import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getCountryInfo, formatMoney } from "@/lib/currency";

export default async function Home() {
  const code = (await cookies()).get("country")?.value;
  const info = getCountryInfo(code);

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { prices: true },
  });

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h2 className="text-2xl font-semibold mb-6">Boutique — {info.code} ({info.currency})</h2>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {products.map(p => {
          const price = p.prices.find(pr => pr.country === info.code) ?? p.prices[0];
          return (
            <Link key={p.id} href={`/product/${p.slug}`} className="border rounded-xl p-4 hover:shadow-md transition">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.imageUrl ?? "/vercel.svg"} alt={p.title} className="w-full h-44 object-cover rounded-md" />
              <h3 className="mt-3 font-medium">{p.title}</h3>
              <p className="text-sm opacity-70">
                {formatMoney(price.amountCents, price.currency, info.locale)} — stock: {p.stock}
              </p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
