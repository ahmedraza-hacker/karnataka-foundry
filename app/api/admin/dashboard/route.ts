import { NextResponse } from "next/server";
import type { EnquiryStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }

  try {
    const [enquiryGroups, products, pendingCompanies] = await Promise.all([
      prisma.enquiry.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.product.count(),
      prisma.company.count({ where: { status: "PENDING" } }),
    ]);
    const counts = new Map<EnquiryStatus, number>(
      enquiryGroups.map(({ status, _count }) => [status, _count._all]),
    );
    const newCount = counts.get("NEW") ?? 0;
    const reviewing = counts.get("REVIEWING") ?? 0;
    const quoted = counts.get("QUOTED") ?? 0;
    const closed = counts.get("CLOSED") ?? 0;
    const total = newCount + reviewing + quoted + closed;

    return NextResponse.json({ total, new: newCount, reviewing, quoted, closed, products, pendingCompanies });
  } catch {
    console.error("Unable to load admin dashboard statistics.");
    return NextResponse.json({ error: "Unable to load dashboard statistics." }, { status: 500 });
  }
}
