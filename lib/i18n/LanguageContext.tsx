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

function persistLocale(l: Locale) {
  localStorage.setItem('agendain_lang', l)
  document.cookie = `NEXT_LOCALE=${l}; path=/; max-age=31536000; SameSite=Lax`
}

// useSearchParams men-suspend saat render server, jadi hanya komponen kecil ini
// yang dibungkus <Suspense>. Dulu Suspense membungkus {children} dan fallback-nya
// ikut merender seluruh halaman → HTML server berisi halaman dua kali (h1 ganda).
function UrlLocaleSync({ onLocale }: { onLocale: (l: Locale) => void }) {
  const searchParams = useSearchParams()

  useEffect(() => {
    // 1. Check URL first
    const urlLang = searchParams.get('lang')
    if (urlLang === 'id' || urlLang === 'en') {
      onLocale(urlLang)
      persistLocale(urlLang)
      return
    }

    // 2. Fallback to localStorage
    const saved = localStorage.getItem('agendain_lang')
    if (saved === 'id' || saved === 'en') {
      onLocale(saved)
      persistLocale(saved)
    }
  }, [searchParams, onLocale])

  return null
}

export function LanguageProvider({ children, initialLocale = 'id' }: { children: ReactNode, initialLocale?: Locale }) {
  const router = useRouter()
  const pathname = usePathname()

  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    persistLocale(l)

    // Update URL without full page reload to maintain animations
    const current = new URLSearchParams(window.location.search)
    current.set('lang', l)
    router.push(`${pathname}?${current.toString()}`, { scroll: false })
    router.refresh()
  }

  const t = (key: string): string => {
    return dictionaries[locale][key] || dictionaries['id'][key] || key
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      <Suspense fallback={null}>
        <UrlLocaleSync onLocale={setLocaleState} />
      </Suspense>
      {children}
    </LanguageContext.Provider>
  )
}
