import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { InvoiceSchema, getClientIp, serverError } from "@/lib/security";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { formatNomorInvoice, hitungInvoice, type InvoiceItem } from "@/lib/invoice";
import { bekukanKurs } from "@/lib/currency";

/** Token tautan publik. Panjang & acak supaya invoice orang lain tak bisa ditebak. */
const buatToken = () => randomBytes(24).toString("base64url");

async function prefixNomor(): Promise<string> {
  const s = await prisma.setting.findUnique({ where: { key: "invoice_settings" } });
  if (!s) return "INV";
  try {
    return (JSON.parse(s.value)?.prefixNomor || "INV").toString();
  } catch {
    return "INV";
  }
}

/**
 * Nomor urut per bulan. Dua admin yang menyimpan bersamaan bisa mendapat angka
 * sama; yang kalah ditolak `@unique` pada kolom `nomor` lalu dicoba lagi dengan
 * urutan berikutnya. Cukup untuk volume agency — tabel sequence tersendiri
 * hanya menambah bagian yang bisa rusak.
 */
async function nomorBerikutnya(prefix: string, tanggal: Date, offset = 0): Promise<string> {
  const awal = new Date(tanggal.getFullYear(), tanggal.getMonth(), 1);
  const akhir = new Date(tanggal.getFullYear(), tanggal.getMonth() + 1, 1);
  const jml = await prisma.invoice.count({ where: { tanggal: { gte: awal, lt: akhir } } });
  return formatNomorInvoice(prefix, tanggal, jml + 1 + offset);
}

export async function GET(req: Request) {
  try {
    const gate = await requirePermission(req, "GET /api/invoice", "invoice_view");
    if (gate.denied) return gate.denied;

    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, nomor: true, token: true, klienNama: true, judul: true,
        tanggal: true, jatuhTempo: true, mataUang: true, total: true,
        status: true, createdAt: true,
      },
    });
    return NextResponse.json(invoices);
  } catch (error) {
    return serverError("invoice", error);
  }
}

export async function POST(req: Request) {
  try {
    const gate = await requirePermission(req, "POST /api/invoice", "invoice_create");
    if (gate.denied) return gate.denied;

    const parsed = InvoiceSchema.safeParse(await req.json());
    if (!parsed.success) {
      console.error("[invoice] validasi gagal", parsed.error.flatten().fieldErrors);
      return NextResponse.json(
        { error: "Data tidak valid.", fieldErrors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const d = parsed.data;
    const tanggal = new Date(d.tanggal);
    if (Number.isNaN(tanggal.getTime())) {
      return NextResponse.json({ error: "Tanggal invoice tidak valid." }, { status: 400 });
    }

    // Angka SELALU dihitung ulang di sini — payload klien tidak membawanya.
    const { subtotal, pajakNominal, total } = hitungInvoice(
      d.items as InvoiceItem[],
      d.pajakPersen ?? 0,
    );

    const status = d.status ?? "draft";
    const { kurs, totalPadanan } = status === "draft"
      ? { kurs: null, totalPadanan: null }
      : await bekukanKurs(d.mataUang ?? "IDR", total);

    const prefix = await prefixNomor();
    const dasar = {
      token: buatToken(),
      bahasa: d.bahasa ?? "id",
      mataUang: d.mataUang ?? "IDR",
      klienNama: d.klienNama,
      klienEmail: d.klienEmail || null,
      klienTelepon: d.klienTelepon || null,
      klienAlamat: d.klienAlamat || null,
      judul: d.judul || null,
      tanggal,
      jatuhTempo: d.jatuhTempo ? new Date(d.jatuhTempo) : null,
      items: d.items,
      subtotal, pajakNominal, total,
      pajakLabel: d.pajakLabel || null,
      pajakPersen: d.pajakPersen ?? 0,
      kurs, totalPadanan,
      catatan: d.catatan || null,
      status,
      lunasAt: status === "lunas" ? new Date() : null,
      paymentAccountId: d.paymentAccountId ?? null,
    };

    // Bentrok nomor sangat jarang; 5 percobaan sudah jauh lebih dari cukup.
    let created = null;
    for (let percobaan = 0; percobaan < 5 && !created; percobaan++) {
      const nomor = await nomorBerikutnya(prefix, tanggal, percobaan);
      try {
        created = await prisma.invoice.create({ data: { ...dasar, nomor } });
      } catch (e) {
        // P2002 = pelanggaran kolom unik; di sini artinya `nomor` keburu
        // dipakai admin lain. Galat lain harus tetap dilempar.
        if ((e as { code?: string })?.code !== "P2002") throw e;
      }
    }
    if (!created) {
      return NextResponse.json(
        { error: "Gagal membuat nomor invoice unik. Coba lagi." },
        { status: 409 },
      );
    }

    await logAudit({
      action: "invoice.create",
      actorId: gate.actor.userId,
      actorEmail: gate.actor.email,
      targetType: "Invoice",
      targetId: created.id,
      detail: { nomor: created.nomor, status: created.status, total: String(created.total) },
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent"),
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return serverError("invoice", error);
  }
}
