"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/#about", label: "About" },
  { href: "/quote", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isCompany = status === "authenticated" && session?.user?.accountType === "COMPANY";
  const isAdmin = status === "authenticated" && session?.user?.accountType === "ADMIN";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="Karnataka Foundry home" onClick={() => setOpen(false)}>
          <span className="kf-monogram" aria-hidden="true">KF</span>
          <span className="brand-copy">
            <strong>KARNATAKA FOUNDRY</strong>
            <small>ENGINEERED FLOW</small>
          </span>
        </Link>
        <button
          className="mobile-menu-toggle"
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-controls="main-navigation"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
        <nav id="main-navigation" className={open ? "main-nav main-nav-open" : "main-nav"} aria-label="Main navigation">
          {links.map((link) => (
            <Link
              href={link.href}
              key={link.label}
              aria-current={
                link.href === pathname || (link.href === "/products" && pathname.startsWith("/products/"))
                  ? "page"
                  : undefined
              }
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isCompany ? (
            <Link href="/company/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
          ) : !isAdmin && status === "unauthenticated" ? (
            <Link href="/company/login" onClick={() => setOpen(false)}>Company Login</Link>
          ) : null}
          {status === "unauthenticated" && (
            <Link className="mobile-register-link" href="/company/register" onClick={() => setOpen(false)}>
              Register company
            </Link>
          )}
          {isCompany && (
            <button
              className="mobile-logout-link"
              type="button"
              onClick={() => void signOut({ redirectTo: "/company/login" })}
            >
              Logout
            </button>
          )}
        </nav>
        <div className="header-actions">
          <Link className="icon-button" href="/products" aria-label="Search and browse products"><Search size={18} /></Link>
          {status === "unauthenticated" && (
            <Link className="header-quote" href="/company/register">Register company <span aria-hidden="true">↗</span></Link>
          )}
          {isCompany && (
            <button
              className="header-logout"
              type="button"
              onClick={() => void signOut({ redirectTo: "/company/login" })}
            >
              Logout
            </button>
          )}
          <Link className="icon-button bag-link" href="/cart" aria-label="Enquiry basket"><ShoppingBag size={18} /></Link>
        </div>
      </div>
    </header>
  );
}
