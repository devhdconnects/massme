import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const products = Array.from({ length: 8 }).map((_, i) => ({
    title: `Produit ${i + 1}`,
    slug: `produit-${i + 1}`,
    description: `Description du produit ${i + 1}`,
    imageUrl: `https://picsum.photos/seed/p${i + 1}/800/600`,
    stock: 5 + i
  }));

  // Prix de base (FR EUR), avec variations pour US/USD et GB/GBP
  const basePrice = (i: number) => 1499 + i * 200; // en cents EUR
  const usd = (eurCents: number) => Math.round(eurCents * 1.1); // approx simple
  const gbp = (eurCents: number) => Math.round(eurCents * 0.85);

  await prisma.productPrice.deleteMany();
  await prisma.product.deleteMany();

  for (let i = 0; i < products.length; i++) {
    const p = await prisma.product.create({ data: products[i] });
    const eur = basePrice(i);
    await prisma.productPrice.createMany({
      data: [
        { productId: p.id, country: "FR", currency: "EUR", amountCents: eur },
        { productId: p.id, country: "US", currency: "USD", amountCents: usd(eur) },
        { productId: p.id, country: "GB", currency: "GBP", amountCents: gbp(eur) },
      ],
    });
  }

  console.log("Seed multi-pays OK");
}

main().finally(() => prisma.$disconnect());
