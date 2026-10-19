import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const enquirySchema = z.object({
  customerName: z.string().trim().min(1).max(120),
  companyName: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(5).max(30),
  productReference: z.string().trim().max(500).optional().default(""),
  quantity: z.union([z.literal(""), z.coerce.number().int().min(1).max(1_000_000)]).optional(),
  applicationDetails: z.string().trim().max(2000).optional().default(""),
  technicalNeeds: z.string().trim().max(3000).optional().default(""),
  message: z.string().trim().max(3000).optional().default(""),
  website: z.string().max(0).optional(),
});

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Enquiry submission is not configured yet. Please contact the company directly." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Please submit a valid enquiry form." }, { status: 400 });
  }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the required fields and try again." }, { status: 400 });
  }

  try {
    const enquiry = await prisma.enquiry.create({
      data: {
        customerName: parsed.data.customerName,
        companyName: parsed.data.companyName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        productReference: parsed.data.productReference || null,
        quantity: parsed.data.quantity === "" ? null : parsed.data.quantity,
        applicationDetails: parsed.data.applicationDetails || null,
        technicalNeeds: parsed.data.technicalNeeds || null,
        message: parsed.data.message || null,
      },
      select: { id: true, createdAt: true },
    });
    return NextResponse.json({ reference: `KF-${enquiry.createdAt.getUTCFullYear()}-${enquiry.id.slice(-6).toUpperCase()}` }, { status: 201 });
  } catch (error) {
    console.error("Unable to save quotation enquiry.", error);
    return NextResponse.json({ error: "We couldn't save your enquiry right now. Please try again later." }, { status: 500 });
  }
}
