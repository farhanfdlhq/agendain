// Sumber tunggal daftar status permintaan Private Trip.
//
// Sengaja dipisah dari `lib/security.ts`: file itu mengimpor `next/server`
// (NextResponse/after), sehingga bila dipakai dari komponen client seluruh
// modul server ikut terbawa ke bundle browser. Modul ini murni data + fungsi
// pure, jadi aman dipakai di kedua sisi.

export const PRIVATE_TRIP_STATUSES = [
  "new",
  "contacted",
  "deal",
  "cancelled",
] as const;

export type PrivateTripStatus = (typeof PRIVATE_TRIP_STATUSES)[number];

export const PRIVATE_TRIP_STATUS_LABEL: Record<PrivateTripStatus, string> = {
  new: "Baru",
  contacted: "Dihubungi",
  deal: "Deal",
  cancelled: "Batal",
};

/**
 * Memetakan nilai status apa pun dari DB ke salah satu status yang dikenal.
 *
 * Baris lama bisa menyimpan "replied" — sisa skema dua-keadaan sebelumnya yang
 * hanya mengenal dibalas/belum. Nilai itu dianggap "contacted". Nilai tak
 * dikenal jatuh ke "new" agar dropdown tak pernah tampil kosong.
 */
export function normalizePrivateTripStatus(raw: unknown): PrivateTripStatus {
  if (raw === "replied") return "contacted";
  return (PRIVATE_TRIP_STATUSES as readonly unknown[]).includes(raw)
    ? (raw as PrivateTripStatus)
    : "new";
}
