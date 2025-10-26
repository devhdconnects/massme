// src/lib/order-finalize.ts
import { prisma } from "@/lib/prisma";
import { generateInvoicePdf } from "@/lib/invoice";
import { sendInvoiceEmail } from "@/lib/email";

export async function finalizeOrderPaid(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return;

  // Numéro de facture
  const invoiceNumber = order.invoiceNumber ?? `INV-${order.number}`;

  // Génère le PDF => on récupère chemin disque + URL publique
  const { filePath, publicUrl } = await generateInvoicePdf({ ...order, invoiceNumber });

  // Sauvegarde en DB
  await prisma.order.update({
    where: { id: order.id },
    data: {
      invoiceNumber,
      invoiceUrl: publicUrl,
      invoicedAt: new Date(),
    },
  });

  // Envoi email au client
  try {
    await sendInvoiceEmail({
      to: order.email,
      order: {
        number: order.number,
        firstName: order.firstName,
        lastName: order.lastName,
        currency: order.currency,
        totalCents: order.totalCents,
      },
      invoiceUrl: publicUrl,
      attachmentPath: filePath, // on joint le PDF si dispo
    });
  } catch (e) {
    console.error("Erreur envoi email facture:", e);
    // pas bloquant pour la commande
  }
}
