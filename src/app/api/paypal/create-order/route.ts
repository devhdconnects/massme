import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const { orderId } = await req.json();
    if (!orderId) {
      return new Response(JSON.stringify({ error: "orderId manquant" }), { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return new Response(JSON.stringify({ error: "Commande introuvable" }), { status: 404 });
    }

    const token = await getAccessToken();

    // Crée l’ordre PayPal avec le montant de ta commande
    const createRes = await fetch(`${BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: order.currency,
              value: (order.totalCents / 100).toFixed(2),
            },
            reference_id: order.id,
          },
        ],
      }),
    });

    const createData = await createRes.json();
    if (!createRes.ok) {
      return new Response(
        JSON.stringify({ error: createData?.message || "Erreur PayPal create", details: createData }),
        { status: createRes.status }
      );
    }

    return new Response(JSON.stringify({ id: createData.id }), { status: 200 });
  } catch (e: any) {
    console.error("paypal/create-order error:", e);
    return new Response(JSON.stringify({ error: e?.message || "Erreur serveur create-order" }), { status: 500 });
  }
}
