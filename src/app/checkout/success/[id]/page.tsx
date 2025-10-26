// src/app/checkout/success/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/currency";

export const dynamic = "force-dynamic"; // évite les surprises de cache

export default async function OrderSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const o = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!o) return notFound();

  // paid via DB (webhook) OU via query param (succès direct après confirmPayment)
  const paidByDb = o.status === "PAID";
  const paidByQuery =
    (typeof sp?.paid === "string" && sp.paid === "1") ||
    (Array.isArray(sp?.paid) && sp.paid[0] === "1");

  const paid = paidByDb || paidByQuery;

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Commande {o.number}</h1>
      <p className="opacity-70">Statut actuel : {o.status}</p>

      {paid && (
        <div className="rounded border border-green-300 bg-green-50 px-3 py-2 text-green-700">
          Paiement confirmé ✅ Merci pour votre commande !
        </div>
      )}

      <div className="border rounded p-4">
        <h2 className="font-medium mb-2">Articles</h2>
        <ul className="space-y-1">
          {o.items.map((it) => (
            <li key={it.id} className="flex justify-between">
              <span>
                {it.title} × {it.qty}
              </span>
              <span>{formatMoney(it.totalCents, it.currency, "fr-FR")}</span>
            </li>
          ))}
        </ul>
        <hr className="my-3" />
        <div className="flex justify-between">
          <span>Sous-total</span>
          <span>{formatMoney(o.subtotalCents, o.currency, "fr-FR")}</span>
        </div>
        <div className="flex justify-between">
          <span>Livraison</span>
          <span>{formatMoney(o.shippingCents, o.currency, "fr-FR")}</span>
        </div>
        <div className="flex justify-between">
          <span>TVA</span>
          <span>{formatMoney(o.vatCents, o.currency, "fr-FR")}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatMoney(o.totalCents, o.currency, "fr-FR")}</span>
        </div>
      </div>

      {!paid && (
        <Link
          href={`/pay/${o.id}`}
          className="border rounded px-4 py-2 inline-block hover:shadow"
        >
          Payer maintenant
        </Link>
      )}
    </main>
  );
}
