import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { InvoiceSchema, getClientIp, serverError } from "@/lib/security";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { hitungInvoice, type InvoiceItem } from "@/lib/invoice";
import { bekukanKurs } from "@/lib/currency";

// Next 16: `params` adalah Promise dan WAJIB di-await.
type Ctx = { params: Promise<{ id: string }> };

const idDari = async (ctx: Ctx) => {
  const n = Number((await ctx.params).id);
  return Number.isInteger(n) && n > 0 ? n : null;
};

export async function GET(req: Request, ctx: Ctx) {
  try {
    const gate = await requirePermission(req, "GET /api/invoice/[id]", "invoice_view");
    if (gate.denied) return gate.denied;

    const id = await idDari(ctx);
    if (!id) return NextResponse.json({ error: "Id tidak valid." }, { status: 400 });

    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return NextResponse.json({ error: "Invoice tidak ditemukan." }, { status: 404 });

    return NextResponse.json(invoice);
  } catch (error) {
    return serverError("invoice/[id]", error);
  }
}

export async function PUT(req: Request, ctx: Ctx) {
  try {
    const gate = await requirePermission(req, "PUT /api/invoice/[id]", "invoice_edit");
    if (gate.denied) return gate.denied;

    const id = await idDari(ctx);
    if (!id) return NextResponse.json({ error: "Id tidak valid." }, { status: 400 });

    const lama = await prisma.invoice.findUnique({ where: { id } });
    if (!lama) return NextResponse.json({ error: "Invoice tidak ditemukan." }, { status: 404 });

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

    const { subtotal, pajakNominal, total } = hitungInvoice(
      d.items as InvoiceItem[],
      d.pajakPersen ?? 0,
    );

    const status = d.status ?? lama.status;
    const mataUang = d.mataUang ?? lama.mataUang;

    // Kurs dibekukan SEKALI, saat invoice pertama kali meninggalkan status
    // draft. Setelah itu tidak pernah disegarkan lagi walau invoice disunting.
    let kurs = lama.kurs as unknown as number | null;
    let totalPadanan = lama.totalPadanan as unknown as number | null;
    if (status !== "draft" && !kurs) {
      const beku = await bekukanKurs(mataUang, total);
      kurs = beku.kurs;
      totalPadanan = beku.totalPadanan;
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        bahasa: d.bahasa ?? lama.bahasa,
        mataUang,
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
        // Tanggal pelunasan diisi saat berpindah ke lunas, dan dihapus bila
        // status dikembalikan — supaya tidak ada invoice "belum lunas" yang
        // masih menyimpan tanggal pelunasan lama.
        lunasAt: status === "lunas" ? (lama.lunasAt ?? new Date()) : null,
        paymentAccountId: d.paymentAccountId ?? null,
      },
    });

    if (lama.status !== updated.status) {
      await logAudit({
        action: "invoice.status_change",
        actorId: gate.actor.userId,
        actorEmail: gate.actor.email,
        targetType: "Invoice",
        targetId: id,
        detail: { nomor: updated.nomor, dari: lama.status, ke: updated.status },
        ip: getClientIp(req),
        userAgent: req.headers.get("user-agent"),
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return serverError("invoice/[id]", error);
  }
}

export async function DELETE(req: Request, ctx: Ctx) {
  try {
    const gate = await requirePermission(req, "DELETE /api/invoice/[id]", "invoice_delete");
    if (gate.denied) return gate.denied;

    const id = await idDari(ctx);
    if (!id) return NextResponse.json({ error: "Id tidak valid." }, { status: 400 });

    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return NextResponse.json({ error: "Invoice tidak ditemukan." }, { status: 404 });

    // Invoice yang sudah dikirim ke klien adalah dokumen tagihan — dibatalkan,
    // bukan dihapus, supaya nomornya tidak pernah dipakai ulang diam-diam.
    if (invoice.status !== "draft") {
      return NextResponse.json(
        { error: "Hanya invoice berstatus draft yang bisa dihapus. Ubah status menjadi Batal." },
        { status: 409 },
      );
    }

    await prisma.invoice.delete({ where: { id } });

    await logAudit({
      action: "invoice.delete",
      actorId: gate.actor.userId,
      actorEmail: gate.actor.email,
      targetType: "Invoice",
      targetId: id,
      detail: { nomor: invoice.nomor },
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent"),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError("invoice/[id]", error);
  }
}

// Ubah HANYA status — dipakai dropdown status di daftar invoice, yang tak
// memuat items/klien sehingga tak bisa mengirim payload PUT lengkap. Logika
// pembekuan kurs & lunasAt disamakan dengan PUT agar konsisten.
export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const gate = await requirePermission(req, "PATCH /api/invoice/[id]", "invoice_edit");
    if (gate.denied) return gate.denied;

    const id = await idDari(ctx);
    if (!id) return NextResponse.json({ error: "Id tidak valid." }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const status = body?.status;
    if (!["draft", "terkirim", "lunas", "batal"].includes(status)) {
      return NextResponse.json({ error: "Status tidak valid." }, { status: 400 });
    }

    const lama = await prisma.invoice.findUnique({ where: { id } });
    if (!lama) return NextResponse.json({ error: "Invoice tidak ditemukan." }, { status: 404 });

    // Bekukan kurs sekali saat invoice pertama meninggalkan draft.
    let kurs = lama.kurs as unknown as number | null;
    let totalPadanan = lama.totalPadanan as unknown as number | null;
    if (status !== "draft" && !kurs) {
      const beku = await bekukanKurs(lama.mataUang, Number(lama.total));
      kurs = beku.kurs;
      totalPadanan = beku.totalPadanan;
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        status,
        kurs,
        totalPadanan,
        lunasAt: status === "lunas" ? (lama.lunasAt ?? new Date()) : null,
      },
    });

    if (lama.status !== updated.status) {
      await logAudit({
        action: "invoice.status_change",
        actorId: gate.actor.userId,
        actorEmail: gate.actor.email,
        targetType: "Invoice",
        targetId: id,
        detail: { nomor: updated.nomor, dari: lama.status, ke: updated.status },
        ip: getClientIp(req),
        userAgent: req.headers.get("user-agent"),
      });
    }

    return NextResponse.json({ id: updated.id, status: updated.status, token: updated.token });
  } catch (error) {
    return serverError("invoice/[id]", error);
  }
}
