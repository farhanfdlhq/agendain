import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaymentAccountSchema, getClientIp, serverError } from "@/lib/security";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

// Next 16: `params` adalah Promise dan WAJIB di-await sebelum dipakai.
type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, ctx: Ctx) {
  try {
    const gate = await requirePermission(
      req,
      "PUT /api/payment-accounts/[id]",
      "settings_manage",
    );
    if (gate.denied) return gate.denied;

    const id = Number((await ctx.params).id);
    if (!Number.isInteger(id) || id < 1) {
      return NextResponse.json({ error: "Id tidak valid." }, { status: 400 });
    }

    const parsed = PaymentAccountSchema.safeParse(await req.json());
    if (!parsed.success) {
      console.error("[payment-accounts] validasi gagal", parsed.error.flatten().fieldErrors);
      return NextResponse.json(
        { error: "Data tidak valid.", fieldErrors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const updated = await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.paymentAccount.updateMany({
          where: { isDefault: true, NOT: { id } },
          data: { isDefault: false },
        });
      }
      return tx.paymentAccount.update({ where: { id }, data });
    });

    // Nomor rekening yang berubah wajib meninggalkan jejak — lihat catatan
    // vektor penipuan di route induk.
    await logAudit({
      action: "payment_account.update",
      actorId: gate.actor.userId,
      actorEmail: gate.actor.email,
      targetType: "PaymentAccount",
      targetId: id,
      detail: {
        label: updated.label,
        bank: updated.bank,
        nomor: updated.nomor,
        iban: updated.iban,
        isDefault: updated.isDefault,
        aktif: updated.aktif,
      },
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent"),
    });

    return NextResponse.json(updated);
  } catch (error) {
    return serverError("payment-accounts", error);
  }
}

// Nonaktifkan, BUKAN hapus baris. Invoice lama merujuk akun ini lewat
// `paymentAccountId`; menghapusnya membuat invoice yang sudah terkirim
// kehilangan rekening tujuannya.
export async function DELETE(req: Request, ctx: Ctx) {
  try {
    const gate = await requirePermission(
      req,
      "DELETE /api/payment-accounts/[id]",
      "settings_manage",
    );
    if (gate.denied) return gate.denied;

    const id = Number((await ctx.params).id);
    if (!Number.isInteger(id) || id < 1) {
      return NextResponse.json({ error: "Id tidak valid." }, { status: 400 });
    }

    const deactivated = await prisma.paymentAccount.update({
      where: { id },
      data: { aktif: false, isDefault: false },
    });

    await logAudit({
      action: "payment_account.deactivate",
      actorId: gate.actor.userId,
      actorEmail: gate.actor.email,
      targetType: "PaymentAccount",
      targetId: id,
      detail: { label: deactivated.label, bank: deactivated.bank },
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent"),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError("payment-accounts", error);
  }
}
