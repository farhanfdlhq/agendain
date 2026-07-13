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

function LanguageProviderInner({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  const [locale, setLocaleState] = useState<Locale>('id')

  useEffect(() => {
    // 1. Check URL first
    const urlLang = searchParams.get('lang') as Locale | null
    if (urlLang && (urlLang === 'id' || urlLang === 'en')) {
      setLocaleState(urlLang)
      localStorage.setItem('agendain_lang', urlLang)
      return
    }

    // 2. Fallback to localStorage
    const saved = localStorage.getItem('agendain_lang') as Locale | null
    if (saved && (saved === 'id' || saved === 'en')) {
      setLocaleState(saved)
    }
  }, [searchParams])

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    localStorage.setItem('agendain_lang', l)
    
    // Update URL without full page reload to maintain animations
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    current.set('lang', l)
    const search = current.toString()
    const query = search ? `?${search}` : ""
    router.push(`${pathname}${query}`, { scroll: false })
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

export function LanguageProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<LanguageContext.Provider value={{ locale: 'id', setLocale: () => {}, t: (k) => k }}>{children}</LanguageContext.Provider>}>
      <LanguageProviderInner>{children}</LanguageProviderInner>
    </Suspense>
  )
}
