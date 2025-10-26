import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const { orderId } = await req.json();
  if (!orderId) return new Response("Missing orderId", { status: 400 });

  const o = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!o || !o.items.length) return new Response("Order not found", { status: 404 });

  const amount = o.totalCents;
  const currency = o.currency.toLowerCase();

  // 🧹 Toujours créer un nouveau PI (on évite les mismatches pk/sk)
  const pi = await stripe.paymentIntents.create({
    amount,
    currency,
    metadata: { orderId: o.id },
    automatic_payment_methods: { enabled: true },
  });

  await prisma.order.update({
    where: { id: o.id },
    data: { paymentIntentId: pi.id }, // on écrase l’ancien au passage
  });

  // Petit log utile en dev
  // console.log("PI created", { id: pi.id, currency, amount });

  return Response.json({ clientSecret: pi.client_secret });
}
