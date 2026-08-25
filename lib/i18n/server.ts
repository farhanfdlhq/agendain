import { cookies } from 'next/headers'
import idDict from './locales/id'
import enDict from './locales/en'

export type Locale = 'id' | 'en'

const dictionaries: Record<Locale, Record<string, string>> = { id: idDict, en: enDict }

/**
 * Mendapatkan locale saat ini dari cookie.
 * Khusus untuk dipanggil dari dalam Server Components.
 */
export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const lang = cookieStore.get('NEXT_LOCALE')?.value
  if (lang === 'id' || lang === 'en') {
    return lang as Locale
  }
  return 'id' // Default
}

/**
 * Padanan `t` dari `useTranslation()` untuk Server Component.
 *
 * Semantiknya sengaja dibuat identik dengan versi client
 * (`LanguageContext.tsx`): locale aktif → kamus Indonesia → kunci itu sendiri.
 * Karena kamusnya sama, kunci yang sama bisa dipakai di kedua sisi.
 *
 * Memanggil ini membuat halaman dinamis (baca cookie). Itu bukan regresi:
 * root layout sudah memanggil `getServerLocale()` untuk seluruh halaman.
 */
export async function getServerT(): Promise<(key: string) => string> {
  const locale = await getServerLocale()
  return (key: string) => dictionaries[locale][key] || dictionaries.id[key] || key
}

/**
 * Helper untuk mengambil nilai setting dari CMS berdasarkan locale saat ini.
 */
export async function getI18nSetting(settings: Record<string, any> | undefined | null, key: string): Promise<any> {
  if (!settings) return undefined;
  
  const locale = await getServerLocale()
  
  // Jika bahasa Inggris dan data versi en tersedia, gunakan itu.
  if (locale === 'en' && settings[`${key}_en`]) {
    return settings[`${key}_en`]
  }
  
  // Fallback ke bahasa Indonesia (default)
  return settings[key]
}
