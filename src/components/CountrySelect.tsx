"use client";

import { usePathname } from "next/navigation";

type Props = {
  current?: "FR" | "US" | "GB";
};

export default function CountrySelect({ current = "FR" }: Props) {
  const pathname = usePathname();

  return (
    <form action={"/actions/set-country"} method="post" className="inline-flex items-center gap-2">
      {/* On envoie vers l'action via une route auto (/app/actions – voir proxy ci-dessous) */}
      <input type="hidden" name="redirectTo" value={pathname || "/"} />
      <select
        name="country"
        defaultValue={current}
        onChange={(e) => (e.currentTarget.form as HTMLFormElement)?.requestSubmit()}
        className="border rounded px-2 py-1 text-sm"
        aria-label="Choisir le pays"
      >
        <option value="FR">🇫🇷 France (EUR)</option>
        <option value="US">🇺🇸 USA (USD)</option>
        <option value="GB">🇬🇧 UK (GBP)</option>
      </select>
    </form>
  );
}
