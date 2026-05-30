"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Edit2, Trash2, Search, MapPin } from "lucide-react"
import styles from "../paket/page.module.css" // We can reuse the Paket list CSS!

export default function AdminDestinasiPage() {
  const [destinasi, setDestinasi] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchDestinasi()
  }, [])

  const fetchDestinasi = async () => {
    try {
      const res = await fetch("/api/destinasi")
      if (res.ok) {
        const data = await res.json()
        setDestinasi(data)
      }
    } catch (error) {
      console.error("Failed to fetch destinations", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Hapus destinasi ini? Semua paket yang terkait mungkin akan kehilangan relasinya.")) {
      alert("Fitur hapus belum diaktifkan")
    }
  }

  const filteredData = destinasi.filter(d => 
    d.nama.toLowerCase().includes(search.toLowerCase()) || 
    d.negara.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Manajemen Destinasi</h2>
          <p className={styles.subtitle}>Kelola negara dan kota tujuan wisata.</p>
        </div>
        <Link href="/admin/destinasi/baru" className={styles.addBtn}>
          <Plus size={18} />
          Tambah Destinasi
        </Link>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableToolbar}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Cari nama destinasi atau negara..." 
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nama Destinasi</th>
                <th>Negara</th>
                <th>Mata Uang</th>
                <th>Waktu Terbaik</th>
                <th className={styles.textRight}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className={styles.loadingCell}>Memuat data...</td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((d) => (
                  <tr key={d.id}>
                    <td className={styles.boldCell}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <MapPin size={16} color="var(--color-primary)" />
                        {d.nama}
                      </div>
                    </td>
                    <td><span className={styles.badgeNeutral}>{d.negara}</span></td>
                    <td>{d.matauang || '-'}</td>
                    <td>{d.waktuTerbaik || '-'}</td>
                    <td className={styles.actionsCell}>
                      <button className={styles.iconBtn} title="Edit">
                        <Edit2 size={18} />
                      </button>
                      <button className={styles.iconBtnDanger} onClick={() => handleDelete(d.id)} title="Hapus">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className={styles.emptyCell}>Tidak ada destinasi ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
