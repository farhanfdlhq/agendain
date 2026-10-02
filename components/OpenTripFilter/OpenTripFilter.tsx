'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { TransitionStartFunction } from 'react'
import { Select } from 'radix-ui'
import { ArrowUpDown, Check, ChevronDown, Clock, Loader2, MapPin, RotateCcw, type LucideIcon } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { pickLocalized } from '@/lib/i18n/localize'
import styles from './OpenTripFilter.module.css'

export type DestOption = { nama: string; namaEn?: string | null }

type Option = { value: string; label: string }

// Radix Select tidak menerima value "" → opsi "Semua …" dipetakan ke token ini.
const ALL = '__all'

/**
 * Dropdown filter kustom (Radix Select): panel membulat sesuai desain, bukan
 * daftar <select> bawaan OS yang bersudut tajam. Keyboard, typeahead & ARIA
 * tetap ditangani Radix.
 */
function FilterSelect({ id, label, icon: Icon, value, options, onChange }: {
  id: string
  label: string
  icon: LucideIcon
  value: string
  options: Option[]
  onChange: (value: string) => void
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <Select.Root value={value || ALL} onValueChange={(v) => onChange(v === ALL ? '' : v)}>
        <Select.Trigger id={id} className={styles.trigger}>
          <Icon size={16} aria-hidden="true" className={styles.icon} />
          <span className={styles.triggerValue}><Select.Value /></span>
          <Select.Icon className={styles.chevron}>
            <ChevronDown size={16} aria-hidden="true" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content position="popper" sideOffset={8} className={styles.menu}>
            <Select.Viewport className={styles.viewport}>
              {options.map((o) => (
                <Select.Item key={o.value || ALL} value={o.value || ALL} className={styles.item}>
                  <Select.ItemText>{o.label}</Select.ItemText>
                  <Select.ItemIndicator className={styles.itemCheck}>
                    <Check size={16} aria-hidden="true" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  )
}

export default function OpenTripFilter({
  destList = [],
  resultCount,
  isPending = false,
  startTransition,
}: {
  destList?: DestOption[]
  resultCount: number
  isPending?: boolean
  startTransition: TransitionStartFunction
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, locale } = useTranslation()

  const destinasi = searchParams.get('destinasi') || ''
  const durasi = searchParams.get('durasi') || ''
  const urutkan = searchParams.get('urutkan') || 'terbaru'
  const isFiltered = !!(destinasi || durasi || urutkan !== 'terbaru')

  const push = (params: URLSearchParams) => {
    const qs = params.toString()
    // scroll:false → hasil berganti di tempat, halaman tidak melompat ke atas.
    startTransition(() => {
      router.push(qs ? `/open-trip?${qs}` : '/open-trip', { scroll: false })
    })
  }

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    push(params)
  }

  const destOptions: Option[] = [
    { value: '', label: t('filter.allDest') },
    // Label ikut bahasa, tapi `value` wajib nama Indonesia agar query filter tetap cocok.
    ...destList.map((d) => ({ value: d.nama, label: pickLocalized(d, 'nama', locale) || d.nama })),
  ]
  const durasiOptions: Option[] = [
    { value: '', label: t('filter.allDuration') },
    { value: '5-7', label: `5 - 7 ${t('filter.days')}` },
    { value: '8-10', label: `8 - 10 ${t('filter.days')}` },
    { value: '11+', label: `11+ ${t('filter.days')}` },
  ]
  const urutkanOptions: Option[] = [
    { value: 'terbaru', label: t('filter.newest') },
    { value: 'termurah', label: t('filter.cheapest') },
    { value: 'termahal', label: t('filter.expensive') },
  ]

  return (
    <div className={styles.toolbar}>
      <div className={styles.fields}>
        <FilterSelect id="filter-destinasi" label={t('filter.dest')} icon={MapPin} value={destinasi}
          options={destOptions} onChange={(v) => handleFilterChange('destinasi', v)} />
        <FilterSelect id="filter-durasi" label={t('filter.duration')} icon={Clock} value={durasi}
          options={durasiOptions} onChange={(v) => handleFilterChange('durasi', v)} />
        <FilterSelect id="filter-urutkan" label={t('filter.sort')} icon={ArrowUpDown} value={urutkan}
          options={urutkanOptions} onChange={(v) => handleFilterChange('urutkan', v)} />
      </div>

      <div className={styles.meta}>
        <p className={styles.count} aria-live="polite">
          {isPending ? (
            <span className={styles.loading}>
              <Loader2 size={14} aria-hidden="true" className={styles.spin} />
              {t('filter.loading')}
            </span>
          ) : (
            <span key={resultCount} className={styles.countValue}>
              {t('filter.results').replace('{n}', String(resultCount))}
            </span>
          )}
        </p>
        {isFiltered && (
          <button type="button" className={styles.reset} onClick={() => push(new URLSearchParams())}>
            <RotateCcw size={14} aria-hidden="true" />
            {t('filter.reset')}
          </button>
        )}
      </div>
    </div>
  )
}
