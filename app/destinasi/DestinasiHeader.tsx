'use client'
import styles from './page.module.css'
import { useTranslation } from '@/lib/i18n/useTranslation'

export default function DestinasiHeader() {
  const { t } = useTranslation()

  return (
    <div className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.title}>{t('dest.title')}</h1>
        <p className={styles.subtitle}>{t('dest.subtitle')}</p>
      </div>
    </div>
  )
}
