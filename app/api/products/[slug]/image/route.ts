import { get } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdminSession } from "@/lib/admin-auth";
import { isApprovedCompany, type ApprovedCompanyContext } from "@/lib/company-auth";
import { canViewProduct } from "@/lib/public-products";
import { prisma } from "@/lib/prisma";
import { isProductImageUrlForVisibility } from "@/lib/product-image";

export const dynamic = "force-dynamic";

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Product access is not available." }, { status: 503 });
  }

  const { slug } = await params;
  if (!slug || slug.length > 180) {
    return NextResponse.json({ error: "Product image not found." }, { status: 404 });
  }

  const session = await auth();
  const isAdmin = isAdminSession(session);
  let company: ApprovedCompanyContext | null = null;
  if (session?.user?.accountType === "COMPANY" && session.user.companyId && !isAdmin) {
    const companyRecord = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      select: { id: true, role: true, status: true },
    });
    if (companyRecord && isApprovedCompany(companyRecord)) {
      company = {
        id: companyRecord.id,
        role: companyRecord.role,
        status: companyRecord.status,
      };
    }
  }

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      select: {
        imageUrl: true,
        visibility: true,
        companyAccess: { select: { companyId: true } },
      },
    });
    if (
      !product ||
      product.visibility === "PUBLIC" ||
      !canViewProduct(
        product.visibility,
        company,
        product.companyAccess.map((access) => access.companyId),
        isAdmin,
      ) ||
      !product.imageUrl ||
      !isProductImageUrlForVisibility(product.imageUrl, product.visibility)
    ) {
      return NextResponse.json(
        { error: "Product image not found." },
        { status: 404, headers: { "Cache-Control": "private, no-store" } },
      );
    }

    const token = process.env.BLOB_PRIVATE_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "Private product image storage is not configured." },
        { status: 503, headers: { "Cache-Control": "private, no-store" } },
      );
    }

    const result = await get(product.imageUrl, { access: "private", token });
    if (
      !result ||
      result.statusCode !== 200 ||
      !allowedImageTypes.has(result.blob.contentType)
    ) {
      return NextResponse.json(
        { error: "Product image not found." },
        { status: 404, headers: { "Cache-Control": "private, no-store" } },
      );
    }

    return new NextResponse(result.stream, {
      status: 200,
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": "inline",
        "Content-Type": result.blob.contentType,
        "X-Content-Type-Options": "nosniff",
        Vary: "Cookie",
      },
    });
  } catch {
    console.error("Unable to load an authorized product image.");
    return NextResponse.json(
      { error: "Unable to load product image." },
      { status: 502, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
