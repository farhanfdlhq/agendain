/**
 * Daftar font yang boleh dipilih di /admin/settings/design.
 *
 * Modul ini HANYA data (tanpa import next/font) supaya aman dipakai baik oleh
 * route API maupun komponen client. Loader next/font-nya ada di app/layout.tsx,
 * dipetakan memakai nama yang sama persis dengan FONT_CHOICES di bawah.
 */
export const FONT_CHOICES = [
  "Montserrat",
  "Inter",
  "Outfit",
  "Poppins",
  "Playfair Display",
  "Plus Jakarta Sans",
  "Roboto",
  "DM Sans",
  "Lora",
] as const;

export type FontChoice = (typeof FONT_CHOICES)[number];

/**
 * Nama CSS custom property yang di-generate next/font untuk tiap pilihan.
 *
 * `as const` wajib: next/font hanya mengembalikan tipe ber-`.variable` bila
 * argumen `variable` bertipe literal `--${string}`, bukan `string` biasa.
 * `satisfies` menjaga agar setiap FONT_CHOICES punya entri.
 */
export const FONT_CSS_VARS = {
  Montserrat: "--font-montserrat",
  Inter: "--font-inter",
  Outfit: "--font-outfit",
  Poppins: "--font-poppins",
  "Playfair Display": "--font-playfair",
  "Plus Jakarta Sans": "--font-plus-jakarta",
  Roboto: "--font-roboto",
  "DM Sans": "--font-dm-sans",
  Lora: "--font-lora",
} as const satisfies Record<FontChoice, `--${string}`>;

export const DEFAULT_HEADING_FONT: FontChoice = "Plus Jakarta Sans";
export const DEFAULT_BODY_FONT: FontChoice = "Montserrat";

export function isFontChoice(value: unknown): value is FontChoice {
  return typeof value === "string" && (FONT_CHOICES as readonly string[]).includes(value);
}

/**
 * Nama pilihan → nama CSS var. Nilai tak dikenal jatuh ke fallback, sehingga
 * nilai theme_settings buatan tangan tidak bisa disuntikkan ke dalam tag
 * <style> di app/layout.tsx.
 */
export function fontCssVar(value: unknown, fallback: FontChoice = DEFAULT_BODY_FONT): string {
  return FONT_CSS_VARS[isFontChoice(value) ? value : fallback];
}
