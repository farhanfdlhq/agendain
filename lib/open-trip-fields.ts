import type { z } from "zod";
import type { OpenTripSchema } from "@/lib/security";

type OpenTripInput = z.infer<typeof OpenTripSchema>;

/**
 * Peta payload paket (sudah lolos `OpenTripSchema`) ke kolom Prisma.
 *
 * Dipakai bersama oleh POST /api/open-trip dan PUT /api/open-trip/[slug].
 * Sebelumnya kedua route menulis daftar kolomnya sendiri-sendiri dan sudah
 * melenceng: `informasiPenting`, `kebijakanPembatalan`, `fileDokumen`, dan
 * `opsiPenjemputan` dikirim form admin tapi tidak pernah ikut disimpan. Satu
 * sumber seperti ini membuat kolom baru tidak bisa lagi tertinggal di salah
 * satu route.
 */
export function toOpenTripData(data: OpenTripInput, mode: "create" | "update") {
  // Kolom `Json?` di Prisma tidak menerima `null` biasa (butuh `Prisma.DbNull`),
  // jadi null diubah jadi undefined = kolomnya tidak disentuh.
  const j = (v: unknown) => (v === null ? undefined : v);
  // Pada create kolom Json wajib harus punya isi; pada update biarkan undefined
  // supaya nilai lamanya tidak tertimpa kosong.
  const req = (v: unknown, fallback: unknown) =>
    mode === "create" ? (v ?? fallback) : j(v);

  return {
    nama: data.nama,
    namaEn: data.namaEn || null,
    deskripsi: data.deskripsi,
    deskripsiEn: data.deskripsiEn || null,
    harga: Number(data.harga),
    durasi: Number(data.durasi),
    destinasiId: Number(data.destinasiId),
    foto: req(data.foto, {}),
    itinerary: req(data.itinerary, []),
    fasilitas: req(data.fasilitas, []),
    termasuk: req(data.termasuk, []),
    tidakTermasuk: req(data.tidakTermasuk, []),
    informasiPenting: j(data.informasiPenting),
    kebijakanPembatalan: j(data.kebijakanPembatalan),
    fileDokumen: j(data.fileDokumen),
    opsiPenjemputan: j(data.opsiPenjemputan),
    itineraryEn: j(data.itineraryEn),
    fasilitasEn: j(data.fasilitasEn),
    termasukEn: j(data.termasukEn),
    tidakTermasukEn: j(data.tidakTermasukEn),
    informasiPentingEn: j(data.informasiPentingEn),
    kebijakanPembatalanEn: j(data.kebijakanPembatalanEn),
    opsiPenjemputanEn: j(data.opsiPenjemputanEn),
    status: data.status,
    label: data.label || null,
  };
}

/** Slug dari nama paket bila admin tidak mengisinya sendiri. */
export function slugifyNama(nama: string) {
  return nama
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
