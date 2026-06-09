'use client'
import { useContext } from 'react'
import { LanguageContext } from './LanguageContext'

export function useTranslation() {
  const context = useContext(LanguageContext)

  const translateData = (text: string) => {
    if (!text) return text
    if (context.locale === 'id') return text
    
    const cleanText = text.trim();

    // Fallback translations for dynamic database content
    const dict: Record<string, string> = {
      'Prancis': 'France',
      'Swiss': 'Switzerland',
      'Italia': 'Italy',
      'Inggris': 'United Kingdom',
      'Spanyol': 'Spain',
      'Belanda': 'Netherlands',
      'Jerman': 'Germany',
      'Turki': 'Turkey',
      'Eropa Barat': 'Western Europe',
      'Eropa Timur': 'Eastern Europe',
      'Skandinavia': 'Scandinavia',
      'Eropa': 'Europe',
      'Terlaris': 'Best Seller',
      'Populer': 'Popular',
      'Baru': 'New',
      'Terbaru': 'New',
      'Promo': 'Promo',
      'Rekomendasi': 'Recommended',
      'Diskon': 'Discount',
      'Spesial': 'Special',
      'Promo Spesial': 'Special Promo',
      'Eksklusif': 'Exclusive'
    }

    // Try exact match, then capitalized match
    const translated = dict[cleanText] || dict[cleanText.charAt(0).toUpperCase() + cleanText.slice(1).toLowerCase()]
    return translated || text
  }

  return { ...context, translateData }
}
