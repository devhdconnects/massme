import { createProductAction } from "../../server-actions";

export default function NewProductPage() {
  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h1 className="text-xl font-semibold">Nouveau produit</h1>

      <form action={createProductAction} className="grid gap-4">
        <input name="title" placeholder="Titre" required className="border rounded px-3 py-2" />
        <input name="slug" placeholder="Slug (unique)" required className="border rounded px-3 py-2" />
        <input name="imageUrl" placeholder="Image URL" className="border rounded px-3 py-2" />
        <textarea name="description" placeholder="Description" className="border rounded px-3 py-2 min-h-[100px]" />
        <input name="stock" type="number" placeholder="Stock" defaultValue={0} className="border rounded px-3 py-2" />
        <button className="border rounded px-4 py-2 hover:shadow">Créer</button>
      </form>
    </div>
  );
}
