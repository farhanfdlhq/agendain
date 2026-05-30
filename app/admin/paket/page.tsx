"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Edit2, Trash2, Search, MoreVertical, Eye } from "lucide-react"
import { formatIDR } from "@/lib/currency"
import { toast } from "react-hot-toast"
import styles from "./page.module.css"

export default function AdminPaketPage() {
  const [packages, setPackages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const res = await fetch("/api/paket")
      if (res.ok) {
        const data = await res.json()
        setPackages(data)
      }
    } catch (error) {
      console.error("Failed to fetch packages", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    // We can't use confirm directly if we want fully custom, but for simplicity of "custom alert",
    // we use a toast promise or just a toast error since it's just a dummy for now.
    toast.error("Fitur hapus akan diaktifkan setelah integrasi API Delete", {
      icon: '🔒'
    });
  }

  const filteredPackages = packages.filter(pkg => 
    pkg.nama.toLowerCase().includes(search.toLowerCase()) || 
    pkg.destinasi.nama.toLowerCase().includes(search.toLowerCase())
  )

  const formatPrice = (price: any) => {
    return formatIDR(Number(price))
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Manajemen Paket</h2>
          <p className={styles.subtitle}>Kelola semua paket wisata perjalanan Anda.</p>
        </div>
        <Link href="/admin/paket/baru" className={styles.addBtn}>
          <Plus size={18} />
          Tambah Paket Baru
        </Link>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableToolbar}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Cari nama paket atau destinasi..." 
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.filters}>
            <select className={styles.select}>
              <option value="">Semua Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nama Paket</th>
                <th>Destinasi</th>
                <th>Durasi</th>
                <th>Harga</th>
                <th>Status</th>
                <th className={styles.textRight}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className={styles.loadingCell}>Memuat data...</td>
                </tr>
              ) : filteredPackages.length > 0 ? (
                filteredPackages.map((pkg) => (
                  <tr key={pkg.id}>
                    <td className={styles.boldCell}>{pkg.nama}</td>
                    <td>
                      <span className={styles.badgeNeutral}>{pkg.destinasi.nama}</span>
                    </td>
                    <td>{pkg.durasi} Hari</td>
                    <td className={styles.priceCell}>{formatPrice(pkg.harga)}</td>
                    <td>
                      <span className={`${styles.badge} ${pkg.status === 'published' ? styles.badgeSuccess : styles.badgeWarning}`}>
                        {pkg.status}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <Link href={`/paket/${pkg.slug}`} target="_blank" className={styles.iconBtn} title="Lihat di Web">
                        <Eye size={18} />
                      </Link>
                      <button className={styles.iconBtn} title="Edit">
                        <Edit2 size={18} />
                      </button>
                      <button className={styles.iconBtnDanger} onClick={() => handleDelete(pkg.id)} title="Hapus">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className={styles.emptyCell}>Tidak ada paket ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
