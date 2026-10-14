/**
 * Nama file unggahan yang aman: ekstensi SELALU diturunkan dari tipe konten
 * yang sudah terverifikasi (magic bytes / hasil konversi sharp), bukan dari
 * nama asli kiriman klien. Mencegah file berisi PDF/PNG valid tersimpan
 * sebagai `.php`/`.html` — berbahaya bila server web pernah salah konfigurasi.
 * Titik di nama dasar diganti "-" (tidak ada ekstensi ganda seperti
 * `shell.php.pdf`).
 */
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/x-icon": "ico",
  "image/vnd.microsoft.icon": "ico",
  "image/ico": "ico",
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
}

export function extensionForType(mime: string): string | null {
  return EXT_BY_TYPE[mime] ?? null
}

export function safeUploadName(originalName: string, mime: string): string {
  const ext = extensionForType(mime)
  if (!ext) throw new Error(`Tipe file tidak dikenal: ${mime}`)
  const lastDot = originalName.lastIndexOf(".")
  const stem = lastDot > 0 ? originalName.slice(0, lastDot) : originalName
  const base = stem
    .replace(/\./g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80)
  return `${base || "file"}.${ext}`
}
