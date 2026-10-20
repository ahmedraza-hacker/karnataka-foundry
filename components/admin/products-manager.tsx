"use client";

import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { put } from "@vercel/blob/client";
import { ImagePlus, Plus, Search, X } from "lucide-react";
import { ProductImage } from "@/components/product-image";

type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  material: string | null;
  outerDiameterMm: number | null;
  innerDiameterMm: number | null;
  overallDimensions: string | null;
  bladeCount: number | null;
  compatibleFrames: string | null;
  description: string;
  minimumOrderQty: number;
  price: string | number | null;
  imageUrl: string | null;
  isSample: boolean;
  updatedAt: string;
};

type ProductForm = {
  name: string;
  slug: string;
  sku: string;
  category: string;
  material: string;
  outerDiameterMm: string;
  innerDiameterMm: string;
  overallDimensions: string;
  bladeCount: string;
  compatibleFrames: string;
  description: string;
  minimumOrderQty: string;
  price: string;
  imageUrl: string;
  isSample: boolean;
};

const emptyForm: ProductForm = {
  name: "",
  slug: "",
  sku: "",
  category: "",
  material: "",
  outerDiameterMm: "",
  innerDiameterMm: "",
  overallDimensions: "",
  bladeCount: "",
  compatibleFrames: "",
  description: "",
  minimumOrderQty: "1",
  price: "",
  imageUrl: "",
  isSample: true,
};

function toForm(product: Product): ProductForm {
  return {
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    category: product.category,
    material: product.material ?? "",
    outerDiameterMm: product.outerDiameterMm?.toString() ?? "",
    innerDiameterMm: product.innerDiameterMm?.toString() ?? "",
    overallDimensions: product.overallDimensions ?? "",
    bladeCount: product.bladeCount?.toString() ?? "",
    compatibleFrames: product.compatibleFrames ?? "",
    description: product.description,
    minimumOrderQty: product.minimumOrderQty.toString(),
    price: product.price?.toString() ?? "",
    imageUrl: product.imageUrl ?? "",
    isSample: product.isSample,
  };
}

