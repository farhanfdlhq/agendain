'use client'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { motion } from 'framer-motion'
import styles from './LanguageToggle.module.css'

export default function LanguageToggle() {
  const { locale, setLocale } = useTranslation()

  return (
    <div className={styles.toggleGroup}>
      <button
        className={`${styles.toggleBtn} ${locale === 'id' ? styles.activeText : ''}`}
        onClick={() => setLocale('id')}
        aria-label="Bahasa Indonesia"
      >
        {locale === 'id' && (
          <motion.div layoutId="activeLangBg" className={styles.activeBg} transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />
        )}
        <span className={styles.contentWrapper}>
          <img src="/flags/id.png" alt="ID" width={20} height={15} className={styles.flag} /> ID
        </span>
      </button>
      <button
        className={`${styles.toggleBtn} ${locale === 'en' ? styles.activeText : ''}`}
        onClick={() => setLocale('en')}
        aria-label="English"
      >
        {locale === 'en' && (
          <motion.div layoutId="activeLangBg" className={styles.activeBg} transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />
        )}
        <span className={styles.contentWrapper}>
          <img src="/flags/en.png" alt="EN" width={20} height={15} className={styles.flag} /> EN
        </span>
      </button>
    </div>
  )
}
