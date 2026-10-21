"use client";

import { signOut } from "next-auth/react";

export function CompanyLogout() {
  return (
    <button
      type="button"
      onClick={() => signOut({ redirectTo: "/company/login" })}
      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
    >
      Sign out
    </button>
  );
}
