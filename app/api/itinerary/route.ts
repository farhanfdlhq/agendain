import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { ItineraryDocSchema, getClientIp, serverError } from "@/lib/security";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

/** Token tautan publik — panjang & acak agar dokumen orang lain tak bisa ditebak. */
const buatToken = () => randomBytes(24).toString("base64url");

export async function GET(req: Request) {
  try {
    const gate = await requirePermission(req, "GET /api/itinerary", "itinerary_view");
    if (gate.denied) return gate.denied;

    const rows = await prisma.itinerary.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, token: true, judul: true, klienNama: true,
        tanggalDok: true, status: true, createdAt: true,
      },
    });
    return NextResponse.json(rows);
  } catch (error) {
    return serverError("itinerary", error);
  }
}

export async function POST(req: Request) {
  try {
    const gate = await requirePermission(req, "POST /api/itinerary", "itinerary_create");
    if (gate.denied) return gate.denied;

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

    const created = await prisma.itinerary.create({
      data: {
        token: buatToken(),
        bahasa: d.bahasa ?? "id",
        judul: d.judul,
        klienNama: d.klienNama,
        klienNegara: d.klienNegara || null,
        klienTelepon: d.klienTelepon || null,
        klienEmail: d.klienEmail || null,
        tanggalDok,
        hari: d.hari,
        catatan: d.catatan || null,
        status: d.status ?? "draft",
      },
    });

    await logAudit({
      action: "itinerary.create",
      actorId: gate.actor.userId,
      actorEmail: gate.actor.email,
      targetType: "Itinerary",
      targetId: created.id,
      detail: { judul: created.judul, status: created.status },
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent"),
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return serverError("itinerary", error);
  }
}
