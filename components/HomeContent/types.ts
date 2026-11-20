/** Tipe prop bersama section Beranda. */

/** Pembaca setting CMS ber-bahasa dengan fallback kunci i18n / teks statis. */
export type Gs = (key: string, fallbackTKey?: string, defaultStatic?: string) => string

/** Penerjemah kunci i18n (`t` dari useTranslation). */
export type Tr = (key: string) => string

/** Objek `home_settings` dari CMS (bentuk bebas; dibaca per kunci). */
export type HomeSettings = Record<string, unknown> | null | undefined
