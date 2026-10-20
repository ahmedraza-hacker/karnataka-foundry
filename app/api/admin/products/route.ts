import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { adminProductSchema } from "@/lib/admin-product-schema";
import { prisma } from "@/lib/prisma";

async function authorize() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }
  return null;
}

export async function GET() {
  const denied = await authorize();
  if (denied) return denied;

  try {
    const products = await prisma.product.findMany({ orderBy: { updatedAt: "desc" } });
    return NextResponse.json({ products });
  } catch {
    console.error("Unable to load admin products.");
    return NextResponse.json({ error: "Unable to load products." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const denied = await authorize();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Submit valid product data." }, { status: 400 });
  }

  const parsed = adminProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the product fields and try again." }, { status: 400 });
  }

  try {
    const product = await prisma.product.create({ data: parsed.data });
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "The product slug or SKU is already in use." }, { status: 409 });
    }
    console.error("Unable to create admin product.");
    return NextResponse.json({ error: "Unable to create product." }, { status: 500 });
  }
}
