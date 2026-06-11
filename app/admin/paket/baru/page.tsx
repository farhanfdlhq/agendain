"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Loader2, Image as ImageIcon, X } from "lucide-react"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'durasi' ? Number(value) : value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: name === 'destinasiId' ? Number(value) : value
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
    if (!formData.nama || !formData.destinasiId || !formData.hargaString) {
      toast.error("Mohon lengkapi data wajib (Nama, Destinasi, Harga)")
      return
    }

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
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/paket">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Tambah Paket Baru</h2>
            <p className="text-muted-foreground text-sm">Isi detail informasi untuk paket perjalanan baru.</p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={loading || uploadingImage}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Simpan Paket
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Dasar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Paket</Label>
                <Input 
                  id="nama"
                  name="nama" 
                  placeholder="Contoh: Romantic Paris 5 Days"
                  value={formData.nama}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL) <span className="text-muted-foreground font-normal ml-1">Opsional</span></Label>
                <Input 
                  id="slug"
                  name="slug" 
                  placeholder="romantic-paris-5-days"
                  value={formData.slug}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground">Biarkan kosong untuk generate otomatis dari nama.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deskripsi">Deskripsi Paket</Label>
                <Textarea 
                  id="deskripsi"
                  name="deskripsi" 
                  placeholder="Tuliskan deskripsi menarik tentang perjalanan ini..."
                  rows={6}
                  value={formData.deskripsi}
                  onChange={handleChange}
                  required 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fasilitas & Layanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fasilitasText">Fasilitas Utama</Label>
                <Textarea 
                  id="fasilitasText"
                  name="fasilitasText" 
                  placeholder="Hotel Bintang 4&#10;Transportasi Bus Private&#10;Guide Berbahasa Indonesia"
                  rows={4}
                  value={formData.fasilitasText}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground">Tulis setiap fasilitas di baris baru (Enter).</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="termasukText">Termasuk (Included)</Label>
                  <Textarea 
                    id="termasukText"
                    name="termasukText" 
                    placeholder="Tiket Pesawat PP&#10;Visa Schengen&#10;Makan 3x Sehari"
                    rows={4}
                    value={formData.termasukText}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tidakTermasukText">Tidak Termasuk (Excluded)</Label>
                  <Textarea 
                    id="tidakTermasukText"
                    name="tidakTermasukText" 
                    placeholder="Asuransi Perjalanan&#10;Pengeluaran Pribadi&#10;Tipping"
                    rows={4}
                    value={formData.tidakTermasukText}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Itinerary Perjalanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.itinerary.map((it, idx) => (
                <div key={idx} className="p-4 border rounded-lg bg-muted/20 relative">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-sm">Hari {idx + 1}</h4>
                    {formData.itinerary.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setFormData(prev => ({ ...prev, itinerary: prev.itinerary.filter((_, i) => i !== idx) }))}
                        className="h-8 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        Hapus
                      </Button>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Judul Tempat/Aktivitas</Label>
                      <Input 
                        type="text" 
                        value={it.judul} 
                        placeholder="Contoh: Sydney to Snowy Mountains" 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const newItinerary = [...formData.itinerary];
                          newItinerary[idx].judul = e.target.value;
                          setFormData(prev => ({ ...prev, itinerary: newItinerary }));
                        }} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Deskripsi</Label>
                      <Textarea 
                        rows={3} 
                        value={it.deskripsi} 
                        placeholder="Deskripsi perjalanan..." 
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                          const newItinerary = [...formData.itinerary];
                          newItinerary[idx].deskripsi = e.target.value;
                          setFormData(prev => ({ ...prev, itinerary: newItinerary }));
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button 
                variant="outline" 
                className="w-full border-dashed"
                onClick={() => setFormData(prev => ({ ...prev, itinerary: [...prev.itinerary, { judul: '', deskripsi: '' }] }))}
              >
                <Plus className="mr-2 h-4 w-4" /> Tambah Hari
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kebijakan & Informasi Custom <span className="text-muted-foreground font-normal">(Opsional)</span></CardTitle>
              <CardDescription>Biarkan kosong jika ingin menggunakan pengaturan global.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="informasiPentingText">Informasi Penting</Label>
                <Textarea 
                  id="informasiPentingText"
                  name="informasiPentingText" 
                  placeholder="Tulis poin-poin di baris baru..."
                  rows={4}
                  value={formData.informasiPentingText}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kebijakanPembatalanText">Kebijakan Pembatalan</Label>
                <Textarea 
                  id="kebijakanPembatalanText"
                  name="kebijakanPembatalanText" 
                  placeholder="Tulis poin-poin di baris baru..."
                  rows={4}
                  value={formData.kebijakanPembatalanText}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label>File & Dokumen</Label>
                <p className="text-xs text-muted-foreground mb-2">Format didukung: PDF, DOC. Maks: 10MB. Maks jumlah: 3.</p>
                <div className="space-y-2">
                  <Input 
                    type="file" 
                    accept=".pdf,.doc,.docx"
                    multiple
                    onChange={handleDocUpload}
                    className="hidden"
                    id="upload-paket-doc"
                  />
                  <Label 
                    htmlFor="upload-paket-doc" 
                    className="flex items-center justify-center w-full py-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    {uploadingDoc ? 'Mengupload...' : '+ Klik untuk Upload Dokumen'}
                  </Label>
                  
                  {formData.fileDokumenList.length > 0 && (
                    <div className="space-y-2 mt-4">
                      {formData.fileDokumenList.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-md bg-background">
                          <span className="text-sm font-medium truncate max-w-[80%]">{doc.name}</span>
                          <Button variant="ghost" size="icon" onClick={() => removeDoc(idx)} className="h-8 w-8 text-destructive">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="opsiPenjemputanText">Opsi Penjemputan</Label>
                <Textarea 
                  id="opsiPenjemputanText"
                  name="opsiPenjemputanText" 
                  placeholder="Tulis poin-poin di baris baru..."
                  rows={4}
                  value={formData.opsiPenjemputanText}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media & Gambar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input 
                  type="file" 
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="upload-foto"
                />
                <Label 
                  htmlFor="upload-foto" 
                  className="flex flex-col items-center justify-center w-full py-12 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors bg-muted/20"
                >
                  {uploadingImage ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-primary mb-2" />
                  )}
                  <span className="text-sm font-medium">
                    {uploadingImage ? 'Mengupload gambar...' : 'Klik untuk memilih banyak gambar'}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">Maks 2MB/file</span>
                </Label>
                
                {formData.fotoUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                    {formData.fotoUrls.map((url, idx) => (
                      <div key={idx} className={`relative aspect-square rounded-lg overflow-hidden border ${idx === 0 ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}>
                        <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <div className="absolute bottom-0 inset-x-0 bg-background/80 backdrop-blur-sm text-[10px] font-medium text-center py-1">
                            Thumbnail
                          </div>
                        )}
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-1 right-1 h-6 w-6 rounded-full"
                          onClick={() => removeImage(idx)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Detail Penjualan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status Publikasi</Label>
                <Select value={formData.status} onValueChange={(val: string) => handleSelectChange('status', val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft (Disembunyikan)</SelectItem>
                    <SelectItem value="published">Published (Ditampilkan)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Label <span className="text-muted-foreground font-normal ml-1">Opsional</span></Label>
                <Select value={formData.label || "none"} onValueChange={(val: string) => handleSelectChange('label', val === "none" ? "" : val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak ada label</SelectItem>
                    <SelectItem value="Terlaris">Terlaris</SelectItem>
                    <SelectItem value="Populer">Populer</SelectItem>
                    <SelectItem value="Promo">Promo</SelectItem>
                    <SelectItem value="Terbaru">Terbaru</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Destinasi Negara</Label>
                <Select 
                  value={formData.destinasiId ? String(formData.destinasiId) : undefined} 
                  onValueChange={(val: string) => handleSelectChange('destinasiId', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="-- Pilih Destinasi --" />
                  </SelectTrigger>
                  <SelectContent>
                    {fetchingDest ? (
                      <SelectItem value="loading" disabled>Memuat destinasi...</SelectItem>
                    ) : (
                      destinations.map(d => (
                        <SelectItem key={d.id} value={String(d.id)}>{d.nama}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="durasi">Durasi (Hari)</Label>
                <Input 
                  type="number" 
                  id="durasi"
                  name="durasi" 
                  min="1"
                  value={formData.durasi}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="harga">Harga Dasar (Rp)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">Rp</span>
                  <Input 
                    type="text" 
                    id="harga"
                    name="harga" 
                    placeholder="15.000.000"
                    className="pl-9"
                    value={formData.hargaString}
                    onChange={handleHargaChange}
                    required 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
