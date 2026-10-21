import type { Metadata } from "next";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { QuoteForm } from "@/components/quote-form";

export const metadata: Metadata = {
  title: "Request a Quotation",
  description: "Send Karnataka Foundry your AC motor cooling fan requirements and request a technical quotation.",
};

export default async function QuotePage({ searchParams }: { searchParams: Promise<{ product?: string; products?: string }> }) {
  const params = await searchParams;
  const productReference = [params.product, params.products].filter(Boolean).join(", ").slice(0, 500);
  return <div className="page-shell">
    <div className="page-banner quote-banner"><div className="page-banner-inner"><span className="eyebrow eyebrow-light">LET'S START A CONVERSATION / 02</span><h1>Tell us what<br /><em>you need.</em></h1><p>Share your application and technical requirements. Our team can review the details and respond with next steps.</p><div className="breadcrumbs"><span>HOME</span><b>/</b><strong>ENQUIRY</strong></div></div><div className="banner-art"><span>TECHNICAL ENQUIRIES / KF</span><div className="banner-ring" /></div></div>
    <section className="quote-layout" id="contact">
      <div className="quote-sidebar">
        <span className="eyebrow">KARNATAKA FOUNDRY / ENGINEERED FLOW</span>
        <h2>Let’s discuss<br /><em>your requirement.</em></h2>
        <p>Contact Abdul Khadar or send your product and application details using the enquiry form.</p>
        <div className="contact-detail"><Mail size={18} /><div><small>EMAIL</small><a href="mailto:karnatakafoundry@gmail.com">karnatakafoundry@gmail.com</a></div></div>
        <div className="contact-detail"><Phone size={18} /><div><small>MOBILE</small><a href="tel:9880430017">9880430017</a></div></div>
        <div className="contact-detail"><Phone size={18} /><div><small>ALTERNATE PHONE</small><a href="tel:9986333191">9986333191</a></div></div>
        <div className="contact-detail"><span aria-hidden="true" className="contact-owner-mark">KF</span><div><small>OWNER</small><span>Abdul Khadar</span></div></div>
        <div className="sidebar-note"><span>SEND AN ENQUIRY</span><p>Share motor details, drawings, dimensions, and application requirements for review.</p><ArrowRight size={18} /></div>
      </div>
      <div className="quote-form-panel">
        <div className="form-panel-heading"><span className="eyebrow">ENQUIRY FORM / 01</span><h2>Request a quotation</h2><p>Required fields are marked with an asterisk.</p></div>
        <QuoteForm productReference={productReference} />
      </div>
    </section>
  </div>;
}
