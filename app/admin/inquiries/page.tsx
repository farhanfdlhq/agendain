"use client"

import { useState, useEffect } from "react"
import { Search, Mail, Phone, Calendar, Users, CheckCircle, Clock } from "lucide-react"
import { toast } from "react-hot-toast"
import styles from "./page.module.css"

export default function AdminInquiriesPage() {
  const [activeTab, setActiveTab] = useState<"inquiries" | "privatetrip">("privatetrip")
  const [data, setData] = useState({ inquiries: [], privateTrips: [] })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch("/api/inquiries")
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (error) {
      console.error("Failed to fetch inquiries", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsReplied = async (id: number, type: string) => {
    try {
      const res = await fetch(`/api/inquiries`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type, sudahDibalas: true })
      })
      if (res.ok) {
        toast.success("Status berhasil diperbarui")
        fetchData()
      } else {
        toast.error("Gagal memperbarui status")
      }
    } catch (err) {
      console.error("Failed to update status", err)
      toast.error("Terjadi kesalahan sistem")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
    })
  }

  const filteredTrips = data.privateTrips.filter((t: any) => 
    t.nama.toLowerCase().includes(search.toLowerCase()) || 
    t.email.toLowerCase().includes(search.toLowerCase()) ||
    t.destinasi.toLowerCase().includes(search.toLowerCase())
  )

  const filteredInquiries = data.inquiries.filter((i: any) => 
    i.nama.toLowerCase().includes(search.toLowerCase()) || 
    i.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Pusat Pesan & Inquiries</h2>
          <p className={styles.subtitle}>Kelola permintaan Private Trip dan pertanyaan masuk dari pelanggan.</p>
        </div>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tabBtn} ${activeTab === "privatetrip" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("privatetrip")}
        >
          Request Private Trip
          {data.privateTrips.length > 0 && <span className={styles.badge}>{data.privateTrips.length}</span>}
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === "inquiries" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("inquiries")}
        >
          Pesan Masuk (Q&A)
          {data.inquiries.length > 0 && <span className={styles.badge}>{data.inquiries.length}</span>}
        </button>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableToolbar}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Cari nama, email, atau destinasi..." 
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {activeTab === "privatetrip" ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Pelanggan</th>
                  <th>Destinasi & Tanggal</th>
                  <th>Detail Pax & Budget</th>
                  <th>Status</th>
                  <th className={styles.textRight}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className={styles.loadingCell}>Memuat data...</td></tr>
                ) : filteredTrips.length > 0 ? (
                  filteredTrips.map((trip: any) => (
                    <tr key={trip.id}>
                      <td>
                        <p className={styles.boldCell}>{trip.nama}</p>
                        <div className={styles.contactInfo}>
                          <span className={styles.contactItem}><Mail size={12}/> {trip.email}</span>
                          <span className={styles.contactItem}><Phone size={12}/> {trip.noWa}</span>
                        </div>
                      </td>
                      <td>
                        <p className={styles.boldCell}>{trip.destinasi}</p>
                        <div className={styles.contactItem}><Calendar size={12}/> {new Date(trip.tanggal).toLocaleDateString('id-ID', {month: 'long', year:'numeric'})}</div>
                      </td>
                      <td>
                        <div className={styles.contactItem}><Users size={12}/> {trip.jumlahPax} Orang</div>
                        <p className={styles.budget}>{trip.budget}</p>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${trip.status === 'new' ? styles.statusNew : styles.statusProgress}`}>
                          {trip.status === 'new' ? 'Baru' : 'Diproses'}
                        </span>
                      </td>
                      <td className={styles.actionsCell}>
                        <a href={`https://wa.me/${trip.noWa.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className={styles.btnPrimarySm}>
                          Balas WA
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className={styles.emptyCell}>Tidak ada request Private Trip.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Pengirim</th>
                  <th>Pesan / Pertanyaan</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                  <th className={styles.textRight}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className={styles.loadingCell}>Memuat data...</td></tr>
                ) : filteredInquiries.length > 0 ? (
                  filteredInquiries.map((inq: any) => (
                    <tr key={inq.id}>
                      <td>
                        <p className={styles.boldCell}>{inq.nama}</p>
                        <p className={styles.contactItem} style={{marginTop: 4}}><Mail size={12}/> {inq.email}</p>
                        {inq.noWa && <p className={styles.contactItem}><Phone size={12}/> {inq.noWa}</p>}
                      </td>
                      <td style={{maxWidth: '300px'}}>
                        {inq.paket && <span className={styles.topicBadge}>Terkait: {inq.paket.nama}</span>}
                        <p className={styles.messageText}>{inq.pesan}</p>
                      </td>
                      <td>{formatDate(inq.createdAt)}</td>
                      <td>
                        {inq.sudahDibalas ? (
                          <span className={`${styles.statusBadge}`} style={{background: 'var(--color-success-surface)', color: 'var(--color-success)'}}><CheckCircle size={12}/> Selesai</span>
                        ) : (
                          <span className={`${styles.statusBadge}`} style={{background: 'var(--color-danger-surface)', color: 'var(--color-danger)'}}><Clock size={12}/> Menunggu</span>
                        )}
                      </td>
                      <td className={styles.actionsCell}>
                        {!inq.sudahDibalas && (
                          <button onClick={() => handleMarkAsReplied(inq.id, 'inquiry')} className={styles.btnSecondarySm}>
                            Tandai Selesai
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className={styles.emptyCell}>Tidak ada pesan masuk.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
