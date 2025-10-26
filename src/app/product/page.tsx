import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getCountryInfo, formatMoney } from "@/lib/currency";
import { addToCartAction } from "@/app/cart/server-actions";

export default async function ProductPage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;                // Next 16: params est une Promise
  if (!slug) return notFound();

  const p = await prisma.product.findUnique({
    where: { slug },
    include: { prices: true },
  });
  if (!p) return notFound();

  const code = (await cookies()).get("country")?.value ?? "FR";
  const info = getCountryInfo(code);

  const price = p.prices.find(pr => pr.country === info.code) ?? p.prices[0];
  const priceText = price ? formatMoney(price.amountCents, price.currency, info.locale) : "Prix indisponible";

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={p.imageUrl ?? "/vercel.svg"} alt={p.title} className="w-full h-72 object-cover rounded-xl" />
      <h1 className="text-2xl font-semibold">{p.title}</h1>
      <p className="opacity-70">{priceText}</p>
      {p.description && <p>{p.description}</p>}

      {price && (
        <form
          action={async (fd) => {
            "use server";
            await addToCartAction({
              slug: p.slug,
              title: p.title,
              currency: price.currency,
              unitCents: price.amountCents,
              qty: Number(fd.get("qty") || 1),
              options: { couleur: "Blanc [ Fibres de bambou ]" },
              imageUrl: p.imageUrl ?? null,
            });
          }}
          className="space-y-2 border rounded-lg p-4 inline-block"
        >
          <label className="block text-sm">Quantité</label>
          <input name="qty" type="number" min={1} defaultValue={1} className="border rounded px-3 py-2 w-28" />
          <div>
            <button className="mt-2 inline-flex items-center gap-2 rounded-lg px-4 py-2 border hover:shadow">
              Ajouter au panier
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
