import { get } from "@vercel/blob";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import {
  isProductImageUrlForVisibility,
  type ProductImageVisibility,
} from "@/lib/product-image";

const allowedContentTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const allowedImageTypes = new Set(allowedContentTypes);
const validVisibilities = new Set<ProductImageVisibility>([
  "PUBLIC",
  "APPROVED_BUYERS",
  "SELECTED_COMPANIES",
]);

function isProductImageVisibility(value: unknown): value is ProductImageVisibility {
  return typeof value === "string" && validVisibilities.has(value as ProductImageVisibility);
}

export async function POST(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: HandleUploadBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid image upload request." }, { status: 400 });
  }

  if (body.type !== "blob.generate-client-token") {
    return NextResponse.json({ error: "Invalid image upload request." }, { status: 400 });
  }

  const visibility = body.payload.clientPayload;
  if (!isProductImageVisibility(visibility)) {
    return NextResponse.json({ error: "Select a valid product visibility." }, { status: 400 });
  }

  const access = visibility === "PUBLIC" ? "public" : "private";
  const token =
    access === "public"
      ? process.env.BLOB_READ_WRITE_TOKEN
      : process.env.BLOB_PRIVATE_READ_WRITE_TOKEN;

  if (!token) {
    return NextResponse.json(
      {
        error:
          access === "public"
            ? "Public product image storage is not configured. Set BLOB_READ_WRITE_TOKEN."
            : "Restricted product image storage is not configured. Set BLOB_PRIVATE_READ_WRITE_TOKEN to a private Vercel Blob store token.",
      },
      { status: 503 },
    );
  }

  try {
    const result = await handleUpload({
      request,
      body,
      token,
      onBeforeGenerateToken: async (pathname, clientPayload, multipart) => {
        const expectedPrefix = access === "public" ? "products/public/" : "products/restricted/";
        if (
          !(await getAdminSession()) ||
          clientPayload !== visibility ||
          !pathname.startsWith(expectedPrefix) ||
          pathname.includes("..") ||
          pathname.length > 240 ||
          multipart
        ) {
          throw new Error("Unauthorized image upload.");
        }

        return {
          allowedContentTypes,
          maximumSizeInBytes: 5 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
    });

    return NextResponse.json(result);
  } catch {
    console.error(`Vercel Blob could not authorize the ${access} product image upload.`);
    return NextResponse.json(
      {
        error:
          `Vercel Blob could not authorize this ${access} image upload. Check the matching Blob store and read/write token.`,
      },
      { status: 502 },
    );
  }
}

export async function GET(request: NextRequest) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const urlValue = request.nextUrl.searchParams.get("url");
  if (
    !urlValue ||
    urlValue.length > 2048 ||
    !isProductImageUrlForVisibility(urlValue, "APPROVED_BUYERS")
  ) {
    return NextResponse.json({ error: "Invalid private product image." }, { status: 400 });
  }

  let blobUrl: URL;
  try {
    blobUrl = new URL(urlValue);
  } catch {
    return NextResponse.json({ error: "Invalid private product image." }, { status: 400 });
  }

  if (!blobUrl.pathname.startsWith("/products/restricted/")) {
    return NextResponse.json({ error: "Invalid private product image." }, { status: 400 });
  }
  if (!process.env.BLOB_PRIVATE_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Private product image storage is not configured." }, { status: 503 });
  }

  try {
    const result = await get(urlValue, {
      access: "private",
      token: process.env.BLOB_PRIVATE_READ_WRITE_TOKEN,
    });
    if (!result || result.statusCode !== 200 || !allowedImageTypes.has(result.blob.contentType)) {
      return NextResponse.json({ error: "Product image not found." }, { status: 404 });
    }

    return new NextResponse(result.stream, {
      status: 200,
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": "inline",
        "Content-Type": result.blob.contentType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    console.error("Unable to load an admin product image preview.");
    return NextResponse.json({ error: "Unable to load product image." }, { status: 502 });
  }
}
