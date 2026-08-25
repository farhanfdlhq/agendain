'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { pickLocalized } from '@/lib/i18n/localize'
import styles from './OpenTripFilter.module.css'

export type DestOption = { nama: string; namaEn?: string | null }

export default function OpenTripFilter({ destList = [] }: { destList?: DestOption[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, locale } = useTranslation()

  const destinasi = searchParams.get('destinasi') || ''
  const durasi = searchParams.get('durasi') || ''
  const urutkan = searchParams.get('urutkan') || 'terbaru'

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/open-trip?${params.toString()}`)
  }

  const destinasiOptions: DestOption[] = destList.length > 0
    ? destList
    : [{ nama: 'Italia' }, { nama: 'Swiss' }, { nama: 'Prancis' }, { nama: 'Inggris' }, { nama: 'Belanda' }]

  return (
    <div className={styles.filterBar}>
      <div className={styles.filterItem}>
        <span className={styles.filterLabel}>{t('filter.dest')}</span>
        <select
          className={styles.select}
          value={destinasi}
          onChange={(e) => handleFilterChange('destinasi', e.target.value)}
        >
          <option value="">{t('filter.allDest')}</option>
          {/* Label ikut bahasa, tapi `value` wajib nama Indonesia agar query filter tetap cocok. */}
          {destinasiOptions.map(d => (
            <option key={d.nama} value={d.nama}>{pickLocalized(d, 'nama', locale) || d.nama}</option>
          ))}
        </select>
      </div>
      <div className={styles.filterItem}>
        <span className={styles.filterLabel}>{t('filter.duration')}</span>
        <select 
          className={styles.select}
          value={durasi}
          onChange={(e) => handleFilterChange('durasi', e.target.value)}
        >
          <option value="">{t('filter.allDuration')}</option>
          <option value="5-7">5 - 7 {t('filter.days')}</option>
          <option value="8-10">8 - 10 {t('filter.days')}</option>
          <option value="11+">11+ {t('filter.days')}</option>
        </select>
      </div>
      <div className={styles.filterItem}>
        <span className={styles.filterLabel}>{t('filter.sort')}</span>
        <select 
          className={styles.select}
          value={urutkan}
          onChange={(e) => handleFilterChange('urutkan', e.target.value)}
        >
          <option value="terbaru">{t('filter.newest')}</option>
          <option value="termurah">{t('filter.cheapest')}</option>
          <option value="termahal">{t('filter.expensive')}</option>
        </select>
      </div>
    </div>
  )
}
