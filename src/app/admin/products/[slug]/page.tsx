import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  updateProductAction,
  deleteProductAction,
  upsertPriceAction,
  deletePriceAction,
} from "../../server-actions";
import ConfirmButton from "@/components/ConfirmButton";

export default async function EditProductPage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!slug) return notFound();

  const p = await prisma.product.findUnique({
    where: { slug },
    include: { prices: true },
  });
  if (!p) return notFound();

  const countries = [
    { code: "FR", currency: "EUR" },
    { code: "US", currency: "USD" },
    { code: "GB", currency: "GBP" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Éditer : {p.title}</h1>
        <form action={deleteProductAction}>
          <input type="hidden" name="id" value={p.id} />
          <ConfirmButton className="text-red-600 underline" message="Supprimer ce produit ?">
            Supprimer
          </ConfirmButton>
        </form>
      </div>

      <form action={updateProductAction} className="grid sm:grid-cols-2 gap-4">
        <input type="hidden" name="id" value={p.id} />
        <input name="title" defaultValue={p.title} className="border rounded px-3 py-2" />
        <input name="slug" defaultValue={p.slug} className="border rounded px-3 py-2" />
        <input name="imageUrl" defaultValue={p.imageUrl ?? ""} className="border rounded px-3 py-2" />
        <input name="stock" type="number" min={0} defaultValue={p.stock} className="border rounded px-3 py-2" />
        <textarea name="description" defaultValue={p.description ?? ""} className="border rounded px-3 py-2 sm:col-span-2 min-h-[120px]"/>
        <div className="sm:col-span-2">
          <button className="border rounded px-4 py-2 hover:shadow">Enregistrer</button>
        </div>
      </form>

      <div className="space-y-3">
        <h2 className="font-medium">Prix par pays</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th>Pays</th><th>Devise</th><th>Montant (centimes)</th><th></th>
            </tr>
          </thead>
          <tbody>
            {p.prices.map(pr => (
              <tr key={pr.id} className="border-b">
                <td>{pr.country}</td>
                <td>{pr.currency}</td>
                <td>
                  <form action={upsertPriceAction} className="flex items-center gap-2">
                    <input type="hidden" name="productId" value={p.id} />
                    <input type="hidden" name="priceId" value={pr.id} />
                    <input type="hidden" name="country" value={pr.country} />
                    <input type="hidden" name="currency" value={pr.currency} />
                    <input name="amountCents" type="number" defaultValue={pr.amountCents} className="border rounded px-2 py-1 w-28 text-right" />
                    <button className="underline text-sm">Mettre à jour</button>
                  </form>
                </td>
                <td>
                  <form action={deletePriceAction}>
                    <input type="hidden" name="productId" value={p.id} />
                    <input type="hidden" name="priceId" value={pr.id} />
                    <ConfirmButton className="text-red-600 underline text-sm" message="Supprimer ce prix ?">
                      Supprimer
                    </ConfirmButton>
                  </form>
                </td>
              </tr>
            ))}
            {countries.map(c => !p.prices.some(pr => pr.country === c.code) && (
              <tr key={c.code} className="border-b bg-gray-50/50">
                <td>{c.code}</td><td>{c.currency}</td>
                <td colSpan={2}>
                  <form action={upsertPriceAction} className="flex items-center gap-2">
                    <input type="hidden" name="productId" value={p.id} />
                    <input type="hidden" name="country" value={c.code} />
                    <input type="hidden" name="currency" value={c.currency} />
                    <input name="amountCents" type="number" placeholder="ex: 8250" className="border rounded px-2 py-1 w-28 text-right" />
                    <button className="underline text-sm">Ajouter</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
