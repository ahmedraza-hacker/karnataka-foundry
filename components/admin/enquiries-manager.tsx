"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

type EnquiryStatus = "NEW" | "REVIEWING" | "QUOTED" | "CLOSED";
type Enquiry = {
  id: string;
  customerName: string;
  companyName: string;
  email: string;
  phone: string;
  productReference: string | null;
  quantity: number | null;
  applicationDetails: string | null;
  technicalNeeds: string | null;
  message: string | null;
  status: EnquiryStatus;
  createdAt: string;
};

const statuses: { value: EnquiryStatus; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "REVIEWING", label: "Reviewing" },
  { value: "QUOTED", label: "Quoted" },
  { value: "CLOSED", label: "Closed" },
];
const statusStyle: Record<EnquiryStatus, string> = {
  NEW: "bg-blue-50 text-blue-700",
  REVIEWING: "bg-amber-50 text-amber-800",
  QUOTED: "bg-violet-50 text-violet-700",
  CLOSED: "bg-emerald-50 text-emerald-700",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function EnquiriesManager() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      const query = new URLSearchParams();
      if (search.trim()) query.set("search", search.trim());
      if (status) query.set("status", status);
      try {
        const response = await fetch(`/api/admin/enquiries?${query}`, { cache: "no-store", signal: controller.signal });
        const result = (await response.json()) as { enquiries?: Enquiry[]; error?: string };
        if (!response.ok) throw new Error(result.error ?? "Could not load enquiries.");
        setEnquiries(result.enquiries ?? []);
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === "AbortError") return;
        setError(loadError instanceof Error ? loadError.message : "Could not load enquiries.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 200);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [search, status]);

  async function updateStatus(enquiry: Enquiry, nextStatus: EnquiryStatus) {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/enquiries?id=${encodeURIComponent(enquiry.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not update enquiry.");
      const updated = { ...enquiry, status: nextStatus };
      setSelected(updated);
      setEnquiries((items) => items.map((item) => item.id === enquiry.id ? updated : item));
      setNotice("Enquiry status updated.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not update enquiry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#a96f48]">Customer relationships</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Enquiries</h1>
        <p className="mt-2 text-sm text-slate-600">Review customer requirements and track each enquiry through your workflow.</p>
      </div>

      <div className="mb-5 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_220px]">
        <label className="flex items-center gap-3 rounded-lg border border-slate-300 px-3">
          <Search size={17} className="shrink-0 text-slate-400" />
          <span className="sr-only">Search enquiries</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customer, email, company, or product" className="min-w-0 flex-1 py-3 text-sm outline-none" />
        </label>
        <label className="text-xs font-medium text-slate-500">
          Filter by status
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800">
            <option value="">All statuses</option>
            {statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
      </div>

      {(error || notice) && (
        <p role={error ? "alert" : "status"} className={`mb-4 rounded-lg p-3 text-sm ${error ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>
          {error || notice}
        </p>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold">Customer submissions</h2>
          <span className="text-xs text-slate-500">{loading ? "Loading…" : `${enquiries.length} ${enquiries.length === 1 ? "result" : "results"}`}</span>
        </div>
        {loading && enquiries.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">Loading enquiries…</p>
        ) : error && enquiries.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">Enquiries could not be loaded.</p>
        ) : enquiries.length === 0 ? (
          <div className="p-10 text-center">
            <h3 className="font-semibold">No enquiries found</h3>
            <p className="mt-2 text-sm text-slate-500">Try another search or status filter. New quote requests will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[#f7f7f5] text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="px-5 py-3 font-semibold">Customer</th><th className="px-5 py-3 font-semibold">Product / quantity</th><th className="px-5 py-3 font-semibold">Status</th><th className="px-5 py-3 font-semibold">Submitted</th><th className="px-5 py-3"><span className="sr-only">Details</span></th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enquiries.map((enquiry) => (
                  <tr key={enquiry.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4"><strong className="block font-semibold">{enquiry.customerName}</strong><span className="mt-1 block text-xs text-slate-500">{enquiry.companyName} · {enquiry.email}</span></td>
                    <td className="px-5 py-4"><span className="block max-w-xs truncate">{enquiry.productReference || "General enquiry"}</span><span className="mt-1 block text-xs text-slate-500">{enquiry.quantity ? `Quantity: ${enquiry.quantity}` : "Quantity not specified"}</span></td>
                    <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[enquiry.status]}`}>{statuses.find((item) => item.value === enquiry.status)?.label}</span></td>
                    <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-600">{formatDate(enquiry.createdAt)}</td>
                    <td className="px-5 py-4"><button type="button" onClick={() => { setSelected(enquiry); setNotice(""); }} className="font-semibold text-[#a96f48] hover:underline">View details</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/45" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="enquiry-heading" className="h-full w-full max-w-xl overflow-y-auto bg-white p-5 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#a96f48]">Enquiry details</p><h2 id="enquiry-heading" className="mt-2 text-2xl font-semibold">{selected.customerName}</h2><p className="mt-1 text-sm text-slate-500">{formatDate(selected.createdAt)}</p></div>
              <button type="button" onClick={() => setSelected(null)} aria-label="Close details" className="rounded-lg px-3 py-2 text-xl text-slate-500 hover:bg-slate-100">×</button>
            </div>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <Detail label="Company" value={selected.companyName} />
              <Detail label="Email" value={selected.email} href={`mailto:${selected.email}`} />
              <Detail label="Phone" value={selected.phone} href={`tel:${selected.phone}`} />
              <Detail label="Requested product" value={selected.productReference || "Not specified"} />
              <Detail label="Quantity" value={selected.quantity?.toLocaleString() ?? "Not specified"} />
            </div>
            <div className="mt-6">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Enquiry status</label>
              <select value={selected.status} disabled={saving} onChange={(event) => void updateStatus(selected, event.target.value as EnquiryStatus)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm">
                {statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </div>
            <div className="mt-6 space-y-5">
              <Detail label="Application or motor details" value={selected.applicationDetails} />
              <Detail label="Technical requirements" value={selected.technicalNeeds} />
              <Detail label="Additional message" value={selected.message} />
            </div>
            {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
            {notice && <p role="status" className="mt-5 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
          </section>
        </div>
      )}
    </>
  );
}

function Detail({ label, value, href }: { label: string; value: string | null; href?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      {href && value ? <a href={href} className="mt-1 block break-words text-sm text-[#9b6038] hover:underline">{value}</a> : <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-800">{value || "Not provided"}</p>}
    </div>
  );
}
