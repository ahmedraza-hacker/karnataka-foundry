import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return <article className="legal-page">
    <span className="eyebrow">COMPANY INFORMATION REQUIRED</span>
    <h1>Terms & conditions</h1>
    <p className="legal-lead">This placeholder is not a contract or final terms of sale. The company must provide and approve terms before accepting commercial orders.</p>
    <h2>Catalogue information</h2><p>All catalogue entries currently shown are illustrative development samples. They do not represent a confirmed product specification, price, inventory position, delivery commitment, or offer to sell.</p>
    <h2>Quotation and order terms</h2><p>Define quotation validity, specification approval, minimum order quantities, pricing and taxes, payment terms, delivery and title, inspection/acceptance, warranty, returns, liability, governing law, and dispute resolution with appropriate legal review.</p>
  </article>;
}
