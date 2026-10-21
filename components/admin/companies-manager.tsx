"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

type CompanyRole = "BUYER" | "SUPPLIER" | "BOTH";
type CompanyStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

type Company = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  requestedRole: CompanyRole;
  role: CompanyRole | null;
  status: CompanyStatus;
  city: string;
  state: string;
  gstin: string | null;
  createdAt: string;
};

const roleLabels: Record<CompanyRole, string> = {
  BUYER: "Buyer",
  SUPPLIER: "Supplier",
  BOTH: "Buyer and supplier",
};

const statusStyles: Record<CompanyStatus, string> = {
  PENDING: "bg-amber-50 text-amber-800",
  APPROVED: "bg-emerald-50 text-emerald-800",
  REJECTED: "bg-red-50 text-red-800",
  SUSPENDED: "bg-slate-100 text-slate-700",
};

export function CompaniesManager() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [roles, setRoles] = useState<Record<string, CompanyRole>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadCompanies = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/companies", { cache: "no-store" });
      const result = (await response.json()) as { companies?: Company[]; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not load company applications.");
      const items = result.companies ?? [];
      setCompanies(items);
      setRoles((current) => {
        const next = { ...current };
        for (const company of items) next[company.id] ??= company.role ?? company.requestedRole;
        return next;
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load company applications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCompanies();
  }, [loadCompanies]);

  async function updateCompany(company: Company, action: "APPROVE" | "REJECT" | "SUSPEND") {
    const role = roles[company.id] ?? company.requestedRole;
    const confirmation =
      action === "APPROVE"
        ? `Approve ${company.companyName} as ${roleLabels[role]}?`
        : action === "REJECT"
          ? `Reject the application from ${company.companyName}?`
          : `Suspend ${company.companyName}'s access?`;
    if (!window.confirm(confirmation)) return;

    setBusyId(company.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/companies?id=${encodeURIComponent(company.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === "APPROVE" ? { action, role } : { action }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not update the company.");
      setNotice(`${company.companyName}: ${action.toLowerCase()} action completed.`);
      await loadCompanies();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update the company.");
    } finally {
      setBusyId("");
    }
  }

  const pendingCount = companies.filter((company) => company.status === "PENDING").length;

  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#a96f48]">Company access</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Company applications</h1>
          <p className="mt-2 text-sm text-slate-600">Review business details and assign access roles when approving applications.</p>
        </div>
        <button type="button" onClick={() => void loadCompanies()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium hover:border-[#c77d45] disabled:opacity-60">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-600">Applications awaiting review</p>
        <p className="mt-1 text-3xl font-semibold">{loading && companies.length === 0 ? "—" : pendingCount}</p>
      </div>

      {(error || notice) && <p role={error ? "alert" : "status"} className={`mb-4 rounded-lg p-3 text-sm ${error ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>{error || notice}</p>}

      {loading && companies.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Loading company applications…</p>
      ) : companies.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <h2 className="font-semibold">No company applications</h2>
          <p className="mt-2 text-sm text-slate-500">New registrations will appear here for review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {companies.map((company) => (
            <article key={company.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{company.companyName}</h2>
                  <p className="mt-1 text-sm text-slate-600">{company.contactName} · {company.email}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[company.status]}`}>{company.status}</span>
              </div>

              <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div><dt className="text-slate-500">Phone</dt><dd className="mt-1 font-medium">{company.phone}</dd></div>
                <div><dt className="text-slate-500">Location</dt><dd className="mt-1 font-medium">{company.city}, {company.state}</dd></div>
                <div><dt className="text-slate-500">Requested business type</dt><dd className="mt-1 font-medium">{roleLabels[company.requestedRole]}</dd></div>
                <div><dt className="text-slate-500">GSTIN</dt><dd className="mt-1 font-medium">{company.gstin ?? "Not provided"}</dd></div>
              </dl>

              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                {company.status !== "APPROVED" && (
                  <>
                    <label className="flex items-center gap-2 text-sm font-medium">
                      Assign role
                      <select aria-label={`Role for ${company.companyName}`} value={roles[company.id] ?? company.requestedRole} onChange={(event) => setRoles((current) => ({ ...current, [company.id]: event.target.value as CompanyRole }))} className="rounded-lg border border-slate-300 bg-white px-3 py-2">
                        <option value="BUYER">Buyer</option>
                        <option value="SUPPLIER">Supplier</option>
                        <option value="BOTH">Buyer and supplier</option>
                      </select>
                    </label>
                    <button type="button" disabled={Boolean(busyId)} onClick={() => void updateCompany(company, "APPROVE")} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
                      {busyId === company.id ? "Saving…" : "Approve"}
                    </button>
                  </>
                )}
                {company.status === "PENDING" && <button type="button" disabled={Boolean(busyId)} onClick={() => void updateCompany(company, "REJECT")} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60">Reject</button>}
                {company.status === "APPROVED" && <button type="button" disabled={Boolean(busyId)} onClick={() => void updateCompany(company, "SUSPEND")} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">Suspend access</button>}
                <span className="text-xs text-slate-500">Registered {new Date(company.createdAt).toLocaleDateString()}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
