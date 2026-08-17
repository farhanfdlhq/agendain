import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { purgeCloudflareCache } from "@/lib/cloudflare";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    const isSuperAdmin = role === 'super_admin' || role === 'admin';

    const settings = await prisma.setting.findMany();

    // Convert array of {key, value} to object
    const settingsObj = settings.reduce(
      (acc: any, curr: { key: string; value: string }) => {
        // Jangan ekspos info rezeki/pembayaran atau rahasia lainnya jika bukan administrator yang terotentikasi
        const sensitiveKey = /payment|secret|token|password|credential/i.test(curr.key);
        if (!isSuperAdmin && sensitiveKey) {
          return acc;
        }
        acc[curr.key] = curr.value;
        return acc;
      },
      {},
    );

    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil pengaturan" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (!session || role !== 'super_admin') {
      return NextResponse.json({ error: "Forbidden - Super Admin required" }, { status: 403 });
    }

    const data = await req.json();

    // Data is an object of key-value pairs
    // Upsert each setting using raw query to bypass generated types issue
    const promises = Object.entries(data).map(([key, value]) => {
      if (typeof value !== "string") return Promise.resolve();
      return prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    });

    await Promise.all(promises);

    revalidateTag("settings", { expire: 0 });
    revalidatePath("/", "layout");

    // Purge cloudflare cache to ensure static assets and edge cache mirror the new DB state
    await purgeCloudflareCache();

    return NextResponse.json({ message: "Pengaturan berhasil disimpan" });
  } catch (error) {
    console.error("Settings POST error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan pengaturan" },
      { status: 500 },
    );
  }
}
