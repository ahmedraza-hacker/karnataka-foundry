import Link from "next/link";
import { redirect } from "next/navigation";
import { CompanyLogout } from "@/components/company/company-logout";
import { getApprovedCompanyContext } from "@/lib/company-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CompanyDashboardPage() {
  const access = await getApprovedCompanyContext();
  if (!access) redirect("/company/login");

  const company = await prisma.company.findUnique({
    where: { id: access.id },
    select: { companyName: true, email: true, phone: true, city: true, state: true },
  });
  if (!company) redirect("/company/login");

  const roleName =
    access.role === "BOTH" ? "Buyer and supplier" : access.role === "BUYER" ? "Buyer" : "Supplier";

  return (
    <section className="account-page company-dashboard mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#a96f48]">Company workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{company.companyName}</h1>
          <p className="mt-2 text-sm text-slate-600">{roleName} account · Approved</p>
        </div>
        <CompanyLogout />
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold">Company profile</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div><dt className="text-slate-500">Business email</dt><dd className="mt-1 font-medium">{company.email}</dd></div>
            <div><dt className="text-slate-500">Phone</dt><dd className="mt-1 font-medium">{company.phone}</dd></div>
            <div><dt className="text-slate-500">Location</dt><dd className="mt-1 font-medium">{company.city}, {company.state}</dd></div>
          </dl>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold">Marketplace access</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Product listings shown to your account are checked against your current approval, company role, and product access grants.
          </p>
          <Link href="/products" className="mt-5 inline-flex rounded-lg bg-[#252a2d] px-4 py-3 text-sm font-semibold text-white hover:bg-[#3b4144]">
            Browse available products
          </Link>
        </article>
      </div>
    </section>
  );
}
