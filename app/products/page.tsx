import type { Metadata } from "next";
import { Catalogue } from "@/components/catalogue";
import { getVisibleProducts } from "@/lib/public-products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Product Catalogue",
  description: "Browse sample AC motor cooling fan and industrial component catalogue entries from Karnataka Foundry.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const products = await getVisibleProducts();
  return <div className="page-shell">
    <div className="page-banner"><div className="page-banner-inner"><span className="eyebrow eyebrow-light">PRODUCT CATALOGUE / 01</span><h1>Components for<br /><em>industrial airflow.</em></h1><p>Explore the catalogue and contact us to confirm technical details, availability, and pricing for your application.</p><div className="breadcrumbs"><span>HOME</span><b>/</b><strong>PRODUCTS</strong></div></div><div className="banner-art"><span>KF / PRODUCT SYSTEMS</span><div className="banner-ring" /></div></div>
    <section className="catalogue-section"><div className="catalogue-intro"><div><span className="eyebrow">PRODUCT CATALOGUE / {products.length} LISTINGS</span><h2>Find your component.</h2></div><p>Explore current product records and contact us to confirm technical details, availability, and pricing for your application.</p></div><Catalogue products={products} initialCategory={params.category} /></section>
  </div>;
}
