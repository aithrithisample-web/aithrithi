export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aydgnokektxslpaukbou.supabase.co";
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5ZGdub2tla3R4c2xwYXVrYm91Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NTM1NjQ3NiwiZXhwIjoyMTEwOTMyNDc2fQ.0TMWONf-N9RKy0M3NiTexTSGApgPAgnQKuzd_BKjfa0";

/**
 * Uploads a file buffer to Supabase Storage (cloud CDN) or falls back to Base64 / local disk.
 * 100% serverless compatible — eliminates EROFS read-only errors on Vercel.
 */
async function uploadMediaFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<{ fileUrl: string; savedFileName: string }> {
  const ext = path.extname(originalName).toLowerCase() || (mimeType.includes("png") ? ".png" : ".jpg");
  const uniqueSuffix = `${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const safeBase = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 32);
  const savedFileName = `${safeBase}_${uniqueSuffix}${ext}`;

  // 1. Primary: Upload to Supabase Storage ('store-assets' public bucket)
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const uploadUrl = `${SUPABASE_URL}/storage/v1/object/store-assets/${encodeURIComponent(savedFileName)}`;
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_KEY}`,
          apikey: SUPABASE_KEY,
          "Content-Type": mimeType,
          "x-upsert": "true",
        },
        body: new Uint8Array(buffer),
      });

      if (res.ok) {
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/store-assets/${encodeURIComponent(savedFileName)}`;
        return { fileUrl: publicUrl, savedFileName };
      } else {
        const errText = await res.text();
        console.warn("[Media Upload] Supabase storage returned non-200:", errText);
      }
    } catch (err: any) {
      console.warn("[Media Upload] Supabase upload failed:", err?.message);
    }
  }

  // 2. Secondary: If running locally where disk is writable, save to public/uploads/products
  try {
    const uploadDir = path.join(process.cwd(), "public/uploads/products");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const localFilePath = path.join(uploadDir, savedFileName);
    fs.writeFileSync(localFilePath, buffer);
    return { fileUrl: `/uploads/products/${savedFileName}`, savedFileName };
  } catch (fsErr: any) {
    console.warn("[Media Upload] Local disk write skipped (read-only/serverless environment):", fsErr?.message);
  }

  // 3. Failsafe for images on Vercel: Return Base64 Data URL
  const dataUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
  return { fileUrl: dataUrl, savedFileName };
}

// GET: List all media assets
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // image, video, all

    const where: any = {};
    if (type && type !== "all") {
      where.fileType = type;
    }

    const assets = await prisma.mediaAsset.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, assets });
  } catch (err: any) {
    console.error("GET /api/admin/media error:", err);
    return NextResponse.json({ success: false, error: err?.message || "Failed to load media." }, { status: 500 });
  }
}

// POST: Upload image or video from system
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // 1. Multipart Form Data (Direct file input from user system)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const files = formData.getAll("file") as File[];
      const uploadedAssets = [];

      for (const file of files) {
        if (!file || typeof file.arrayBuffer !== "function") continue;

        const buffer = Buffer.from(await file.arrayBuffer());
        const originalName = file.name || "media-upload";
        const ext = path.extname(originalName).toLowerCase() || ".jpg";

        // Determine type: video or image
        const isVideo = [".mp4", ".webm", ".mov", ".ogg", ".m4v"].includes(ext) || file.type.startsWith("video/");
        const fileType = isVideo ? "video" : "image";
        const mimeType = file.type || (isVideo ? "video/mp4" : "image/jpeg");

        const { fileUrl, savedFileName } = await uploadMediaFile(buffer, originalName, mimeType);

        // Create MediaAsset record in DB
        const asset = await prisma.mediaAsset.create({
          data: {
            fileName: originalName,
            fileUrl,
            fileType,
            mimeType,
            fileSize: buffer.length,
            altText: path.basename(originalName, ext).replace(/[^a-zA-Z0-9]/g, " "),
          },
        });

        uploadedAssets.push(asset);
      }

      if (uploadedAssets.length === 0) {
        return NextResponse.json({ success: false, error: "No valid files received." }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: `${uploadedAssets.length} file(s) uploaded successfully.`,
        assets: uploadedAssets,
        url: uploadedAssets[0].fileUrl, // For single file convenience (logo, favicon, product thumbnail)
      });
    }

    // 2. Base64 or External URL upload payload
    const body = await req.json();
    const { dataUrl, fileName = "system-upload.png", fileType = "image", altText } = body;

    if (!dataUrl) {
      return NextResponse.json({ success: false, error: "Data payload required." }, { status: 400 });
    }

    // Handle Base64 Data URI
    if (dataUrl.startsWith("data:")) {
      const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return NextResponse.json({ success: false, error: "Invalid data URL format." }, { status: 400 });
      }

      const mimeType = matches[1];
      const buffer = Buffer.from(matches[2], "base64");
      const isVideo = mimeType.startsWith("video/");
      const ext = mimeType.includes("png") ? ".png" : mimeType.includes("webp") ? ".webp" : isVideo ? ".mp4" : ".jpg";

      const { fileUrl } = await uploadMediaFile(buffer, fileName || `upload${ext}`, mimeType);

      const asset = await prisma.mediaAsset.create({
        data: {
          fileName: fileName || `upload${ext}`,
          fileUrl,
          fileType: isVideo ? "video" : fileType,
          mimeType,
          fileSize: buffer.length,
          altText: altText || fileName,
        },
      });

      return NextResponse.json({
        success: true,
        message: "File uploaded successfully.",
        asset,
        url: asset.fileUrl,
      });
    }

    // Direct external URL reference
    const asset = await prisma.mediaAsset.create({
      data: {
        fileName,
        fileUrl: dataUrl,
        fileType,
        mimeType: fileType === "video" ? "video/mp4" : "image/jpeg",
        altText,
      },
    });

    return NextResponse.json({ success: true, asset, url: asset.fileUrl });
  } catch (err: any) {
    console.error("POST /api/admin/media error:", err);
    return NextResponse.json({ success: false, error: err?.message || "Failed to upload file." }, { status: 500 });
  }
}

// DELETE: Delete asset
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "Asset ID required." }, { status: 400 });

    const asset = await prisma.mediaAsset.findUnique({ where: { id } });
    if (asset) {
      // 1. Delete from Supabase Storage if applicable
      if (asset.fileUrl.includes("/storage/v1/object/public/store-assets/")) {
        const parts = asset.fileUrl.split("/store-assets/");
        if (parts[1]) {
          const rawName = decodeURIComponent(parts[1]);
          try {
            await fetch(`${SUPABASE_URL}/storage/v1/object/store-assets/${encodeURIComponent(rawName)}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${SUPABASE_KEY}`,
                apikey: SUPABASE_KEY,
              },
            });
          } catch (e) {
            console.warn("Could not delete from Supabase storage:", e);
          }
        }
      }

      // 2. Delete local file if applicable
      if (asset.fileUrl.startsWith("/uploads/products/")) {
        const filePath = path.join(process.cwd(), "public", asset.fileUrl);
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (e) {
          console.warn("Could not remove file on disk:", e);
        }
      }

      await prisma.mediaAsset.delete({ where: { id } });
    }

    return NextResponse.json({ success: true, message: "Asset deleted successfully." });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Failed to delete asset." }, { status: 500 });
  }
}
