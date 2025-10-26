"use client";
import { supportedCountries } from "@/lib/currency";

export default function CountrySelect() {
  const current = document.cookie.match(/(?:^| )country=([^;]+)/)?.[1] || "FR";
  const change = (c: string) => {
    document.cookie = `country=${c};path=/;max-age=${60*60*24*365}`;
    location.reload();
  };
  return (
    <select defaultValue={current} onChange={(e)=>change(e.target.value)} className="border rounded px-2 py-1 text-sm">
      {supportedCountries.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
    </select>
  );
}
