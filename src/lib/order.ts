// src/lib/order.ts
export type CartItem = {
  slug: string;
  title: string;
  currency: string;
  unitCents: number;
  qty: number;
  imageUrl?: string | null;
};

export function shippingCentsByCountry(country: string) {
  switch (country) {
    case "FR": return 0;        // franco FR (exemple)
    case "GB": return 900;      // 9,00 GBP
    case "US": return 1200;     // 12,00 USD
    default:   return 1500;
  }
}

export function vatRate(country: string) {
  if (country === "FR") return 0.2; // 20% (MVP)
  return 0;
}

export function computeTotals(items: CartItem[], country: string, currency: string) {
  const subtotal = items.reduce((s, it) => s + it.unitCents * it.qty, 0);
  const shipping = shippingCentsByCountry(country);
  const vat = Math.round((subtotal + shipping) * vatRate(country));
  const total = subtotal + shipping + vat;
  return { subtotalCents: subtotal, shippingCents: shipping, vatCents: vat, totalCents: total, currency };
}

export function makeOrderNumber() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `ORD-${y}${m}${day}-${rand}`;
}
