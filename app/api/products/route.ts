
import { NextRequest, NextResponse } from "next/server";
import { getVisibleProducts } from "@/lib/public-products";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get("search")?.trim().slice(0, 160);
    const category = request.nextUrl.searchParams.get("category")?.trim();

    const allProducts = await getVisibleProducts();
    const query = search?.toLocaleLowerCase();
    const products = allProducts.filter((product) => {
      const matchesSearch =
        !query ||
        `${product.name} ${product.sku} ${product.category} ${product.application}`
          .toLocaleLowerCase()
          .includes(query);
      const matchesCategory =
        !category || product.category.toLocaleLowerCase() === category.toLocaleLowerCase();
      return matchesSearch && matchesCategory;
    }).sort((left, right) => left.name.localeCompare(right.name));

    return NextResponse.json(
      { success: true, products },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    console.error("Products API error.");
    return NextResponse.json(
      { success: false, message: "Unable to fetch products" },
      { status: 500, headers: { "Cache-Control": "private, no-store" } }
    );
  }
}
