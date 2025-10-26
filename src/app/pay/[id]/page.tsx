import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PayClient from "./pay-client"; // ton composant Stripe Elements existant
import PayPalButtons from "./paypal-buttons";

export default async function PayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = await prisma.order.findUnique({ where: { id } });
  if (!o) return notFound();
  if (o.status === "PAID") {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <p className="rounded bg-green-50 border border-green-300 text-green-700 px-3 py-2">
          Commande déjà payée ✅
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Paiement de la commande {o.number}</h1>

      {/* 1) Carte bancaire (Stripe) */}
      <section className="space-y-2">
        <h2 className="font-medium">Carte bancaire</h2>
        <PayClient orderId={o.id} />
      </section>

      {/* 2) OU */}
      <div className="text-center opacity-60">— ou —</div>

      {/* 3) PayPal */}
      <section className="space-y-2">
        <h2 className="font-medium">PayPal</h2>
        <PayPalButtons orderId={o.id} />
      </section>
    </main>
  );
}
