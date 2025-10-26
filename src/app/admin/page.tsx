export default function AdminHome() {
  return (
    <main className="space-y-4">
      <h2 className="text-lg font-medium">Bienvenue sur l’admin</h2>
      <ul className="list-disc pl-6">
        <li><a className="underline" href="/admin/products">Gérer les produits</a></li>
        <li><a className="underline" href="/admin/orders">Voir les commandes</a></li>
      </ul>
    </main>
  );
}
