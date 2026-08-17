import { after } from "next/server";
import { logAudit } from "./audit";
import { getClientIpFromHeaders } from "./security";

// Policy layer di atas lib/audit.ts untuk mencatat error/penolakan ke AuditLog.
//
// PENTING: file ini meng-import ./audit (yang menyentuh Prisma) secara statis,
// jadi ia TIDAK BOLEH di-import statis oleh lib/security.ts — security.ts wajib
// memakai dynamic import("./error-log") agar lib/security.test.ts (tanpa vitest
// config, tanpa alias @/ dan tanpa DATABASE_URL) tetap bisa memuat security.ts.
//
// Semua fungsi report* bersifat "fire-and-forget" dan tidak pernah melempar
// error (kontrak diwarisi dari logAudit). Hanya logErrorEvent yang mengembalikan
// Promise agar instrumentation.ts dapat menunggunya (await) sebelum proses mati.

export type ErrorCtx = {
  route: string;
  status?: number;
  code?: string;
  req?: Request | null;
  actorId?: number | null;
  actorEmail?: string | null;
  targetType?: string | null;
  targetId?: string | number | null;
  detail?: Record<string, unknown>;
};

// --- Dedup lintas-lapisan (WeakSet objek error) --------------------------------
// Mencegah satu error yang sama tercatat dua kali: sekali oleh catch route
// (serverError) dan sekali lagi saat bubble ke onRequestError instrumentation.
const reported = new WeakSet<object>();

export function markReported(error: unknown): void {
  if (error !== null && typeof error === "object") reported.add(error as object);
}

export function wasReported(error: unknown): boolean {
  return error !== null && typeof error === "object" && reported.has(error as object);
}

// --- Throttle per-signature (anti-banjir) --------------------------------------
// Error yang sama yang terpicu tiap request (mis. route rusak) tidak boleh
// membanjiri AuditLog. Kunci = action|route|code|message(120). Jendela 10 detik.
const THROTTLE_MS = 10_000;
const lastLogged = new Map<string, number>();

function shouldThrottle(key: string): boolean {
  const now = Date.now();
  const last = lastLogged.get(key);
  if (last !== undefined && now - last < THROTTLE_MS) return true;
  lastLogged.set(key, now);
  return false;
}

// Bersihkan entri kadaluarsa agar Map tidak tumbuh tanpa batas. unref() supaya
// interval ini tidak menahan proses tetap hidup (pola sama dengan rateLimit).
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [k, t] of lastLogged.entries()) {
    if (now - t > THROTTLE_MS) lastLogged.delete(k);
  }
}, 60_000);
(cleanupTimer as { unref?: () => void }).unref?.();

// --- Ringkasan error yang aman -------------------------------------------------
// Buang cwd absolut dari string agar path internal server tidak bocor & lebih
// ringkas. Normalisasi backslash Windows sekaligus.
function stripCwd(s: string): string {
  let cwd = "";
  try {
    cwd = process.cwd();
  } catch {
    return s;
  }
  if (!cwd) return s;
  return s.split(cwd).join(".").split(cwd.replace(/\\/g, "/")).join(".");
}

// Ekstrak HANYA field yang aman: nama, pesan (≤500), stack (8 baris, ≤1500),
// serta kode sistem/Prisma. TIDAK PERNAH menyimpan meta Prisma, body, cookie,
// header authorization, token, atau isi file.
function summarizeError(error: unknown): Record<string, unknown> {
  if (error === null || error === undefined) return {};
  if (typeof error !== "object") {
    return { message: String(error).slice(0, 500) };
  }

  const e = error as Record<string, unknown>;
  const out: Record<string, unknown> = {};

  if (typeof e.name === "string") out.name = e.name;
  if (typeof e.message === "string") out.message = e.message.slice(0, 500);
  if (typeof e.stack === "string") {
    out.stack = stripCwd(e.stack).split("\n").slice(0, 8).join("\n").slice(0, 1500);
  }
  // Kode error sistem (fs: EACCES/ENOSPC) atau Prisma (P2002, dll) — string
  // pendek & aman. errno/syscall membantu diagnosa masalah izin/disk di VPS.
  for (const k of ["code", "errno", "syscall"] as const) {
    const v = e[k];
    if (typeof v === "string" || typeof v === "number") out[k] = v;
  }
  if (typeof e.path === "string") out.path = stripCwd(e.path).slice(0, 300);
  if (typeof e.digest === "string") out.digest = e.digest.slice(0, 200);

  return out;
}

