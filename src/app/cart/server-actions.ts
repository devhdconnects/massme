"use server";

import { cookies } from "next/headers";

export type CartItem = {
  slug: string;
  title: string;
  currency: string;
  unitCents: number;
  qty: number;
  imageUrl?: string | null;
  options?: Record<string, string>;
};

// ---- helpers async (Next 16: cookies() => Promise) ----
async function readCart(): Promise<CartItem[]> {
  const c = await cookies();
  const raw = c.get("cart")?.value ?? "[]";
  try {
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

async function writeCart(items: CartItem[]) {
  const c = await cookies();
  c.set("cart", JSON.stringify(items), {
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 jours
    httpOnly: false,
  });
}

// ---- actions ----
export async function addToCartAction(item: CartItem) {
  const cart = await readCart();
  const idx = cart.findIndex(
    (it) => it.slug === item.slug && JSON.stringify(it.options ?? {}) === JSON.stringify(item.options ?? {})
  );
  if (idx >= 0) {
    cart[idx].qty += item.qty;
  } else {
    cart.push(item);
  }
  await writeCart(cart);
}

export async function setQtyAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const qty = Math.max(0, Number(formData.get("qty") || 0));
  const cart = await readCart();
  const idx = cart.findIndex((it) => it.slug === slug);
  if (idx >= 0) {
    if (qty === 0) cart.splice(idx, 1);
    else cart[idx].qty = qty;
  }
  await writeCart(cart);
}

export async function removeFromCartAction(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const cart = await readCart();
  const next = cart.filter((it) => it.slug !== slug);
  await writeCart(next);
}

export async function clearCartAction() {
  await writeCart([]);
}
