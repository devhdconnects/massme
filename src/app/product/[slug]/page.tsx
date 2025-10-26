import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getCountryInfo, formatMoney } from "@/lib/currency";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const code = (await cookies()).get("country")?.value;
  const info = getCountryInfo(code);

  const p = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { prices: true },
  });
  if (!p) return notFound();

  const price = p.prices.find(pr => pr.country === info.code) ?? p.prices[0];

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={p.imageUrl ?? "/vercel.svg"} alt={p.title} className="w-full h-72 object-cover rounded-xl" />
      <h1 className="text-2xl font-semibold">{p.title}</h1>
      <p className="opacity-70">{formatMoney(price.amountCents, price.currency, info.locale)}</p>
      <p>{p.description}</p>
      <p className="text-sm opacity-70">Stock: {p.stock}</p>
    </div>
  );
}
