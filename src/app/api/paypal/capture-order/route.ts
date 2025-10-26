import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { finalizeOrderPaid } from "@/lib/order-finalize";

const BASE = process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com";
const CID  = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
const SEC  = process.env.PAYPAL_CLIENT_SECRET!;

async function getAccessToken() {
  const basic = Buffer.from(`${CID}:${SEC}`).toString("base64");
  const oauthRes = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!oauthRes.ok) {
    const txt = await oauthRes.text();
    throw new Error(`PayPal OAuth ${oauthRes.status} ${txt}`);
  }
  const data = await oauthRes.json();
  return data.access_token as string;
}

export async function POST(req: NextRequest) {
  try {
    const { paypalOrderId, orderId } = await req.json();
    if (!paypalOrderId || !orderId) {
      return new Response(JSON.stringify({ error: "paypalOrderId ou orderId manquant" }), { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return new Response(JSON.stringify({ error: "Commande introuvable" }), { status: 404 });
    }

    const token = await getAccessToken();

    const captureRes = await fetch(`${BASE}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const captureData = await captureRes.json();

    if (!captureRes.ok) {
      return new Response(
        JSON.stringify({ error: captureData?.message || "Erreur PayPal capture", details: captureData }),
        { status: captureRes.status } // 👈 plus de "res is not defined"
      );
    }

    if (captureData?.status === "COMPLETED") {
      const captureId = captureData?.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null;

      await prisma.order.update({
        where: { id: orderId },
        data: { status: "PAID", paymentIntentId: captureId },
      });

      // Génère/stocke la facture + envoi email
      await finalizeOrderPaid(orderId);
    }

    return new Response(JSON.stringify({ status: captureData?.status || "OK" }), { status: 200 });
  } catch (e: any) {
    console.error("paypal/capture-order error:", e);
    return new Response(JSON.stringify({ error: e?.message || "Erreur serveur capture-order" }), { status: 500 });
  }
}
