/**
 * Vokabuler & logika permission yang MURNI DATA — tanpa prisma / next-auth,
 * sehingga aman diimpor komponen client (sidebar admin, halaman Roles).
 *
 * Bagian yang menyentuh DB & sesi ada di lib/rbac.ts, yang me-re-export
 * seluruh isi modul ini agar route API cukup mengimpor satu tempat.
 */

/** Role yang tidak boleh kehilangan akses & tidak boleh dihapus (project/review.md). */
export const SUPER_ADMIN_ROLE = "super_admin";

/**
 * Permission kanonik. Dipakai sebagai whitelist saat menyimpan roles_config,
 * jadi id baru WAJIB didaftarkan di sini agar bisa disimpan.
 * Id `inquiry_*` sengaja dipertahankan meski menunya kini bernama "Permintaan
 * Private Trip" — mengganti id akan mereset permission yang sudah tersimpan.
 */
export const PERMISSION_IDS = [
  "paket_view",
  "paket_create",
  "paket_edit",
  "paket_delete",
  "destinasi_view",
  "destinasi_create",
  "destinasi_edit",
  "destinasi_delete",
  "booking_view",
  "booking_create",
  "booking_edit",
  "booking_delete",
  "inquiry_view",
  "inquiry_edit",
  "inquiry_delete",
  "invoice_view",
  "invoice_create",
  "invoice_edit",
  "invoice_delete",
  "itinerary_view",
  "itinerary_create",
  "itinerary_edit",
  "itinerary_delete",
  "blog_view",
  "blog_create",
  "blog_edit",
  "blog_delete",
  "users_manage",
  "roles_manage",
  "audit_view",
  "settings_manage",
  "profile_manage",
  "cms_manage",
] as const;

export type PermissionId = (typeof PERMISSION_IDS)[number];

/**
 * Penanda bahwa sebuah role sudah disimpan dengan vokabuler menu Pengaturan
 * yang terpisah (`roles_manage`, `audit_view`, `profile_manage`). Disisipkan
 * otomatis saat role disimpan; bukan izin yang dicek gerbang mana pun.
 */
export const RBAC_SETTINGS_V2 = "rbac_settings_v2";

/**
 * Role lama (disimpan sebelum menu Pengaturan dipecah) diberi izin setara
 * agar aksesnya tidak tiba-tiba hilang: dulu `users_manage` membuka Kelola
 * User + Audit Log + Roles, dan Akun & Profil terbuka untuk semua. Role yang
 * sudah membawa penanda v2 dibiarkan apa adanya — centang admin yang berlaku.
 */
export function upgradeLegacyPermissions(permissions: string[]): string[] {
  if (permissions.includes("all") || permissions.includes(RBAC_SETTINGS_V2)) return permissions;
  const out = new Set(permissions);
  out.add("profile_manage");
  if (out.has("users_manage")) {
    out.add("audit_view");
    out.add("roles_manage");
  }
  return [...out];
}

export type RoleDef = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
};

/**
 * Grant bawaan. Dipilih agar akses efektif TIDAK berubah dibanding perilaku
 * lama: `blog_*` tidak diberikan ke admin/editor (blog dulu super-admin-only),
 * `users_manage`/`roles_manage`/`audit_view`/`settings_manage` hanya milik
 * super_admin lewat 'all'; `profile_manage` (Akun & Profil) untuk semua role.
 */
export const DEFAULT_ROLES: RoleDef[] = [
  {
    id: "super_admin",
    name: "Super Admin",
    description: "Akses penuh ke semua fitur sistem",
    permissions: ["all"],
  },
  {
    id: "admin",
    name: "Administrator",
    description: "Mengelola pesanan, inquiry, dan konten wisata",
    permissions: [
      "paket_view",
      "paket_create",
      "paket_edit",
      "paket_delete",
      "destinasi_view",
      "destinasi_create",
      "destinasi_edit",
      "destinasi_delete",
      "booking_view",
      "booking_create",
      "booking_edit",
      "booking_delete",
      "inquiry_view",
      "inquiry_edit",
      "inquiry_delete",
      "invoice_view",
      "invoice_create",
      "invoice_edit",
      "invoice_delete",
      "itinerary_view",
      "itinerary_create",
      "itinerary_edit",
      "itinerary_delete",
      "cms_manage",
      "profile_manage",
      RBAC_SETTINGS_V2,
    ],
  },
  {
    id: "editor",
    name: "Editor",
    description: "Hanya dapat mengelola paket dan destinasi",
    permissions: [
      "paket_view",
      "paket_create",
      "paket_edit",
      "destinasi_view",
      "destinasi_create",
      "destinasi_edit",
      "cms_manage",
      "profile_manage",
      RBAC_SETTINGS_V2,
    ],
  },
];

/** Cukup untuk memutuskan izin; Actor di lib/rbac.ts adalah bentuk lengkapnya. */
export type PermissionSubject = {
  role: string;
  permissions: string[];
};

/** Semantik OR: cukup punya salah satu permission yang diminta. */
export function hasPermission(
  subject: PermissionSubject | null | undefined,
  ...required: string[]
): boolean {
  if (!subject) return false;
  if (subject.role === SUPER_ADMIN_ROLE) return true;
  if (subject.permissions.includes("all")) return true;
  if (required.length === 0) return true; // cukup terautentikasi
  return required.some((p) => subject.permissions.includes(p));
}
