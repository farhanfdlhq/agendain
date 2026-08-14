'use client'
import { createContext, useState, useEffect, ReactNode, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import idDict from './locales/id'
import enDict from './locales/en'

export type Locale = 'id' | 'en'

const dictionaries: Record<Locale, Record<string, string>> = { id: idDict, en: enDict }

export const LanguageContext = createContext<{
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string) => string
}>({
  locale: 'id',
  setLocale: () => {},
  t: (key) => key,
})

function LanguageProviderInner({ children, initialLocale = 'id' }: { children: ReactNode, initialLocale?: Locale }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  useEffect(() => {
    // 1. Check URL first
    const urlLang = searchParams.get('lang') as Locale | null
    if (urlLang && (urlLang === 'id' || urlLang === 'en')) {
      setLocaleState(urlLang)
      localStorage.setItem('agendain_lang', urlLang)
      document.cookie = `NEXT_LOCALE=${urlLang}; path=/; max-age=31536000; SameSite=Lax`
      return
    }

    // 2. Fallback to localStorage
    const saved = localStorage.getItem('agendain_lang') as Locale | null
    if (saved && (saved === 'id' || saved === 'en')) {
      setLocaleState(saved)
      document.cookie = `NEXT_LOCALE=${saved}; path=/; max-age=31536000; SameSite=Lax`
    }
  }, [searchParams])

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    localStorage.setItem('agendain_lang', l)
    document.cookie = `NEXT_LOCALE=${l}; path=/; max-age=31536000; SameSite=Lax`
    
    // Update URL without full page reload to maintain animations
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    current.set('lang', l)
    const search = current.toString()
    const query = search ? `?${search}` : ""
    router.push(`${pathname}${query}`, { scroll: false })
    router.refresh()
  }

  const t = (key: string): string => {
    return dictionaries[locale][key] || dictionaries['id'][key] || key
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function LanguageProvider({ children, initialLocale = 'id' }: { children: ReactNode, initialLocale?: Locale }) {
  return (
    <Suspense fallback={<LanguageContext.Provider value={{ locale: initialLocale, setLocale: () => {}, t: (k) => k }}>{children}</LanguageContext.Provider>}>
      <LanguageProviderInner initialLocale={initialLocale}>{children}</LanguageProviderInner>
    </Suspense>
  )
}
