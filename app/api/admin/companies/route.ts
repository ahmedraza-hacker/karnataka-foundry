import { CompanyStatus, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { adminCompanyActionSchema } from "@/lib/company-schemas";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }

  try {
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        companyName: true,
        contactName: true,
        email: true,
        phone: true,
        requestedRole: true,
        role: true,
        status: true,
        city: true,
        state: true,
        gstin: true,
        createdAt: true,
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ companies });
  } catch {
    console.error("Unable to load company applications.");
    return NextResponse.json({ error: "Unable to load companies." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id || id.length > 64) {
    return NextResponse.json({ error: "Invalid company." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Submit a valid company action." }, { status: 400 });
  }

  const parsed = adminCompanyActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Choose a valid company action and role." }, { status: 400 });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!company) {
      return NextResponse.json({ error: "Company not found." }, { status: 404 });
    }

    if (parsed.data.action === "REJECT" && company.status !== CompanyStatus.PENDING) {
      return NextResponse.json({ error: "Only pending applications can be rejected." }, { status: 409 });
    }
    if (parsed.data.action === "SUSPEND" && company.status !== CompanyStatus.APPROVED) {
      return NextResponse.json({ error: "Only approved companies can be suspended." }, { status: 409 });
    }

    const data =
      parsed.data.action === "APPROVE"
        ? { status: CompanyStatus.APPROVED, role: parsed.data.role }
        : parsed.data.action === "REJECT"
          ? { status: CompanyStatus.REJECTED }
          : { status: CompanyStatus.SUSPENDED };

    await prisma.company.update({ where: { id }, data });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Company not found." }, { status: 404 });
    }
    console.error("Unable to update company approval status.");
    return NextResponse.json({ error: "Unable to update company." }, { status: 500 });
  }
}