// JSON.stringify aman + batas 4000 char. Melindungi kolom detail @db.Text agar
// tidak membengkak karena stack/detail yang tak terduga besar.
function boundDetail(obj: Record<string, unknown>): Record<string, unknown> {
  let serialized: string;
  try {
    serialized = JSON.stringify(obj);
  } catch {
    return { _unserializable: true };
  }
  if (serialized.length > 4000) {
    return { _truncated: true, preview: serialized.slice(0, 4000) };
  }
  return obj;
}

// Ambil actor dari session NextAuth secara defensif. actorId hanya diisi bila
// id numerik valid; actorEmail tetap ditulis meski id tidak ada.
export function actorFrom(session: unknown): {
  actorId: number | null;
  actorEmail: string | null;
} {
  const user = (session as { user?: { id?: unknown; email?: unknown } } | null)?.user;
  const idNum = Number(user?.id);
  return {
    actorId: Number.isFinite(idNum) ? idNum : null,
    actorEmail: typeof user?.email === "string" ? user.email : null,
  };
}

// Inti pencatatan (dipakai instrumentation dgn await). Mengembalikan Promise
// tetapi TIDAK PERNAH menolak (reject) — semua kegagalan ditelan di dalam.
export async function logErrorEvent(
  action: string,
  ctx: ErrorCtx,
  error?: unknown,
): Promise<void> {
  try {
    const summary = error !== undefined ? summarizeError(error) : {};

    // Tandai error sebagai sudah dilaporkan agar tidak dobel saat bubble.
    if (error !== undefined) markReported(error);

    // Throttle berdasarkan signature.
    const code = ctx.code ?? (typeof summary.code === "string" ? summary.code : "");
    const msg =
      typeof summary.message === "string" ? summary.message.slice(0, 120) : "";
    if (shouldThrottle(`${action}|${ctx.route}|${code}|${msg}`)) return;

    // Rakit detail: konteks pemanggil + status/code + ringkasan error.
    const detail: Record<string, unknown> = { route: ctx.route, ...(ctx.detail ?? {}) };
    if (ctx.status !== undefined) detail.status = ctx.status;
    if (ctx.code !== undefined) detail.code = ctx.code;
    if (Object.keys(summary).length > 0) detail.error = summary;

    // IP + User-Agent bila ada Request pada konteks.
    let ip: string | null = null;
    let userAgent: string | null = null;
    if (ctx.req) {
      try {
        ip = getClientIpFromHeaders(ctx.req.headers);
        userAgent = ctx.req.headers.get("user-agent");
      } catch {
        /* abaikan */
      }
    }

    await logAudit({
      action,
      actorId: ctx.actorId ?? null,
      actorEmail: ctx.actorEmail ?? null,
      targetType: ctx.targetType ?? "route",
      targetId: ctx.targetId ?? ctx.route,
      detail: boundDetail(detail),
      ip,
      userAgent,
    });
  } catch (err) {
    // Logger error tidak boleh menjatuhkan alur apa pun.
    console.error("[error-log] gagal mencatat", action, err);
  }
}

// Fire-and-forget: jadwalkan penulisan setelah respons terkirim (after()).
// Di luar request scope (mis. test), after() melempar → fallback membiarkan
// promise berjalan di latar tanpa menunggu.
function schedule(p: Promise<void>): void {
  const safe = p.catch(() => {});
  try {
    after(safe);
  } catch {
    void safe;
  }
}

// 500 tertangkap di catch route.
export function reportServerError(ctx: ErrorCtx, error: unknown): void {
  schedule(logErrorEvent("error.server", ctx, error));
}

// 4xx gate upload (no_file/size/mime/signature) — bukan kegagalan proses.
export function reportUploadRejected(ctx: ErrorCtx): void {
  schedule(logErrorEvent("upload.rejected", ctx));
}

// 5xx saat memproses/menulis file (sharp gagal, EACCES/ENOSPC saat tulis).
export function reportUploadFailed(ctx: ErrorCtx, error: unknown): void {
  schedule(logErrorEvent("upload.failed", ctx, error));
}

// 401/403 penolakan otentikasi/otorisasi.
export function reportAuthDenied(ctx: ErrorCtx): void {
  schedule(logErrorEvent("auth.denied", ctx));
}
