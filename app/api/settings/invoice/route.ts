import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { InvoiceSettingsSchema, getClientIp, serverError } from "@/lib/security";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

const KEY = "invoice_settings";

export async function GET(req: Request) {
  try {
    // Dibaca juga oleh form invoice (untuk mengisi pajak & termin bawaan),
    // jadi `invoice_view` sudah cukup. MENULIS tetap khusus `settings_manage`.
    const gate = await requirePermission(
      req,
      "GET /api/settings/invoice",
      "invoice_view",
      "settings_manage",
    );
    if (gate.denied) return gate.denied;

    const setting = await prisma.setting.findUnique({ where: { key: KEY } });
    if (!setting) return NextResponse.json({});
    return NextResponse.json(JSON.parse(setting.value));
  } catch (error) {
    return serverError("settings/invoice", error);
  }
}

export async function POST(req: Request) {
  try {
    const gate = await requirePermission(req, "POST /api/settings/invoice", "settings_manage");
    if (gate.denied) return gate.denied;

    const parsed = InvoiceSettingsSchema.safeParse(await req.json());
    if (!parsed.success) {
      console.error("[settings/invoice] validasi gagal", parsed.error.flatten().fieldErrors);
      return NextResponse.json(
        { error: "Data tidak valid.", fieldErrors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const jsonValue = JSON.stringify(parsed.data);
    await prisma.setting.upsert({
      where: { key: KEY },
      update: { value: jsonValue },
      create: { key: KEY, value: jsonValue },
    });

    // Identitas yang tercetak di dokumen tagihan. Perubahannya dicatat agar
    // bisa ditelusuri bila kelak ada sengketa dengan klien.
    await logAudit({
      action: "invoice.settings_update",
      actorId: gate.actor.userId,
      actorEmail: gate.actor.email,
      targetType: "Setting",
      targetId: KEY,
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent"),
    });

    // getSettings() di app/layout.tsx men-cache SELURUH baris Setting (tag
    // 'settings', TTL 1 jam) — tanpa ini pengaturan lama bertahan sejam.
    revalidateTag("settings", { expire: 0 });
    revalidatePath("/", "layout");

    return NextResponse.json({ success: true, message: "Pengaturan invoice berhasil disimpan" });
  } catch (error) {
    return serverError("settings/invoice", error);
  }
}
