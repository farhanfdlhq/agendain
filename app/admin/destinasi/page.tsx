"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Edit2, Trash2, Search, MapPin, WifiOff, AlertCircle, RefreshCw, Map } from "lucide-react"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import styles from "../paket/page.module.css" // We can reuse the Paket list CSS!

export default function AdminDestinasiPage() {
  const [destinasi, setDestinasi] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
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
    
    fetchDestinasi()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const fetchDestinasi = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/destinasi")
      if (res.ok) {
        const data = await res.json()
        setDestinasi(data)
      } else {
        setError("Gagal memuat data dari server.")
      }
    } catch (error) {
      console.error("Failed to fetch destinations", error)
      setError("Gagal terhubung ke server. Periksa koneksi internet Anda.")
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

  const SkeletonRow = () => (
    <tr className={styles.skeletonRow}>
      <td>
        <div className={`${styles.skeleton} ${styles.skTitle}`}></div>
      </td>
      <td><div className={`${styles.skeleton} ${styles.skBadge}`}></div></td>
      <td><div className={`${styles.skeleton} ${styles.skSub}`}></div></td>
      <td><div className={`${styles.skeleton} ${styles.skBtn}`}></div></td>
    </tr>
  )

  const renderState = () => {
    if (isOffline) {
      return (
        <tr>
          <td colSpan={4} className={styles.loadingCell}>
            <div className={styles.stateContent}>
              <div className={`${styles.stateIconWrapper} ${styles.error}`}>
                <WifiOff size={28} />
              </div>
              <h3 className={styles.stateTitle}>Anda Sedang Offline</h3>
              <p className={styles.stateDesc}>Koneksi internet terputus. Silakan periksa jaringan Anda lalu coba lagi.</p>
              <button className={styles.retryBtn} onClick={fetchDestinasi}>
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
          <td colSpan={4} className={styles.loadingCell}>
            <div className={styles.stateContent}>
              <div className={`${styles.stateIconWrapper} ${styles.error}`}>
                <AlertCircle size={28} />
              </div>
              <h3 className={styles.stateTitle}>Terjadi Kesalahan</h3>
              <p className={styles.stateDesc}>{error}</p>
              <button className={styles.retryBtn} onClick={fetchDestinasi}>
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
          <h2 className={styles.title}>Manajemen Destinasi</h2>
          <p className={styles.subtitle}>Kelola negara dan kota tujuan wisata.</p>
        </div>
        <Button asChild className="bg-[var(--color-primary)] text-white hover:opacity-90 shadow-sm rounded-md h-10 px-4 font-semibold">
          <Link href="/admin/destinasi/baru">
            <Plus size={18} className="mr-2" />
            Tambah Destinasi
          </Link>
        </Button>
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
              {renderState() || (filteredData.length > 0 ? (
                filteredData.map((d) => (
                  <tr key={d.id}>
                    <td className={styles.boldCell}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <MapPin size={16} color="var(--color-primary)" />
                        {d.nama}
                      </div>
                    </td>
                    <td><span className={styles.badgeNeutral}>{d.slug}</span></td>
                    <td>{d._count?.pakets || 0}</td>
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
                  <td colSpan={4} className={styles.emptyCell}>
                    <div className={styles.stateContent}>
                      <div className={styles.stateIconWrapper}>
                        <Map size={28} />
                      </div>
                      <h3 className={styles.stateTitle}>Tidak Ada Destinasi Ditemukan</h3>
                      <p className={styles.stateDesc}>Belum ada destinasi wisata yang ditambahkan atau pencarian tidak cocok.</p>
                      <Link href="/admin/destinasi/baru" className={styles.retryBtn} style={{ marginTop: '16px' }}>
                        <Plus size={16} /> Tambah Destinasi
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
