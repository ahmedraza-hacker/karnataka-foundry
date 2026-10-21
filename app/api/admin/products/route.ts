import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { adminProductSchema } from "@/lib/admin-product-schema";
import { areApprovedCompanies } from "@/lib/product-company-access";
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
    const [products, companies] = await Promise.all([
      prisma.product.findMany({
        include: { companyAccess: { select: { companyId: true } } },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.company.findMany({
        where: { status: "APPROVED", role: { not: null } },
        select: { id: true, companyName: true, city: true, state: true },
        orderBy: { companyName: "asc" },
      }),
    ]);
    return NextResponse.json({ products, companies });
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
    const { selectedCompanyIds, ...productData } = parsed.data;
    const product = await prisma.$transaction(async (transaction) => {
      if (!(await areApprovedCompanies(selectedCompanyIds, transaction))) {
        return null;
      }
      const createdProduct = await transaction.product.create({ data: productData });
      if (selectedCompanyIds.length > 0) {
        await transaction.companyProductAccess.createMany({
          data: selectedCompanyIds.map((companyId) => ({
            companyId,
            productId: createdProduct.id,
          })),
        });
      }
      return createdProduct;
    });
    if (!product) {
      return NextResponse.json({ error: "Choose only approved companies." }, { status: 400 });
    }
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "The product slug or SKU is already in use." }, { status: 409 });
    }
    console.error("Unable to create admin product.");
    return NextResponse.json({ error: "Unable to create product." }, { status: 500 });
  }
}
