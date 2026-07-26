import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, readdir, stat, unlink } from "fs/promises";
import path from "path";
import fsSync from "fs";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let files: { url: string; name: string; created_at: string }[] = [];
    const uploadDir = path.join(process.cwd(), "public/uploads");

    try {
      const fileNames = await readdir(uploadDir);
      for (const file of fileNames) {
        if (file.startsWith(".")) continue; // skip hidden files
        const stats = await stat(path.join(uploadDir, file));
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
      // Directory might not exist yet
    }

    return NextResponse.json({ files });
  } catch (error) {
    console.error("Error fetching files:", error);
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
    if (!session || !['super_admin', 'admin', 'editor'].includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
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
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak diizinkan." },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    let fileBuffer: any = Buffer.from(bytes);
    let filename = file.name;

    // Auto convert and compress images
    if (file.type.startsWith("image/")) {
      try {
        const sharp = (await import("sharp")).default;

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
      } catch (err) {
        console.error("Failed to process image with sharp:", err);
      }
    }

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "");
    const finalName = `${uniqueSuffix}-${cleanFilename}`;
    const uploadDir = path.join(process.cwd(), "public/uploads");
    const filepath = path.join(uploadDir, finalName);

    // Ensure directory exists
    if (!fsSync.existsSync(uploadDir)) {
      fsSync.mkdirSync(uploadDir, { recursive: true });
    }

    await writeFile(filepath, fileBuffer);
    return NextResponse.json({ url: `/uploads/${finalName}` });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
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
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
