import { NextResponse } from "next/server";
import { after } from "next/server";
import { z } from "zod";
export { sanitizeHtml } from "./sanitize";
import { PRIVATE_TRIP_STATUSES } from "./private-trip-status";

export const ADMIN_ROLES = ["super_admin", "admin", "editor"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export function isAllowedRole(
  role: unknown,
  allowedRoles: readonly AdminRole[],
): role is AdminRole {
  return typeof role === "string" && allowedRoles.includes(role as AdminRole);
}

export const PasswordSchema = z
  .string()
  .min(12, "Password minimal 12 karakter")
  .regex(/[a-z]/, "Password harus memiliki huruf kecil")
  .regex(/[A-Z]/, "Password harus memiliki huruf besar")
  .regex(/[0-9]/, "Password harus memiliki angka")
  .regex(/[^a-zA-Z0-9]/, "Password harus memiliki simbol");

/**
 * Id role pada payload user. Sengaja BUKAN enum tiga id bawaan: role custom
 * yang dibuat di halaman Roles & Permissions harus bisa ditetapkan ke user,
 * dan skema ini tidak bisa menyentuh DB. Bentuknya divalidasi di sini, lalu
 * keberadaan id-nya diperiksa terhadap roles_config di dalam route
 * (app/api/admin/users/**) — sama dengan aturan id di POST /api/admin/roles.
 */
export const RoleIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(50)
  .regex(/^[a-z0-9_]+$/, "Id role hanya boleh huruf kecil, angka, dan underscore");

export const AdminUserSchema = z.object({
  nama: z.string().min(2).max(100).trim(),
  email: z.string().email().max(190).trim().toLowerCase(),
  password: PasswordSchema,
  role: RoleIdSchema,
});

export const AdminUserUpdateSchema = AdminUserSchema.extend({
  password: PasswordSchema.optional(),
}).partial({ password: true });

export const ProfileUpdateSchema = z
  .object({
    nama: z.string().min(2).max(100).trim().optional(),
    email: z.string().email().max(190).trim().toLowerCase().optional(),
    currentPassword: z.string().optional(),
    newPassword: PasswordSchema.optional(),
    avatar: z.string().max(500).optional(),
  })
  .refine((data) => !data.newPassword || !!data.currentPassword, {
    message: "Password lama wajib diisi",
    path: ["currentPassword"],
  });

// === Bahan validasi field JSON paket (item keamanan) ===
// Field-field ini dulu `z.any()` — apa pun lolos. Sekarang tiap bentuk
// divalidasi: URL dibatasi skema aman (menutup XSS tersimpan lewat
// `javascript:`/`data:`), panjang string & jumlah elemen dibatasi (menahan
// payload raksasa), dan key tak dikenal di-strip (menutup prototype pollution).
// `z` object memang strip key tak dikenal secara default, jadi __proto__ dsb
// tidak pernah ikut tersimpan.

// URL untuk disimpan lalu dirender sebagai src/href. Hanya path relatif
// ("/uploads/...") atau http(s). Skema berbahaya ditolak tegas.
const StoredUrl = z
  .string()
  .max(2000)
  .refine((s) => {
    const t = s.trim();
    if (!t) return false;
    if (/^\s*(javascript|data|vbscript):/i.test(t)) return false;
    return t.startsWith("/") || /^https?:\/\//i.test(t);
  }, "URL tidak valid atau skema tidak diizinkan");

// Varian yang MEMBOLEHKAN string kosong. Form admin mengirim slot foto kosong
// sebagai "" (mis. `foto.medium = fotoUrls[0] || ""` saat paket belum berfoto
// atau `foto` lama berbentuk array sehingga hidrasi menghasilkan fotoUrls
// kosong). Tanpa ini, menyimpan paket seperti itu ditolak 400 — regresi nyata.
// Skema berbahaya tetap ditolak; hanya "" yang ditoleransi (dianggap "tak diisi").
const OptionalStoredUrl = z.literal("").or(StoredUrl);

// Daftar teks bebas (fasilitas, termasuk, informasi penting, dst).
const TextList = z.array(z.string().max(2000)).max(200);

const ItineraryItem = z.object({
  hari: z.coerce.number().int().min(0).max(1000).optional(),
  judul: z.string().max(500).optional(),
  judulEn: z.string().max(500).optional(),
  deskripsi: z.string().max(5000).optional(),
  deskripsiEn: z.string().max(5000).optional(),
  desc: z.string().max(5000).optional(),
});
const ItineraryList = z.array(ItineraryItem).max(200);

// Akomodasi & Penerbangan: baris bisa string mentah atau objek terstruktur.
const AkomodasiList = z
  .array(
    z.union([
      z.string().max(1000),
      z.object({ kota: z.string().max(200).optional(), nama: z.string().max(1000).optional() }),
    ]),
  )
  .max(100);
const PenerbanganList = z
  .array(
    z.union([
      z.string().max(1000),
      z.object({
        rute: z.string().max(400).optional(),
        detail: z.string().max(1000).optional(),
        maskapai: z.string().max(300).optional(),
      }),
    ]),
  )
  .max(100);

// File dokumen: {name, url} atau string URL.
const FileDokumenList = z
  .array(z.union([StoredUrl, z.object({ name: z.string().max(400).optional(), url: StoredUrl })]))
  .max(20);

// Foto: dua bentuk historis — array objek gambar, atau objek ber-`gallery`.
const FotoImageObject = z.object({
  thumb: OptionalStoredUrl.optional(),
  medium: OptionalStoredUrl.optional(),
  large: OptionalStoredUrl.optional(),
  full: OptionalStoredUrl.optional(),
});
const FotoSchema = z.union([
  z.array(z.union([StoredUrl, FotoImageObject])).max(30),
  z.object({
    thumb: OptionalStoredUrl.optional(),
    medium: OptionalStoredUrl.optional(),
    large: OptionalStoredUrl.optional(),
    full: OptionalStoredUrl.optional(),
    // Slot kosong "" disaring agar gallery tetap berisi URL sah saja.
    gallery: z.array(OptionalStoredUrl).max(30).optional(),
  }),
]);

export const OpenTripSchema = z.object({
  nama: z.string().min(1, "Nama paket harus diisi").max(160),
  namaEn: z.string().max(160).nullable().optional(),
  slug: z.string().max(180).optional(),
  deskripsi: z.string().min(1, "Deskripsi harus diisi").max(20000),
  deskripsiEn: z.string().max(20000).nullable().optional(),
  harga: z.coerce.number().positive("Harga harus lebih dari 0").max(1_000_000_000_000),
  durasi: z.coerce.number().int().positive("Durasi harus lebih dari 0").max(365),
  destinasiId: z.coerce.number().int().positive(),
  foto: FotoSchema.nullable().optional(),
  itinerary: ItineraryList.nullable().optional(),
  fasilitas: TextList.nullable().optional(),
  termasuk: TextList.nullable().optional(),
  tidakTermasuk: TextList.nullable().optional(),
  informasiPenting: TextList.nullable().optional(),
  kebijakanPembatalan: TextList.nullable().optional(),
  fileDokumen: FileDokumenList.nullable().optional(),
  opsiPenjemputan: TextList.nullable().optional(),
  // Versi Inggris; dikosongkan berarti jatuh ke versi Indonesia saat dirender.
  itineraryEn: ItineraryList.nullable().optional(),
  fasilitasEn: TextList.nullable().optional(),
  termasukEn: TextList.nullable().optional(),
  tidakTermasukEn: TextList.nullable().optional(),
  informasiPentingEn: TextList.nullable().optional(),
  kebijakanPembatalanEn: TextList.nullable().optional(),
  opsiPenjemputanEn: TextList.nullable().optional(),
  // Kosong dari form dikirim sebagai "" — diubah jadi null, bukan Invalid Date.
  tanggalKeberangkatan: z
    .union([z.string(), z.date(), z.null()])
    .optional()
    .transform((v) => {
      if (v === null || v === undefined || v === "") return null;
      const d = v instanceof Date ? v : new Date(v);
      return Number.isNaN(d.getTime()) ? null : d;
    }),
  kuota: z.coerce.number().int().min(0).max(10000).nullable().optional(),
  kursiTerisi: z.coerce.number().int().min(0).max(10000).optional().default(0),
  akomodasi: AkomodasiList.nullable().optional(),
  akomodasiEn: AkomodasiList.nullable().optional(),
  penerbangan: PenerbanganList.nullable().optional(),
  penerbanganEn: PenerbanganList.nullable().optional(),
  status: z.enum(["draft", "published", "archived"]).optional().default("draft"),
  label: z.string().max(80).nullable().optional(),
});

export const OpenTripPatchSchema = z.object({
  status: z.enum(["draft", "published", "archived"]).optional(),
  label: z.string().max(80).nullable().optional(),
});

export const DestinasiSchema = z.object({
  nama: z.string().min(1, "Nama destinasi harus diisi").max(160),
  namaEn: z.string().max(160).nullable().optional(),
  slug: z.string().max(180).optional(),
  negara: z.string().min(1, "Negara harus diisi").max(120),
  deskripsi: z.string().min(1, "Deskripsi harus diisi").max(20000),
  deskripsiEn: z.string().max(20000).nullable().optional(),
  foto: z.string().min(1, "Foto harus diisi").max(500),
  bahasa: z.string().max(200).optional().nullable(),
  matauang: z.string().max(80).optional().nullable(),
  waktuTerbaik: z.string().max(500).optional().nullable(),
  infoVisa: z.string().max(20000).optional().nullable(),
});

export const BookingStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
});

