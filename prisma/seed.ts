import { PrismaClient } from "@prisma/client";
import { products } from "../lib/products";

const prisma = new PrismaClient();

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        sku: product.sku,
        category: product.category,
        description: product.description,
        material: product.material,
        isSample: true,
      },
      create: {
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        category: product.category,
        description: product.description,
        material: product.material,
        isSample: true,
      },
    });
  }
  console.info(`Seeded ${products.length} clearly marked sample products.`);
}

main()
  .catch((error: unknown) => {
    console.error("Unable to seed sample products.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