export function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/products", { cache: "no-store" });
      const result = (await response.json()) as { products?: Product[]; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not load products.");
      setProducts(result.products ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.sku} ${product.slug} ${product.category}`.toLowerCase().includes(search.trim().toLowerCase()),
  );

  function openNewProduct() {
    setEditing(null);
    setForm(emptyForm);
    setCreating(true);
    setError("");
    setNotice("");
  }

  function openEditProduct(product: Product) {
    setEditing(product);
    setForm(toForm(product));
    setCreating(true);
    setError("");
    setNotice("");
  }

  function closeForm() {
    if (saving) return;
    setCreating(false);
    setEditing(null);
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(editing ? `/api/admin/products/${encodeURIComponent(editing.id)}` : "/api/admin/products", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not save product.");
      setCreating(false);
      setEditing(null);
      setNotice(editing ? "Product updated." : "Product created.");
      await loadProducts();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save product.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadProductImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
      setError("Choose a JPEG, PNG, WebP, or AVIF image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Choose an image smaller than 5 MB.");
      return;
    }

    setUploadingImage(true);
    setError("");
    setNotice("");
    let uploadStage: "authorization" | "blob" = "authorization";
    let authorizationStatus: number | null = null;
    let clientUploadToken: string | undefined;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 60_000);
    try {
      const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const pathname = `products/${filename}`;
      const tokenResponse = await fetch("/api/admin/product-image", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "blob.generate-client-token",
          payload: { pathname, multipart: false, clientPayload: null },
        }),
      });
      authorizationStatus = tokenResponse.status;
      const tokenResult = (await tokenResponse.json().catch(() => null)) as
        | { clientToken?: string; error?: string }
        | null;

      if (!tokenResponse.ok) {
        throw new Error(
          tokenResult?.error ??
            `Image upload authorization failed (HTTP ${tokenResponse.status}).`,
        );
      }
      if (!tokenResult?.clientToken) {
        throw new Error("Image upload authorization returned no upload token.");
      }

      uploadStage = "blob";
      clientUploadToken = tokenResult.clientToken;
      const blob = await put(pathname, file, {
        access: "public",
        token: clientUploadToken,
        contentType: file.type,
        abortSignal: controller.signal,
      });
      updateField("imageUrl", blob.url);
      setNotice("Image uploaded. Save the product to attach it to this record.");
    } catch (uploadError) {
      const rawMessage = controller.signal.aborted
        ? "Image upload timed out. Check your connection and try again."
        : uploadError instanceof Error
          ? uploadError.message
          : "Unexpected image upload error.";
      const message = clientUploadToken
        ? rawMessage.replaceAll(clientUploadToken, "[redacted]")
        : rawMessage;
      const status =
        uploadStage === "authorization"
          ? `HTTP ${authorizationStatus ?? "unknown"}`
          : "not exposed by the Vercel Blob SDK";
      const privateStoreFailure =
        uploadStage === "blob" &&
        message.includes("Cannot use public access on a private store");
      const userMessage = privateStoreFailure
        ? "This Vercel Blob store is private, but product images need public access. Connect a public Blob store and update BLOB_READ_WRITE_TOKEN."
        : message;
      console.error(
        `[product image upload] stage=${uploadStage}; status=${status}; ${message}`,
      );
      setError(userMessage);
    } finally {
      window.clearTimeout(timeout);
      setUploadingImage(false);
    }
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(`Delete "${product.name}" (${product.sku})? This cannot be undone.`)) return;
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/products/${encodeURIComponent(product.id)}`, { method: "DELETE" });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not delete product.");
      setProducts((items) => items.filter((item) => item.id !== product.id));
      setNotice("Product deleted.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete product.");
    }
  }

  function updateField<Key extends keyof ProductForm>(key: Key, value: ProductForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#a96f48]">Catalogue administration</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Products</h1>
          <p className="mt-2 text-sm text-slate-600">Manage product records and technical information stored in the catalogue.</p>
        </div>
        <button type="button" onClick={openNewProduct} className="inline-flex items-center gap-2 rounded-lg bg-[#252a2d] px-4 py-3 text-sm font-semibold text-white hover:bg-[#3b4144]">
          <Plus size={17} /> Add product
        </button>
      </div>

      {(error || notice) && (
        <div role={error ? "alert" : "status"} className={`mb-4 rounded-lg p-3 text-sm ${error ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>{error || notice}</div>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
          <label className="flex min-w-[230px] flex-1 items-center gap-3 rounded-lg border border-slate-300 px-3 sm:max-w-md">
            <Search size={17} className="shrink-0 text-slate-400" />
            <span className="sr-only">Search products</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search product, SKU, or category" className="min-w-0 flex-1 py-3 text-sm outline-none" />
          </label>
          <span className="text-xs text-slate-500">{loading ? "Loading…" : `${filteredProducts.length} ${filteredProducts.length === 1 ? "product" : "products"}`}</span>
        </div>
        {loading && products.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">Loading products…</p>
        ) : error && products.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">Products could not be loaded.</p>
        ) : filteredProducts.length === 0 ? (
          <div className="p-10 text-center">
            <h2 className="font-semibold">{products.length ? "No matching products" : "No products yet"}</h2>
            <p className="mt-2 text-sm text-slate-500">{products.length ? "Try another product name, SKU, or category." : "Add the first product record to your catalogue."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[730px] text-left text-sm">
              <thead className="bg-[#f7f7f5] text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="px-5 py-3 font-semibold">Product</th><th className="px-5 py-3 font-semibold">Category</th><th className="px-5 py-3 font-semibold">Pricing</th><th className="px-5 py-3 font-semibold">Record type</th><th className="px-5 py-3"><span className="sr-only">Actions</span></th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4"><strong className="block font-semibold">{product.name}</strong><span className="mt-1 block text-xs text-slate-500">{product.sku} · /{product.slug}</span></td>
                    <td className="px-5 py-4 text-slate-600">{product.category}</td>
                    <td className="px-5 py-4 text-slate-600">{product.price ? `₹${Number(product.price).toLocaleString()}` : "Quote only"}</td>
                    <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${product.isSample ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-700"}`}>{product.isSample ? "Sample" : "Catalogue"}</span></td>
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <button type="button" onClick={() => openEditProduct(product)} className="mr-4 font-semibold text-[#a96f48] hover:underline">Edit</button>
                      <button type="button" onClick={() => void deleteProduct(product)} className="font-semibold text-red-700 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {creating && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/45" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="product-form-heading" className="h-full w-full max-w-3xl overflow-y-auto bg-white p-5 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#a96f48]">Product catalogue</p><h2 id="product-form-heading" className="mt-2 text-2xl font-semibold">{editing ? "Edit product" : "Add product"}</h2></div>
              <button type="button" onClick={closeForm} aria-label="Close product form" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button>
            </div>
            <form onSubmit={saveProduct} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Product name" required><input required maxLength={160} value={form.name} onChange={(event) => updateField("name", event.target.value)} /></Field>
                <Field label="SKU / part number" required><input required maxLength={80} value={form.sku} onChange={(event) => updateField("sku", event.target.value)} /></Field>
                <Field label="URL slug" hint="Lowercase letters, numbers, and hyphens only." required><input required maxLength={180} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={form.slug} onChange={(event) => updateField("slug", event.target.value)} /></Field>
                <Field label="Category" required><input required maxLength={120} value={form.category} onChange={(event) => updateField("category", event.target.value)} /></Field>
                <Field label="Material"><input maxLength={160} value={form.material} onChange={(event) => updateField("material", event.target.value)} /></Field>
                <Field label="Minimum order quantity" required><input type="number" required min="1" max="1000000" value={form.minimumOrderQty} onChange={(event) => updateField("minimumOrderQty", event.target.value)} /></Field>
                <Field label="Outer diameter (mm)"><input type="number" min="0" step="any" value={form.outerDiameterMm} onChange={(event) => updateField("outerDiameterMm", event.target.value)} /></Field>
                <Field label="Inner diameter / bore (mm)"><input type="number" min="0" step="any" value={form.innerDiameterMm} onChange={(event) => updateField("innerDiameterMm", event.target.value)} /></Field>
                <Field label="Blade count"><input type="number" min="0" step="1" value={form.bladeCount} onChange={(event) => updateField("bladeCount", event.target.value)} /></Field>
                <Field label="Compatible motor frames"><input maxLength={300} value={form.compatibleFrames} onChange={(event) => updateField("compatibleFrames", event.target.value)} /></Field>
                <Field label="Overall dimensions" hint="For example: diameter × height"><input maxLength={300} value={form.overallDimensions} onChange={(event) => updateField("overallDimensions", event.target.value)} /></Field>
                <Field label="Price (INR)" hint="Leave blank to use quote-only pricing."><input type="number" min="0.01" max="9999999999.99" step="0.01" value={form.price} onChange={(event) => updateField("price", event.target.value)} /></Field>
                <Field label="Description" className="sm:col-span-2"><textarea required maxLength={5000} rows={4} value={form.description} onChange={(event) => updateField("description", event.target.value)} /></Field>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-700">Product image</p>
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  {form.imageUrl ? (
                    <ProductImage src={form.imageUrl} alt="Product image preview" width={112} height={112} className="h-28 w-28 rounded-lg border border-slate-200 bg-white object-contain p-2" fallbackClassName="flex h-28 w-28 items-center justify-center rounded-lg bg-slate-100 text-center text-xs text-slate-500" />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-lg bg-slate-100 text-center text-xs text-slate-500">No image uploaded</div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <label className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-semibold hover:bg-slate-50 ${uploadingImage ? "pointer-events-none opacity-60" : ""}`}>
                      <ImagePlus size={16} /> {uploadingImage ? "Uploading…" : form.imageUrl ? "Replace image" : "Upload image"}
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={uploadingImage} onChange={(event) => void uploadProductImage(event)} className="sr-only" />
                    </label>
                    {form.imageUrl && <button type="button" onClick={() => updateField("imageUrl", "")} className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Remove image</button>}
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500">JPEG, PNG, WebP, or AVIF · max 5 MB. Stored in Vercel Blob and linked after saving this product.</p>
              </div>
              <label className="flex items-start gap-3 rounded-lg bg-[#f7f7f5] p-4 text-sm">
                <input type="checkbox" checked={form.isSample} onChange={(event) => updateField("isSample", event.target.checked)} className="mt-0.5" />
                <span><strong className="block">Mark as a sample listing</strong><span className="mt-1 block text-xs text-slate-500">This reflects the existing `isSample` field; the schema does not currently track stock availability.</span></span>
              </label>
              <p className="text-xs leading-5 text-slate-500">Availability is not a field in the current database model.</p>
              {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5">
                <button type="button" onClick={closeForm} disabled={saving} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60">Cancel</button>
                <button type="submit" disabled={saving || uploadingImage} className="rounded-lg bg-[#252a2d] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3b4144] disabled:opacity-60">{saving ? "Saving…" : editing ? "Save changes" : "Create product"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

function Field({
  label,
  required,
  hint,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block text-xs font-semibold text-slate-700 ${className}`}>
      {label}{required && <span className="ml-1 text-red-700">*</span>}
      {hint && <span className="mt-1 block font-normal text-slate-500">{hint}</span>}
      <span className="mt-1 block [&>input]:w-full [&>input]:rounded-lg [&>input]:border [&>input]:border-slate-300 [&>input]:bg-white [&>input]:px-3 [&>input]:py-2.5 [&>input]:text-sm [&>input]:font-normal [&>input]:text-slate-900 [&>input]:outline-none [&>input]:focus:border-[#c77d45] [&>textarea]:w-full [&>textarea]:rounded-lg [&>textarea]:border [&>textarea]:border-slate-300 [&>textarea]:bg-white [&>textarea]:px-3 [&>textarea]:py-2.5 [&>textarea]:text-sm [&>textarea]:font-normal [&>textarea]:text-slate-900 [&>textarea]:outline-none [&>textarea]:focus:border-[#c77d45]">
        {children}
      </span>
    </label>
  );
}
