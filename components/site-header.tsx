"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, Shield, ShoppingBag } from "lucide-react";

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isCompany = status === "authenticated" && session?.user?.accountType === "COMPANY";
  const isAdmin = status === "authenticated" && session?.user?.accountType === "ADMIN";

  return (
    <header className={`site-header${pathname === "/" ? " site-header-home" : ""}`}>
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="Karnataka Foundry home">
          <span className="kf-monogram" aria-hidden="true">KF</span>
          <span className="brand-copy">
            <strong>KARNATAKA FOUNDRY</strong>
            <small>ENGINEERED FLOW</small>
          </span>
        </Link>
        <div className="header-actions">
          {isCompany && (
            <>
              <Link className="header-account-link" href="/company/dashboard">
                <LayoutDashboard size={16} />
                <span>Company dashboard</span>
              </Link>
              <button
                className="header-account-link"
                type="button"
                onClick={() => void signOut({ redirectTo: "/company/login" })}
              >
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
            </>
          )}
          {isAdmin && (
            <Link className="header-account-link" href="/admin">
              <Shield size={16} />
              <span>Admin</span>
            </Link>
          )}
          <Link className="icon-button bag-link" href="/cart" aria-label="Enquiry basket">
            <ShoppingBag size={18} />
          </Link>
        </div>
      </div>
    </header>
  );
}
