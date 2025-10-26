import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.product.deleteMany();
  await prisma.productPrice.deleteMany();

  const p = await prisma.product.create({
    data: {
      title: "MassMe appui-tête ergonomique",
      slug: "massme-appui-tete",
      description: "Appui-tête ergonomique — housse bambou",
      imageUrl: "https://picsum.photos/seed/massme/800/600",
      stock: 50,
      prices: {
        create: [
          { country: "FR", currency: "EUR", amountCents: 8250 },
          { country: "US", currency: "USD", amountCents: 8999 },
          { country: "GB", currency: "GBP", amountCents: 6999 },
        ],
      },
    },
  });

  console.log("Seed OK:", p.slug);
}

main().finally(() => prisma.$disconnect());