// Status permintaan Private Trip. Daftar nilainya ada di
// `lib/private-trip-status.ts` agar bisa dipakai komponen client tanpa menarik
// `next/server` ke bundle browser; di sini hanya validasi input API-nya.
export const PrivateTripStatusUpdateSchema = z.object({
  id: z.coerce.number().int().positive(),
  status: z.enum(PRIVATE_TRIP_STATUSES),
});

// === Blog Schemas ===
export const BlogCategorySchema = z.object({
  nama: z.string().min(1).max(100),
  namaEn: z.string().max(100).optional().nullable(),
  slug: z.string().min(1).max(100).optional(),
});

export const BlogPostSchema = z.object({
  title: z.string().min(1).max(255),
  titleEn: z.string().max(255).optional().nullable(),
  slug: z.string().min(1).max(255).optional(),
  excerpt: z.string().min(1).max(1000),
  excerptEn: z.string().max(1000).optional().nullable(),
  content: z.string().min(1),
  contentEn: z.string().optional().nullable(),
  thumbnail: z.string().min(1),
  categoryId: z.number().int().positive(),
  tags: z.array(z.string().max(50)).max(20).default([]),
  status: z.enum(["draft", "published"]).default("draft"),
  metaTitle: z.string().max(160).optional().nullable(),
  metaDescription: z.string().max(320).optional().nullable(),
  ogImage: z.string().optional().nullable(),
});

const allowedUploadTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function validateUploadedFile(file: File, maxSize = 10 * 1024 * 1024) {
  if (file.size > maxSize) {
    return { ok: false as const, error: "Ukuran file terlalu besar." };
  }

  const extension = allowedUploadTypes[file.type];
  if (!extension) {
    return { ok: false as const, error: "Format file tidak diizinkan." };
  }

  return { ok: true as const, extension };
}

// Verifikasi "magic bytes" agar file.type (yang dikirim client dan bisa
// dipalsukan) tidak menjadi satu-satunya penjaga. Mengembalikan true jika
// konten nyata cocok dengan salah satu tipe yang diklaim.
export function matchesFileSignature(bytes: Uint8Array, mime: string) {
  const starts = (sig: number[]) =>
    sig.every((b, i) => bytes[i] === b);

  switch (mime) {
    case "image/jpeg":
    case "image/jpg":
      return starts([0xff, 0xd8, 0xff]);
    case "image/png":
      return starts([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case "image/webp":
      // "RIFF"...."WEBP"
      return (
        starts([0x52, 0x49, 0x46, 0x46]) &&
        bytes[8] === 0x57 &&
        bytes[9] === 0x45 &&
        bytes[10] === 0x42 &&
        bytes[11] === 0x50
      );
    case "application/pdf":
      return starts([0x25, 0x50, 0x44, 0x46, 0x2d]); // %PDF-
    case "application/msword":
      return starts([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]); // OLE2
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return starts([0x50, 0x4b, 0x03, 0x04]) || starts([0x50, 0x4b, 0x05, 0x06]); // ZIP
    case "image/x-icon":
    case "image/vnd.microsoft.icon":
    case "image/ico":
      // ICONDIR: reserved(0,0) + type=1 (ICO; CUR=2 ditolak) + count>=1.
      return (
        starts([0x00, 0x00, 0x01, 0x00]) &&
        (((bytes[4] ?? 0) | ((bytes[5] ?? 0) << 8)) >= 1)
      );
    default:
      return false;
  }
}

// In-memory rate limiter with cleanup to prevent memory leaks
const rateLimitMap = new Map<
  string,
  { count: number; lastReset: number; windowMs: number }
>();

// Clean up expired records every 5 minutes, menghormati window tiap record
// (sebelumnya di-hardcode 60s sehingga record login window 5 menit terhapus
// prematur dan rate limit-nya praktis tidak berlaku).
setInterval(
  () => {
    const now = Date.now();
    for (const [ip, record] of rateLimitMap.entries()) {
      if (now - record.lastReset > record.windowMs) {
        rateLimitMap.delete(ip);
      }
    }
  },
  5 * 60 * 1000,
);

export function rateLimit(ip: string, limit: number, windowMs: number) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.lastReset > windowMs) {
    rateLimitMap.set(ip, { count: 1, lastReset: now, windowMs });
    return { success: true };
  }

  if (record.count >= limit) {
    return { success: false };
  }

  record.count += 1;
  return { success: true };
}

