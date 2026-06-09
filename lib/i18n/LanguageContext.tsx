'use client'
import { createContext, useState, useEffect, ReactNode } from 'react'
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

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('id')

  useEffect(() => {
    const saved = localStorage.getItem('agendain_lang') as Locale | null
    if (saved && (saved === 'id' || saved === 'en')) {
      setLocaleState(saved)
    }
  }, [])

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    localStorage.setItem('agendain_lang', l)
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
