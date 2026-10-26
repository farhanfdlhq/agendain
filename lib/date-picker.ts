/**
 * Logika murni kalender untuk components/ui/date-picker.tsx.
 *
 * Nilai tanggal selalu string "YYYY-MM-DD" (sama dengan <input type="date">),
 * diolah sebagai tanggal LOKAL tanpa jam supaya tidak bergeser sehari karena
 * zona waktu (new Date("2026-10-26") dibaca UTC).
 */
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

export function parseIsoDate(value: string | null | undefined): Date | null {
  const m = value ? ISO_DATE.exec(value) : null
  if (!m) return null
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const date = new Date(y, mo - 1, d)
  // Tolak tanggal yang "meluap" (mis. 2026-02-30 → 2 Maret).
  return date.getFullYear() === y && date.getMonth() === mo - 1 && date.getDate() === d ? date : null
}

const pad = (n: number) => String(n).padStart(2, "0")

export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)

/** Tanggal 1 bulan yang digeser `months` dari bulan `date`. */
export const startOfMonth = (date: Date, months = 0) =>
  new Date(date.getFullYear(), date.getMonth() + months, 1)

/** 42 hari (6 minggu) untuk tampilan bulan `view`, minggu dimulai Senin. */
export function monthGrid(view: Date): Date[] {
  const first = startOfMonth(view)
  const offset = (first.getDay() + 6) % 7 // Senin = 0 … Minggu = 6
  const start = addDays(first, -offset)
  return Array.from({ length: 42 }, (_, i) => addDays(start, i))
}

/** Di luar batas min/max (string ISO, dibandingkan leksikografis). */
export function isOutOfRange(iso: string, min?: string, max?: string): boolean {
  return (!!min && iso < min) || (!!max && iso > max)
}