// Ambil IP klien secara andal di belakang Cloudflare + Nginx. cf-connecting-ip
// diset oleh Cloudflare dan tidak bisa dipalsukan end-user; X-Forwarded-For
// dipakai sebagai fallback dengan hanya mengambil hop pertama (client asli).
export function getClientIpFromHeaders(h: Headers) {
  const cf = h.get("cf-connecting-ip");
  if (cf) return cf.trim();

  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();

  return h.get("x-real-ip")?.trim() || "127.0.0.1";
}

export function getClientIp(req: Request) {
  return getClientIpFromHeaders(req.headers);
}

export function checkCSRF(req: Request) {
  const host = req.headers.get("host");
  const origin = req.headers.get("origin");

  if (origin) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }

  // Tidak ada Origin: terima hanya jika Referer sehost, atau jika browser
  // menandai request sebagai same-origin/none via Sec-Fetch-Site. Menolak
  // saat semua sinyal tak ada menutup celah "Origin absen = lolos".
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).host === host;
    } catch {
      return false;
    }
  }

  const secFetchSite = req.headers.get("sec-fetch-site");
  if (secFetchSite) {
    return secFetchSite === "same-origin" || secFetchSite === "none";
  }

  return false;
}

/**
 * Apakah request WAJIB ditolak karena gagal CSRF — varian ramah klien
 * non-browser (mis. Hermes Agent server-to-server di production).
 *
 * Serangan CSRF hanya bisa terjadi lewat BROWSER korban, dan browser SELALU
 * menyertakan `Sec-Fetch-Site` (browser modern) atau `Origin` (pada request
 * non-GET) — keduanya header terlarang yang tidak bisa dihapus/dipalsukan oleh
 * JavaScript penyerang. Maka:
 *   - Ada sinyal browser + lintas-origin  → tolak (inilah serangan CSRF).
 *   - Ada sinyal browser + same-origin     → lolos.
 *   - TANPA sinyal browser (klien server)  → lolos di sini; bukan vektor CSRF.
 *     Otentikasi/otorisasi tetap menjaganya.
 *
 * `checkCSRF` yang lebih ketat sengaja DIPERTAHANKAN untuk route publik
 * (form booking/inquiry) yang pemanggilnya pasti browser.
 */
