"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Boxes, Building2, CircleAlert, MessageSquareText, RefreshCw } from "lucide-react";

type DashboardStats = {
  total: number;
  new: number;
  reviewing: number;
  quoted: number;
  closed: number;
  products: number;
  pendingCompanies: number;
};

const cards = [
  { key: "total", label: "Total enquiries", icon: MessageSquareText },
  { key: "new", label: "New enquiries", icon: CircleAlert },
  { key: "quoted", label: "Quotes in progress", icon: RefreshCw },
  { key: "products", label: "Products", icon: Boxes },
  { key: "pendingCompanies", label: "Pending companies", icon: Building2 },
] as const;

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/dashboard", { cache: "no-store" });
      const result = (await response.json()) as DashboardStats & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not load dashboard.");
      setStats(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#a96f48]">Operations overview</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">A quick view of customer enquiries and catalogue records.</p>
        </div>
        <button type="button" onClick={() => void loadStats()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium hover:border-[#c77d45] disabled:opacity-60">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <span>{error}</span>
          <button type="button" onClick={() => void loadStats()} className="font-semibold underline">Try again</button>
        </div>
      )}

      <section aria-label="Business statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(({ key, label, icon: Icon }) => (
          <article key={key} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#f5eee8] text-[#a96f48]"><Icon size={19} /></span>
            </div>
            <p className="mt-5 text-3xl font-semibold">{loading && !stats ? "—" : stats?.[key] ?? 0}</p>
          </article>
        ))}
      </section>

      {stats && (
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-semibold">Enquiry pipeline</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["New", stats.new],
              ["Reviewing", stats.reviewing],
              ["Quoted", stats.quoted],
              ["Closed", stats.closed],
            ].map(([label, count]) => (
              <div key={label} className="rounded-lg bg-[#f7f7f5] p-4">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-2 text-xl font-semibold">{count}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link href="/admin/enquiries" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#c77d45]">
          <h2 className="font-semibold">Review customer enquiries</h2>
          <p className="mt-2 text-sm text-slate-600">Search submissions, open customer details, and update their status.</p>
          <span className="mt-5 inline-flex text-sm font-semibold text-[#a96f48]">Manage enquiries →</span>
        </Link>
        <Link href="/admin/products" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#c77d45]">
          <h2 className="font-semibold">Maintain the catalogue</h2>
          <p className="mt-2 text-sm text-slate-600">Add, edit, and remove product records and technical specifications.</p>
          <span className="mt-5 inline-flex text-sm font-semibold text-[#a96f48]">Manage products →</span>
        </Link>
        <Link href="/admin/companies" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#c77d45]">
          <h2 className="font-semibold">Review company applications</h2>
          <p className="mt-2 text-sm text-slate-600">Approve, reject, or suspend company accounts and assign access roles.</p>
          <span className="mt-5 inline-flex text-sm font-semibold text-[#a96f48]">Manage companies →</span>
        </Link>
      </section>
    </>
  );
}
