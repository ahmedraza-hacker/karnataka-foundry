export type ProductImageVisibility =
  | "PUBLIC"
  | "APPROVED_BUYERS"
  | "SELECTED_COMPANIES";

export type ProductImageAccess = "public" | "private";

export function getProductImageAccess(
  visibility: ProductImageVisibility,
): ProductImageAccess {
  return visibility === "PUBLIC" ? "public" : "private";
}

export function isProductImageUrlForVisibility(
  value: string,
  visibility: ProductImageVisibility,
): boolean {
  try {
    const url = new URL(value);
    const expectedAccess = getProductImageAccess(visibility);
    const matchesStore =
      url.protocol === "https:" &&
      url.hostname.endsWith(`.${expectedAccess}.blob.vercel-storage.com`)
    if (!matchesStore) return false;
    return (
      expectedAccess === "public" ||
      url.pathname.startsWith("/products/restricted/")
    );
  } catch {
    return false;
  }
}

export function getProductImageSource({
  slug,
  visibility,
  imageUrl,
}: {
  slug: string;
  visibility: ProductImageVisibility;
  imageUrl: string | null;
}): string {
  if (!imageUrl) return "";
  if (visibility === "PUBLIC") return imageUrl;
  return `/api/products/${encodeURIComponent(slug)}/image`;
}
