import { prisma } from "@/lib/prisma";

type AuditInput = {
  action: string;
  actorId?: number | null;
  actorEmail?: string | null;
  targetType?: string | null;
  targetId?: string | number | null;
  detail?: Record<string, unknown> | null;
  ip?: string | null;
  userAgent?: string | null;
};

// Mencatat event keamanan ke tabel AuditLog. WAJIB tidak pernah melempar
// error — kegagalan logging tidak boleh menggagalkan alur utama (login/CRUD).
export async function logAudit(input: AuditInput) {
  try {
    await prisma.auditLog.create({
      data: {
        action: input.action,
        actorId: input.actorId ?? null,
        actorEmail: input.actorEmail ?? null,
        targetType: input.targetType ?? null,
        targetId: input.targetId != null ? String(input.targetId) : null,
        detail: input.detail ? JSON.stringify(input.detail) : null,
        ip: input.ip ?? null,
        userAgent: input.userAgent ?? null,
      },
    });
  } catch (err) {
    console.error("[audit] gagal mencatat", input.action, err);
  }
}
