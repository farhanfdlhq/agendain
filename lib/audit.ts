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

// Retensi audit log: baris lebih tua dari ini dihapus otomatis. Menjaga tabel
// tetap ramping tanpa cron terpisah — pembersihan dipicu opportunistik saat ada
// aktivitas, tetapi DIBATASI sekali per jam (in-memory) agar tidak menjalankan
// deleteMany di setiap penulisan.
const AUDIT_RETENTION_DAYS = 14;
const PURGE_THROTTLE_MS = 60 * 60 * 1000; // maksimal 1x/jam
let lastPurgeAt = 0;

async function purgeOldAuditLogs() {
  const now = Date.now();
  if (now - lastPurgeAt < PURGE_THROTTLE_MS) return;
  lastPurgeAt = now;
  try {
    const cutoff = new Date(now - AUDIT_RETENTION_DAYS * 24 * 60 * 60 * 1000);
    await prisma.auditLog.deleteMany({ where: { createdAt: { lt: cutoff } } });
  } catch (err) {
    // Pembersihan gagal tidak boleh mengganggu apa pun; catat saja.
    console.error("[audit] gagal membersihkan log lama", err);
  }
}

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
    // Sesudah menulis, coba bersihkan yang kedaluwarsa (ter-throttle).
    void purgeOldAuditLogs();
  } catch (err) {
    console.error("[audit] gagal mencatat", input.action, err);
  }
}
