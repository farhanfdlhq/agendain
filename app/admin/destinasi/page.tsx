"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Edit2, Trash2, Search, MapPin } from "lucide-react"
import { toast } from "react-hot-toast"
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

  const handleDelete = async (slug: string) => {
    if (confirm("Hapus destinasi ini? Semua paket yang terkait mungkin akan kehilangan relasinya.")) {
      try {
        const res = await fetch(`/api/destinasi/${slug}`, {
          method: "DELETE"
        });
        if (res.ok) {
          toast.success("Destinasi berhasil dihapus");
          fetchDestinasi();
        } else {
          toast.error("Gagal menghapus destinasi");
        }
      } catch (e) {
        toast.error("Terjadi kesalahan server");
      }
    }
  }

  const filteredData = destinasi.filter(d => 
    d.nama.toLowerCase().includes(search.toLowerCase())
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
              placeholder="Cari nama destinasi..." 
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
                <th>Slug</th>
                <th>Jumlah Paket</th>
                <th className={styles.textRight}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className={styles.loadingCell}>Memuat data...</td>
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
                    <td><span className={styles.badgeNeutral}>{d.slug}</span></td>
                    <td>-</td>
                    <td className={styles.actionsCell}>
                      <Link href={`/admin/destinasi/edit/${d.slug}`} className={styles.iconBtn} title="Edit">
                        <Edit2 size={18} />
                      </Link>
                      <button className={styles.iconBtnDanger} onClick={() => handleDelete(d.slug)} title="Hapus">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className={styles.emptyCell}>Tidak ada destinasi ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
