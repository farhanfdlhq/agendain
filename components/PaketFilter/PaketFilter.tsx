'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import styles from './PaketFilter.module.css'

export default function PaketFilter({ destList = [] }: { destList?: string[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
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
    router.push(`/paket?${params.toString()}`)
  }

  const destinasiOptions = destList.length > 0 ? destList : ['Italia', 'Swiss', 'Prancis', 'Inggris', 'Belanda']

  return (
    <div className={styles.filterBar}>
      <div className={styles.filterItem}>
        <span className={styles.filterLabel}>Destinasi</span>
        <select 
          className={styles.select} 
          value={destinasi}
          onChange={(e) => handleFilterChange('destinasi', e.target.value)}
        >
          <option value="">Semua Destinasi</option>
          {destinasiOptions.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>
      <div className={styles.filterItem}>
        <span className={styles.filterLabel}>Durasi</span>
        <select 
          className={styles.select}
          value={durasi}
          onChange={(e) => handleFilterChange('durasi', e.target.value)}
        >
          <option value="">Semua Durasi</option>
          <option value="5-7">5 - 7 Hari</option>
          <option value="8-10">8 - 10 Hari</option>
          <option value="11+">11+ Hari</option>
        </select>
      </div>
      <div className={styles.filterItem}>
        <span className={styles.filterLabel}>Urutkan</span>
        <select 
          className={styles.select}
          value={urutkan}
          onChange={(e) => handleFilterChange('urutkan', e.target.value)}
        >
          <option value="terbaru">Terbaru</option>
          <option value="termurah">Termurah</option>
          <option value="termahal">Termahal</option>
        </select>
      </div>
    </div>
  )
}
