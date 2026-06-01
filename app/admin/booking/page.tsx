"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Plus, Edit2, Trash2, Eye, PackageX, Loader2, RefreshCw, AlertCircle, CalendarDays } from "lucide-react"
import { toast } from "react-hot-toast"
import styles from "../paket/page.module.css"

export default function AdminBookingPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/booking")
      if (res.ok) {
        const data = await res.json()
        setBookings(data)
      } else {
        setError("Gagal memuat data dari server.")
      }
    } catch (error) {
      console.error("Failed to fetch bookings", error)
      setError("Gagal terhubung ke server. Periksa koneksi internet Anda.")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/booking/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        toast.success("Status berhasil diperbarui")
        fetchBookings()
      } else {
        toast.error("Gagal memperbarui status")
      }
    } catch (err) {
      console.error(err)
      toast.error("Terjadi kesalahan sistem")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pemesanan ini?")) return;
    
    try {
      const res = await fetch(`/api/booking/${id}`, {
        method: "DELETE"
      })
      
      if (res.ok) {
        toast.success("Pemesanan berhasil dihapus")
        fetchBookings()
      } else {
        toast.error("Gagal menghapus pemesanan")
      }
    } catch (error) {
      console.error(error)
      toast.error("Terjadi kesalahan pada server")
    }
  }

  const formatPrice = (price: any) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(price))
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric"
    })
  }

  const filteredBookings = bookings.filter((b: any) => {
    const matchesSearch = b.nama.toLowerCase().includes(search.toLowerCase()) || 
                          b.email.toLowerCase().includes(search.toLowerCase()) ||
                          b.paket?.nama.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "" || b.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const renderState = () => {
    if (error) {
      return (
        <tr>
          <td colSpan={7} className={styles.loadingCell}>
            <div className={styles.stateContent}>
              <div className={`${styles.stateIconWrapper} ${styles.error}`}>
                <AlertCircle size={28} />
              </div>
              <h3 className={styles.stateTitle}>Terjadi Kesalahan</h3>
              <p className={styles.stateDesc}>{error}</p>
              <button className={styles.retryBtn} onClick={fetchBookings}>
                <RefreshCw size={16} /> Coba Lagi
              </button>
            </div>
          </td>
        </tr>
      )
    }

    if (loading) {
      return (
        <tr>
          <td colSpan={7} className={styles.loadingCell}>
            <div className={styles.stateContent}>
              <Loader2 className={styles.spinnerLg} size={32} />
              <p className={styles.stateDesc}>Memuat data pemesanan...</p>
            </div>
          </td>
        </tr>
      )
    }

    return null
  }

  const renderSkeletonRow = () => (
    <tr>
      <td>
        <div className={`${styles.skeleton} ${styles.skTitle}`}></div>
        <div className={`${styles.skeleton} ${styles.skSub}`}></div>
      </td>
      <td><div className={`${styles.skeleton} ${styles.skTitle}`}></div></td>
      <td><div className={`${styles.skeleton} ${styles.skBadge}`}></div></td>
      <td><div className={`${styles.skeleton} ${styles.skSub}`}></div></td>
      <td><div className={`${styles.skeleton} ${styles.skSub}`}></div></td>
      <td><div className={`${styles.skeleton} ${styles.skBadge}`}></div></td>
      <td><div className={`${styles.skeleton} ${styles.skBtn}`}></div></td>
    </tr>
  )

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h2 className={styles.title}>Manajemen Booking</h2>
            <p className={styles.subtitle}>Kelola daftar pemesanan dari pelanggan.</p>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Cari nama, email, atau paket..." 
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.filters}>
            <select className={styles.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Lunas (Paid)</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Pelanggan</th>
                <th>Paket</th>
                <th>Tanggal Trip</th>
                <th>Pax</th>
                <th>Total Tagihan</th>
                <th>Status</th>
                <th className={styles.textRight}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {renderState() || (filteredBookings.length > 0 ? (
                filteredBookings.map((b) => (
                  <tr key={b.id}>
                    <td className={styles.boldCell}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span>{b.nama}</span>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', fontWeight: 'normal', display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span>{b.email}</span>
                          {b.noWa && (
                            <>
                              <span>•</span>
                              <a 
                                href={`https://wa.me/${b.noWa.replace(/\D/g, '')}`} 
                                target="_blank" 
                                rel="noreferrer"
                                style={{ color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '2px' }}
                              >
                                WA
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={styles.badgeNeutral}>{b.paket?.nama || "Paket Dihapus"}</span>
                    </td>
                    <td>
                      <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                        <CalendarDays size={14} color="var(--color-muted)"/>
                        {formatDate(b.tanggal)}
                      </div>
                    </td>
                    <td>{b.jumlahPax} pax</td>
                    <td className={styles.priceCell}>{formatPrice(b.total)}</td>
                    <td>
                      <select 
                        value={b.status} 
                        onChange={(e) => handleStatusChange(b.id, e.target.value)}
                        className={`${styles.badge} ${b.status === 'paid' ? styles.badgeSuccess : (b.status === 'cancelled' ? styles.badgeDanger : styles.badgeWarning)}`}
                        style={{ border: 'none', cursor: 'pointer', outline: 'none' }}
                      >
                        <option value="pending" className={styles.badgeWarning}>Pending</option>
                        <option value="paid" className={styles.badgeSuccess}>Lunas</option>
                        <option value="cancelled" className={styles.badgeDanger}>Batal</option>
                      </select>
                    </td>
                    <td className={styles.actionsCell}>
                      <button className={styles.iconBtn} onClick={() => setSelectedBooking(b)} title="Lihat Detail">
                        <Eye size={18} />
                      </button>
                      <button className={styles.iconBtnDanger} onClick={() => handleDelete(b.id)} title="Hapus">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className={styles.emptyCell}>
                    <div className={styles.stateContent}>
                      <div className={styles.stateIconWrapper}>
                        <PackageX size={28} />
                      </div>
                      <h3 className={styles.stateTitle}>Tidak Ada Pesanan Ditemukan</h3>
                      <p className={styles.stateDesc}>Belum ada riwayat booking atau pesanan yang dicari tidak ada.</p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Booking */}
      {selectedBooking && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '500px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Detail Pesanan</h3>
              <button onClick={() => setSelectedBooking(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}>
                &times;
              </button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>ID Pemesanan</span>
                <strong style={{ fontSize: '1.1rem' }}>#BKG-{selectedBooking.id.toString().padStart(4, '0')}</strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>Pelanggan</span>
                  <strong>{selectedBooking.nama}</strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>No. WhatsApp</span>
                  <a href={`https://wa.me/${selectedBooking.noWa.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                    {selectedBooking.noWa}
                  </a>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>Paket Wisata</span>
                <strong>{selectedBooking.paket?.nama || "Paket Dihapus"}</strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>Tanggal Trip</span>
                  <strong>{formatDate(selectedBooking.tanggal)}</strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>Jumlah Pax</span>
                  <strong>{selectedBooking.jumlahPax} Orang</strong>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>Total Tagihan</span>
                <strong style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>{formatPrice(selectedBooking.total)}</strong>
              </div>
              {selectedBooking.catatan && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px', padding: '12px', background: 'var(--color-surface-soft)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>Catatan Tambahan:</span>
                  <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5 }}>{selectedBooking.catatan}</p>
                </div>
              )}
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-hairline)', background: 'var(--color-surface-soft)', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedBooking(null)} style={{ padding: '8px 16px', background: 'white', border: '1px solid var(--color-border-strong)', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
