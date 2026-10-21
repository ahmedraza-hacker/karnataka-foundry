import { z } from "zod";
import { ProductVisibility } from "@prisma/client";

const nullableText = (maximum: number) =>
  z.string().trim().max(maximum).optional().nullable().transform((value) => value || null);

const nullableNumber = (maximum: number, integer = false) =>
  z.preprocess(
    (value) => (value === "" || value === null ? null : value),
    (integer
      ? z.coerce.number().int().min(0).max(maximum)
      : z.coerce.number().finite().min(0).max(maximum)
    ).nullable(),
  );

const blobImageUrl = z.preprocess(
  (value) => (value === "" || value === null ? null : value),
  z.string().url().max(2048).nullable(),
).refine((value) => {
  if (value === null) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}, "Use an uploaded public Vercel Blob image.");

export const adminProductSchema = z.object({
  name: z.string().trim().min(1).max(160),
  slug: z.string().trim().min(1).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase URL slug."),
  sku: z.string().trim().min(1).max(80),
  category: z.string().trim().min(1).max(120),
  material: nullableText(160),
  outerDiameterMm: nullableNumber(100_000),
  innerDiameterMm: nullableNumber(100_000),
  overallDimensions: nullableText(300),
  bladeCount: nullableNumber(1_000, true),
  compatibleFrames: nullableText(300),
  description: z.string().trim().min(1).max(5000),
  minimumOrderQty: z.coerce.number().int().min(1).max(1_000_000),
  imageUrl: blobImageUrl,
  price: z.preprocess(
    (value) => (value === "" || value === null ? null : value),
    z.coerce.number().finite().positive().max(9_999_999_999.99).nullable(),
  ),
  isSample: z.boolean(),
  visibility: z.nativeEnum(ProductVisibility),
  selectedCompanyIds: z.array(z.string().min(1).max(64)).max(500)
    .refine((ids) => new Set(ids).size === ids.length),
}).superRefine((product, context) => {
  if (product.visibility === ProductVisibility.SELECTED_COMPANIES && product.selectedCompanyIds.length === 0) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["selectedCompanyIds"],
      message: "Select at least one approved company.",
    });
  }
  if (product.visibility !== ProductVisibility.SELECTED_COMPANIES && product.selectedCompanyIds.length > 0) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["selectedCompanyIds"],
      message: "Company access is only valid for selected-company products.",
    });
  }
  if (product.visibility !== ProductVisibility.PUBLIC && product.imageUrl) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["imageUrl"],
      message: "Remove public product images before restricting product visibility.",
    });
  }
});
