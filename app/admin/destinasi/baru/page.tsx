"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Loader2, Image as ImageIcon } from "lucide-react"
import styles from "../../paket/baru/page.module.css" // Reusing form CSS

export default function TambahDestinasiPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    nama: "",
    slug: "",
    negara: "",
    deskripsi: "",
    foto: "",
    bahasa: "",
    matauang: "",
    waktuTerbaik: "",
    infoVisa: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/destinasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        router.push("/admin/destinasi")
        router.refresh()
      } else {
        alert("Gagal menambahkan destinasi.")
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
        <Link href="/admin/destinasi" className={styles.backBtn}>
          <ArrowLeft size={18} />
          Kembali
        </Link>
        <div className={styles.headerContent}>
          <div>
            <h2 className={styles.title}>Tambah Destinasi</h2>
            <p className={styles.subtitle}>Tambahkan kota atau negara tujuan baru.</p>
          </div>
          <button onClick={handleSubmit} className={styles.saveBtn} disabled={loading}>
            {loading ? <Loader2 size={18} className={styles.spinner} /> : <Save size={18} />}
            Simpan Destinasi
          </button>
        </div>
      </div>

      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.formGrid}>
          
          <div className={styles.mainColumn}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Informasi Utama</h3>
              
              <div className={styles.inputGroup}>
                <label>Nama Destinasi (Kota/Wilayah)</label>
                <input 
                  type="text" name="nama" className={styles.input} 
                  placeholder="Contoh: Paris, Swiss Alps, Cappadocia"
                  value={formData.nama} onChange={handleChange} required 
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label>Negara</label>
                <input 
                  type="text" name="negara" className={styles.input} 
                  placeholder="Contoh: Prancis, Swiss, Turki"
                  value={formData.negara} onChange={handleChange} required 
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Deskripsi Singkat</label>
                <textarea 
                  name="deskripsi" className={styles.textarea} rows={4}
                  placeholder="Deskripsikan pesona destinasi ini..."
                  value={formData.deskripsi} onChange={handleChange} required 
                ></textarea>
              </div>

              <div className={styles.inputGroup}>
                <label>URL Gambar Utama</label>
                <div className={styles.inputWithIcon}>
                  <ImageIcon size={18} className={styles.inputIcon} />
                  <input 
                    type="url" name="foto" className={styles.inputPl} 
                    placeholder="https://..."
                    value={formData.foto} onChange={handleChange} required 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.sideColumn}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Informasi Tambahan</h3>
              
              <div className={styles.inputGroup}>
                <label>Bahasa Utama <span className={styles.optional}>Opsional</span></label>
                <input 
                  type="text" name="bahasa" className={styles.input} 
                  placeholder="Contoh: Prancis, Inggris"
                  value={formData.bahasa} onChange={handleChange}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Mata Uang <span className={styles.optional}>Opsional</span></label>
                <input 
                  type="text" name="matauang" className={styles.input} 
                  placeholder="Contoh: Euro (EUR)"
                  value={formData.matauang} onChange={handleChange}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Waktu Terbaik Berkunjung <span className={styles.optional}>Opsional</span></label>
                <input 
                  type="text" name="waktuTerbaik" className={styles.input} 
                  placeholder="Contoh: Musim Semi (April - Juni)"
                  value={formData.waktuTerbaik} onChange={handleChange}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Info Visa <span className={styles.optional}>Opsional</span></label>
                <textarea 
                  name="infoVisa" className={styles.textarea} rows={3}
                  placeholder="Butuh Visa Schengen, dll..."
                  value={formData.infoVisa} onChange={handleChange}
                ></textarea>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  )
}
