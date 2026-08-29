"use client"

import { useState, useEffect, use } from "react"
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
import { parseAkomodasi, parsePenerbangan, stringifyAkomodasi, stringifyPenerbangan } from "@/lib/open-trip-fields"

export default function EditPaketPage(props: { params: Promise<{ slug: string }> }) {
  const params = use(props.params)
  const router = useRouter()
  const [destinations, setDestinations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingDest, setFetchingDest] = useState(true)
  const [fetchingPkg, setFetchingPkg] = useState(true)

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
    tanggalKeberangkatan: "",
    kuota: "",
    kursiTerisi: "",
    akomodasiText: "",
    akomodasiTextEn: "",
    penerbanganText: "",
    penerbanganTextEn: "",
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
      const res = await fetch(`/api/open-trip/${params.slug}`)
      if (res.ok) {
        const data = await res.json()

        const joinLines = (v: any) => Array.isArray(v) ? v.join('\n') : ''
        const fasilitasText = joinLines(data.fasilitas)
        const termasukText = joinLines(data.termasuk)
        const tidakTermasukText = joinLines(data.tidakTermasuk)
        const informasiPentingText = joinLines(data.informasiPenting)
        const kebijakanPembatalanText = joinLines(data.kebijakanPembatalan)
        const fileDokumenList = Array.isArray(data.fileDokumen) ? data.fileDokumen : []
        // <input type="date"> hanya menerima YYYY-MM-DD; DB mengirim ISO penuh.
        const tanggalKeberangkatan = data.tanggalKeberangkatan
          ? String(data.tanggalKeberangkatan).slice(0, 10)
          : ""

        const galleryArray = Array.isArray(data.foto?.gallery)
          ? data.foto.gallery
          : (data.foto?.medium ? [data.foto.medium] : []);

        // Itinerary ID & EN digabung baris demi baris ke satu array agar jumlah hari
        // kedua bahasa selalu sama.
        const itinEn: any[] = Array.isArray(data.itineraryEn) ? data.itineraryEn : []
        let initialItinerary = []
        if (Array.isArray(data.itinerary) && data.itinerary.length > 0) {
          initialItinerary = data.itinerary.map((i: any, idx: number) => ({
            judul: i.judul || '',
            deskripsi: i.deskripsi || i.desc || '',
            judulEn: itinEn[idx]?.judul || '',
            deskripsiEn: itinEn[idx]?.deskripsi || itinEn[idx]?.desc || ''
          }))
        } else {
          initialItinerary = [{ judul: '', deskripsi: '', judulEn: '', deskripsiEn: '' }]
        }

        setFormData({
          nama: data.nama || "",
          namaEn: data.namaEn || "",
          slug: data.slug || "",
          destinasiId: data.destinasiId || "",
          durasi: data.durasi || 1,
          hargaString: new Intl.NumberFormat('id-ID').format(data.harga || 0),
          deskripsi: data.deskripsi || "",
          deskripsiEn: data.deskripsiEn || "",
          fotoUrls: galleryArray,
          status: data.status || "draft",
          label: data.label || "",
          fasilitasText,
          fasilitasTextEn: joinLines(data.fasilitasEn),
          termasukText,
          termasukTextEn: joinLines(data.termasukEn),
          tidakTermasukText,
          tidakTermasukTextEn: joinLines(data.tidakTermasukEn),
          informasiPentingText,
          informasiPentingTextEn: joinLines(data.informasiPentingEn),
          kebijakanPembatalanText,
          kebijakanPembatalanTextEn: joinLines(data.kebijakanPembatalanEn),
          fileDokumenList,
          tanggalKeberangkatan,
          kuota: data.kuota === null || data.kuota === undefined ? "" : String(data.kuota),
          kursiTerisi: data.kursiTerisi === null || data.kursiTerisi === undefined ? "" : String(data.kursiTerisi),
          akomodasiText: stringifyAkomodasi(data.akomodasi),
          akomodasiTextEn: stringifyAkomodasi(data.akomodasiEn),
          penerbanganText: stringifyPenerbangan(data.penerbangan),
          penerbanganTextEn: stringifyPenerbangan(data.penerbanganEn),
          itinerary: initialItinerary
        })
      } else {
        toast.error("Paket tidak ditemukan")
        router.push("/admin/open-trip")
      }
    } catch (err) {
      console.error(err)
      toast.error("Gagal mengambil data paket")
    } finally {
      setFetchingPkg(false)
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

  // Field wajib yang bordernya memerah bila kosong/salah saat disimpan.
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const clearError = (name: string) =>
    setErrors(prev => (prev[name] ? { ...prev, [name]: false } : prev))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    clearError(name)
    setFormData(prev => ({
      ...prev,
      [name]: name === 'durasi' ? Number(value) : value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    clearError(name)
    setFormData(prev => ({
      ...prev,
      [name]: name === 'destinasiId' ? Number(value) : value
    }))
  }

  const handleHargaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearError('hargaString')
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
    // Kumpulkan SEMUA field wajib yang bermasalah sekaligus → border merah.
    const fieldErrors: Record<string, boolean> = {
      nama: !formData.nama.trim(),
      deskripsi: !formData.deskripsi.trim(),
      destinasiId: !formData.destinasiId,
      hargaString: !formData.hargaString.trim(),
      durasi: !formData.durasi || Number(formData.durasi) < 1,
      tanggalKeberangkatan: !formData.tanggalKeberangkatan,
      kuota: formData.kuota === "" || Number(formData.kuota) < 1,
    }
    // Tiap hari itinerary wajib punya deskripsi (ID). Judul opsional — jatuh ke
    // "Hari N" bila kosong. Versi EN opsional (jatuh ke ID).
    formData.itinerary.forEach((it, idx) => {
      fieldErrors[`itinerary-${idx}-deskripsi`] = !(it.deskripsi || '').trim()
    })
    if (Object.values(fieldErrors).some(Boolean)) {
      setErrors(fieldErrors)
      toast.error("Ada field wajib yang belum benar. Cek bagian bertanda merah.")
      return
    }
    setErrors({})

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
      const akomodasi = parseAkomodasi(formData.akomodasiText);
      const penerbangan = parsePenerbangan(formData.penerbanganText);

      const itinerary = formData.itinerary.map((it, idx) => ({
        hari: idx + 1,
        judul: it.judul || `Hari ${idx + 1}`,
        deskripsi: it.deskripsi
      }));

      // Itinerary EN memakai jumlah baris yang sama dengan versi Indonesia.
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
        tanggalKeberangkatan: formData.tanggalKeberangkatan || null,
        kuota: formData.kuota === "" ? null : Number(formData.kuota),
        kursiTerisi: formData.kursiTerisi === "" ? 0 : Number(formData.kursiTerisi),
        akomodasi,
        akomodasiEn: parseAkomodasi(formData.akomodasiTextEn),
        penerbangan,
        penerbanganEn: parsePenerbangan(formData.penerbanganTextEn)
      }

      const res = await fetch(`/api/open-trip/${params.slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        toast.success("Paket berhasil diperbarui!");
        router.push("/admin/open-trip")
        router.refresh()
      } else {
        toast.error("Gagal memperbarui openTrip. Pastikan data terisi dengan benar.")
      }
    } catch (error) {
      console.error(error)
      toast.error("Terjadi kesalahan pada server")
    } finally {
      setLoading(false)
    }
  }

  if (fetchingPkg) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <AirplaneLoader className="h-8 w-8  text-primary" />
      </div>
    )
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
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Edit Paket: {formData.nama || params.slug}</h2>
            <p className="text-muted-foreground text-sm">Perbarui detail informasi paket perjalanan.</p>
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
          {activeTab === 'id' && (
          <Card>
            <CardHeader className="border-b-2 border-border pb-5 mb-5">
              <CardTitle>Media & Gambar</CardTitle>
              <CardDescription>
                Foto pertama otomatis jadi thumbnail. Rekomendasi: rasio lanskap 3:2,
                mis. <strong>1600×1067px</strong> (min. 1200×800px), format JPG/PNG/WEBP, maks 10MB/file.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <MediaPickerMultiple
                  values={formData.fotoUrls}
                  onChange={(urls) => setFormData(prev => ({ ...prev, fotoUrls: urls }))}
                  description="Rasio lanskap 3:2 · JPG/PNG/WEBP · Maks 10MB/file"
                />
              </div>
            </CardContent>
          </Card>
          )}

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
                  aria-invalid={!!errors.nama}
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
                  aria-invalid={!!errors.deskripsi}
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
                        aria-invalid={!!errors[`itinerary-${idx}-deskripsi`]}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                          const newItinerary = [...formData.itinerary];
                          newItinerary[idx] = { ...newItinerary[idx], [activeTab === 'en' ? 'deskripsiEn' : 'deskripsi']: e.target.value };
                          setFormData(prev => ({ ...prev, itinerary: newItinerary }));
                          if (activeTab !== 'en') clearError(`itinerary-${idx}-deskripsi`);
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

              <div className="grid gap-4 sm:grid-cols-2 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="akomodasiText">Akomodasi</Label>
                  <Textarea
                    id="akomodasiText"
                    name={tf('akomodasiText')}
                    placeholder={ph('akomodasiText', 'Satu hotel per baris:\nOsaka | Nishikasai Flower Hotel')}
                    rows={5}
                    value={fv('akomodasiText')}
                    onChange={handleChange}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Format: <code>Kota | Nama Hotel</code>. Tanpa <code>|</code> juga boleh.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="penerbanganText">Penerbangan</Label>
                  <Textarea
                    id="penerbanganText"
                    name={tf('penerbanganText')}
                    placeholder={ph('penerbanganText', 'Satu rute per baris:\nJakarta → Osaka | MH720 CGK-KUL 15:40 | Malaysia Airlines')}
                    rows={5}
                    value={fv('penerbanganText')}
                    onChange={handleChange}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Format: <code>Rute | Detail | Maskapai</code>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

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

              {/* Kuota & Kursi Terisi dinaikkan ke atas: paling sering disunting
                  (update sisa kursi saat ada booking), jadi tak perlu scroll. */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="kuota">Kuota Peserta</Label>
                  <Input
                    type="number"
                    id="kuota"
                    name="kuota"
                    min="1"
                    placeholder="20"
                    value={formData.kuota}
                    onChange={handleChange}
                    aria-invalid={!!errors.kuota}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kursiTerisi">Kursi Terisi</Label>
                  <Input
                    type="number"
                    id="kursiTerisi"
                    name="kursiTerisi"
                    min="0"
                    placeholder="0"
                    value={formData.kursiTerisi}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground -mt-2">
                Kuota wajib. Kursi Terisi = peserta luar website (WhatsApp/offline); booking
                website <strong>Lunas</strong> dihitung otomatis. Sisa = kuota &minus; terisi &minus; Lunas.
              </p>

              <div className="space-y-2">
                <Label>Label <span className="text-muted-foreground font-normal ml-1">Opsional</span></Label>
                <Select value={formData.label || "none"} onValueChange={(val) => handleSelectChange('label', val === "none" ? "" : val)}>
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
                  onValueChange={(val) => handleSelectChange('destinasiId', val)}
                >
                  <SelectTrigger aria-invalid={!!errors.destinasiId} className={errors.destinasiId ? 'border-destructive ring-destructive/20' : ''}>
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
                  aria-invalid={!!errors.durasi}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tanggalKeberangkatan">Tanggal Keberangkatan</Label>
                <Input
                  type="date"
                  id="tanggalKeberangkatan"
                  name="tanggalKeberangkatan"
                  value={formData.tanggalKeberangkatan}
                  onChange={handleChange}
                  aria-invalid={!!errors.tanggalKeberangkatan}
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Wajib diisi. Setiap open trip kini punya tanggal keberangkatan tetap.
                </p>
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
                    aria-invalid={!!errors.hargaString}
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
