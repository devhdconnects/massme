"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const COUNTRIES = [
  { country: "FR", currency: "EUR" },
  { country: "US", currency: "USD" },
  { country: "GB", currency: "GBP" },
];

// --- AUTH ADMIN ---

export async function loginAdminAction(formData: FormData) {
  const pass = String(formData.get("password") || "");
  const c = await cookies();

  if (pass && process.env.ADMIN_PASSWORD && pass === process.env.ADMIN_PASSWORD) {
    c.set({
      name: "admin",
      value: "1",
      path: "/",
      httpOnly: true,
      maxAge: 60 * 60 * 8, // 8h
    });
    redirect("/admin");
  }
  redirect("/admin/login");
}

export async function logoutAdminAction() {
  const c = await cookies();
  c.set({
    name: "admin",
    value: "",
    path: "/",
    httpOnly: true,
    maxAge: 0,
  });
  redirect("/admin/login");
}

// --- CRUD PRODUITS ---

export async function createProductAction(formData: FormData) {
  const title = String(formData.get("title") || "");
  const slug = String(formData.get("slug") || "");
  const description = String(formData.get("description") || "");
  const imageUrl = String(formData.get("imageUrl") || "");
  const stock = Number(formData.get("stock") || 0);

  if (!title || !slug) return;

  const p = await prisma.product.create({
    data: { title, slug, description, imageUrl, stock },
  });

  // Crée les prix par pays si renseignés
  for (const { country, currency } of COUNTRIES) {
    const amount = Number(formData.get(`price_${country}`) || 0);
    if (amount > 0) {
      await prisma.productPrice.create({
        data: { productId: p.id, country, currency, amountCents: amount },
      });
    }
  }
  redirect(`/admin/products/${p.id}`);
}

export async function updateProductAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "");
  const slug = String(formData.get("slug") || "");
  const description = String(formData.get("description") || "");
  const imageUrl = String(formData.get("imageUrl") || "");
  const stock = Number(formData.get("stock") || 0);

  if (!id) return;
  await prisma.product.update({
    where: { id },
    data: { title, slug, description, imageUrl, stock },
  });
  redirect(`/admin/products/${id}`);
}

export async function deleteProductAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  await prisma.productPrice.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });
  redirect("/admin/products");
}

// --- CRUD PRIX ---

export async function upsertPriceAction(formData: FormData) {
  const productId = String(formData.get("productId") || "");
  const country = String(formData.get("country") || "");
  const currency = String(formData.get("currency") || "");
  const amountCents = Number(formData.get("amountCents") || 0);
  const priceId = String(formData.get("priceId") || "");

  if (!productId || !country || !currency || !amountCents) return;

  if (priceId) {
    await prisma.productPrice.update({
      where: { id: priceId },
      data: { country, currency, amountCents },
    });
  } else {
    // unique (productId, country)
    const existing = await prisma.productPrice.findFirst({
      where: { productId, country },
    });
    if (existing) {
      await prisma.productPrice.update({
        where: { id: existing.id },
        data: { currency, amountCents },
      });
    } else {
      await prisma.productPrice.create({
        data: { productId, country, currency, amountCents },
      });
    }
  }
  redirect(`/admin/products/${productId}`);
}

export async function deletePriceAction(formData: FormData) {
  const productId = String(formData.get("productId") || "");
  const priceId = String(formData.get("priceId") || "");
  if (!priceId || !productId) return;
  await prisma.productPrice.delete({ where: { id: priceId } });
  redirect(`/admin/products/${productId}`);
}
