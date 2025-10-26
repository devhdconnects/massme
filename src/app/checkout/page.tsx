// src/app/checkout/page.tsx
import { cookies } from "next/headers";
import Link from "next/link";
import { createOrderAction } from "./server-actions";

export default async function CheckoutPage() {
  const c = await cookies();
  const cartJson = c.get("cart")?.value ?? "[]";
  const cart = JSON.parse(cartJson) as {
    slug: string; title: string; currency: string; unitCents: number; qty: number; imageUrl?: string | null;
  }[];

  const currency = cart[0]?.currency ?? "EUR";
  const subtotal = cart.reduce((sum, it) => sum + it.unitCents * it.qty, 0);
  const shipping = 0; // tu pourras calculer selon le pays
  const vat = Math.round(subtotal * 0.2); // exemple TVA 20% (à adapter)
  const total = subtotal + shipping + vat;

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Informations de livraison</h1>

      {cart.length === 0 ? (
        <p>
          Panier vide. <Link href="/cart" className="underline">Retour au panier</Link>
        </p>
      ) : (
        <>
          <form action={createOrderAction} className="grid gap-3 md:grid-cols-2 border rounded p-4">
            <div className="md:col-span-1">
              <label className="block text-sm">Prénom</label>
              <input name="firstName" required className="border rounded px-3 py-2 w-full" />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm">Nom</label>
              <input name="lastName" required className="border rounded px-3 py-2 w-full" />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm">Email</label>
              <input name="email" type="email" required className="border rounded px-3 py-2 w-full" />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm">Téléphone (optionnel)</label>
              <input name="phone" className="border rounded px-3 py-2 w-full" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm">Adresse</label>
              <input name="address1" required className="border rounded px-3 py-2 w-full" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm">Complément (optionnel)</label>
              <input name="address2" className="border rounded px-3 py-2 w-full" />
            </div>

            <div>
              <label className="block text-sm">Ville</label>
              <input name="city" required className="border rounded px-3 py-2 w-full" />
            </div>
            <div>
              <label className="block text-sm">Code postal</label>
              <input name="postalCode" required className="border rounded px-3 py-2 w-full" />
            </div>
            <div>
              <label className="block text-sm">Pays (ISO2)</label>
              <input name="country" defaultValue="FR" required className="border rounded px-3 py-2 w-full" />
            </div>
            <div>
              <label className="block text-sm">État / Région (si applicable)</label>
              <input name="state" className="border rounded px-3 py-2 w-full" />
            </div>

            {/* Totaux */}
            <input type="hidden" name="currency" value={currency} />
            <input type="hidden" name="subtotalCents" value={subtotal} />
            <input type="hidden" name="shippingCents" value={shipping} />
            <input type="hidden" name="vatCents" value={vat} />
            <input type="hidden" name="totalCents" value={total} />

            <div className="md:col-span-2 pt-2">
              <button className="border rounded px-4 py-2 hover:shadow">Continuer vers le paiement</button>
            </div>
          </form>

          <p className="text-sm opacity-70">
            Total estimé : {(total / 100).toFixed(2)} {currency}
          </p>
        </>
      )}
    </main>
  );
}
