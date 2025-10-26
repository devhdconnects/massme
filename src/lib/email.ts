// src/lib/email.ts
import fs from "node:fs";
import path from "node:path";
import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM = "Massme <no-reply@massme.local>",
} = process.env;

function ensureSmtpConfig() {
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error(
      "SMTP config manquante. Renseigne SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS et SMTP_FROM dans .env"
    );
  }
}

export function getTransport() {
  ensureSmtpConfig();
  const port = Number(SMTP_PORT);
  const secure = port === 465; // 465 = SMTPS
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

type SendInvoiceArgs = {
  to: string;
  order: {
    number: string;
    firstName?: string | null;
    lastName?: string | null;
    currency: string;
    totalCents: number;
  };
  invoiceUrl: string;             // lien public (ex: /invoices/INV-XXXX.pdf)
  attachmentPath?: string | null; // chemin disque si tu veux attacher le PDF
};

export async function sendInvoiceEmail(args: SendInvoiceArgs) {
  const { to, order, invoiceUrl, attachmentPath } = args;
  const transport = getTransport();

  const fullName = [order.firstName, order.lastName].filter(Boolean).join(" ") || "Client";
  const total = (order.totalCents / 100).toLocaleString("fr-FR", { style: "currency", currency: order.currency });

  const subject = `Votre facture — commande ${order.number}`;
  const html = `
    <p>Bonjour ${fullName},</p>
    <p>Merci pour votre achat. Vous trouverez votre facture en pièce jointe (si disponible) ou via le lien :</p>
    <p><a href="${invoiceUrl}">${invoiceUrl}</a></p>
    <p><strong>Total :</strong> ${total}</p>
    <p>— L'équipe Massme</p>
  `;
  const text = `Bonjour ${fullName},

Merci pour votre achat. Lien de la facture: ${invoiceUrl}
Total: ${total}

— L'équipe Massme
`;

  const attachments: any[] = [];
  if (attachmentPath && fs.existsSync(attachmentPath)) {
    attachments.push({
      filename: path.basename(attachmentPath),
      path: attachmentPath,
      contentType: "application/pdf",
    });
  }

  await transport.sendMail({
    from: SMTP_FROM,
    to,
    subject,
    text,
    html,
    attachments,
  });
}
