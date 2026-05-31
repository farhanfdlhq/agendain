"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Edit2, Trash2, Search, MoreVertical, Eye, WifiOff, AlertCircle, RefreshCw, PackageX } from "lucide-react"
import { formatIDR } from "@/lib/currency"
import { toast } from "react-hot-toast"
import styles from "./page.module.css"

export default function AdminPaketPage() {
  const [packages, setPackages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    
    if (typeof navigator !== "undefined") {
      setIsOffline(!navigator.onLine)
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    fetchPackages()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const fetchPackages = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/paket")
      if (res.ok) {
        const data = await res.json()
        setPackages(data)
      } else {
        setError("Gagal memuat data dari server.")
      }
    } catch (error) {
      console.error("Failed to fetch packages", error)
      setError("Gagal terhubung ke server. Periksa koneksi internet Anda.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (slug: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus paket ini?")) return;
    
    try {
      const res = await fetch(`/api/paket/${slug}`, {
        method: "DELETE"
      });
      if (res.ok) {
        toast.success("Paket berhasil dihapus");
        fetchPackages();
      } else {
        toast.error("Gagal menghapus paket");
      }
    } catch (e) {
      toast.error("Terjadi kesalahan server");
    }
  }

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.nama.toLowerCase().includes(search.toLowerCase()) || 
      pkg.destinasi.nama.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !statusFilter || pkg.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatPrice = (price: any) => {
    return formatIDR(Number(price))
  }

  const SkeletonRow = () => (
    <tr className={styles.skeletonRow}>
      <td>
        <div className={`${styles.skeleton} ${styles.skTitle}`}></div>
        <div className={`${styles.skeleton} ${styles.skSub}`}></div>
      </td>
      <td><div className={`${styles.skeleton} ${styles.skBadge}`}></div></td>
      <td><div className={`${styles.skeleton} ${styles.skSub}`}></div></td>
      <td><div className={`${styles.skeleton} ${styles.skTitle}`}></div></td>
      <td><div className={`${styles.skeleton} ${styles.skBadge}`}></div></td>
      <td><div className={`${styles.skeleton} ${styles.skBtn}`}></div></td>
    </tr>
  )

  const renderState = () => {
    if (isOffline) {
      return (
        <tr>
          <td colSpan={6} className={styles.loadingCell}>
            <div className={styles.stateContent}>
              <div className={`${styles.stateIconWrapper} ${styles.error}`}>
                <WifiOff size={28} />
              </div>
              <h3 className={styles.stateTitle}>Anda Sedang Offline</h3>
              <p className={styles.stateDesc}>Koneksi internet terputus. Silakan periksa jaringan Anda lalu coba lagi.</p>
              <button className={styles.retryBtn} onClick={fetchPackages}>
                <RefreshCw size={16} /> Coba Ulang
              </button>
            </div>
          </td>
        </tr>
      )
    }
    
    if (error) {
      return (
        <tr>
          <td colSpan={6} className={styles.loadingCell}>
            <div className={styles.stateContent}>
              <div className={`${styles.stateIconWrapper} ${styles.error}`}>
                <AlertCircle size={28} />
              </div>
              <h3 className={styles.stateTitle}>Terjadi Kesalahan</h3>
              <p className={styles.stateDesc}>{error}</p>
              <button className={styles.retryBtn} onClick={fetchPackages}>
                <RefreshCw size={16} /> Coba Lagi
              </button>
            </div>
          </td>
        </tr>
      )
    }

    if (loading) {
      return (
        <>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </>
      )
    }

    return null
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
            <select className={styles.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
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
              {renderState() || (filteredPackages.length > 0 ? (
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
                      <Link href={`/admin/paket/edit/${pkg.slug}`} className={styles.iconBtn} title="Edit">
                        <Edit2 size={18} />
                      </Link>
                      <button className={styles.iconBtnDanger} onClick={() => handleDelete(pkg.slug)} title="Hapus">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className={styles.emptyCell}>
                    <div className={styles.stateContent}>
                      <div className={styles.stateIconWrapper}>
                        <PackageX size={28} />
                      </div>
                      <h3 className={styles.stateTitle}>Tidak Ada Paket Ditemukan</h3>
                      <p className={styles.stateDesc}>Belum ada paket wisata yang ditambahkan atau paket yang dicari tidak ada.</p>
                      <Link href="/admin/paket/baru" className={styles.retryBtn} style={{ marginTop: '16px' }}>
                        <Plus size={16} /> Tambah Paket
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
