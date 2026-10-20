import { NextResponse } from "next/server";
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
    const [total, newCount, reviewing, quoted, closed, products] = await Promise.all([
      prisma.enquiry.count(),
      prisma.enquiry.count({ where: { status: "NEW" } }),
      prisma.enquiry.count({ where: { status: "REVIEWING" } }),
      prisma.enquiry.count({ where: { status: "QUOTED" } }),
      prisma.enquiry.count({ where: { status: "CLOSED" } }),
      prisma.product.count(),
    ]);

    return NextResponse.json({ total, new: newCount, reviewing, quoted, closed, products });
  } catch {
    console.error("Unable to load admin dashboard statistics.");
    return NextResponse.json({ error: "Unable to load dashboard statistics." }, { status: 500 });
  }
}
