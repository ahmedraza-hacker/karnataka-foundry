"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function CompanyLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Unable to sign in. Check your details and confirm your application is approved.");
        return;
      }
      router.push("/company/dashboard");
      router.refresh();
    } catch {
      setError("Sign in is temporarily unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="account-page mx-auto max-w-lg px-4 py-16 sm:px-6">
      <form onSubmit={submit} className="account-card space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#a96f48]">Company access</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-2 text-sm text-slate-600">Company accounts must be approved before signing in.</p>
        </div>
        <label className="block text-sm font-medium">Business email
          <input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5" />
        </label>
        <label className="block text-sm font-medium">Password
          <input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5" />
        </label>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-lg bg-[#252a2d] px-5 py-3 font-semibold text-white hover:bg-[#3b4144] disabled:opacity-60">
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <p className="text-sm text-slate-600">
          Need company access? <Link href="/company/register" className="font-semibold text-[#a96f48] hover:underline">Register your company</Link>
        </p>
        <p className="text-xs text-slate-500">For administrator access, use the <Link href="/admin/login" className="underline">admin sign-in</Link>.</p>
      </form>
    </section>
  );
}
