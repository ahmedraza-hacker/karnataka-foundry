"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Boxes, LayoutDashboard, LogOut, MessageSquareText } from "lucide-react";
import type { ReactNode } from "react";

const navigation = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/enquiries", label: "Enquiries", icon: MessageSquareText },
  { href: "/admin/products", label: "Products", icon: Boxes },
];

export function AdminShell({
  adminName,
  children,
}: {
  adminName: string;
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f3f3f0] text-[#171a1c] lg:flex">
      <aside className="flex w-full shrink-0 flex-col bg-[#202527] text-white lg:sticky lg:top-0 lg:h-screen lg:w-64">
        <Link href="/admin" className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
          <span className="grid h-10 w-10 place-items-center rounded-full border border-[#c77d45] text-sm font-bold text-[#e4a579]">KF</span>
          <span>
            <strong className="block text-xs tracking-[.15em]">KARNATAKA</strong>
            <small className="mt-1 block text-[9px] tracking-[.13em] text-white/50">FOUNDRY ADMIN</small>
          </span>
        </Link>
        <nav aria-label="Admin navigation" className="flex gap-1 overflow-x-auto p-3 lg:flex-1 lg:flex-col lg:gap-2 lg:p-4">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${active ? "bg-[#c77d45] text-white" : "text-white/65 hover:bg-white/10 hover:text-white"}`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden border-t border-white/10 p-4 lg:block">
          <p className="truncate px-2 pb-3 text-xs text-white/55">{adminName}</p>
          <button
            type="button"
            onClick={() => signOut({ redirectTo: "/admin/login" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-white/70 hover:bg-white/10 hover:text-white"
          >
            <LogOut size={18} /> Log out
          </button>
        </div>
        <button
          type="button"
          onClick={() => signOut({ redirectTo: "/admin/login" })}
          className="flex shrink-0 items-center gap-2 border-t border-white/10 px-5 py-3 text-xs text-white/70 hover:text-white lg:hidden"
        >
          <LogOut size={16} /> Log out
        </button>
      </aside>
      <div className="min-w-0 flex-1 px-4 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-10">
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </div>
    </div>
  );
}
