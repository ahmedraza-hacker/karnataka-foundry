import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";

const allowedContentTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function POST(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "Product image storage is not configured. Set BLOB_READ_WRITE_TOKEN in the local environment and restart the server.",
      },
      { status: 503 },
    );
  }

  let body: HandleUploadBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid image upload request." }, { status: 400 });
  }

  try {
    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname) => {
        if (
          !(await getAdminSession()) ||
          !pathname.startsWith("products/") ||
          pathname.includes("..") ||
          pathname.length > 240
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
    console.error("Vercel Blob could not authorize the product image upload.");
    return NextResponse.json(
      {
        error:
          "Vercel Blob could not authorize this upload. Check the configured Blob store and read/write token.",
      },
      { status: 502 },
    );
  }
}
