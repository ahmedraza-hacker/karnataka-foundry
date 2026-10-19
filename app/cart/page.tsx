import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";

export const metadata: Metadata = { title: "Enquiry Basket" };

export default function CartPage() {
  return <div className="page-shell"><div className="page-banner cart-banner"><div className="page-banner-inner"><span className="eyebrow eyebrow-light">TEMPORARY SELECTION / 03</span><h1>Your enquiry<br /><em>basket.</em></h1><p>Collect sample catalogue items before sending them with a quotation enquiry.</p><div className="breadcrumbs"><span>HOME</span><b>/</b><strong>BASKET</strong></div></div><div className="banner-art"><span>QUOTE REQUEST / KF</span><div className="banner-ring" /></div></div><section className="cart-section"><CartView /></section></div>;
}
