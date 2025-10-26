import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/currency";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="space-y-4">
      <h2 className="text-lg font-medium">Commandes</h2>
      <div className="overflow-auto rounded border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">N°</th>
              <th className="px-3 py-2 text-left">Statut</th>
              <th className="px-3 py-2 text-left">Total</th>
              <th className="px-3 py-2 text-left">Devise</th>
              <th className="px-3 py-2 text-left">Créée</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="px-3 py-2">{o.number}</td>
                <td className="px-3 py-2">
                  <span className="rounded px-2 py-1 border text-xs">{o.status}</span>
                </td>
                <td className="px-3 py-2">{formatMoney(o.totalCents, o.currency, "fr-FR")}</td>
                <td className="px-3 py-2">{o.currency}</td>
                <td className="px-3 py-2">{new Date(o.createdAt).toLocaleString("fr-FR")}</td>
                <td className="px-3 py-2">
                  <Link href={`/admin/orders/${o.id}`} className="underline">Voir</Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center opacity-60" colSpan={6}>
                  Aucune commande pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
