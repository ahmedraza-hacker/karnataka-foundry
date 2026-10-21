import type { CompanyRole, CompanyStatus } from "@prisma/client";
import { auth } from "@/auth";
import { isAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export type ApprovedCompanyContext = {
  id: string;
  role: CompanyRole;
  status: CompanyStatus;
};

export function isApprovedCompany(
  company: { status: CompanyStatus; role: CompanyRole | null } | null,
): company is { status: "APPROVED"; role: CompanyRole } {
  return company?.status === "APPROVED" && company.role !== null;
}

export async function getApprovedCompanyContext(): Promise<ApprovedCompanyContext | null> {
  const session = await auth();
  const companyId =
    session?.user?.accountType === "COMPANY" ? session.user.companyId : undefined;

  if (!companyId || isAdminSession(session) || !process.env.DATABASE_URL) {
    return null;
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, role: true, status: true },
  });

  if (!company || !isApprovedCompany(company)) return null;

  return { id: company.id, role: company.role, status: company.status };
}
