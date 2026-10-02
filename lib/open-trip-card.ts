/**
 * Bentuk data kartu open trip — SATU sumber untuk beranda (Destinasi Favorit)
 * dan halaman /open-trip, supaya kedua kartu selalu identik & sinkron dengan DB.
 * Tanpa data dummy: yang tidak ada di DB tidak ditampilkan.
 */
export type OpenTripCardData = {
  id: number
  slug: string
  nama: string
  namaEn?: string | null
  harga: number
  durasi: number
  destinasi: { nama: string; namaEn?: string | null }
  fotoThumbnail: string
  label?: string | null
  /** ISO string (aman diserialisasi ke client component). */
  tanggalKeberangkatan?: string | null
  kuota?: number | null
  kursiTerisi?: number
}

type FotoEntry = string | { full?: string; medium?: string; thumb?: string } | null | undefined

/** Bentuk minimal baris prisma.openTrip (+ include destinasi) yang dibaca kartu. */
type OpenTripRow = {
  id: number
  slug: string
  nama: string
  namaEn?: string | null
  harga: number | string | { toString(): string }
  durasi: number
  destinasi?: { nama: string; namaEn?: string | null } | null
  foto: unknown
  label?: string | null
  tanggalKeberangkatan?: Date | string | null
  kuota?: number | null
  kursiTerisi?: number | null
}

export function toOpenTripCard(p: OpenTripRow): OpenTripCardData {
  const foto = p.foto as FotoEntry | FotoEntry[]
  const firstFoto: FotoEntry = Array.isArray(foto) ? foto[0] : foto
  return {
    id: p.id,
    slug: p.slug,
    nama: p.nama,
    namaEn: p.namaEn ?? null,
    harga: Number(p.harga.toString()),
    durasi: p.durasi,
    destinasi: { nama: p.destinasi?.nama ?? '', namaEn: p.destinasi?.namaEn ?? null },
    fotoThumbnail:
      typeof firstFoto === 'string'
        ? firstFoto
        : firstFoto?.medium || firstFoto?.thumb || firstFoto?.full || '/placeholder.webp',
    label: p.label || null,
    tanggalKeberangkatan: p.tanggalKeberangkatan ? new Date(p.tanggalKeberangkatan).toISOString() : null,
    kuota: p.kuota ?? null,
    kursiTerisi: p.kursiTerisi ?? 0,
  }
}

export const PUBLISHED_OPEN_TRIP = { status: { in: ['published', 'publish'] } }
