/**
 * Baris "Terakhir Diperbarui" di dokumen Kebijakan Privasi — logika murni.
 *
 * Baris itu bagian dari isi dokumen (rich text CMS), dulu diketik manual
 * ("Agustus 2026") dan mudah lupa diganti. Kini API simpan menulis ulang
 * bulan-tahunnya otomatis setiap kali ISI dokumen berubah (ID atau EN).
 * Menyimpan ulang tanpa mengubah isi, atau hanya mengganti hero, tidak
 * menggeser tanggal.
 */

type Lang = "id" | "en"

const LABEL: Record<Lang, string> = { id: "Terakhir Diperbarui", en: "Last Updated" }

// Label (ID/EN) + titik dua + tanggal, dengan/atau tanpa <strong>.
const DATE_LINE = /((?:Terakhir\s+Diperbarui|Last\s+Updated)\s*:(?:\s|&nbsp;)*)(<strong>)?([^<]*)(<\/strong>)?/i

/** "November 2026" / "November 2026" (en) menurut waktu Jakarta. */
export function formatPolicyMonth(date: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === "en" ? "en-US" : "id-ID", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date)
}

/** Isi dokumen tanpa tanggalnya, untuk membandingkan "apakah isinya berubah". */
export function withoutPolicyDate(html: string | null | undefined): string {
  return (html ?? "").replace(DATE_LINE, "$1").trim()
}

/** Isi dokumen (ID atau EN) berbeda dari yang tersimpan, di luar baris tanggal? */
export function policyContentChanged(
  stored: Record<string, unknown> | null | undefined,
  incoming: Record<string, unknown>,
): boolean {
  return (["privacyContent", "privacyContent_en"] as const).some(
    (k) => withoutPolicyDate(stored?.[k] as string) !== withoutPolicyDate(incoming[k] as string),
  )
}

/**
 * Tulis bulan-tahun ke baris "Terakhir Diperbarui". Baris yang sudah ada
 * diganti tanggalnya saja; bila tidak ada, disisipkan setelah judul pertama
 * (atau di paling atas). Dokumen kosong dibiarkan kosong.
 */
export function stampPolicyDate(html: string | null | undefined, date: Date, lang: Lang): string {
  const src = html ?? ""
  if (!src.trim()) return src
  const month = formatPolicyMonth(date, lang)
  if (DATE_LINE.test(src)) {
    return src.replace(DATE_LINE, (_m, label: string) => `${label}<strong>${month}</strong>`)
  }
  const line = `<p>${LABEL[lang]}: <strong>${month}</strong></p>`
  const heading = /<\/h[12]>/i.exec(src)
  if (!heading) return line + src
  const at = heading.index + heading[0].length
  return src.slice(0, at) + line + src.slice(at)
}

/** Teks tanggal yang sedang tertulis di baris "Terakhir Diperbarui", bila ada. */
export function readPolicyDate(html: string | null | undefined): string | null {
  const m = DATE_LINE.exec(html ?? "")
  const text = m?.[3]?.trim()
  return text ? text : null
}

/**
 * Isi tidak berubah: pakai lagi tanggal yang tersimpan. Editor yang dibuka
 * sebelum simpan terakhir (atau tab lain) masih memuat tanggal lama; tanpa
 * ini, menyimpan dari sana memundurkan tanggal.
 */
export function keepPolicyDate(incoming: string | null | undefined, stored: string | null | undefined): string {
  const src = incoming ?? ""
  const kept = readPolicyDate(stored)
  if (!kept || !DATE_LINE.test(src)) return src
  return src.replace(DATE_LINE, (_m, label: string) => `${label}<strong>${kept}</strong>`)
}
