import type { Metadata } from "next";
import { Catalogue } from "@/components/catalogue";

export const metadata: Metadata = {
  title: "Product Catalogue",
  description: "Browse sample AC motor cooling fan and industrial component catalogue entries from Karnataka Foundry.",
};

export default function ProductsPage() {
  return <div className="page-shell">
    <div className="page-banner"><div className="page-banner-inner"><span className="eyebrow eyebrow-light">PRODUCT CATALOGUE / 01</span><h1>Components for<br /><em>industrial airflow.</em></h1><p>Explore the sample range and contact us to confirm technical details, availability, and pricing for your application.</p><div className="breadcrumbs"><span>HOME</span><b>/</b><strong>PRODUCTS</strong></div></div><div className="banner-art"><span>KF / PRODUCT SYSTEMS</span><div className="banner-ring" /></div></div>
    <section className="catalogue-section"><div className="catalogue-intro"><div><span className="eyebrow">SAMPLE RANGE / 04 LISTINGS</span><h2>Find your component.</h2></div><p>All model numbers and descriptions below are development samples, not verified product specifications.</p></div><Catalogue /></section>
  </div>;
}
