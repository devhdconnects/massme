import { loginAdminAction } from "../server-actions";

export default function AdminLoginPage() {
  return (
    <div className="mx-auto max-w-sm p-6 space-y-4">
      <h1 className="text-xl font-semibold">Connexion Admin</h1>
      <form action={loginAdminAction} className="space-y-3">
        <input
          type="password"
          name="password"
          placeholder="Mot de passe admin"
          className="border rounded px-3 py-2 w-full"
          required
        />
        <button className="border rounded px-4 py-2 hover:shadow">Se connecter</button>
      </form>
    </div>
  );
}
