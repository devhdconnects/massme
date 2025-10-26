import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/currency";
import {
  cancelOrderAction,
  markPaidAction,
  refundOrderAction,
  regenerateInvoiceAction,
} from "../server-actions";
import ConfirmButton from "@/components/ConfirmButton";

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const o = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!o) return notFound();

  const stripeLink =
    o.paymentIntentId
      ? `https://dashboard.stripe.com/test/payments/${o.paymentIntentId}`
      : o.checkoutSessionId
      ? `https://dashboard.stripe.com/test/checkout/sessions/${o.checkoutSessionId}`
      : null;

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Commande {o.number}</h1>
        <div className="flex items-center gap-2">
          <span className="rounded px-2 py-1 border text-xs">{o.status}</span>
          {stripeLink && (
            <a href={stripeLink} target="_blank" rel="noreferrer" className="underline text-sm">
              Voir sur Stripe ↗
            </a>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="border rounded p-4 space-y-3">
          <h2 className="font-medium">Articles</h2>
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
        </div>

        <div className="border rounded p-4 space-y-2">
          <h2 className="font-medium">Totaux</h2>
          <div className="flex justify-between"><span>Sous-total</span><span>{formatMoney(o.subtotalCents, o.currency, "fr-FR")}</span></div>
          <div className="flex justify-between"><span>Livraison</span><span>{formatMoney(o.shippingCents, o.currency, "fr-FR")}</span></div>
          <div className="flex justify-between"><span>TVA</span><span>{formatMoney(o.vatCents, o.currency, "fr-FR")}</span></div>
          <div className="flex justify-between font-semibold"><span>Total</span><span>{formatMoney(o.totalCents, o.currency, "fr-FR")}</span></div>
        </div>

        <div className="border rounded p-4 space-y-2">
          <h2 className="font-medium">Client</h2>
          <div className="text-sm">
            <div>{o.firstName} {o.lastName}</div>
            <div>{o.email}{o.phone ? ` · ${o.phone}` : ""}</div>
            <div>{o.address1}{o.address2 ? `, ${o.address2}` : ""}</div>
            <div>{o.postalCode} {o.city}{o.state ? `, ${o.state}` : ""}</div>
            <div>{o.country}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <form action={markPaidAction}>
          <input type="hidden" name="id" value={o.id} />
          <button className="border rounded px-3 py-2 hover:shadow">Marquer payé</button>
        </form>

        <form action={cancelOrderAction}>
          <input type="hidden" name="id" value={o.id} />
          <ConfirmButton message="Annuler cette commande ?" className="border rounded px-3 py-2 hover:shadow text-red-600">
            Annuler
          </ConfirmButton>
        </form>

        {o.paymentIntentId && (
          <form action={refundOrderAction}>
            <input type="hidden" name="id" value={o.id} />
            <ConfirmButton message="Rembourser cette commande ?" className="border rounded px-3 py-2 hover:shadow text-amber-700">
              Rembourser
            </ConfirmButton>
          </form>
        )}

        <form action={regenerateInvoiceAction}>
          <input type="hidden" name="id" value={o.id} />
          <button className="border rounded px-3 py-2 hover:shadow">
            Régénérer / Renvoyer la facture
          </button>
        </form>

        {o.invoiceUrl ? (
          <a href={o.invoiceUrl} target="_blank" rel="noreferrer" className="underline">
            Télécharger la facture ({o.invoiceNumber})
          </a>
        ) : (
          <span className="opacity-60 text-sm">Pas encore de facture</span>
        )}

        <Link href="/admin/orders" className="underline self-center">← Retour</Link>
      </div>
    </main>
  );
}
