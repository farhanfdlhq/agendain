/**
 * Penggabungan data dua bahasa.
 *
 * Latar: dulu setiap repeater CMS (whyItems, testiItems, dst.) disimpan sebagai
 * DUA array penuh — `whyItems` dan `whyItems_en` — dan renderernya mengambil
 * salah satu secara utuh. Akibatnya field yang sebenarnya TIDAK punya bahasa
 * (gambar, ikon, bobot huruf) ikut terduplikasi: mengganti gambar di tab ID
 * tidak mengubah salinan EN-nya, sehingga versi Inggris membeku pada gambar
 * lama. Jumlah baris pun bisa berbeda antar bahasa.
 *
 * Sekarang satu baris memuat kedua bahasa: `{ image, title, title_en }`. Hanya
 * field teks yang punya sibling `_en`.
 *
 * ATURAN KRITIS: seluruh fungsi di sini hanya boleh menyentuh field yang
 * disebut di `textFields`. Field lain disalin apa adanya. Begitu field
 * non-teks (image/photo/icon/*Weight) ikut di-fallback per bahasa, bug gambar
 * beku itu kembali.
 *
 * Modul ini sengaja bebas dari `'use client'` dan `next/headers` supaya bisa
 * dipakai Server Component maupun Client Component.
 */

const hasValue = (v: unknown): boolean => {
  if (v == null) return false
  if (typeof v === 'string') return v.trim() !== ''
  if (Array.isArray(v)) return v.length > 0
  return true
}

/**
 * Gabungkan teks versi EN ke dalam baris basis.
 *
 * `base` selalu jadi sumber STRUKTUR (jumlah baris + seluruh field
 * bahasa-netral). `en` hanya dipanen teksnya per indeks, jadi jumlah baris
 * tidak mungkin berbeda antar bahasa.
 *
 * Urutan prioritas tiap field teks: `row[field_en]` → `en[i][field]` → `row[field]`.
 */
export function localizeRows(
  base: any[],
  en: any[] | null | undefined,
  textFields: readonly string[],
  locale: string,
): any[] {
  if (locale !== 'en') return base
  const fallback = Array.isArray(en) ? en : []
  return base.map((row, i) => {
    if (!row || typeof row !== 'object') return row
    const out: Record<string, any> = { ...row }
    for (const f of textFields) {
      const own = row[`${f}_en`]
      if (hasValue(own)) {
        out[f] = own
        continue
      }
      const legacy = fallback[i]?.[f]
      if (hasValue(legacy)) out[f] = legacy
      // else: biarkan nilai ID-nya (fallback terakhir)
    }
    return out
  })
}

/**
 * Baca satu repeater dari objek setting CMS dan lokalkan teksnya.
 *
 * Mengembalikan `null` bila belum ada data kustom, supaya pemanggil tetap
 * memakai data bawaannya sendiri (perilaku lama: `Array.isArray(x) ? x : default`).
 *
 * Array `${key}_en` yang masih ada di DB (data lama, sebelum admin menyimpan
 * ulang) tetap dipakai sebagai sumber teks — jadi tidak ada teks Inggris yang
 * hilang saat rilis.
 */
export function localizeRepeater(
  settings: Record<string, any> | null | undefined,
  key: string,
  locale: string,
  textFields: readonly string[],
): any[] | null {
  const base = settings?.[key]
  if (!Array.isArray(base)) return null
  return localizeRows(base, settings?.[`${key}_en`], textFields, locale)
}

/**
 * Lipat array `${key}_en` warisan ke dalam array utamanya, lalu buang.
 *
 * Dipanggil sekali saat halaman CMS memuat datanya. Sesudah admin menyimpan,
 * bentuk barunya ikut tersimpan — migrasi berjalan sendiri tanpa skrip dan
 * tanpa perintah DB. Objek `data` dimutasi di tempat (objek hasil parse JSON
 * yang baru diambil, seperti blok perbaikan data warisan yang sudah ada).
 */
export function foldLegacyRepeaters(
  data: Record<string, any> | null | undefined,
  map: Record<string, readonly string[]>,
): void {
  if (!data) return

  for (const [key, textFields] of Object.entries(map)) {
    const legacyKey = `${key}_en`
    const legacy = data[legacyKey]
    if (!Array.isArray(legacy)) continue

    const base = data[key]
    if (Array.isArray(base)) {
      base.forEach((row, i) => {
        if (!row || typeof row !== 'object') return
        const old = legacy[i]
        if (!old || typeof old !== 'object') return
        for (const f of textFields) {
          if (!hasValue(row[`${f}_en`]) && hasValue(old[f])) row[`${f}_en`] = old[f]
        }
      })
    } else if (legacy.length > 0) {
      // Hanya versi EN yang pernah diisi. Pakai baris EN sebagai basis supaya
      // isinya tidak hilang saat legacyKey dibuang.
      data[key] = legacy.map((row: any) => {
        if (!row || typeof row !== 'object') return row
        const out: Record<string, any> = { ...row }
        for (const f of textFields) if (hasValue(row[f])) out[`${f}_en`] = row[f]
        return out
      })
    }

    delete data[legacyKey]
  }
}

/**
 * Ambil satu field dari baris DB yang punya kolom EN bersuffix `En`
 * (mis. `nama` / `namaEn`). Kosong atau null → jatuh ke versi Indonesia.
 */
export function pickLocalized<T = any>(
  row: Record<string, any> | null | undefined,
  field: string,
  locale: string,
): T {
  if (!row) return undefined as T
  if (locale === 'en') {
    const en = row[`${field}En`]
    if (hasValue(en)) return en as T
  }
  return row[field] as T
}

/** Peta field teks tiap repeater. Satu sumber untuk CMS dan renderer. */
export const HOME_REPEATERS = {
  whyItems: ['title', 'desc'],
  accItems: ['title', 'body'],
  testiItems: ['name', 'text'],
  faqItems: ['q', 'a'],
} as const

export const PRIVATE_TRIP_REPEATERS = {
  whyItems: ['title', 'desc'],
  workflowSteps: ['title', 'desc'],
} as const
