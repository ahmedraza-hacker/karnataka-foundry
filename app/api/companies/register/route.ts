import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { companyRegistrationSchema } from "@/lib/company-schemas";
import { isRegistrationRateLimited } from "@/lib/registration-rate-limit";
import { prisma } from "@/lib/prisma";

const genericRegistrationMessage =
  "If the application can be accepted, it will be reviewed. You may now sign in after approval.";

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Company registration is not configured." }, { status: 503 });
  }

  try {
    if (await isRegistrationRateLimited()) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again in an hour." },
        { status: 429 },
      );
    }
  } catch {
    console.error("Company registration rate limiting failed.");
    return NextResponse.json({ error: "Company registration is temporarily unavailable." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Submit valid company details." }, { status: 400 });
  }

  const parsed = companyRegistrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the company details and try again." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (parsed.data.email === adminEmail) {
    return NextResponse.json({ message: genericRegistrationMessage }, { status: 202 });
  }

  try {
    await prisma.company.create({
      data: {
        companyName: parsed.data.companyName,
        contactName: parsed.data.contactName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        passwordHash,
        requestedRole: parsed.data.requestedRole,
        city: parsed.data.city,
        state: parsed.data.state,
        gstin: parsed.data.gstin ?? null,
      },
      select: { id: true },
    });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
      console.error("Unable to save company registration.");
      return NextResponse.json({ error: "Company registration could not be completed." }, { status: 500 });
    }
  }

  return NextResponse.json({ message: genericRegistrationMessage }, { status: 202 });
}
