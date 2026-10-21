"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function CompanyRegistrationPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    password: "",
    requestedRole: "BUYER",
    city: "",
    state: "",
    gstin: "",
  });

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/companies/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Registration could not be completed.");
      router.push("/company/pending");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Registration could not be completed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="account-page mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="account-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#a96f48]">Company access</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Register your business</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Company applications are reviewed before marketplace access is enabled.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">Company or business name
              <input required minLength={2} maxLength={160} autoComplete="organization" value={form.companyName} onChange={(event) => updateField("companyName", event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5" />
            </label>
            <label className="block text-sm font-medium">Contact person's name
              <input required minLength={2} maxLength={120} autoComplete="name" value={form.contactName} onChange={(event) => updateField("contactName", event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5" />
            </label>
            <label className="block text-sm font-medium">Business email
              <input required type="email" maxLength={254} autoComplete="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5" />
            </label>
            <label className="block text-sm font-medium">Phone number
              <input required type="tel" minLength={7} maxLength={30} autoComplete="tel" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5" />
            </label>
            <label className="block text-sm font-medium">Password
              <input required type="password" minLength={12} maxLength={72} autoComplete="new-password" value={form.password} onChange={(event) => updateField("password", event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5" aria-describedby="company-password-help" />
              <span id="company-password-help" className="mt-1 block text-xs font-normal text-slate-500">Use 12–72 characters. Passwords are limited to bcrypt's 72-byte input size.</span>
            </label>
            <label className="block text-sm font-medium">Business type
              <select value={form.requestedRole} onChange={(event) => updateField("requestedRole", event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5">
                <option value="BUYER">Buyer</option>
                <option value="SUPPLIER">Supplier</option>
                <option value="BOTH">Both</option>
              </select>
            </label>
            <label className="block text-sm font-medium">City
              <input required maxLength={100} autoComplete="address-level2" value={form.city} onChange={(event) => updateField("city", event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5" />
            </label>
            <label className="block text-sm font-medium">State
              <input required maxLength={100} autoComplete="address-level1" value={form.state} onChange={(event) => updateField("state", event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5" />
            </label>
            <label className="block text-sm font-medium sm:col-span-2">GSTIN <span className="font-normal text-slate-500">(optional)</span>
              <input maxLength={15} autoCapitalize="characters" value={form.gstin} onChange={(event) => updateField("gstin", event.target.value.toUpperCase())} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 uppercase" />
            </label>
          </div>

          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-[#252a2d] px-5 py-3 font-semibold text-white hover:bg-[#3b4144] disabled:opacity-60">
            {loading ? "Submitting…" : "Submit for approval"}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          Already registered? <Link href="/company/login" className="font-semibold text-[#a96f48] hover:underline">Company sign in</Link>
        </p>
      </div>
    </section>
  );
}
