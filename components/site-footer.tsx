import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link className="brand brand-light" href="/">
            <span className="kf-monogram" aria-hidden="true">KF</span>
            <span className="brand-copy"><strong>KARNATAKA FOUNDRY</strong><small>ENGINEERED FLOW</small></span>
          </Link>
          <p>AC motor cooling fans and airflow components for industrial applications and OEM requirements.</p>
        </div>
        <div className="footer-column">
          <h3>Explore</h3>
          <Link href="/products">Products</Link>
          <Link href="/#about">About Karnataka Foundry</Link>
          <Link href="/quote">Contact and enquiries</Link>
          <Link href="/cart">Enquiry basket</Link>
        </div>
        <div className="footer-column">
          <h3>Company access</h3>
          <Link href="/company/login">Company login</Link>
          <Link href="/company/register">Register a company</Link>
        </div>
        <div className="footer-column">
          <h3>Contact</h3>
          <span>Abdul Khadar · Owner</span>
          <a href="mailto:karnatakafoundry@gmail.com">karnatakafoundry@gmail.com</a>
          <a href="tel:9880430017">9880430017</a>
          <a href="tel:9986333191">9986333191</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Karnataka Foundry. All rights reserved.</span>
        <span>Catalogue entries are illustrative placeholders pending company verification.</span>
        <div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div>
      </div>
    </footer>
  );
}
