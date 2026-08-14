import { cookies } from 'next/headers'

export type Locale = 'id' | 'en'

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
