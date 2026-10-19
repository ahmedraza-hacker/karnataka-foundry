import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link className="brand brand-light" href="/">
            <span className="brand-mark" aria-hidden="true"><span /></span>
            <span className="brand-copy"><strong>KARNATAKA</strong><small>FOUNDRY · ENGINEERED AIRFLOW</small></span>
          </Link>
          <p>AC motor cooling fan solutions for industrial applications and OEM requirements.</p>
        </div>
        <div className="footer-column"><h3>Explore</h3><Link href="/products">Product catalogue</Link><Link href="/#industries">Industries</Link><Link href="/#quality">Manufacturing</Link></div>
        <div className="footer-column"><h3>Work with us</h3><Link href="/quote">Request a quotation</Link><Link href="/cart">Enquiry basket</Link><a href="mailto:enquiries@karnatakafoundry.example">Email placeholder</a></div>
        <div className="footer-column"><h3>Company details</h3><span>Address to be provided</span><span>Phone to be provided</span><span>GSTIN to be provided</span></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Karnataka Foundry. All rights reserved.</span><span>Catalogue entries are illustrative placeholders pending company verification.</span><div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div></div>
    </footer>
  );
}
