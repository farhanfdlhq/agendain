'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './SearchBar.module.css'

export default function SearchBar() {
  const router = useRouter()
  const [destinasi, setDestinasi] = useState('')
  const [waktu, setWaktu] = useState('')
  const [pax, setPax] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (destinasi) params.append('destinasi', destinasi)
    if (waktu) params.append('waktu', waktu)
    if (pax) params.append('pax', pax)
    router.push(`/paket?${params.toString()}`)
  }

  return (
    <form className={styles.searchBar} onSubmit={handleSearch}>
      <div className={styles.field}>
        <label htmlFor="destinasi">Mau ke mana?</label>
        <input 
          type="text" 
          id="destinasi" 
          placeholder="Cari negara atau kota"
          value={destinasi}
          onChange={(e) => setDestinasi(e.target.value)}
        />
      </div>
      
      <div className={styles.divider} />
      
      <div className={styles.field}>
        <label htmlFor="waktu">Kapan?</label>
        <input 
          type="month" 
          id="waktu"
          value={waktu}
          onChange={(e) => setWaktu(e.target.value)}
        />
      </div>
      
      <div className={styles.divider} />
      
      <div className={styles.field}>
        <label htmlFor="pax">Berapa orang?</label>
        <input 
          type="number" 
          id="pax" 
          placeholder="Jumlah peserta"
          min="1"
          value={pax}
          onChange={(e) => setPax(e.target.value)}
        />
      </div>
      
      <button type="submit" className={styles.submitBtn} aria-label="Cari Paket">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </button>
    </form>
  )
}
