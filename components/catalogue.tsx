"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { products } from "@/lib/products";
import { ProductCard } from "@/components/product-card";

export function Catalogue() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const categories = ["All categories", ...Array.from(new Set(products.map((product) => product.category)))];
  const filtered = useMemo(() => products.filter((product) => {
    const matchesSearch = `${product.name} ${product.sku} ${product.category} ${product.application}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesSearch && (category === "All categories" || product.category === category);
  }), [query, category]);

  return <>
    <div className="catalogue-controls">
      <label className="search-field"><Search size={18} /><span className="sr-only">Search products</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by product, model or part number" /></label>
      <label className="filter-field"><SlidersHorizontal size={16} /><span className="sr-only">Filter by category</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
      <span className="result-count">{filtered.length} sample {filtered.length === 1 ? "listing" : "listings"}</span>
    </div>
    {filtered.length > 0 ? <div className="product-grid">{filtered.map((product, index) => <ProductCard key={product.slug} product={product} index={index} />)}</div> : <div className="empty-state"><span className="eyebrow">No matches</span><h2>Try another search</h2><p>Check the spelling or clear the category filter to see the sample catalogue.</p><button className="button button-outline" onClick={() => { setQuery(""); setCategory("All categories"); }}>Clear filters</button></div>}
    <p className="catalogue-disclaimer">These are sample catalogue records. Product availability, specifications, pricing, and minimum order quantities require confirmation from Karnataka Foundry.</p>
  </>;
}
