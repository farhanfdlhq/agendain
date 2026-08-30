import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ItineraryDocSchema, getClientIp, serverError } from "@/lib/security";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

type Ctx = { params: Promise<{ id: string }> };

const idDari = async (ctx: Ctx) => {
  const n = Number((await ctx.params).id);
  return Number.isInteger(n) && n > 0 ? n : null;
};

export async function GET(req: Request, ctx: Ctx) {
  try {
    const gate = await requirePermission(req, "GET /api/itinerary/[id]", "itinerary_view");
    if (gate.denied) return gate.denied;

    const id = await idDari(ctx);
    if (!id) return NextResponse.json({ error: "Id tidak valid." }, { status: 400 });

    const it = await prisma.itinerary.findUnique({ where: { id } });
    if (!it) return NextResponse.json({ error: "Itinerary tidak ditemukan." }, { status: 404 });

    return NextResponse.json(it);
  } catch (error) {
    return serverError("itinerary/[id]", error);
  }
}

export async function PUT(req: Request, ctx: Ctx) {
  try {
    const gate = await requirePermission(req, "PUT /api/itinerary/[id]", "itinerary_edit");
    if (gate.denied) return gate.denied;

    const id = await idDari(ctx);
    if (!id) return NextResponse.json({ error: "Id tidak valid." }, { status: 400 });

    const lama = await prisma.itinerary.findUnique({ where: { id } });
    if (!lama) return NextResponse.json({ error: "Itinerary tidak ditemukan." }, { status: 404 });

    const parsed = ItineraryDocSchema.safeParse(await req.json());
    if (!parsed.success) {
      console.error("[itinerary] validasi gagal", parsed.error.flatten().fieldErrors);
      return NextResponse.json(
        { error: "Data tidak valid.", fieldErrors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const d = parsed.data;
    const tanggalDok = new Date(d.tanggalDok);
    if (Number.isNaN(tanggalDok.getTime())) {
      return NextResponse.json({ error: "Tanggal dokumen tidak valid." }, { status: 400 });
    }

    const updated = await prisma.itinerary.update({
      where: { id },
      data: {
        bahasa: d.bahasa ?? lama.bahasa,
        judul: d.judul,
        klienNama: d.klienNama,
        klienNegara: d.klienNegara || null,
        klienTelepon: d.klienTelepon || null,
        klienEmail: d.klienEmail || null,
        tanggalDok,
        hari: d.hari,
        catatan: d.catatan || null,
        status: d.status ?? lama.status,
      },
    });

    if (lama.status !== updated.status) {
      await logAudit({
        action: "itinerary.status_change",
        actorId: gate.actor.userId,
        actorEmail: gate.actor.email,
        targetType: "Itinerary",
        targetId: id,
        detail: { judul: updated.judul, dari: lama.status, ke: updated.status },
        ip: getClientIp(req),
        userAgent: req.headers.get("user-agent"),
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return serverError("itinerary/[id]", error);
  }
}

// Ubah HANYA status — dipakai dropdown status di daftar itinerary.
export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const gate = await requirePermission(req, "PATCH /api/itinerary/[id]", "itinerary_edit");
    if (gate.denied) return gate.denied;

    const id = await idDari(ctx);
    if (!id) return NextResponse.json({ error: "Id tidak valid." }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const status = body?.status;
    if (!["draft", "published", "archived"].includes(status)) {
      return NextResponse.json({ error: "Status tidak valid." }, { status: 400 });
    }

    const lama = await prisma.itinerary.findUnique({ where: { id } });
    if (!lama) return NextResponse.json({ error: "Itinerary tidak ditemukan." }, { status: 404 });

    const updated = await prisma.itinerary.update({ where: { id }, data: { status } });

    if (lama.status !== updated.status) {
      await logAudit({
        action: "itinerary.status_change",
        actorId: gate.actor.userId,
        actorEmail: gate.actor.email,
        targetType: "Itinerary",
        targetId: id,
        detail: { judul: updated.judul, dari: lama.status, ke: updated.status },
        ip: getClientIp(req),
        userAgent: req.headers.get("user-agent"),
      });
    }

    return NextResponse.json({ id: updated.id, status: updated.status, token: updated.token });
  } catch (error) {
    return serverError("itinerary/[id]", error);
  }
}

export async function DELETE(req: Request, ctx: Ctx) {
  try {
    const gate = await requirePermission(req, "DELETE /api/itinerary/[id]", "itinerary_delete");
    if (gate.denied) return gate.denied;

    const id = await idDari(ctx);
    if (!id) return NextResponse.json({ error: "Id tidak valid." }, { status: 400 });

    const it = await prisma.itinerary.findUnique({ where: { id } });
    if (!it) return NextResponse.json({ error: "Itinerary tidak ditemukan." }, { status: 404 });

    // Itinerary tak punya nomor formal, jadi menghapus aman (tak ada urutan
    // yang bisa terpakai ulang seperti pada invoice).
    await prisma.itinerary.delete({ where: { id } });

    await logAudit({
      action: "itinerary.delete",
      actorId: gate.actor.userId,
      actorEmail: gate.actor.email,
      targetType: "Itinerary",
      targetId: id,
      detail: { judul: it.judul },
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent"),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError("itinerary/[id]", error);
  }
}
