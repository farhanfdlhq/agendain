import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, readdir, stat, unlink } from "fs/promises";
import path from "path";
import fsSync from "fs";
import { isAllowedRole, matchesFileSignature } from "@/lib/security";
import {
  actorFrom,
  reportAuthDenied,
  reportServerError,
  reportUploadFailed,
  reportUploadRejected,
} from "@/lib/error-log";

const ICO_TYPES = ["image/x-icon", "image/vnd.microsoft.icon", "image/ico"];

// Nama file untuk detail audit: bersihkan & batasi panjang (tak menyimpan path).
const safeName = (n: string) => n.replace(/[^\w.\- ]/g, "").slice(0, 120);

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (!session || !isAllowedRole(role, ['super_admin', 'admin', 'editor'])) {
      reportAuthDenied({ route: "GET /api/upload", status: 401, code: "no_session", req: request });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let files: { url: string; name: string; created_at: string }[] = [];
    const uploadDir = path.join(process.cwd(), "public/uploads");

    try {
      const fileNames = await readdir(uploadDir);
      for (const file of fileNames) {
        if (file.startsWith(".")) continue; // skip hidden files
        const stats = await stat(path.join(uploadDir, file));
        if (!stats.isFile()) continue; // skip directories like avatars and seed
        files.push({
          url: `/uploads/${file}`,
          name: file,
          created_at: stats.mtime.toISOString(),
        });
      }
      files.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    } catch (e) {
      // ENOENT (folder belum dibuat) itu normal — abaikan. Kegagalan lain
      // (mis. EACCES izin di VPS) dicatat agar terlihat sebab masalahnya.
      if ((e as { code?: string })?.code !== "ENOENT") {
        reportUploadFailed(
          { route: "GET /api/upload", status: 500, code: "list_dir_failed", req: request },
          e,
        );
      }
    }

    return NextResponse.json({ files });
  } catch (error) {
    console.error("Error fetching files:", error);
    reportServerError({ route: "GET /api/upload", status: 500, req: request }, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (!session || !isAllowedRole(role, ['super_admin', 'admin', 'editor'])) {
      reportAuthDenied({ route: "POST /api/upload", status: 401, code: "no_session", req: request });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { actorId, actorEmail } = actorFrom(session);

    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;
    const type = data.get("type") as string;

    if (!file) {
      reportUploadRejected({
        route: "POST /api/upload", status: 400, code: "no_file", req: request,
        actorId, actorEmail, detail: { uploadType: type || null },
      });
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Sebagian OS tidak memetakan .ico ke MIME; normalkan agar ICO benar-benar
    // didukung end-to-end (tetap diverifikasi lewat magic bytes di bawah).
    let declaredType = file.type;
    if ((!declaredType || declaredType === "application/octet-stream") && /\.ico$/i.test(file.name)) {
      declaredType = "image/x-icon";
    }

    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      reportUploadRejected({
        route: "POST /api/upload", status: 400, code: "size_exceeded", req: request,
        actorId, actorEmail,
        detail: { fileName: safeName(file.name), mimeType: declaredType, size: file.size, uploadType: type || null },
      });
      return NextResponse.json(
        { error: "Ukuran file terlalu besar. Maksimal 10MB." },
        { status: 400 },
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
      "image/x-icon",
      "image/vnd.microsoft.icon",
      "image/ico",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(declaredType)) {
      reportUploadRejected({
        route: "POST /api/upload", status: 400, code: "mime_not_allowed", req: request,
        actorId, actorEmail,
        detail: { fileName: safeName(file.name), mimeType: declaredType, size: file.size, uploadType: type || null },
      });
      return NextResponse.json(
        { error: "Format file tidak diizinkan." },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    let fileBuffer: any = Buffer.from(bytes);
    let filename = file.name;

    // Verifikasi konten nyata (magic bytes), bukan hanya file.type yang
    // dikirim client. Mencegah unggahan berbahaya yang menyamar sebagai PDF/DOCX.
    if (!matchesFileSignature(new Uint8Array(bytes.slice(0, 16)), declaredType)) {
      const sigHex = Array.from(new Uint8Array(bytes.slice(0, 8)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(" ");
      reportUploadRejected({
        route: "POST /api/upload", status: 400, code: "signature_mismatch", req: request,
        actorId, actorEmail,
        detail: { fileName: safeName(file.name), mimeType: declaredType, size: file.size, uploadType: type || null, signatureHex: sigHex },
      });
      return NextResponse.json(
        { error: "Isi file tidak cocok dengan formatnya." },
        { status: 400 },
      );
    }

    const isIco = ICO_TYPES.includes(declaredType);
    const isSystem = type === "system";

    // Konversi/kompres gambar. ICO dilewati (libvips tak punya loader ICO).
    if (declaredType.startsWith("image/") && !isIco) {
      try {
        const sharp = (await import("sharp")).default;

        if (isSystem) {
          // Favicon/logo: PERTAHANKAN format & transparansi. Jangan paksa webp,
          // jangan resize 1920 — cukup batasi ke 1024 agar tak berlebihan.
          let pipeline = sharp(fileBuffer).resize({
            width: 1024,
            height: 1024,
            fit: "inside",
            withoutEnlargement: true,
          });
          if (declaredType === "image/png") {
            pipeline = pipeline.png({ compressionLevel: 9 });
          } else if (declaredType === "image/webp") {
            pipeline = pipeline.webp({ quality: 85 });
          } else {
            pipeline = pipeline.jpeg({ quality: 85, mozjpeg: true });
          }
          fileBuffer = await pipeline.toBuffer();
          // Ekstensi TIDAK diubah (PNG tetap .png).
        } else {
          fileBuffer = await sharp(fileBuffer)
            .resize({ width: 1920, withoutEnlargement: true })
            .webp({ quality: 80, effort: 4 })
            .toBuffer();

          const lastDot = filename.lastIndexOf(".");
          if (lastDot !== -1) {
            filename = filename.substring(0, lastDot) + ".webp";
          } else {
            filename += ".webp";
          }
        }
      } catch (err) {
        // Longgar untuk semua: bila sharp gagal (mis. binary/libvips rusak di
        // VPS), simpan buffer ASLI tanpa konversi & tetap 200 — tetapi CATAT
        // agar penyebabnya terbaca di audit log (keluhan utama user).
        console.error("Failed to process image with sharp:", err);
        reportUploadFailed(
          {
            route: "POST /api/upload", status: 200, code: "sharp_failed", req: request,
            actorId, actorEmail,
            detail: {
              fileName: safeName(file.name), mimeType: declaredType, size: file.size,
              uploadType: type || null, outcome: "saved_original_unconverted",
            },
          },
          err,
        );
      }
    }

    // ICO tanpa ekstensi → pastikan .ico agar dikenali browser sebagai favicon.
    if (isIco && !/\.ico$/i.test(filename)) {
      filename += ".ico";
    }

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "");
    const finalName = `${uniqueSuffix}-${cleanFilename}`;
    let uploadDir = path.join(process.cwd(), "public/uploads");
    let relativeUrl = `/uploads/${finalName}`;

    if (type === "system") {
      uploadDir = path.join(uploadDir, "system");
      relativeUrl = `/uploads/system/${finalName}`;
    }

    // Ensure directory exists
    if (!fsSync.existsSync(uploadDir)) {
      fsSync.mkdirSync(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, finalName);
    await writeFile(filepath, fileBuffer);
    return NextResponse.json({ url: relativeUrl });
  } catch (error) {
    // Kemungkinan besar kegagalan penulisan file (EACCES izin / ENOSPC disk di
    // VPS). summarizeError akan menangkap code/errno/path relatif.
    console.error("Error uploading file:", error);
    reportUploadFailed(
      { route: "POST /api/upload", status: 500, code: "fs_write_failed", req: request },
      error,
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (!session || !isAllowedRole(role, ['super_admin', 'admin', 'editor'])) {
      reportAuthDenied({ route: "DELETE /api/upload", status: 401, code: "no_session", req: request });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url } = await request.json();
    if (!url || typeof url !== "string" || !url.startsWith("/uploads/")) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const filename = url.replace("/uploads/", "");
    if (filename.includes("..") || filename.includes("/")) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    const filepath = path.join(process.cwd(), "public/uploads", filename);
    await unlink(filepath);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting file:", error);
    if (error.code === "ENOENT") {
      reportUploadRejected({
        route: "DELETE /api/upload", status: 404, code: "file_not_found", req: request,
      });
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    reportUploadFailed(
      { route: "DELETE /api/upload", status: 500, code: "fs_delete_failed", req: request },
      error,
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