export function csrfBlocked(req: Request): boolean {
  const looksLikeBrowser =
    req.headers.get("sec-fetch-site") !== null || req.headers.get("origin") !== null;
  return looksLikeBrowser && !checkCSRF(req);
}

const DANGEROUS_KEYS = new Set(["__proto__", "constructor", "prototype"]);

// Validasi payload CMS berbentuk JSON bebas (home/about/privacy/dst) yang
// disimpan apa adanya. Bukan skema per-field, tetapi menegakkan batas aman:
// harus object biasa, tidak terlalu dalam/besar, dan bebas key prototype
// pollution. Mengembalikan objek bersih siap-simpan atau error.
export function sanitizeSettingsPayload(
  input: unknown,
  { maxBytes = 512 * 1024, maxDepth = 12 } = {},
) {
  if (
    typeof input !== "object" ||
    input === null ||
    Array.isArray(input)
  ) {
    return { ok: false as const, error: "Payload harus berupa objek." };
  }

  const clean = (value: unknown, depth: number): unknown => {
    if (depth > maxDepth) {
      throw new Error("Struktur data terlalu dalam.");
    }
    if (Array.isArray(value)) {
      return value.map((item) => clean(item, depth + 1));
    }
    if (value && typeof value === "object") {
      const result: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        if (DANGEROUS_KEYS.has(key)) continue;
        result[key] = clean(val, depth + 1);
      }
      return result;
    }
    return value;
  };

  let sanitized: unknown;
  try {
    sanitized = clean(input, 0);
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "Payload tidak valid.",
    };
  }

  const serialized = JSON.stringify(sanitized);
  if (serialized.length > maxBytes) {
    return { ok: false as const, error: "Payload terlalu besar." };
  }

  return { ok: true as const, data: sanitized, serialized };
}

// Respons error 500 yang aman: detail lengkap dicatat di server (untuk debug),
// tetapi client hanya menerima pesan generik. Mencegah kebocoran internal
// (pesan Prisma/DB, path, stack) ke penyerang lewat body respons API.
//
// Selain console.error, error kini juga dicatat ke AuditLog lewat error-log.ts
// (dynamic import RELATIF — WAJIB: lib/security.test.ts memuat modul ini tanpa
// vitest config, tanpa alias @/ dan tanpa DATABASE_URL; import statis ke Prisma
// akan mematikan test). Fire-and-forget via after() agar tak menunda respons;
// after() melempar di luar request scope (test) → fallback void.
export function serverError(
  context: string,
  error: unknown,
  meta?: { req?: Request | null; code?: string; detail?: Record<string, unknown> },
) {
  console.error(`[${context}]`, error);
  const p = import("./error-log")
    .then((m) => {
      m.markReported(error);
      return m.logErrorEvent(
        "error.server",
        {
          route: context,
          status: 500,
          code: meta?.code ?? "unhandled",
          req: meta?.req ?? null,
          detail: meta?.detail,
        },
        error,
      );
    })
    .catch(() => {});
  try {
    after(p);
  } catch {
    void p;
  }
  return NextResponse.json(
    { error: "Terjadi kesalahan pada server." },
    { status: 500 },
  );
}
