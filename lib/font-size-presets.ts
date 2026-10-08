// Preset px di daftar dropdown. Nilai lain tetap bisa diketik langsung.
export const FONT_SIZE_PRESETS = [12, 14, 16, 17, 18, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 72, 80, 96]

/**
 * Label peran untuk preset yang sama dengan skala tipografi situs
 * (app/tokens.css, ukuran desktop). Yang tersimpan tetap angka px; label hanya
 * membantu admin memilih ukuran yang seragam dengan judul lain.
 */
export const FONT_SIZE_ROLES: Record<number, string> = {
  64: "Hero",
  44: "Judul Section",
  20: "Judul Kartu",
  17: "Lead / Sub-judul",
  16: "Body",
  14: "Caption",
}
