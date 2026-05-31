"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Loader2, Image as ImageIcon } from "lucide-react"
import { toast } from "react-hot-toast"
import styles from "../../../paket/baru/page.module.css" // Reusing form CSS

export default function EditDestinasiPage(props: { params: Promise<{ slug: string }> }) {
  const params = use(props.params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetchingDest, setFetchingDest] = useState(true)

  const [formData, setFormData] = useState({
    nama: "",
    slug: "",
    deskripsi: "",
    fotoUrl: ""
  })

  useEffect(() => {
    fetchDestinasiData()
  }, [])

  const fetchDestinasiData = async () => {
    try {
      const res = await fetch(`/api/destinasi/${params.slug}`)
      if (res.ok) {
        const data = await res.json()
        setFormData({
          nama: data.nama || "",
          slug: data.slug || "",
          deskripsi: data.deskripsi || "",
          fotoUrl: data.foto?.medium || data.foto?.large || "",
        })
      } else {
        toast.error("Destinasi tidak ditemukan")
        router.push("/admin/destinasi")
      }
    } catch (err) {
      console.error(err)
      toast.error("Gagal mengambil data destinasi")
    } finally {
      setFetchingDest(false)
    }
  }

  const [uploadingImage, setUploadingImage] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    const uploadData = new FormData()
    uploadData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      })
      const data = await res.json()
      if (res.ok) {
        setFormData(prev => ({ ...prev, fotoUrl: data.url }))
      } else {
        toast.error("Upload gagal: " + data.error)
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat upload gambar.")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        nama: formData.nama,
        slug: formData.slug,
        deskripsi: formData.deskripsi,
        foto: { medium: formData.fotoUrl, thumb: formData.fotoUrl }
      }

      const res = await fetch(`/api/destinasi/${params.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        toast.success("Destinasi berhasil diperbarui!")
        router.push("/admin/destinasi")
        router.refresh()
      } else {
        toast.error("Gagal memperbarui destinasi. Pastikan data terisi dengan benar.")
      }
    } catch (error) {
      console.error(error)
      toast.error("Terjadi kesalahan pada server")
    } finally {
      setLoading(false)
    }
  }

  if (fetchingDest) {
    return <div className={styles.page} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Loader2 className={styles.spinner} /></div>
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h2 className={styles.title}>Edit Destinasi: {formData.nama || params.slug}</h2>
            <p className={styles.subtitle}>Tambahkan kota atau negara tujuan baru.</p>
          </div>
          <button onClick={handleSubmit} className={styles.saveBtn} disabled={loading || uploadingImage}>
            {loading ? <Loader2 size={18} className={styles.spinner} /> : <Save size={18} />}
            Simpan Destinasi
          </button>
        </div>
      </div>

      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.formGrid}>
          
          <div className={styles.mainColumn} style={{ gridColumn: 'span 12' }}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Informasi Utama</h3>
              
              <div className={styles.inputGroup}>
                <label>Nama Destinasi (Kota/Wilayah/Negara)</label>
                <input 
                  type="text" name="nama" className={styles.input} 
                  placeholder="Contoh: Paris, Swiss Alps, Cappadocia"
                  value={formData.nama} onChange={handleChange} required 
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Slug (URL) <span className={styles.optional}>Opsional</span></label>
                <input 
                  type="text" name="slug" className={styles.input} 
                  placeholder="Contoh: swiss-alps"
                  value={formData.slug} onChange={handleChange}
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
                <label>Upload Foto Utama</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className={styles.inputWithIcon} style={{ border: '2px dashed var(--color-border-strong)', padding: '24px', textAlign: 'center', background: 'var(--color-surface-soft)', borderRadius: 'var(--radius-lg)' }}>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      id="upload-foto"
                    />
                    <label htmlFor="upload-foto" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      {uploadingImage ? (
                        <Loader2 size={32} className={styles.spinner} color="var(--color-primary)" />
                      ) : (
                        <ImageIcon size={32} color="var(--color-primary)" />
                      )}
                      <span style={{ fontWeight: 500, color: 'var(--color-ink)' }}>
                        {uploadingImage ? 'Mengupload gambar...' : 'Klik untuk memilih gambar'}
                      </span>
                    </label>
                  </div>
                  
                  {formData.fotoUrl && (
                    <div style={{ padding: '12px', background: 'var(--color-surface-soft)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                        <img src={formData.fotoUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{formData.fotoUrl}</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-primary)', margin: 0, fontWeight: 500 }}>Berhasil diupload</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  )
}
