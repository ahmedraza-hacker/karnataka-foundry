import { Prisma } from "@prisma/client";
import { products as sampleProducts, type Product } from "@/lib/products";
import { prisma } from "@/lib/prisma";

function fromDatabaseProduct(product: Prisma.ProductGetPayload<Record<string, never>>): Product {
  return {
    slug: product.slug,
    name: product.name,
    sku: product.sku,
    category: product.category,
    material: product.material ?? "To be confirmed",
    diameter: product.outerDiameterMm === null ? "To be confirmed" : `${product.outerDiameterMm} mm`,
    bore: product.innerDiameterMm === null ? "To be confirmed" : `${product.innerDiameterMm} mm`,
    blades: product.bladeCount === null ? "To be confirmed" : String(product.bladeCount),
    application: "To be confirmed",
    compatibleFrames: product.compatibleFrames ?? undefined,
    description: product.description,
    image: product.imageUrl ?? "",
    minimumOrderQty: product.minimumOrderQty,
    price: product.price?.toString() ?? null,
    isSample: product.isSample,
  };
}

export function mergeCatalogueProducts(databaseProducts: Product[]): Product[] {
  const merged = [...sampleProducts];

  for (const product of databaseProducts) {
    const matchingIndices: number[] = [];
    for (let index = 0; index < merged.length; index += 1) {
      const existing = merged[index];
      if (
        existing.slug.toLowerCase() === product.slug.toLowerCase() ||
        existing.sku.toLowerCase() === product.sku.toLowerCase()
      ) {
        matchingIndices.push(index);
      }
    }

    if (matchingIndices.length === 0) {
      merged.push(product);
      continue;
    }

    const firstIndex = matchingIndices[0];
    merged[firstIndex] = {
      ...merged[firstIndex],
      ...product,
      image: product.image || merged[firstIndex].image,
    };
    for (const index of matchingIndices.slice(1).reverse()) {
      merged.splice(index, 1);
    }
  }

  return merged;
}

export async function getPublicProducts(): Promise<Product[]> {
  if (!process.env.DATABASE_URL) {
    return sampleProducts;
  }

  try {
    const records = await prisma.product.findMany({ orderBy: { name: "asc" } });
    return mergeCatalogueProducts(records.map(fromDatabaseProduct));
  } catch {
    console.error("Unable to load database products; serving the existing sample catalogue.");
    return sampleProducts;
  }
}
