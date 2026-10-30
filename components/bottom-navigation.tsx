"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, Building2, House, LogIn, Mail, UserPlus } from "lucide-react";

const links = [
  { href: "/", label: "Home", icon: House },
  { href: "/products", label: "Products", icon: Boxes },
  { href: "/about", label: "About", icon: Building2 },
  { href: "/quote", label: "Contact", icon: Mail },
  { href: "/company/login", label: "Company Login", icon: LogIn },
  { href: "/company/register", label: "Register", icon: UserPlus },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="bottom-navigation" aria-label="Primary navigation">
      <div className="bottom-navigation-items">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            (label === "Home" && pathname === "/") ||
            (label === "About" && pathname === "/about") ||
            (label === "Products" && pathname.startsWith("/products")) ||
            (label === "Contact" && pathname === "/quote") ||
            (label === "Company Login" && pathname === "/company/login") ||
            (label === "Register" && pathname === "/company/register");

          return (
            <Link
              className={`bottom-navigation-link${active ? " is-active" : ""}`}
              href={href}
              key={label}
              aria-current={active ? "page" : undefined}
            >
              <span className="bottom-navigation-icon"><Icon size={18} strokeWidth={1.8} /></span>
              <span className="bottom-navigation-label">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
