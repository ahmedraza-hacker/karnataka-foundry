import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Notice" };

export default function PrivacyPage() {
  return <article className="legal-page">
    <span className="eyebrow">COMPANY INFORMATION REQUIRED</span>
    <h1>Privacy notice</h1>
    <p className="legal-lead">This draft page is not a final privacy policy. Karnataka Foundry must provide and review its legal entity details, data practices, retention periods, processors, and contact information before launch.</p>
    <h2>Enquiry information</h2><p>The quotation form is designed to save submitted business contact and requirement details in the configured PostgreSQL database. Do not submit sensitive personal, financial, or payment information through the form.</p>
    <h2>Before production</h2><p>Document the lawful basis, purposes, access controls, retention/deletion process, hosting location, data processors, individual rights process, and a monitored privacy contact. Obtain legal review appropriate to the company and jurisdictions served.</p>
  </article>;
}
