"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { products as sampleProducts, type Product } from "@/lib/products";

export function CartView() {
  const { lines, remove, setQuantity, clear } = useCart();
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [loadError, setLoadError] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/products", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const result = (await response.json()) as { products?: Product[]; message?: string };
        if (!response.ok) throw new Error(result.message ?? "Unable to refresh product details.");
        setProducts(result.products ?? sampleProducts);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") return;
        setLoadError("Some basket product details could not be refreshed.");
        console.error("Unable to refresh product details in the enquiry basket.");
      })
      .finally(() => setLoadingProducts(false));
    return () => controller.abort();
  }, []);

  const items = lines.map((line) => ({ line, product: products.find((product) => product.slug === line.slug) })).filter((item) => item.product);
  const reference = items.map(({ line, product }) => `${product?.sku} (qty ${line.quantity})`).join(", ");

  if (items.length === 0 && loadingProducts) return <p role="status" className="empty-state">Loading selected products…</p>;
  if (items.length === 0) return <div className="empty-state">{loadError && <p role="status" className="form-error">{loadError}</p>}<span className="eyebrow">YOUR BASKET IS EMPTY</span><h2>Start with a product.</h2><p>Add catalogue listings here to include them in a quotation enquiry.</p><Link className="button button-dark" href="/products">Browse products <ArrowRight size={17} /></Link></div>;
  return <>{loadError && <p role="status" className="cart-notice">{loadError}</p>}<div className="cart-notice"><strong>Temporary basket only.</strong> Items are held in this browser session and are not an order, reservation, or price confirmation.</div><div className="basket-list">{items.map(({ line, product }) => <article className="basket-item" key={line.slug}><div className="basket-thumbnail"><span>ILLUSTRATIVE</span></div><div className="basket-details"><span className="eyebrow">{product?.category}</span><h2>{product?.name}</h2><p>Part no. {product?.sku} · Quote on request</p></div><div className="basket-quantity"><span>ENQUIRY QTY</span><div><button aria-label={`Decrease ${product?.name} quantity`} disabled={line.quantity <= 1} onClick={() => setQuantity(line.slug, line.quantity - 1)}><Minus size={14} /></button><strong>{line.quantity}</strong><button aria-label={`Increase ${product?.name} quantity`} onClick={() => setQuantity(line.slug, line.quantity + 1)}><Plus size={14} /></button></div></div><button className="remove-item" aria-label={`Remove ${product?.name}`} onClick={() => remove(line.slug)}><Trash2 size={16} /></button></article>)}</div><div className="basket-actions"><button className="text-button" onClick={clear}>Clear basket</button><Link className="button button-copper" href={`/quote?products=${encodeURIComponent(reference)}`}>Continue to quotation enquiry <ArrowRight size={17} /></Link></div></>;
}
