"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Image as ImageIcon, X, Plus } from "lucide-react"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AirplaneLoader from "@/components/ui/airplane-loader"
import { MediaPickerMultiple } from "@/components/ui/media-picker-multiple"

export default function TambahPaketPage() {
  const router = useRouter()
  const [destinations, setDestinations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingDest, setFetchingDest] = useState(true)

  const [formData, setFormData] = useState({
    nama: "",
    namaEn: "",
    slug: "",
    destinasiId: "",
    durasi: 1,
    hargaString: "",
    deskripsi: "",
    deskripsiEn: "",
    fotoUrls: [] as string[],
    status: "draft",
    label: "",
    fasilitasText: "",
    fasilitasTextEn: "",
    termasukText: "",
    termasukTextEn: "",
    tidakTermasukText: "",
    tidakTermasukTextEn: "",
    informasiPentingText: "",
    informasiPentingTextEn: "",
    kebijakanPembatalanText: "",
    kebijakanPembatalanTextEn: "",
    fileDokumenList: [] as { name: string, url: string }[],
    opsiPenjemputanText: "",
    opsiPenjemputanTextEn: "",
    itinerary: [{ judul: "", deskripsi: "", judulEn: "", deskripsiEn: "" }] as { judul: string, deskripsi: string, judulEn?: string, deskripsiEn?: string }[]
  })

  // Tab bahasa: field bahasa-netral (foto, harga, durasi, slug, dokumen, status)
  // hanya muncul di tab ID karena nilainya dipakai bersama kedua bahasa.
  const [activeTab, setActiveTab] = useState<'id' | 'en'>('id')
  const tf = (name: string) => (activeTab === 'en' ? `${name}En` : name)
  const fv = (name: string) => ((formData as any)[tf(name)] ?? '') as string
  // Di tab EN, nilai Indonesia dipasang sebagai placeholder: itulah yang akan
  // dipakai halaman publik bila field EN dibiarkan kosong.
  const ph = (name: string, idPlaceholder: string) =>
    activeTab === 'en' ? ((formData as any)[name] || idPlaceholder) : idPlaceholder

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

  // Image upload and removal is now handled internally by MediaPickerMultiple.

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
      const lines = (s: string) => s.split('\n').filter(v => v.trim());
      // Field EN kosong dikirim sebagai null agar halaman publik jatuh ke versi Indonesia.
      const optionalLines = (s: string) => (s.trim() ? lines(s) : null);

      const fasilitas = lines(formData.fasilitasText);
      const termasuk = lines(formData.termasukText);
      const tidakTermasuk = lines(formData.tidakTermasukText);
      const informasiPenting = optionalLines(formData.informasiPentingText);
      const kebijakanPembatalan = optionalLines(formData.kebijakanPembatalanText);
      const fileDokumen = formData.fileDokumenList.length > 0 ? formData.fileDokumenList : null;
      const opsiPenjemputan = optionalLines(formData.opsiPenjemputanText);

      const itinerary = formData.itinerary.map((it, idx) => ({
        hari: idx + 1,
        judul: it.judul || `Hari ${idx + 1}`,
        deskripsi: it.deskripsi
      }));

      // Itinerary EN memakai jumlah baris yang sama dengan versi Indonesia
      // (satu array di form), jadi kedua bahasa tidak bisa berbeda jumlah hari.
      const hasItineraryEn = formData.itinerary.some(it => (it.judulEn || '').trim() || (it.deskripsiEn || '').trim())
      const itineraryEn = hasItineraryEn
        ? formData.itinerary.map((it, idx) => ({
            hari: idx + 1,
            judul: it.judulEn?.trim() || it.judul || `Day ${idx + 1}`,
            deskripsi: it.deskripsiEn?.trim() || it.deskripsi
          }))
        : null;

      const payload = {
        nama: formData.nama,
        namaEn: formData.namaEn || null,
        slug: formData.slug,
        destinasiId: formData.destinasiId,
        durasi: formData.durasi,
        harga: hargaNum,
        deskripsi: formData.deskripsi,
        deskripsiEn: formData.deskripsiEn || null,
        status: formData.status,
        label: formData.label || null,
        foto: {
          medium: formData.fotoUrls[0] || "",
          large: formData.fotoUrls[0] || "",
          thumb: formData.fotoUrls[0] || "",
          gallery: formData.fotoUrls
        },
        itinerary,
        itineraryEn,
        fasilitas,
        fasilitasEn: optionalLines(formData.fasilitasTextEn),
        termasuk,
        termasukEn: optionalLines(formData.termasukTextEn),
        tidakTermasuk,
        tidakTermasukEn: optionalLines(formData.tidakTermasukTextEn),
        informasiPenting,
        informasiPentingEn: optionalLines(formData.informasiPentingTextEn),
        kebijakanPembatalan,
        kebijakanPembatalanEn: optionalLines(formData.kebijakanPembatalanTextEn),
        fileDokumen,
        opsiPenjemputan,
        opsiPenjemputanEn: optionalLines(formData.opsiPenjemputanTextEn)
      }

      const res = await fetch("/api/open-trip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        toast.success("Paket berhasil ditambahkan!");
        router.push("/admin/open-trip")
        router.refresh()
      } else {
        toast.error("Gagal menambahkan openTrip. Pastikan data terisi dengan benar.")
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
            <Link href="/admin/open-trip">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Tambah Paket Baru</h2>
            <p className="text-muted-foreground text-sm">Isi detail informasi untuk paket perjalanan baru.</p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? <AirplaneLoader className="mr-2 h-4 w-4 " /> : <Save className="mr-2 h-4 w-4" />}
          Simpan Paket
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant={activeTab === 'id' ? 'default' : 'outline'}
          onClick={() => setActiveTab('id')}
          className="gap-2 rounded-full font-medium h-9 px-5 shadow-2xs text-xs sm:text-sm cursor-pointer"
        >
          <img src="/flags/id.png" alt="ID" width={20} height={15} className="rounded-xs object-cover" />
          Indonesia
        </Button>
        <Button
          type="button"
          variant={activeTab === 'en' ? 'default' : 'outline'}
          onClick={() => setActiveTab('en')}
          className="gap-2 rounded-full font-medium h-9 px-5 shadow-2xs text-xs sm:text-sm cursor-pointer"
        >
          <img src="/flags/en.png" alt="EN" width={20} height={15} className="rounded-xs object-cover" />
          English
        </Button>
      </div>
      {activeTab === 'en' && (
        <p className="text-xs text-muted-foreground -mt-3">
          Field yang dibiarkan kosong otomatis memakai teks Indonesia (ditampilkan sebagai placeholder). Gambar, harga, durasi, dan dokumen dipakai bersama kedua bahasa — atur di tab Indonesia.
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b-2 border-border pb-5 mb-5">
              <CardTitle>Informasi Dasar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Paket</Label>
                <Input
                  id="nama"
                  name={tf('nama')}
                  placeholder={ph('nama', 'Contoh: Romantic Paris 5 Days')}
                  value={fv('nama')}
                  onChange={handleChange}
                  required
                />
              </div>

              {activeTab === 'id' && (
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
              )}

              <div className="space-y-2">
                <Label htmlFor="deskripsi">Deskripsi Paket</Label>
                <Textarea
                  id="deskripsi"
                  name={tf('deskripsi')}
                  placeholder={ph('deskripsi', 'Tuliskan deskripsi menarik tentang perjalanan ini...')}
                  rows={6}
                  value={fv('deskripsi')}
                  onChange={handleChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b-2 border-border pb-5 mb-5">
              <CardTitle>Fasilitas & Layanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fasilitasText">Fasilitas Utama</Label>
                <Textarea
                  id="fasilitasText"
                  name={tf('fasilitasText')}
                  placeholder={ph('fasilitasText', 'Hotel Bintang 4\nTransportasi Bus Private\nGuide Berbahasa Indonesia')}
                  rows={4}
                  value={fv('fasilitasText')}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground">Tulis setiap fasilitas di baris baru (Enter).</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="termasukText">Termasuk (Included)</Label>
                  <Textarea
                    id="termasukText"
                    name={tf('termasukText')}
                    placeholder={ph('termasukText', 'Tiket Pesawat PP\nVisa Schengen\nMakan 3x Sehari')}
                    rows={4}
                    value={fv('termasukText')}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tidakTermasukText">Tidak Termasuk (Excluded)</Label>
                  <Textarea
                    id="tidakTermasukText"
                    name={tf('tidakTermasukText')}
                    placeholder={ph('tidakTermasukText', 'Asuransi Perjalanan\nPengeluaran Pribadi\nTipping')}
                    rows={4}
                    value={fv('tidakTermasukText')}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b-2 border-border pb-5 mb-5">
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
                        value={(activeTab === 'en' ? it.judulEn : it.judul) || ''}
                        placeholder={activeTab === 'en' ? (it.judul || 'Contoh: Sydney to Snowy Mountains') : 'Contoh: Sydney to Snowy Mountains'}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const newItinerary = [...formData.itinerary];
                          newItinerary[idx] = { ...newItinerary[idx], [activeTab === 'en' ? 'judulEn' : 'judul']: e.target.value };
                          setFormData(prev => ({ ...prev, itinerary: newItinerary }));
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Deskripsi</Label>
                      <Textarea
                        rows={3}
                        value={(activeTab === 'en' ? it.deskripsiEn : it.deskripsi) || ''}
                        placeholder={activeTab === 'en' ? (it.deskripsi || 'Deskripsi perjalanan...') : 'Deskripsi perjalanan...'}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                          const newItinerary = [...formData.itinerary];
                          newItinerary[idx] = { ...newItinerary[idx], [activeTab === 'en' ? 'deskripsiEn' : 'deskripsi']: e.target.value };
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
                onClick={() => setFormData(prev => ({ ...prev, itinerary: [...prev.itinerary, { judul: '', deskripsi: '', judulEn: '', deskripsiEn: '' }] }))}
              >
                <Plus className="mr-2 h-4 w-4" /> Tambah Hari
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b-2 border-border pb-5 mb-5">
              <CardTitle>Kebijakan & Informasi Custom <span className="text-muted-foreground font-normal">(Opsional)</span></CardTitle>
              <CardDescription>Biarkan kosong jika ingin menggunakan pengaturan global.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="informasiPentingText">Informasi Penting</Label>
                <Textarea
                  id="informasiPentingText"
                  name={tf('informasiPentingText')}
                  placeholder={ph('informasiPentingText', 'Tulis poin-poin di baris baru...')}
                  rows={4}
                  value={fv('informasiPentingText')}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kebijakanPembatalanText">Kebijakan Pembatalan</Label>
                <Textarea
                  id="kebijakanPembatalanText"
                  name={tf('kebijakanPembatalanText')}
                  placeholder={ph('kebijakanPembatalanText', 'Tulis poin-poin di baris baru...')}
                  rows={4}
                  value={fv('kebijakanPembatalanText')}
                  onChange={handleChange}
                />
              </div>

              {activeTab === 'id' && (
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
              )}

              <div className="space-y-2 mt-4">
                <Label htmlFor="opsiPenjemputanText">Opsi Penjemputan</Label>
                <Textarea
                  id="opsiPenjemputanText"
                  name={tf('opsiPenjemputanText')}
                  placeholder={ph('opsiPenjemputanText', 'Tulis poin-poin di baris baru...')}
                  rows={4}
                  value={fv('opsiPenjemputanText')}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          {activeTab === 'id' && (
          <Card>
            <CardHeader className="border-b-2 border-border pb-5 mb-5">
              <CardTitle>Media & Gambar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <MediaPickerMultiple
                  values={formData.fotoUrls}
                  onChange={(urls) => setFormData(prev => ({ ...prev, fotoUrls: urls }))}
                />
              </div>
            </CardContent>
          </Card>
          )}
        </div>

        {activeTab === 'id' && (
        <div className="space-y-6">
          <Card className="sticky top-24">
            <CardHeader className="border-b-2 border-border pb-5 mb-5">
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
        )}
      </div>
    </div>
  )
}
