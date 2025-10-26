// src/app/api/dev/test-email/route.ts
import { NextRequest } from "next/server";
import { sendInvoiceEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    // tu peux changer l’adresse ici pour ton email d’achat
    await sendInvoiceEmail({
      to: "ton.email@gmail.com",
      order: {
        number: "TEST-EMAIL",
        firstName: "Aurélien",
        lastName: "Test",
        currency: "EUR",
        totalCents: 1999,
      },
      invoiceUrl: "https://massme.test/facture-test.pdf",
      attachmentPath: null, // pas de PDF pour le test
    });

    return new Response("✅ Email envoyé avec succès.", { status: 200 });
  } catch (e: any) {
    console.error("Erreur test email:", e);
    return new Response(`❌ Erreur: ${e.message}`, { status: 500 });
  }
}
