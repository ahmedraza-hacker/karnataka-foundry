import assert from "node:assert/strict";
import test from "node:test";
import { adminProductSchema } from "@/lib/admin-product-schema";
import {
  canViewProduct,
  filterVisibleProductRecords,
  mergeCatalogueProducts,
} from "@/lib/public-products";
import {
  getProductImageAccess,
  getProductImageSource,
} from "@/lib/product-image";
import { products as sampleProducts } from "@/lib/products";

const buyer = { id: "buyer-1", role: "BUYER" as const, status: "APPROVED" as const };
const supplier = { id: "supplier-1", role: "SUPPLIER" as const, status: "APPROVED" as const };
const suspendedBuyer = { id: "buyer-2", role: "BUYER" as const, status: "SUSPENDED" as const };

test("public products are visible without a company account", () => {
  assert.equal(canViewProduct("PUBLIC", null, []), true);
});

test("approved-buyer products require an approved buyer-capable role", () => {
  assert.equal(canViewProduct("APPROVED_BUYERS", buyer, []), true);
  assert.equal(canViewProduct("APPROVED_BUYERS", supplier, []), false);
  assert.equal(canViewProduct("APPROVED_BUYERS", suspendedBuyer, []), false);
  assert.equal(canViewProduct("APPROVED_BUYERS", null, []), false);
});

test("selected-company products require an explicit grant and approved status", () => {
  assert.equal(canViewProduct("SELECTED_COMPANIES", supplier, ["supplier-1"]), true);
  assert.equal(canViewProduct("SELECTED_COMPANIES", buyer, ["another-company"]), false);
  assert.equal(canViewProduct("SELECTED_COMPANIES", suspendedBuyer, ["buyer-2"]), false);
});

test("unauthorized records are omitted from the shared listing and detail lookup source", () => {
  const products = [
    { slug: "public", visibility: "PUBLIC" as const, companyAccess: [] },
    { slug: "buyers", visibility: "APPROVED_BUYERS" as const, companyAccess: [] },
    {
      slug: "selected",
      visibility: "SELECTED_COMPANIES" as const,
      companyAccess: [{ companyId: "buyer-1" }],
    },
  ];

  const publicProducts = filterVisibleProductRecords(products, null);
  assert.deepEqual(publicProducts.map((product) => product.slug), ["public"]);

  const buyerProducts = filterVisibleProductRecords(products, buyer);
  assert.deepEqual(
    buyerProducts.map((product) => product.slug).sort(),
    ["buyers", "public", "selected"],
  );

  const supplierProducts = filterVisibleProductRecords(products, supplier);
  assert.deepEqual(supplierProducts.map((product) => product.slug), ["public"]);
});

test("restricted products hide matching sample catalogue entries from public visitors", () => {
  const records = [
    {
      slug: "ac-motor-cooling-fan",
      sku: "PRIVATE-KF-001",
      visibility: "APPROVED_BUYERS" as const,
      companyAccess: [],
    },
    {
      slug: "private-impeller",
      sku: "SAMPLE-KF-002",
      visibility: "SELECTED_COMPANIES" as const,
      companyAccess: [],
    },
  ];
  const visibleRecords = filterVisibleProductRecords(records, null);
  const hiddenProductKeys = new Set(
    records
      .filter((record) => !visibleRecords.includes(record))
      .flatMap((record) => [record.slug.toLowerCase(), record.sku.toLowerCase()]),
  );

  const catalogue = mergeCatalogueProducts([], new Set(), hiddenProductKeys);

  assert.equal(catalogue.some((product) => product.slug === "ac-motor-cooling-fan"), false);
  assert.equal(catalogue.some((product) => product.slug === "motor-cooling-impeller"), false);
  assert.equal(
    catalogue.some((product) => product.slug === "custom-cooling-fan"),
    sampleProducts.some((product) => product.slug === "custom-cooling-fan"),
  );
});

test("administrators can inspect all visibility classes", () => {
  assert.equal(canViewProduct("SELECTED_COMPANIES", null, [], true), true);
});

test("product images use access-matched storage for all visibility types", () => {
  const publicProduct = {
    name: "Industrial fan",
    slug: "industrial-fan",
    sku: "KF-100",
    category: "Fans",
    outerDiameterMm: "",
    innerDiameterMm: "",
    bladeCount: "",
    description: "Product description",
    minimumOrderQty: 1,
    imageUrl: "https://example.public.blob.vercel-storage.com/products/public/fan.png",
    price: null,
    isSample: false,
    visibility: "PUBLIC",
    selectedCompanyIds: [],
  };

  const privateImageUrl =
    "https://example.private.blob.vercel-storage.com/products/restricted/fan.png";
  const cases = [
    { visibility: "PUBLIC" as const, imageUrl: publicProduct.imageUrl, access: "public" as const },
    { visibility: "APPROVED_BUYERS" as const, imageUrl: privateImageUrl, access: "private" as const },
    { visibility: "SELECTED_COMPANIES" as const, imageUrl: privateImageUrl, access: "private" as const },
  ];

  for (const { visibility, imageUrl, access } of cases) {
    const data = {
      ...publicProduct,
      imageUrl,
      visibility,
      selectedCompanyIds: visibility === "SELECTED_COMPANIES" ? ["company-1"] : [],
    };
    assert.equal(adminProductSchema.safeParse(data).success, true, `${visibility} accepts a matching image`);
    assert.equal(getProductImageAccess(visibility), access);
    assert.equal(
      getProductImageSource({ slug: "fan", visibility, imageUrl }),
      visibility === "PUBLIC" ? imageUrl : "/api/products/fan/image",
    );
  }

  assert.equal(
    adminProductSchema.safeParse({
      ...publicProduct,
      visibility: "APPROVED_BUYERS",
    }).success,
    false,
    "restricted products cannot save a public Blob URL",
  );
  assert.equal(
    adminProductSchema.safeParse({
      ...publicProduct,
      imageUrl: privateImageUrl,
    }).success,
    false,
    "public products cannot save a private Blob URL",
  );
});
