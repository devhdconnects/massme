"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe";
import { finalizeOrderPaid } from "@/lib/order-finalize";

// ✅ Générer / renvoyer la facture (re-génère PDF + e-mail)
export async function regenerateInvoiceAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  await finalizeOrderPaid(id); // ta fonction qui génère le PDF, met à jour invoiceUrl + envoie l’email
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath(`/admin/orders`);
}

// ✅ Marquer payé (manuel)
export async function markPaidAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  await prisma.order.update({ where: { id }, data: { status: "PAID" } });
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath(`/admin/orders`);
}

// ✅ Annuler
export async function cancelOrderAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  await prisma.order.update({ where: { id }, data: { status: "CANCELED" } });
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath(`/admin/orders`);
}

// ✅ Rembourser (Stripe)
export async function refundOrderAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return;

  if (order.paymentIntentId) {
    const pi = await stripe.paymentIntents.retrieve(order.paymentIntentId, { expand: ["latest_charge"] });
    const chargeId = (pi.latest_charge as any)?.id;
    if (chargeId) {
      await stripe.refunds.create({ charge: chargeId });
    }
  }

  await prisma.order.update({ where: { id }, data: { status: "REFUNDED" } });
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath(`/admin/orders`);
}
