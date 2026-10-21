import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { isAdminSession } from "@/lib/admin-auth";
import { isApprovedCompany, type ApprovedCompanyContext } from "@/lib/company-auth";
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

export function mergeCatalogueProducts(
  databaseProducts: Product[],
  restrictedProductKeys: ReadonlySet<string> = new Set(),
  hiddenProductKeys: ReadonlySet<string> = new Set(),
): Product[] {
  const merged = sampleProducts.filter(
    (product) =>
      !hiddenProductKeys.has(product.slug.toLowerCase()) &&
      !hiddenProductKeys.has(product.sku.toLowerCase()),
  );

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
    const preventSampleImage =
      restrictedProductKeys.has(product.slug.toLowerCase()) ||
      restrictedProductKeys.has(product.sku.toLowerCase());
    merged[firstIndex] = {
      ...merged[firstIndex],
      ...product,
      image: product.image || (preventSampleImage ? "" : merged[firstIndex].image),
    };
    for (const index of matchingIndices.slice(1).reverse()) {
      merged.splice(index, 1);
    }
  }

  return merged;
}

export function canViewProduct(
  visibility: "PUBLIC" | "APPROVED_BUYERS" | "SELECTED_COMPANIES",
  company: ApprovedCompanyContext | null,
  authorizedCompanyIds: readonly string[],
  isAdmin = false,
): boolean {
  if (isAdmin || visibility === "PUBLIC") return true;
  if (!company || company.status !== "APPROVED") return false;

  if (visibility === "APPROVED_BUYERS") {
    return company.role === "BUYER" || company.role === "BOTH";
  }

  return authorizedCompanyIds.includes(company.id);
}

type ProductVisibilityRecord = {
  visibility: "PUBLIC" | "APPROVED_BUYERS" | "SELECTED_COMPANIES";
  companyAccess: { companyId: string }[];
};

export function filterVisibleProductRecords<T extends ProductVisibilityRecord>(
  products: T[],
  company: ApprovedCompanyContext | null,
  isAdmin = false,
): T[] {
  return products.filter((product) =>
    canViewProduct(
      product.visibility,
      company,
      product.companyAccess.map((access) => access.companyId),
      isAdmin,
    ),
  );
}

export async function getVisibleProducts(): Promise<Product[]> {
  if (!process.env.DATABASE_URL) {
    return sampleProducts;
  }

  try {
    const session = await auth();
    const isAdmin = isAdminSession(session);
    let company: ApprovedCompanyContext | null = null;

    if (session?.user?.accountType === "COMPANY" && session.user.companyId && !isAdmin) {
      const record = await prisma.company.findUnique({
        where: { id: session.user.companyId },
        select: { id: true, role: true, status: true },
      });
      if (record && isApprovedCompany(record)) {
        company = { id: record.id, role: record.role, status: record.status };
      }
    }

    const records = await prisma.product.findMany({
      where: isAdmin
        ? undefined
        : {
            OR: [
              { visibility: "PUBLIC" },
              ...(company && (company.role === "BUYER" || company.role === "BOTH")
                ? [{ visibility: "APPROVED_BUYERS" as const }]
                : []),
              ...(company
                ? [
                    {
                      visibility: "SELECTED_COMPANIES" as const,
                      companyAccess: { some: { companyId: company.id } },
                    },
                  ]
                : []),
            ],
          },
      include: { companyAccess: { select: { companyId: true } } },
      orderBy: { name: "asc" },
    });
    const visibleRecords = filterVisibleProductRecords(records, company, isAdmin);

    const hiddenProductKeys = isAdmin
      ? new Set<string>()
      : new Set(
          (await prisma.product.findMany({
            where: { visibility: { not: "PUBLIC" } },
            select: {
              slug: true,
              sku: true,
              visibility: true,
              companyAccess: { select: { companyId: true } },
            },
          }))
            .filter(
              (product) =>
                !canViewProduct(
                  product.visibility,
                  company,
                  product.companyAccess.map((access) => access.companyId),
                ),
            )
            .flatMap((product) => [product.slug.toLowerCase(), product.sku.toLowerCase()]),
        );
    const restrictedProductKeys = new Set(
      visibleRecords
        .filter((product) => product.visibility !== "PUBLIC")
        .flatMap((product) => [product.slug.toLowerCase(), product.sku.toLowerCase()]),
    );
    return mergeCatalogueProducts(
      visibleRecords.map(fromDatabaseProduct),
      restrictedProductKeys,
      hiddenProductKeys,
    );
  } catch {
    console.error("Unable to verify product visibility; omitting the catalogue.");
    return [];
  }
}
