/** Pesan dari nilai `catch` (tipe `unknown`); bukan Error atau kosong → fallback. */
export function errorMessage(e: unknown, fallback = "Terjadi kesalahan"): string {
  return e instanceof Error && e.message ? e.message : fallback
}
