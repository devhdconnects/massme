import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Produits</h1>
        <Link href="/admin/products/new" className="border rounded px-4 py-2 hover:shadow">
          + Nouveau produit
        </Link>
      </div>

      <table className="w-full text-sm border">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="p-2 text-left">Titre</th>
            <th className="p-2 text-left">Slug</th>
            <th className="p-2 text-left">Stock</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b hover:bg-gray-50">
              <td className="p-2">{p.title}</td>
              <td className="p-2">{p.slug}</td>
              <td className="p-2">{p.stock}</td>
              <td className="p-2 text-right">
                <Link href={`/admin/products/${encodeURIComponent(p.slug)}`} className="underline">
                  Éditer
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
