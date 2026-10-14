/**
 * Siapa boleh melihat key apa dari GET /api/settings.
 *
 * - Tanpa login (publik): HANYA allowlist di bawah. Dulu publik menerima semua
 *   key kecuali pola "sensitif" (denylist) — key baru yang namanya tak cocok pola
 *   ikut bocor (mis. `roles_config`, struktur izin admin).
 * - Admin login tanpa `settings_manage`: semua kecuali key sensitif.
 * - `settings_manage`: semua.
 *
 * Konten CMS halaman publik dibaca server component langsung dari DB, jadi
 * tidak bergantung pada endpoint ini.
 */
export const PUBLIC_SETTING_KEYS: ReadonlySet<string> = new Set([
  "site_name", // login admin & halaman publik (sebelum login)
  "site_logo",
  "site_favicon",
  "whatsapp_number", // form Request Private Trip
  "contact_whatsapp",
  "whatsapp_message",
])

export function isSensitiveSettingKey(key: string): boolean {
  // `invoice_settings` memuat identitas legal, NPWP, dan gambar tanda tangan.
  return /payment|secret|token|password|credential/i.test(key) || key === "invoice_settings"
}

export function visibleSettings(
  rows: ReadonlyArray<{ key: string; value: string }>,
  viewer: { authenticated: boolean; canSeeSensitive: boolean },
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const { key, value } of rows) {
    if (!viewer.authenticated) {
      if (!PUBLIC_SETTING_KEYS.has(key)) continue
    } else if (!viewer.canSeeSensitive && isSensitiveSettingKey(key)) {
      continue
    }
    out[key] = value
  }
  return out
}
