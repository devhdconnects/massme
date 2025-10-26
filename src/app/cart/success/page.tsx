import { cookies } from "next/headers";

export default async function Success() {
  const c = await cookies();
  c.set({ name: "cart", value: "[]", path: "/", maxAge: 60 * 60 * 24 * 30 });

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Merci 🎉</h1>
      <p>Paiement confirmé. Vous recevrez un e-mail de confirmation.</p>
    </div>
  );
}
