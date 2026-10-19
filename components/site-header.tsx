"use client";

import Link from "next/link";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/products", label: "Products" },
  { href: "/#industries", label: "Industries" },
  { href: "/#about", label: "About us" },
  { href: "/#quality", label: "Quality & manufacturing" },
  { href: "/quote", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="Karnataka Foundry home" onClick={() => setOpen(false)}>
          <span className="brand-mark" aria-hidden="true"><span /></span>
          <span className="brand-copy">
            <strong>KARNATAKA</strong>
            <small>FOUNDRY · ENGINEERED AIRFLOW</small>
          </span>
        </Link>
        <button className="mobile-menu-toggle" type="button" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
        <nav className={open ? "main-nav main-nav-open" : "main-nav"} aria-label="Main navigation">
          {links.map((link) => (
            <Link href={link.href} key={link.label} onClick={() => setOpen(false)}>{link.label}</Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link className="icon-button" href="/products" aria-label="Browse products"><Search size={18} /></Link>
          <Link className="header-quote" href="/quote">Request a quote <span aria-hidden="true">↗</span></Link>
          <Link className="icon-button bag-link" href="/cart" aria-label="Enquiry basket"><ShoppingBag size={18} /></Link>
        </div>
      </div>
    </header>
  );
}
