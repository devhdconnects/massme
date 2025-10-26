export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <nav className="flex items-center gap-4 text-sm underline">
          <a href="/admin">Accueil</a>
          <a href="/admin/products">Produits</a>
          <a href="/admin/orders">Commandes</a>
          <a href="/">Boutique</a>
        </nav>
      </header>
      {children}
    </div>
  );
}
