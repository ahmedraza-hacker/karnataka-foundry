import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type CompanyReader = Pick<Prisma.TransactionClient, "company">;

export async function areApprovedCompanies(
  ids: string[],
  client: CompanyReader = prisma,
): Promise<boolean> {
  if (ids.length === 0) return true;

  const companies = await client.company.findMany({
    where: { id: { in: ids }, status: "APPROVED", role: { not: null } },
    select: { id: true },
  });
  return companies.length === ids.length;
}
