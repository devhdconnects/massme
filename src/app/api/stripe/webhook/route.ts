import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { finalizeOrderPaid } from "@/lib/order-finalize";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature") as string;
  const raw = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // ✅ Payment Element
  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as any;
    const orderId = pi.metadata?.orderId as string | undefined;
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "PAID", paymentIntentId: pi.id },
      });
      await finalizeOrderPaid(orderId); // <—— IMPORTANT
    }
  }

  // ✅ Stripe Checkout (si utilisé)
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const orderId = session.metadata?.orderId as string | undefined;
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          paymentIntentId: session.payment_intent ?? null,
          checkoutSessionId: session.id ?? null,
        },
      });
      await finalizeOrderPaid(orderId); // <—— IMPORTANT
    }
  }

  return new Response("ok");
}
