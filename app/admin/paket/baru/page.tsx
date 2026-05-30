"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Loader2, Image as ImageIcon } from "lucide-react"
import styles from "./page.module.css"

export default function TambahPaketPage() {
  const router = useRouter()
  const [destinations, setDestinations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingDest, setFetchingDest] = useState(true)

  const [formData, setFormData] = useState({
    nama: "",
    slug: "",
    destinasiId: "",
    durasi: 1,
    harga: 0,
    deskripsi: "",
    fotoUrl: "",
    status: "draft"
  })

  useEffect(() => {
    fetchDestinations()
  }, [])

  const fetchDestinations = async () => {
    try {
      const res = await fetch("/api/destinasi")
      if (res.ok) {
        const data = await res.json()
        setDestinations(data)
      }
    } catch (err) {
      console.error("Gagal mengambil destinasi", err)
    } finally {
      setFetchingDest(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'durasi' || name === 'harga' || name === 'destinasiId' ? Number(value) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        foto: { medium: formData.fotoUrl, thumb: formData.fotoUrl }, // Basic implementation for now
        itinerary: [],
        fasilitas: [],
        termasuk: [],
        tidakTermasuk: []
      }

      const res = await fetch("/api/paket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        router.push("/admin/paket")
        router.refresh()
      } else {
        alert("Gagal menambahkan paket. Pastikan data terisi dengan benar.")
      }
    } catch (err) {
      alert("Terjadi kesalahan server.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/admin/paket" className={styles.backBtn}>
          <ArrowLeft size={18} />
          Kembali
        </Link>
        <div className={styles.headerContent}>
          <div>
            <h2 className={styles.title}>Tambah Paket Wisata</h2>
            <p className={styles.subtitle}>Buat paket perjalanan baru ke Eropa.</p>
          </div>
          <button 
            onClick={handleSubmit} 
            className={styles.saveBtn}
            disabled={loading}
          >
            {loading ? <Loader2 size={18} className={styles.spinner} /> : <Save size={18} />}
            Simpan Paket
          </button>
        </div>
      </div>

      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.formGrid}>
          
          <div className={styles.mainColumn}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Informasi Dasar</h3>
              
              <div className={styles.inputGroup}>
                <label>Nama Paket</label>
                <input 
                  type="text" 
                  name="nama" 
                  className={styles.input} 
                  placeholder="Contoh: Romantic Paris 5 Days"
                  value={formData.nama}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Slug (URL) <span className={styles.optional}>Opsional</span></label>
                <input 
                  type="text" 
                  name="slug" 
                  className={styles.input} 
                  placeholder="romantic-paris-5-days"
                  value={formData.slug}
                  onChange={handleChange}
                />
                <span className={styles.hint}>Biarkan kosong untuk generate otomatis dari nama.</span>
              </div>

              <div className={styles.inputGroup}>
                <label>Deskripsi Paket</label>
                <textarea 
                  name="deskripsi" 
                  className={styles.textarea} 
                  placeholder="Tuliskan deskripsi menarik tentang perjalanan ini..."
                  rows={6}
                  value={formData.deskripsi}
                  onChange={handleChange}
                  required 
                ></textarea>
              </div>
            </div>

            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Media & Gambar</h3>
              
              <div className={styles.inputGroup}>
                <label>URL Foto Thumbnail</label>
                <div className={styles.inputWithIcon}>
                  <ImageIcon size={18} className={styles.inputIcon} />
                  <input 
                    type="url" 
                    name="fotoUrl" 
                    className={styles.inputPl} 
                    placeholder="https://images.unsplash.com/photo-..."
                    value={formData.fotoUrl}
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.sideColumn}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Detail Perjalanan</h3>
              
              <div className={styles.inputGroup}>
                <label>Status Publikasi</label>
                <select name="status" className={styles.select} value={formData.status} onChange={handleChange}>
                  <option value="draft">Draft (Disembunyikan)</option>
                  <option value="published">Published (Ditampilkan)</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label>Destinasi Negara</label>
                <select 
                  name="destinasiId" 
                  className={styles.select} 
                  value={formData.destinasiId}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>-- Pilih Destinasi --</option>
                  {fetchingDest ? (
                    <option disabled>Memuat destinasi...</option>
                  ) : (
                    destinations.map(d => (
                      <option key={d.id} value={d.id}>{d.nama}</option>
                    ))
                  )}
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label>Durasi (Hari)</label>
                <input 
                  type="number" 
                  name="durasi" 
                  className={styles.input} 
                  min="1"
                  value={formData.durasi}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Harga Dasar (Rp)</label>
                <input 
                  type="number" 
                  name="harga" 
                  className={styles.input} 
                  min="0"
                  step="100000"
                  value={formData.harga}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  )
}
