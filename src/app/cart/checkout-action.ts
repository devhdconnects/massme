"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { getCountryInfo } from "@/lib/currency";

type CartItem = {
  slug: string;
  title: string;
  currency: string;
  unitCents: number;
  qty: number;
};

export async function createCheckoutAction() {
  const c = await cookies();
  const cart = JSON.parse(c.get("cart")?.value ?? "[]") as CartItem[];
  if (!cart.length) redirect("/cart");

  const currency = cart[0].currency.toLowerCase();
  const country = c.get("country")?.value;
  const info = getCountryInfo(country);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    currency,
    line_items: cart.map((it) => ({
      quantity: it.qty,
      price_data: {
        currency,
        product_data: { name: it.title },
        unit_amount: it.unitCents,
      },
    })),
    success_url: `${process.env.SITE_URL}/cart/success`,
    cancel_url: `${process.env.SITE_URL}/cart`,
    locale: info.locale.startsWith("fr") ? "fr" : "en",
    metadata: {
      // on stocke ce qu’il faut pour le webhook (limite 500 chars environ par champ)
      items: JSON.stringify(
        cart.map((i) => ({ slug: i.slug, qty: i.qty }))
      ),
    },
  });

  redirect(session.url!);
}
