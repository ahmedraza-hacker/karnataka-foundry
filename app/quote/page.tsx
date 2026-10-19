import type { Metadata } from "next";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
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
    <section className="quote-layout"><div className="quote-sidebar"><span className="eyebrow">DIRECT ENQUIRIES</span><h2>Let's find the<br /><em>right fit.</em></h2><p>For product questions, custom requirements, or OEM discussions, send us the details and we will follow up.</p><div className="contact-detail"><Mail size={18} /><div><small>EMAIL</small><a href="mailto:enquiries@karnatakafoundry.example">To be configured</a></div></div><div className="contact-detail"><Phone size={18} /><div><small>PHONE</small><span>Company number to be provided</span></div></div><div className="contact-detail"><MapPin size={18} /><div><small>LOCATION</small><span>Company address to be provided</span></div></div><div className="sidebar-note"><span>GOOD TO KNOW</span><p>Product details shown on this site are sample placeholders. A drawing or motor/application details can help the team assess your requirements.</p><ArrowRight size={18} /></div></div><div className="quote-form-panel"><div className="form-panel-heading"><span className="eyebrow">ENQUIRY FORM / 01</span><h2>Request a quotation</h2><p>Required fields are marked with an asterisk.</p></div><QuoteForm productReference={productReference} /></div></section>
  </div>;
}
