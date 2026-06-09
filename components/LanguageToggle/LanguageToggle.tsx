'use client'
import { useTranslation } from '@/lib/i18n/useTranslation'
import styles from './LanguageToggle.module.css'

export default function LanguageToggle() {
  const { locale, setLocale } = useTranslation()

  return (
    <div className={styles.toggleGroup}>
      <button
        className={`${styles.toggleBtn} ${locale === 'id' ? styles.active : ''}`}
        onClick={() => setLocale('id')}
        aria-label="Bahasa Indonesia"
      >
        <img src="https://flagcdn.com/w20/id.png" alt="ID" width={20} height={15} className={styles.flag} /> ID
      </button>
      <button
        className={`${styles.toggleBtn} ${locale === 'en' ? styles.active : ''}`}
        onClick={() => setLocale('en')}
        aria-label="English"
      >
        <img src="https://flagcdn.com/w20/gb.png" alt="EN" width={20} height={15} className={styles.flag} /> EN
      </button>
    </div>
  )
}
