"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Loader2, Image as ImageIcon } from "lucide-react"
import { toast } from "react-hot-toast"
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
    hargaString: "",
    deskripsi: "",
    fotoUrls: [] as string[],
    status: "draft",
    fasilitasText: "",
    termasukText: "",
    tidakTermasukText: "",
    itineraryText: ""
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

  const [uploadingImage, setUploadingImage] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploadingImage(true)
    
    try {
      const uploadedUrls: string[] = []
      
      for (const file of files) {
        const uploadData = new FormData()
        uploadData.append('file', file)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData,
        })
        const data = await res.json()
        if (res.ok) {
          uploadedUrls.push(data.url)
        } else {
          toast.error(`Gagal upload ${file.name}: ${data.error}`)
        }
      }
      
      if (uploadedUrls.length > 0) {
        setFormData(prev => ({ ...prev, fotoUrls: [...prev.fotoUrls, ...uploadedUrls] }))
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat upload gambar.")
    } finally {
      setUploadingImage(false)
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fotoUrls: prev.fotoUrls.filter((_, i) => i !== index)
    }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'durasi' || name === 'destinasiId' ? Number(value) : value
    }))
  }

  const handleHargaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    if (!rawValue) {
      setFormData(prev => ({ ...prev, hargaString: "" }));
      return;
    }
    const formatted = new Intl.NumberFormat('id-ID').format(Number(rawValue));
    setFormData(prev => ({ ...prev, hargaString: formatted }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const hargaNum = Number(formData.hargaString.replace(/\./g, ""));
      const fasilitas = formData.fasilitasText.split('\n').filter(s => s.trim());
      const termasuk = formData.termasukText.split('\n').filter(s => s.trim());
      const tidakTermasuk = formData.tidakTermasukText.split('\n').filter(s => s.trim());
      
      const itineraryRaw = formData.itineraryText.split('\n').filter(s => s.trim());
      const itinerary = itineraryRaw.map((text, idx) => ({
        hari: idx + 1,
        judul: `Hari ${idx + 1}`,
        deskripsi: text.trim()
      }));

      const payload = {
        nama: formData.nama,
        slug: formData.slug,
        destinasiId: formData.destinasiId,
        durasi: formData.durasi,
        harga: hargaNum,
        deskripsi: formData.deskripsi,
        status: formData.status,
        foto: { 
          medium: formData.fotoUrls[0] || "", 
          large: formData.fotoUrls[0] || "", 
          thumb: formData.fotoUrls[0] || "",
          gallery: formData.fotoUrls 
        },
        itinerary,
        fasilitas,
        termasuk,
        tidakTermasuk
      }

      const res = await fetch("/api/paket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        toast.success("Paket berhasil ditambahkan!");
        router.push("/admin/paket")
        router.refresh()
      } else {
        toast.error("Gagal menambahkan paket. Pastikan data terisi dengan benar.")
      }
    } catch (err) {
      toast.error("Terjadi kesalahan server.")
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
            <h2 className={styles.title}>Tambah Paket Baru</h2>
            <p className={styles.subtitle}>Isi detail informasi untuk paket perjalanan baru.</p>
          </div>
          <button 
            onClick={handleSubmit} 
            className={styles.saveBtn}
            disabled={loading || uploadingImage}
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
              <h3 className={styles.cardTitle}>Fasilitas & Layanan</h3>
              
              <div className={styles.inputGroup}>
                <label>Fasilitas Utama</label>
                <textarea 
                  name="fasilitasText" 
                  className={styles.textarea} 
                  placeholder="Hotel Bintang 4&#10;Transportasi Bus Private&#10;Guide Berbahasa Indonesia"
                  rows={4}
                  value={formData.fasilitasText}
                  onChange={handleChange}
                ></textarea>
                <span className={styles.hint}>Tulis setiap fasilitas di baris baru (Enter).</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
                <div className={styles.inputGroup}>
                  <label>Termasuk (Included)</label>
                  <textarea 
                    name="termasukText" 
                    className={styles.textarea} 
                    placeholder="Tiket Pesawat PP&#10;Visa Schengen&#10;Makan 3x Sehari"
                    rows={4}
                    value={formData.termasukText}
                    onChange={handleChange}
                  ></textarea>
                </div>
                
                <div className={styles.inputGroup}>
                  <label>Tidak Termasuk (Excluded)</label>
                  <textarea 
                    name="tidakTermasukText" 
                    className={styles.textarea} 
                    placeholder="Asuransi Perjalanan&#10;Pengeluaran Pribadi&#10;Tipping"
                    rows={4}
                    value={formData.tidakTermasukText}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Itinerary Perjalanan</h3>
              
              <div className={styles.inputGroup}>
                <label>Rencana Perjalanan per Hari</label>
                <textarea 
                  name="itineraryText" 
                  className={styles.textarea} 
                  placeholder="Penerbangan dari Jakarta ke Paris&#10;City tour Paris (Eiffel, Louvre)&#10;Perjalanan menuju Swiss"
                  rows={6}
                  value={formData.itineraryText}
                  onChange={handleChange}
                ></textarea>
                <span className={styles.hint}>Tuliskan agenda untuk setiap hari di baris baru secara berurutan. Hari ke-1 di baris 1, Hari ke-2 di baris 2, dst.</span>
              </div>
            </div>

            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Media & Gambar</h3>
              
              <div className={styles.inputGroup}>
                <label>Upload Foto (Bisa pilih banyak sekaligus)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className={styles.inputWithIcon} style={{ border: '2px dashed var(--color-border-strong)', padding: '24px', textAlign: 'center', background: 'var(--color-surface-soft)', borderRadius: 'var(--radius-lg)' }}>
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      multiple
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
                        {uploadingImage ? 'Mengupload gambar...' : 'Klik untuk memilih banyak gambar (Maks 2MB/file)'}
                      </span>
                    </label>
                  </div>
                  
                  {formData.fotoUrls.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '12px' }}>
                      {formData.fotoUrls.map((url, idx) => (
                        <div key={idx} style={{ position: 'relative', width: '100%', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: idx === 0 ? '2px solid var(--color-primary)' : '1px solid var(--color-border)' }}>
                          <img src={url} alt={`Preview ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          {idx === 0 && (
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '10px', textAlign: 'center', padding: '2px 0' }}>Thumbnail</div>
                          )}
                          <button 
                            type="button" 
                            onClick={() => removeImage(idx)}
                            style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(255,0,0,0.8)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
                  type="text" 
                  name="harga" 
                  className={styles.input} 
                  placeholder="15.000.000"
                  value={formData.hargaString}
                  onChange={handleHargaChange}
                  required 
                />
              </div>
            </div>
          </div>

          <div className={styles.formFooter}>
            <Link href="/admin/paket" className={styles.cancelBtn}>Batal</Link>
            <button onClick={handleSubmit} className={styles.saveBtn} disabled={loading || uploadingImage}>
              {loading ? <Loader2 size={18} className={styles.spinner} /> : <Save size={18} />}
              Simpan Paket
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
