/**
 * Pesan error login yang boleh dilihat pengguna. Dipakai server (lib/auth.ts)
 * saat melempar error dan form login untuk menyaring: pesan lain (mis. error
 * Prisma berisi path server) tidak pernah ditampilkan apa adanya.
 */
export const LOGIN_ERRORS = {
  empty: "Email dan password harus diisi",
  rateLimited: "Terlalu banyak percobaan login. Coba lagi nanti.",
  invalid: "Email atau password salah",
  unavailable: "Server sedang bermasalah. Coba lagi beberapa saat lagi.",
} as const

const KNOWN = new Set<string>(Object.values(LOGIN_ERRORS))

export function loginErrorMessage(raw: string | null | undefined): string {
  return raw && KNOWN.has(raw) ? raw : "Terjadi kesalahan. Silakan coba lagi."
}
