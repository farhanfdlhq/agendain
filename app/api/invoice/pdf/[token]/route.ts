import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/security";
import { buildInvoiceView } from "@/lib/invoice";
import { InvoicePdf } from "@/lib/invoice-pdf";

// Render PDF memakan CPU dan rute ini publik (hanya berbekal token), jadi
// dibatasi per-IP. VPS produksi hanya 2 core.
const BATAS = 30;
const JENDELA_MS = 5 * 60 * 1000;

type Ctx = { params: Promise<{ token: string }> };

export async function GET(req: Request, ctx: Ctx) {
  try {
    const ip = getClientIp(req);
    if (!rateLimit(`invoice-pdf:${ip}`, BATAS, JENDELA_MS).success) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan. Coba lagi beberapa menit lagi." },
        { status: 429 },
      );
    }

    const { token } = await ctx.params;
    const invoice = await prisma.invoice.findUnique({
      where: { token },
      include: { paymentAccount: true },
    });

    // Sama seperti halaman publiknya: draft & batal tidak pernah ada.
    if (!invoice || invoice.status === "draft" || invoice.status === "batal") {
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

    const view = buildInvoiceView({
      invoice,
      akun: invoice.paymentAccount,
      settings,
      siteSettings: { site_name: map.site_name ?? "", site_logo: map.site_logo ?? "" },
    });

    const buffer = await renderToBuffer(InvoicePdf({ v: view }));

    // Tanpa `?dl=1` → STREAM (tampil di viewer browser). Dengan `?dl=1` →
    // unduhan. Ini padanan `$pdf->stream()` / `$pdf->download()` di Laravel.
    const unduh = new URL(req.url).searchParams.get("dl") === "1";
    const namaBerkas = `${invoice.nomor.replace(/[^\w.-]+/g, "-")}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${unduh ? "attachment" : "inline"}; filename="${namaBerkas}"`,
        "Content-Length": String(buffer.length),
        // Dokumen tagihan tidak boleh disimpan cache bersama.
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch (error) {
    console.error("[invoice/pdf]", error);
    return NextResponse.json({ error: "Gagal membuat PDF." }, { status: 500 });
  }
}
