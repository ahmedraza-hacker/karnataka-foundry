import { EnquiryStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }

  const search = request.nextUrl.searchParams.get("search")?.trim().slice(0, 160);
  const status = request.nextUrl.searchParams.get("status");

  if (status && !Object.values(EnquiryStatus).includes(status as EnquiryStatus)) {
    return NextResponse.json({ error: "Invalid enquiry status." }, { status: 400 });
  }

  try {
    const enquiries = await prisma.enquiry.findMany({
      where: {
        ...(status ? { status: status as EnquiryStatus } : {}),
        ...(search
          ? {
              OR: [
                { customerName: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { companyName: { contains: search, mode: "insensitive" } },
                { productReference: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ enquiries });
  } catch {
    console.error("Unable to load admin enquiries.");
    return NextResponse.json({ error: "Unable to load enquiries." }, { status: 500 });
  }
}

const updateSchema = z.object({
  status: z.nativeEnum(EnquiryStatus),
});

export async function PATCH(request: NextRequest) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Submit valid enquiry data." }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  const id = request.nextUrl.searchParams.get("id");
  if (!parsed.success || !id || id.length > 64) {
    return NextResponse.json({ error: "Invalid enquiry update." }, { status: 400 });
  }

  try {
    const result = await prisma.enquiry.updateMany({
      where: { id },
      data: { status: parsed.data.status },
    });
    if (result.count === 0) {
      return NextResponse.json({ error: "Enquiry not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    console.error("Unable to update admin enquiry.");
    return NextResponse.json({ error: "Unable to update enquiry." }, { status: 500 });
  }
}
