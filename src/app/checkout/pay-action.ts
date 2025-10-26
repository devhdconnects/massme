"use server";

import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function payOrderAction(formData: FormData) {
  const orderId = String(formData.get("orderId") || "");
  if (!orderId) redirect("/cart");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order || order.items.length === 0) redirect("/cart");

  // Si déjà payée, on évite de recréer une session
  if (order.status === "PAID") {
    redirect(`/checkout/success/${order.id}?paid=1`);
  }

  const currency = order.currency.toLowerCase();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    currency,
    line_items: order.items.map((it) => ({
      quantity: it.qty,
      price_data: {
        currency,
        product_data: { name: it.title },
        unit_amount: it.unitCents,
      },
    })),
    metadata: { orderId: order.id },
    success_url: `${process.env.SITE_URL}/checkout/success/${order.id}?paid=1`,
    cancel_url: `${process.env.SITE_URL}/checkout/success/${order.id}?canceled=1`,
  });

  // On garde une trace (facultatif mais utile)
  await prisma.order.update({
    where: { id: order.id },
    data: { checkoutSessionId: session.id, status: "PENDING_PAYMENT" },
  });

  redirect(session.url!);
}
