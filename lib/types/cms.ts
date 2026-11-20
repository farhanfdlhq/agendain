/**
 * Isi form CMS halaman (Tentang, Blog, Open Trip, Kebijakan Privasi, Footer, …):
 * field teks datar yang dibaca/ditulis dengan nama dinamis, mis.
 * `data[\`${field}_en\`]`, `data[weightField]`, `data[\`stat${n}Value\`]`.
 */
export type CmsFields = Record<string, string>

/** Satu baris daftar CMS (testimoni, FAQ, galeri, langkah booking, …). */
export type CmsItem = Record<string, string>

/**
 * Isi form CMS yang juga memuat daftar & saklar (Beranda, Private Trip).
 * Bobot/ukuran huruf bisa tersimpan sebagai angka; saklar sebagai boolean.
 */
export type CmsValue = string | number | boolean | CmsItem[] | CmsPackageItem[] | null | undefined
export type CmsData = Record<string, CmsValue>

/** Kartu paket Private Trip: teks + daftar (`chips`, `features`). */
export type CmsPackageItem = Record<string, string | string[]>

/** Nilai field sebagai teks; kosong/daftar/saklar → "". */
export function cmsText(data: Record<string, unknown> | null | undefined, key: string): string {
  const v = data?.[key]
  return typeof v === "string" ? v : typeof v === "number" ? String(v) : ""
}

/** Nilai field sebagai daftar; selain array → []. Bentuk baris ditentukan pemanggil. */
export function cmsList<T extends CmsItem | CmsPackageItem = CmsItem>(data: Record<string, unknown> | null | undefined, key: string): T[] {
  const v = data?.[key]
  return Array.isArray(v) ? (v as T[]) : []
}

/** Baris repeater CMS yang sudah dilokalkan (teks, gambar, bobot huruf sebagai teks). */
export type CmsRow = Record<string, string | undefined>

/** Teks field ber-bahasa: `${key}_en` bila EN dan terisi, selain itu versi Indonesia. */
export function cmsLocalText(data: Record<string, unknown> | null | undefined, key: string, en: boolean): string {
  const id = cmsText(data, key)
  if (!en) return id
  const v = cmsText(data, `${key}_en`)
  return v.trim() ? v : id
}
