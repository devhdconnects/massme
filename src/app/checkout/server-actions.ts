"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function generateNumber() {
  // ORD-YYYYMMDD-HHMM + 4 aléatoires
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const num = `ORD-${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
  return num;
}

export async function createOrderAction(formData: FormData) {
  const c = await cookies();
  const cartJson = c.get("cart")?.value ?? "[]";
  const cart = JSON.parse(cartJson) as {
    slug: string; title: string; currency: string; unitCents: number; qty: number; imageUrl?: string | null;
  }[];
  if (!cart.length) redirect("/cart");

  // Champs client
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName  = String(formData.get("lastName") || "").trim();
  const email     = String(formData.get("email") || "").trim();
  const phone     = String(formData.get("phone") || "").trim() || null;
  const address1  = String(formData.get("address1") || "").trim();
  const address2  = String(formData.get("address2") || "").trim() || null;
  const city      = String(formData.get("city") || "").trim();
  const postalCode= String(formData.get("postalCode") || "").trim();
  const country   = String(formData.get("country") || "").trim().toUpperCase();
  const state     = String(formData.get("state") || "").trim() || null;

  if (!firstName || !lastName || !email || !address1 || !city || !postalCode || !country) {
    redirect("/checkout?error=missing_fields");
  }

  // Totaux transmis en hidden (tu peux recalculer côté serveur si tu préfères)
  const currency       = String(formData.get("currency") || "EUR").toUpperCase();
  const subtotalCents  = Number(formData.get("subtotalCents") || 0);
  const shippingCents  = Number(formData.get("shippingCents") || 0);
  const vatCents       = Number(formData.get("vatCents") || 0);
  const totalCents     = Number(formData.get("totalCents") || 0);

  const number = generateNumber();

  // Crée Order + OrderItem
  const order = await prisma.order.create({
    data: {
      number,
      status: "PENDING_PAYMENT",
      currency,
      subtotalCents,
      shippingCents,
      vatCents,
      totalCents,

      firstName, lastName, email, phone,
      address1, address2, city, postalCode, country, state,

      items: {
        create: cart.map((it) => ({
          productSlug: it.slug,
          title: it.title,
          qty: it.qty,
          unitCents: it.unitCents,
          totalCents: it.unitCents * it.qty,
          currency: it.currency,
        })),
      },
    },
    include: { items: true },
  });

  // Vider le panier après création de la commande (optionnel : tu peux attendre PAID)
  c.set("cart", "[]", { path: "/", httpOnly: false, maxAge: 60 * 60 * 24 * 30 });

  // Aller vers la page de paiement intégrée (Stripe Elements)
  redirect(`/pay/${order.id}`);
}
