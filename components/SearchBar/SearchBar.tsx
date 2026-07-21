'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Calendar, Users, Search } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/useTranslation'
import styles from './SearchBar.module.css'

export default function SearchBar() {
  const { t } = useTranslation()
  const router = useRouter()
  const [destinasi, setDestinasi] = useState('')
  const [waktu, setWaktu] = useState('')
  const [pax, setPax] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  
  const [showPaxSuggestions, setShowPaxSuggestions] = useState(false)
  const paxWrapperRef = useRef<HTMLDivElement>(null)

  const [showWaktuSuggestions, setShowWaktuSuggestions] = useState(false)
  const waktuWrapperRef = useRef<HTMLDivElement>(null)

  // Generate next 12 months for travel
  const generateMonths = () => {
    const months = [t('search.anytime')]
    const date = new Date()
    for (let i = 0; i < 12; i++) {
      const month = date.toLocaleString('id-ID', { month: 'long' })
      const year = date.getFullYear()
      months.push(`${month} ${year}`)
      date.setMonth(date.getMonth() + 1)
    }
    return months
  }
  const waktuOptions = generateMonths()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
      if (paxWrapperRef.current && !paxWrapperRef.current.contains(event.target as Node)) {
        setShowPaxSuggestions(false)
      }
      if (waktuWrapperRef.current && !waktuWrapperRef.current.contains(event.target as Node)) {
        setShowWaktuSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    fetch('/api/destinasi')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setSuggestions(data.map((d: any) => d.nama))
        } else {
          setSuggestions(['Swiss', 'Prancis', 'Italia', 'Belanda', 'Inggris', 'Spanyol', 'Turki'])
        }
      })
      .catch(() => {
         setSuggestions(['Swiss', 'Prancis', 'Italia', 'Belanda', 'Inggris', 'Spanyol', 'Turki'])
      })
  }, [])

  const filteredDestinasi = destinasi 
    ? suggestions.filter(s => s.toLowerCase().includes(destinasi.toLowerCase()))
    : suggestions.slice(0, 5)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (destinasi) params.append('destinasi', destinasi)
    if (waktu) params.append('waktu', waktu)
    if (pax) params.append('pax', pax)
    router.push(`/open-trip?${params.toString()}`)
  }

  return (
    <form className={styles.searchBar} onSubmit={handleSearch}>
      <div className={styles.fieldWrapper} ref={wrapperRef}>
        <label className={styles.field} htmlFor="destinasi">
          <div className={styles.fieldHeader}>
            <MapPin size={16} className={styles.icon} />
            <span>{t('search.where')}</span>
          </div>
          <input 
            type="text" 
            id="destinasi" 
            placeholder={t('search.wherePh')}
            value={destinasi}
            onChange={(e) => {
              setDestinasi(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            autoComplete="off"
          />
        </label>

        {showSuggestions && (
          <div className={styles.suggestionsDropdown}>
            {filteredDestinasi.length > 0 ? (
              filteredDestinasi.map(s => (
                <div 
                  key={s} 
                  className={styles.suggestionItem}
                  onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
                  onClick={() => {
                    setDestinasi(s)
                    setShowSuggestions(false)
                  }}
                >
                  <MapPin size={16} className={styles.suggestionIcon} />
                  {s}
                </div>
              ))
            ) : (
              <div className={styles.suggestionEmpty}>{t('search.notFound')}</div>
            )}
          </div>
        )}
      </div>
      
      <div className={styles.divider} />
      
      <div className={styles.fieldWrapper} ref={waktuWrapperRef}>
        <label className={styles.field} htmlFor="waktu">
          <div className={styles.fieldHeader}>
            <Calendar size={16} className={styles.icon} />
            <span>{t('search.when')}</span>
          </div>
          <input 
            type="text" 
            id="waktu"
            placeholder={t('search.whenPh')}
            value={waktu}
            readOnly
            onClick={() => setShowWaktuSuggestions(true)}
            className={!waktu ? styles.emptyInput : ''}
          />
        </label>

        {showWaktuSuggestions && (
          <div className={styles.suggestionsDropdown}>
            {waktuOptions.map(opt => (
              <div 
                key={opt} 
                className={styles.suggestionItem}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setWaktu(opt === t('search.anytime') ? '' : opt)
                  setShowWaktuSuggestions(false)
                }}
              >
                <Calendar size={16} className={styles.suggestionIcon} />
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className={styles.divider} />
      
      <div className={styles.fieldWrapper} ref={paxWrapperRef}>
        <label className={styles.field} htmlFor="pax">
          <div className={styles.fieldHeader}>
            <Users size={16} className={styles.icon} />
            <span>{t('search.pax')}</span>
          </div>
          <input 
            type="number" 
            id="pax" 
            min="1"
            placeholder={t('search.paxPh')}
            value={pax}
            onChange={(e) => {
              setPax(e.target.value)
              setShowPaxSuggestions(true)
            }}
            onFocus={() => setShowPaxSuggestions(true)}
            autoComplete="off"
            className={!pax ? styles.emptyInput : ''}
          />
        </label>
        
        {showPaxSuggestions && (
          <div className={styles.suggestionsDropdown}>
            {[1, 2, 3, 4, 5, 10].map(num => (
              <div 
                key={num} 
                className={styles.suggestionItem}
                onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
                onClick={() => {
                  setPax(num.toString())
                  setShowPaxSuggestions(false)
                }}
              >
                <Users size={16} className={styles.suggestionIcon} />
                {num === 10 ? t('search.group') : `${num} ${t('search.people')}`}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <button type="submit" className={styles.submitBtn} aria-label="Cari Open Trip">
        <Search size={20} strokeWidth={2.5} />
      </button>
    </form>
  )
}
