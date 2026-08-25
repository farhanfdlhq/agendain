/**
 * Bentuk & nilai bawaan `footer_settings`.
 *
 * Modul ini HANYA data + fungsi murni (tanpa import React/prisma) supaya bisa
 * dipakai bersama oleh komponen Footer publik dan halaman CMS-nya. Nilai
 * bawaannya sengaja sama persis dengan yang dulu di-hardcode di
 * components/Footer/Footer.tsx, sehingga tampilan tidak berubah selama baris
 * `footer_settings` belum pernah disimpan.
 */

export const FOOTER_SOCIAL_PLATFORMS = [
  { id: "instagram", label: "Instagram" },
  { id: "youtube", label: "YouTube" },
  { id: "twitter", label: "X / Twitter" },
  { id: "email", label: "Email" },
  { id: "facebook", label: "Facebook" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "tiktok", label: "TikTok" },
  { id: "phone", label: "Telepon" },
  { id: "link", label: "Tautan lain" },
] as const;

export type FooterSocialPlatform = (typeof FOOTER_SOCIAL_PLATFORMS)[number]["id"];

export type FooterSocial = {
  platform: string;
  label: string;
  url: string;
};

export const DEFAULT_FOOTER_SOCIALS: FooterSocial[] = [
  { platform: "instagram", label: "@agendain.id", url: "https://instagram.com/agendain.id" },
  { platform: "youtube", label: "Youtube", url: "https://youtube.com/@agendain" },
  { platform: "twitter", label: "Twitter", url: "https://twitter.com/agendain" },
  { platform: "email", label: "info@agendain.com", url: "mailto:info@agendain.com" },
];

export const DEFAULT_PAYMENT_BADGES = [
  "Visa",
  "Mastercard",
  "Maestro",
  "Amex",
  "G Pay",
  "BCA",
  "BNI",
  "Mandiri",
];

export type ParsedFooterSettings = {
  /** Field teks apa adanya (`tagline`, `tagline_en`, `menuTitle`, dst). */
  raw: Record<string, any>;
  socials: FooterSocial[];
  paymentBadges: string[];
};

/**
 * Terima nilai `setting.value` (string JSON) maupun objek yang sudah di-parse.
 * Nilai rusak / bukan objek tidak melempar — jatuh ke bawaan.
 */
export function parseFooterSettings(value: unknown): ParsedFooterSettings {
  let raw: Record<string, any> = {};

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) raw = parsed;
    } catch {
      raw = {};
    }
  } else if (value && typeof value === "object" && !Array.isArray(value)) {
    raw = value as Record<string, any>;
  }

  const socials = Array.isArray(raw.socials)
    ? raw.socials
        .filter((s: any) => s && typeof s === "object" && typeof s.url === "string" && s.url.trim())
        .map((s: any) => ({
          platform: typeof s.platform === "string" ? s.platform : "link",
          label: typeof s.label === "string" ? s.label : "",
          url: String(s.url).trim(),
        }))
    : [];

  const paymentBadges = Array.isArray(raw.paymentBadges)
    ? raw.paymentBadges.map((b: any) => String(b ?? "").trim()).filter(Boolean)
    : [];

  return {
    raw,
    socials: socials.length ? socials : DEFAULT_FOOTER_SOCIALS,
    paymentBadges: paymentBadges.length ? paymentBadges : DEFAULT_PAYMENT_BADGES,
  };
}

/**
 * Loloskan hanya skema tautan yang wajar. Pemegang `cms_manage` memang sudah
 * dipercaya, tetapi `javascript:` di dalam href adalah XSS tersimpan yang
 * murah untuk ditutup di sini.
 */
export function safeHref(url: unknown): string {
  if (typeof url !== "string") return "#";
  const trimmed = url.trim();
  if (!trimmed) return "#";
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return trimmed;
  return "#";
}
