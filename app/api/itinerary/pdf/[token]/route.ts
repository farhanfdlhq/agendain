import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/security";
import { buildItineraryView } from "@/lib/itinerary";
import { ItineraryPdf } from "@/lib/itinerary-pdf";

// Render PDF memakan CPU dan rute ini publik (hanya berbekal token).
const BATAS = 30;
const JENDELA_MS = 5 * 60 * 1000;

type Ctx = { params: Promise<{ token: string }> };

export async function GET(req: Request, ctx: Ctx) {
  try {
    const ip = getClientIp(req);
    if (!rateLimit(`itinerary-pdf:${ip}`, BATAS, JENDELA_MS).success) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan. Coba lagi beberapa menit lagi." },
        { status: 429 },
      );
    }

    const { token } = await ctx.params;
    const itinerary = await prisma.itinerary.findUnique({ where: { token } });

    // Sama seperti halaman publiknya: hanya published yang bisa dibuka.
    if (!itinerary || itinerary.status !== "published") {
      return NextResponse.json({ error: "Tidak ditemukan." }, { status: 404 });
    }

    const rows = await prisma.setting.findMany({
      where: { key: { in: ["invoice_settings", "site_name", "site_logo"] } },
    });
    const map = Object.fromEntries(rows.map(r => [r.key, r.value]));
    let settings: Record<string, unknown> = {};
    try {
      settings = map.invoice_settings ? JSON.parse(map.invoice_settings) : {};
    } catch {
      settings = {};
    }

    const view = buildItineraryView({
      itinerary,
      settings,
      siteSettings: { site_name: map.site_name ?? "", site_logo: map.site_logo ?? "" },
    });

    const buffer = await renderToBuffer(ItineraryPdf({ v: view }));

    const unduh = new URL(req.url).searchParams.get("dl") === "1";
    const namaBerkas = `Itinerary-${(itinerary.judul || "dokumen").replace(/[^\w.-]+/g, "-").slice(0, 60)}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${unduh ? "attachment" : "inline"}; filename="${namaBerkas}"`,
        "Content-Length": String(buffer.length),
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch (error) {
    console.error("[itinerary/pdf]", error);
    return NextResponse.json({ error: "Gagal membuat PDF." }, { status: 500 });
  }
}
