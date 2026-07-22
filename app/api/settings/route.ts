import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { purgeCloudflareCache } from "@/lib/cloudflare";

export async function GET() {
  try {
    const settings = await prisma.setting.findMany();

    // Convert array of {key, value} to object
    const settingsObj = settings.reduce(
      (acc: any, curr: { key: string; value: string }) => {
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
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
