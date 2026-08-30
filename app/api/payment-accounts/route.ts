import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaymentAccountSchema, getClientIp, serverError } from "@/lib/security";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

// Daftar akun juga dibaca form invoice saat memilih rekening tujuan, jadi cukup
// `invoice_view` ATAU `settings_manage` (semantik OR). MENULIS tetap khusus
// `settings_manage`: mengganti nomor rekening adalah vektor penipuan.
export async function GET(req: Request) {
  try {
    const gate = await requirePermission(
      req,
      "GET /api/payment-accounts",
      "invoice_view",
      "settings_manage",
    );
    if (gate.denied) return gate.denied;

    const accounts = await prisma.paymentAccount.findMany({
      orderBy: [{ isDefault: "desc" }, { label: "asc" }],
    });
    return NextResponse.json(accounts);
  } catch (error) {
    return serverError("payment-accounts", error);
  }
}

export async function POST(req: Request) {
  try {
    const gate = await requirePermission(req, "POST /api/payment-accounts", "settings_manage");
    if (gate.denied) return gate.denied;

    const parsed = PaymentAccountSchema.safeParse(await req.json());
    if (!parsed.success) {
      // Dicatat server-side agar kegagalan validasi terbaca di log pm2 —
      // pelajaran dari blocker "gagal simpan paket" 29 Agustus.
      console.error("[payment-accounts] validasi gagal", parsed.error.flatten().fieldErrors);
      return NextResponse.json(
        { error: "Data tidak valid.", fieldErrors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = parsed.data;
    // Hanya boleh ada satu default. Dibungkus transaksi supaya tidak pernah
    // ada dua default bila dua admin menyimpan bersamaan.
    const created = await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.paymentAccount.updateMany({
          where: { isDefault: true },
          data: { isDefault: false },
        });
      }
      return tx.paymentAccount.create({ data });
    });

    // Rekening tujuan adalah vektor penipuan klasik (nomor ditukar → uang
    // klien mengalir ke penipu), jadi setiap perubahannya dicatat.
    await logAudit({
      action: "payment_account.create",
      actorId: gate.actor.userId,
      actorEmail: gate.actor.email,
      targetType: "PaymentAccount",
      targetId: created.id,
      detail: { label: created.label, bank: created.bank, isDefault: created.isDefault },
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent"),
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return serverError("payment-accounts", error);
  }
}
