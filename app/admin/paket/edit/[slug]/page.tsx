"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Loader2, Image as ImageIcon } from "lucide-react"
import { toast } from "react-hot-toast"
import styles from "./page.module.css"

import { use } from "react"
// ...
export default function EditPaketPage(props: { params: Promise<{ slug: string }> }) {
  const params = use(props.params)
  const router = useRouter()
  const [destinations, setDestinations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingDest, setFetchingDest] = useState(true)
  const [fetchingPkg, setFetchingPkg] = useState(true)

  const [formData, setFormData] = useState({
    nama: "",
    slug: "",
    destinasiId: "",
    durasi: 1,
    hargaString: "",
    deskripsi: "",
    fotoUrls: [] as string[],
    status: "draft",
    label: "",
    fasilitasText: "",
    termasukText: "",
    tidakTermasukText: "",
    informasiPentingText: "",
    kebijakanPembatalanText: "",
    fileDokumenList: [] as { name: string, url: string }[],
    opsiPenjemputanText: "",
    itinerary: [{ judul: "", deskripsi: "" }] as { judul: string, deskripsi: string }[]
  })

  useEffect(() => {
    fetchDestinations()
    fetchPackageData()
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

  const fetchPackageData = async () => {
    try {
      const res = await fetch(`/api/paket/${params.slug}`)
      if (res.ok) {
        const data = await res.json()
        
        const fasilitasText = Array.isArray(data.fasilitas) ? data.fasilitas.join('\n') : ''
        const termasukText = Array.isArray(data.termasuk) ? data.termasuk.join('\n') : ''
        const tidakTermasukText = Array.isArray(data.tidakTermasuk) ? data.tidakTermasuk.join('\n') : ''
        const informasiPentingText = Array.isArray(data.informasiPenting) ? data.informasiPenting.join('\n') : ''
        const kebijakanPembatalanText = Array.isArray(data.kebijakanPembatalan) ? data.kebijakanPembatalan.join('\n') : ''
        const fileDokumenList = Array.isArray(data.fileDokumen) ? data.fileDokumen : []
        const opsiPenjemputanText = Array.isArray(data.opsiPenjemputan) ? data.opsiPenjemputan.join('\n') : ''
        
        const galleryArray = Array.isArray(data.foto?.gallery) 
          ? data.foto.gallery 
          : (data.foto?.medium ? [data.foto.medium] : []);
        
        let initialItinerary = []
        if (Array.isArray(data.itinerary) && data.itinerary.length > 0) {
          initialItinerary = data.itinerary.map((i: any) => ({
            judul: i.judul || '',
            deskripsi: i.deskripsi || i.desc || ''
          }))
        } else {
          // fallback if empty
          initialItinerary = [{ judul: '', deskripsi: '' }]
        }

        setFormData({
          nama: data.nama || "",
          slug: data.slug || "",
          destinasiId: data.destinasiId || "",
          durasi: data.durasi || 1,
          hargaString: new Intl.NumberFormat('id-ID').format(data.harga || 0),
          deskripsi: data.deskripsi || "",
          fotoUrls: galleryArray,
          status: data.status || "draft",
          label: data.label || "",
          fasilitasText,
          termasukText,
          tidakTermasukText,
          informasiPentingText,
          kebijakanPembatalanText,
          fileDokumenList,
          opsiPenjemputanText,
          itinerary: initialItinerary
        })
      } else {
        toast.error("Paket tidak ditemukan")
        router.push("/admin/paket")
      }
    } catch (err) {
      console.error(err)
      toast.error("Gagal mengambil data paket")
    } finally {
      setFetchingPkg(false)
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

  const [uploadingDoc, setUploadingDoc] = useState(false)

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    if (formData.fileDokumenList.length + files.length > 3) {
      toast.error("Maksimal hanya 3 file dokumen yang diizinkan.")
      return
    }

    setUploadingDoc(true)
    try {
      const uploadedDocs: { name: string, url: string }[] = []
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`File ${file.name} terlalu besar. Maksimal 10MB.`)
          continue
        }

        const uploadData = new FormData()
        uploadData.append('file', file)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData,
        })
        const data = await res.json()
        if (res.ok) {
          uploadedDocs.push({ name: file.name, url: data.url })
        } else {
          toast.error(`Gagal upload ${file.name}: ${data.error}`)
        }
      }
      
      if (uploadedDocs.length > 0) {
        setFormData(prev => ({ ...prev, fileDokumenList: [...prev.fileDokumenList, ...uploadedDocs] }))
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat upload dokumen.")
    } finally {
      setUploadingDoc(false)
      e.target.value = ''
    }
  }

  const removeDoc = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fileDokumenList: prev.fileDokumenList.filter((_, i) => i !== index)
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
      const informasiPenting = formData.informasiPentingText ? formData.informasiPentingText.split('\n').filter(s => s.trim()) : null;
      const kebijakanPembatalan = formData.kebijakanPembatalanText ? formData.kebijakanPembatalanText.split('\n').filter(s => s.trim()) : null;
      const fileDokumen = formData.fileDokumenList.length > 0 ? formData.fileDokumenList : null;
      const opsiPenjemputan = formData.opsiPenjemputanText ? formData.opsiPenjemputanText.split('\n').filter(s => s.trim()) : null;
      
      const itinerary = formData.itinerary.map((it, idx) => ({
        hari: idx + 1,
        judul: it.judul || `Hari ${idx + 1}`,
        deskripsi: it.deskripsi
      }));

      const payload = {
        nama: formData.nama,
        slug: formData.slug,
        destinasiId: formData.destinasiId,
        durasi: formData.durasi,
        harga: hargaNum,
        deskripsi: formData.deskripsi,
        status: formData.status,
        label: formData.label || null,
        foto: { 
          medium: formData.fotoUrls[0] || "", 
          large: formData.fotoUrls[0] || "", 
          thumb: formData.fotoUrls[0] || "",
          gallery: formData.fotoUrls 
        },
        itinerary,
        fasilitas,
        termasuk,
        tidakTermasuk,
        informasiPenting,
        kebijakanPembatalan,
        fileDokumen,
        opsiPenjemputan
      }

      const res = await fetch(`/api/paket/${params.slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        toast.success("Paket berhasil diperbarui!");
        router.push("/admin/paket")
        router.refresh()
      } else {
        toast.error("Gagal memperbarui paket. Pastikan data terisi dengan benar.")
      }
    } catch (error) {
      console.error(error)
      toast.error("Terjadi kesalahan pada server")
    } finally {
      setLoading(false)
    }
  }

  if (fetchingPkg) {
    return <div className={styles.page} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Loader2 className={styles.spinner} /></div>
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
            <h2 className={styles.title}>Edit Paket: {formData.nama || params.slug}</h2>
            <p className={styles.subtitle}>Perbarui detail informasi paket perjalanan.</p>
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
              
              <div className={styles.itineraryList}>
                {formData.itinerary.map((it, idx) => (
                  <div key={idx} style={{ padding: '16px', border: '1px solid var(--color-hairline)', borderRadius: '8px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ margin: 0 }}>Hari {idx + 1}</h4>
                      {formData.itinerary.length > 1 && (
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, itinerary: prev.itinerary.filter((_, i) => i !== idx) }))} style={{ background: 'transparent', color: 'red', border: 'none', cursor: 'pointer' }}>Hapus</button>
                      )}
                    </div>
                    <div className={styles.inputGroup} style={{ marginBottom: '12px' }}>
                      <label>Judul Tempat/Aktivitas</label>
                      <input type="text" className={styles.input} value={it.judul} placeholder="Contoh: Sydney to Snowy Mountains" onChange={(e) => {
                        const newItinerary = [...formData.itinerary];
                        newItinerary[idx].judul = e.target.value;
                        setFormData(prev => ({ ...prev, itinerary: newItinerary }));
                      }} />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Deskripsi</label>
                      <textarea className={styles.textarea} rows={3} value={it.deskripsi} placeholder="Deskripsi perjalanan..." onChange={(e) => {
                        const newItinerary = [...formData.itinerary];
                        newItinerary[idx].deskripsi = e.target.value;
                        setFormData(prev => ({ ...prev, itinerary: newItinerary }));
                      }}></textarea>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, itinerary: [...prev.itinerary, { judul: '', deskripsi: '' }] }))} style={{ padding: '10px 16px', background: 'var(--color-surface-soft)', border: '1px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>+ Tambah Hari</button>
              </div>
            </div>

            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Kebijakan & Informasi Custom (Opsional)</h3>
              <p className={styles.hint} style={{ marginBottom: '16px' }}>Biarkan kosong jika ingin menggunakan pengaturan global dari menu Pengaturan.</p>
              
              <div className={styles.inputGroup}>
                <label>Informasi Penting (Khusus Paket Ini)</label>
                <textarea 
                  name="informasiPentingText" 
                  className={styles.textarea} 
                  placeholder="Paspor minimal masa berlaku 6 bulan...&#10;Tulis poin-poin di baris baru..."
                  rows={4}
                  value={formData.informasiPentingText}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className={styles.inputGroup}>
                <label>Kebijakan Pembatalan (Khusus Paket Ini)</label>
                <textarea 
                  name="kebijakanPembatalanText" 
                  className={styles.textarea} 
                  placeholder="Pembatalan > 30 hari: Pengembalian 50%...&#10;Tulis poin-poin di baris baru..."
                  rows={4}
                  value={formData.kebijakanPembatalanText}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className={styles.inputGroup}>
                <label>File & Dokumen (Khusus Paket Ini)</label>
                <p className={styles.hint} style={{ marginBottom: '8px' }}>
                  Format didukung: PDF, DOC, DOCX. Maksimal ukuran file: 10MB. Maksimal jumlah file: 3.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx"
                    multiple
                    onChange={handleDocUpload}
                    style={{ display: 'none' }}
                    id="upload-paket-doc"
                  />
                  <label 
                    htmlFor="upload-paket-doc" 
                    style={{ cursor: 'pointer', padding: '10px 16px', background: 'var(--color-surface-soft)', border: '1px dashed var(--color-border)', borderRadius: '6px', textAlign: 'center', fontWeight: 500 }}
                  >
                    {uploadingDoc ? 'Mengupload...' : '+ Klik untuk Upload Dokumen (PDF, DOC)'}
                  </label>
                  
                  {formData.fileDokumenList.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {formData.fileDokumenList.map((doc, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'white', border: '1px solid var(--color-hairline)', borderRadius: '6px' }}>
                          <span style={{ fontSize: '0.9rem', color: 'var(--color-ink)' }}>{doc.name}</span>
                          <button type="button" onClick={() => removeDoc(idx)} style={{ color: 'red', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Opsi Penjemputan (Khusus Paket Ini)</label>
                <textarea 
                  name="opsiPenjemputanText" 
                  className={styles.textarea} 
                  placeholder="Bandara Soekarno Hatta...&#10;Tulis poin-poin di baris baru..."
                  rows={4}
                  value={formData.opsiPenjemputanText}
                  onChange={handleChange}
                ></textarea>
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
                <label>Label (Opsional)</label>
                <select name="label" className={styles.select} value={formData.label} onChange={handleChange}>
                  <option value="">Tidak ada label</option>
                  <option value="Terlaris">Terlaris</option>
                  <option value="Populer">Populer</option>
                  <option value="Promo">Promo</option>
                  <option value="Terbaru">Terbaru</option>
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
