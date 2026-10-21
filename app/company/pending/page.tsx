import Link from "next/link";

export default function CompanyPendingPage() {
  return (
    <section className="account-page mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="account-card rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#a96f48]">Application status</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Approval is pending</h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Company applications are reviewed by Karnataka Foundry. Company features remain unavailable until an administrator approves the application.
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          This confirmation does not indicate whether an account already exists. Once approved, sign in using the registered business email.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/company/login" className="rounded-lg bg-[#252a2d] px-4 py-3 text-sm font-semibold text-white hover:bg-[#3b4144]">Company sign in</Link>
          <Link href="/products" className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold hover:bg-slate-50">Browse public products</Link>
        </div>
      </div>
    </section>
  );
}
