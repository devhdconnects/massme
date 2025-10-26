import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";

export async function generateInvoicePdf(order: {
  id: string;
  number: string;
  invoiceNumber: string;
  currency: string;
  totalCents: number;
  subtotalCents: number;
  shippingCents: number;
  vatCents: number;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  address1: string;
  address2?: string | null;
  city: string;
  postalCode: string;
  country: string;
  state?: string | null;
  items: { title: string; qty: number; totalCents: number; currency: string }[];
}) {
  const invoicesDir = path.join(process.cwd(), "public", "invoices");
  fs.mkdirSync(invoicesDir, { recursive: true });

  const filename = `${order.invoiceNumber}.pdf`;
  const filePath = path.join(invoicesDir, filename);
  const publicUrl = `/invoices/${filename}`;

  const doc = new PDFDocument({ size: "A4", margin: 50 }); // Helvetica intégrée par défaut
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  doc.fontSize(18).text("Facture", { align: "right" });
  doc.moveDown();
  doc.fontSize(12).text(`N° facture : ${order.invoiceNumber}`);
  doc.text(`Commande  : ${order.number}`);
  doc.text(`Client     : ${order.firstName || ""} ${order.lastName || ""}`);
  doc.text(`Email      : ${order.email}`);
  doc.moveDown();
  doc.text(`Adresse :`);
  doc.text(`${order.address1}`);
  if (order.address2) doc.text(order.address2);
  doc.text(`${order.postalCode} ${order.city}${order.state ? `, ${order.state}` : ""}`);
  doc.text(`${order.country}`);
  doc.moveDown();

  doc.text(`Articles :`);
  order.items.forEach((it) => {
    const line = `${it.title} x ${it.qty}`;
    const price = (it.totalCents / 100).toLocaleString("fr-FR", { style: "currency", currency: it.currency });
    doc.text(`${line} — ${price}`);
  });
  doc.moveDown();

  const fmt = (cents: number) =>
    (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: order.currency });
  doc.text(`Sous-total : ${fmt(order.subtotalCents)}`);
  doc.text(`Livraison  : ${fmt(order.shippingCents)}`);
  doc.text(`TVA        : ${fmt(order.vatCents)}`);
  doc.font("Helvetica-Bold").text(`Total      : ${fmt(order.totalCents)}`);
  doc.end();

  await new Promise((res, rej) => {
    stream.on("finish", res);
    stream.on("error", rej);
  });

  return { filePath, publicUrl };
}
