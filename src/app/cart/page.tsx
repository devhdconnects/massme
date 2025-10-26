import Link from "next/link";
import { cookies } from "next/headers";
import { setQtyAction, removeFromCartAction, type CartItem } from "./server-actions";
import { getCountryInfo, formatMoney } from "@/lib/currency";
import { computeTotals } from "@/lib/order";

export default async function CartPage() {
  const c = await cookies();
  const code = c.get("country")?.value ?? "FR";
  const info = getCountryInfo(code);

  const cart: CartItem[] = JSON.parse(c.get("cart")?.value ?? "[]");
  const currency = cart[0]?.currency ?? info.currency;
  const totals = computeTotals(cart, info.code, currency);

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Votre panier</h1>

      {cart.length === 0 ? (
        <div className="border rounded p-4">
          Panier vide. <Link href="/" className="underline">Continuer mes achats</Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {cart.map((it) => (
              <div key={it.slug} className="flex items-center justify-between border rounded p-3">
                <div>
                  <div className="font-medium">{it.title}</div>
                  <div className="text-sm opacity-75">
                    {formatMoney(it.unitCents, it.currency, info.locale)} × {it.qty}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <form action={setQtyAction} className="flex items-center gap-2">
                    <input type="hidden" name="slug" value={it.slug} />
                    <input name="qty" type="number" min={0} defaultValue={it.qty} className="border rounded px-2 py-1 w-20" />
                    <button className="text-sm underline">MAJ</button>
                  </form>
                  <form action={removeFromCartAction}>
                    <input type="hidden" name="slug" value={it.slug} />
                    <button className="text-sm text-red-600 underline">Supprimer</button>
                  </form>
                </div>
              </div>
            ))}
          </div>

          <div className="border rounded p-4 space-y-2">
            <div className="flex justify-between"><span>Sous-total</span><span>{formatMoney(totals.subtotalCents, currency, info.locale)}</span></div>
            <div className="flex justify-between"><span>Livraison</span><span>{formatMoney(totals.shippingCents, currency, info.locale)}</span></div>
            <div className="flex justify-between"><span>TVA</span><span>{formatMoney(totals.vatCents, currency, info.locale)}</span></div>
            <div className="flex justify-between font-semibold text-lg"><span>Total</span><span>{formatMoney(totals.totalCents, currency, info.locale)}</span></div>
          </div>

          <div className="flex gap-3">
            <Link href="/checkout" className="border rounded px-4 py-2 hover:shadow">
              Commander
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
