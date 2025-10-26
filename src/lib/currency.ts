export const supportedCountries = [
  { code: "FR", label: "France", currency: "EUR", locale: "fr-FR" },
  { code: "US", label: "United States", currency: "USD", locale: "en-US" },
  { code: "GB", label: "United Kingdom", currency: "GBP", locale: "en-GB" },
] as const;

export function getCountryInfo(code?: string) {
  const fallback = supportedCountries[0];
  if (!code) return fallback;
  return supportedCountries.find(c => c.code === code) ?? fallback;
}

export function formatMoney(cents: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(cents / 100);
}
