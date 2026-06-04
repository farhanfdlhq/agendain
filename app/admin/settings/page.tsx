"use client"

import { useState, useEffect } from "react"
import { Settings, Save, Loader2, Link as LinkIcon, MessageSquare, CreditCard, LayoutTemplate, Info } from "lucide-react"
import { toast } from "react-hot-toast"

import styles from "./page.module.css"

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [formData, setFormData] = useState({
    site_name: "Agendain",
    whatsapp_number: "6281234567890",
    whatsapp_message: "Halo Agendain, saya ingin bertanya tentang paket wisata.",
    payment_instructions: "Silakan transfer ke rekening BCA 1234567890 a.n PT Agendain.",
    site_logo: "/logo.png",
    global_informasi_penting: "Paspor minimal masa berlaku 6 bulan dari tanggal kepulangan.\nVisa Schengen diwajibkan bagi pemegang paspor Indonesia.\nJadwal perjalanan dan akomodasi dapat berubah sewaktu-waktu menyesuaikan kondisi cuaca.",
    global_kebijakan_pembatalan: "Pembatalan > 30 hari sebelum keberangkatan: Pengembalian 50% dari total.\nPembatalan 15-30 hari sebelum keberangkatan: Pengembalian 25% dari total.\nPembatalan < 14 hari sebelum keberangkatan: Tidak ada pengembalian dana (Non-refundable).\nJika visa ditolak, biaya visa tidak dapat dikembalikan.",
    global_opsi_penjemputan: "Bandara Internasional Soekarno Hatta (Terminal 3).\nPenjemputan area Jakarta (sesuai konfirmasi).\nSilakan kumpul 4 jam sebelum keberangkatan."
  })

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingLogo(true)
    const uploadData = new FormData()
    uploadData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      })
      const data = await res.json()
      if (res.ok) {
        setFormData(prev => ({ ...prev, site_logo: data.url }))
        toast.success("Logo berhasil diunggah!")
      } else {
        toast.error("Upload gagal: " + data.error)
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat upload gambar.")
    } finally {
      setUploadingLogo(false)
    }
  }

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data && !data.error && Object.keys(data).length > 0) {
          setFormData(prev => ({ ...prev, ...data }))
        }
      })
      .catch(err => console.error(err))
      .finally(() => setFetching(false))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      ...formData
    }

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        toast.success("Pengaturan berhasil disimpan!")
      } else {
        toast.error("Gagal menyimpan pengaturan.")
      }
    } catch (err) {
      toast.error("Terjadi kesalahan server.")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className={styles.loadingWrapper}>
        <Loader2 size={32} className={styles.spinner} />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Pengaturan Sistem</h2>
          <p className={styles.subtitle}>Konfigurasi parameter dan identitas utama website Agendain.</p>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={loading}
          className={styles.saveBtn}
        >
          {loading ? <Loader2 size={18} className={styles.spinner} /> : <Save size={18} />}
          Simpan Perubahan
        </button>
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSubmit}>
          
          {/* Section: Identitas Website */}
          <div className={`${styles.section} ${styles.sectionBorder}`}>
            <div className={styles.sectionHeader}>
              <LayoutTemplate size={20} />
              <h3 className={styles.sectionTitle}>Identitas Website</h3>
            </div>
            
            <div className={styles.grid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nama Website</label>
                <input
                  type="text"
                  name="site_name"
                  value={formData.site_name}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Logo Website</label>
                <div className={styles.logoUploadRow}>
                  {formData.site_logo && formData.site_logo !== "/logo.png" ? (
                    <img src={formData.site_logo} alt="Logo" className={styles.logoPreview} />
                  ) : (
                    <div className={styles.logoPlaceholder}>
                      <LayoutTemplate size={24} color="var(--color-muted)" />
                    </div>
                  )}
                  <div className={styles.logoContent}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      style={{ display: "none" }}
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload" className={styles.uploadLabel}>
                      {uploadingLogo ? <Loader2 size={16} className={styles.spinner} /> : "Pilih Gambar Logo"}
                    </label>
                    <p className={styles.hint}>
                      Disarankan menggunakan gambar PNG dengan latar belakang transparan (rasio 1:1 atau 3:1).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Kontak & Komunikasi */}
          <div className={`${styles.section} ${styles.sectionBorder}`}>
            <div className={styles.sectionHeader}>
              <MessageSquare size={20} />
              <h3 className={styles.sectionTitle}>Kontak & Pesan</h3>
            </div>
            
            <div className={styles.grid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nomor WhatsApp Utama (Gunakan format 62xxx)</label>
                <input
                  type="text"
                  name="whatsapp_number"
                  value={formData.whatsapp_number}
                  onChange={handleChange}
                  placeholder="6281234567890"
                  className={styles.input}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Teks Pesan WhatsApp Default</label>
                <textarea
                  name="whatsapp_message"
                  value={formData.whatsapp_message}
                  onChange={handleChange}
                  rows={3}
                  className={`${styles.input} ${styles.textarea}`}
                />
                <p className={styles.hint}>Pesan ini akan otomatis terisi saat kustomer menekan tombol chat WhatsApp di frontend.</p>
              </div>
            </div>
          </div>

          {/* Section: Pembayaran */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <CreditCard size={20} />
              <h3 className={styles.sectionTitle}>Instruksi Pembayaran</h3>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Informasi Rekening / Metode Pembayaran</label>
              <textarea
                name="payment_instructions"
                value={formData.payment_instructions}
                onChange={handleChange}
                rows={4}
                className={`${styles.input} ${styles.textarea}`}
              />
              <p className={styles.hint}>Instruksi ini akan ditampilkan kepada kustomer setelah mereka melakukan booking.</p>
            </div>
          </div>

          {/* Section: Informasi & Kebijakan Default */}
          <div className={`${styles.section} ${styles.sectionBorder}`}>
            <div className={styles.sectionHeader}>
              <Info size={20} />
              <h3 className={styles.sectionTitle}>Informasi & Kebijakan Default (Global)</h3>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Informasi Penting (Default)</label>
              <textarea
                name="global_informasi_penting"
                value={formData.global_informasi_penting}
                onChange={handleChange}
                rows={4}
                className={`${styles.input} ${styles.textarea}`}
                placeholder="Tulis setiap poin di baris baru..."
              />
              <p className={styles.hint}>Ini akan digunakan pada semua paket yang tidak memiliki Informasi Penting custom.</p>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Kebijakan Pembatalan & Pengembalian Dana (Default)</label>
              <textarea
                name="global_kebijakan_pembatalan"
                value={formData.global_kebijakan_pembatalan}
                onChange={handleChange}
                rows={4}
                className={`${styles.input} ${styles.textarea}`}
                placeholder="Tulis setiap poin di baris baru..."
              />
              <p className={styles.hint}>Ini akan digunakan pada semua paket yang tidak memiliki Kebijakan Pembatalan custom.</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Opsi Penjemputan (Default)</label>
              <textarea
                name="global_opsi_penjemputan"
                value={formData.global_opsi_penjemputan}
                onChange={handleChange}
                rows={4}
                className={`${styles.input} ${styles.textarea}`}
                placeholder="Tulis setiap poin di baris baru..."
              />
              <p className={styles.hint}>Ini akan digunakan pada semua paket yang tidak memiliki Opsi Penjemputan custom.</p>
            </div>
          </div>

        </form>
      </div>
    </div>
  )
}
