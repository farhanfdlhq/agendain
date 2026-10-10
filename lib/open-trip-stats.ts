/**
 * Statistik di bawah hero halaman Open Trip (mis. "63+ Destinasi Unik").
 *
 * Data + fungsi murni, dipakai bersama halaman publik dan CMS Open Trip.
 * Disimpan sebagai field datar di `opentrip_settings`:
 * `stat1Value`, `stat1Suffix`, `stat1Label`, `stat1Label_en` … `stat4*`.
 * Nilai bawaan = yang dulu di-hardcode, jadi tampilan tidak berubah selama
 * CMS belum pernah disimpan.
 */

export const OPEN_TRIP_STAT_DEFAULTS = [
  { value: 2, suffix: "+", label: "Tahun Pengalaman", label_en: "Years of Experience" },
  { value: 63, suffix: "+", label: "Destinasi Unik", label_en: "Unique Destinations" },
  { value: 32, suffix: "K+", label: "Traveler Senang", label_en: "Happy Travelers" },
  { value: 94, suffix: "%", label: "Tingkat Kepuasan", label_en: "Satisfaction Rate" },
] as const;

export type OpenTripStat = { value: number; suffix: string; label: string };

/** Field CMS berisi nilai bawaan, untuk mengisi form sebelum data termuat. */
export function openTripStatFormDefaults(): Record<string, string> {
  const out: Record<string, string> = {};
  OPEN_TRIP_STAT_DEFAULTS.forEach((d, i) => {
    const n = i + 1;
    out[`stat${n}Value`] = String(d.value);
    out[`stat${n}Suffix`] = d.suffix;
    out[`stat${n}Label`] = d.label;
    out[`stat${n}Label_en`] = d.label_en;
  });
  return out;
}

/**
 * Angka kosong/tidak valid → bawaan. Akhiran kosong disengaja (tanpa akhiran),
 * hanya field yang belum pernah disimpan yang memakai bawaan. Label kosong →
 * bawaan bahasa yang sedang tampil.
 */
export function resolveOpenTripStats(
  settings: Record<string, unknown> | null | undefined,
  isEn: boolean,
): OpenTripStat[] {
  const s = settings ?? {};
  return OPEN_TRIP_STAT_DEFAULTS.map((d, i) => {
    const n = i + 1;
    const rawValue = String(s[`stat${n}Value`] ?? "").trim();
    const parsed = Number(rawValue);
    const value = rawValue !== "" && Number.isFinite(parsed) && parsed >= 0 ? parsed : d.value;

    const rawSuffix = s[`stat${n}Suffix`];
    const suffix = typeof rawSuffix === "string" ? rawSuffix.trim() : d.suffix;

    const rawLabel = String(s[isEn ? `stat${n}Label_en` : `stat${n}Label`] ?? "").trim();
    const label = rawLabel || (isEn ? d.label_en : d.label);

    return { value, suffix, label };
  });
}
