"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Image as ImageIcon } from "lucide-react"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import AirplaneLoader from "@/components/ui/airplane-loader"
import { MediaPicker } from "@/components/ui/media-picker"

export default function EditDestinasiPage(props: { params: Promise<{ slug: string }> }) {
  const params = use(props.params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetchingDest, setFetchingDest] = useState(true)

  const [formData, setFormData] = useState({
    nama: "",
    namaEn: "",
    slug: "",
    negara: "",
    deskripsi: "",
    deskripsiEn: "",
    fotoUrl: "",
    bahasa: "",
    matauang: "",
    waktuTerbaik: "",
    infoVisa: ""
  })

  // Hanya nama & deskripsi yang bilingual; field lain bahasa-netral (tab ID saja).
  const [activeTab, setActiveTab] = useState<'id' | 'en'>('id')
  const tf = (name: string) => (activeTab === 'en' ? `${name}En` : name)
  const fv = (name: string) => ((formData as any)[tf(name)] ?? '') as string
  const ph = (name: string, idPlaceholder: string) =>
    activeTab === 'en' ? ((formData as any)[name] || idPlaceholder) : idPlaceholder

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
          namaEn: data.namaEn || "",
          slug: data.slug || "",
          negara: data.negara || "",
          deskripsi: data.deskripsi || "",
          deskripsiEn: data.deskripsiEn || "",
          fotoUrl: data.foto?.medium || data.foto?.large || data.foto || "",
          bahasa: data.bahasa || "",
          matauang: data.matauang || "",
          waktuTerbaik: data.waktuTerbaik || "",
          infoVisa: data.infoVisa || ""
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

  // handleImageUpload is now handled internally by MediaPicker.

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
        namaEn: formData.namaEn || null,
        slug: formData.slug,
        negara: formData.negara,
        deskripsi: formData.deskripsi,
        deskripsiEn: formData.deskripsiEn || null,
        foto: { medium: formData.fotoUrl, thumb: formData.fotoUrl },
        bahasa: formData.bahasa,
        matauang: formData.matauang,
        waktuTerbaik: formData.waktuTerbaik,
        infoVisa: formData.infoVisa
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
    return (
      <div className="flex h-screen items-center justify-center">
        <AirplaneLoader size={48} className="text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="h-10 w-10 shrink-0">
            <Link href="/admin/destinasi">
              <ArrowLeft size={18} />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Edit Destinasi: {formData.nama || params.slug}</h2>
            <p className="text-muted-foreground text-sm mt-1">Perbarui detail informasi kota atau negara tujuan.</p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={loading} className="w-full sm:w-auto">
          {loading ? <AirplaneLoader size={18} className="mr-2" /> : <Save size={18} className="mr-2" />}
          Simpan Perubahan
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
          Hanya nama & deskripsi yang punya versi Inggris. Field lain (negara, foto, info turis) dipakai bersama — atur di tab Indonesia.
        </p>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader className="border-b-2 border-border pb-5 mb-5">
              <CardTitle>Informasi Utama</CardTitle>
              <CardDescription>Detail inti tentang destinasi ini.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Destinasi (Kota/Wilayah)</label>
                <Input
                  name={tf('nama')}
                  placeholder={ph('nama', 'Contoh: Paris, Swiss Alps, Cappadocia')}
                  value={fv('nama')} onChange={handleChange} required
                />
              </div>

              {activeTab === 'id' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Negara</label>
                <Input
                  name="negara"
                  placeholder="Contoh: Prancis, Swiss, Turki"
                  value={formData.negara} onChange={handleChange} required
                />
              </div>
              )}

              {activeTab === 'id' && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex justify-between">
                  Slug (URL) <span className="text-muted-foreground font-normal text-xs">Opsional</span>
                </label>
                <Input
                  name="slug"
                  placeholder="Contoh: swiss-alps"
                  value={formData.slug} onChange={handleChange}
                />
              </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Deskripsi Singkat</label>
                <Textarea
                  name={tf('deskripsi')} rows={4}
                  placeholder={ph('deskripsi', 'Deskripsikan pesona destinasi ini...')}
                  value={fv('deskripsi')} onChange={handleChange} required
                />
              </div>

              {activeTab === 'id' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Upload Foto Utama</label>
                <MediaPicker
                  value={formData.fotoUrl}
                  onChange={(url) => setFormData(prev => ({ ...prev, fotoUrl: url }))}
                />
              </div>
              )}
            </CardContent>
          </Card>
        </div>

        {activeTab === 'id' && (
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card>
            <CardHeader className="border-b-2 border-border pb-5 mb-5">
              <CardTitle>Informasi Tambahan</CardTitle>
              <CardDescription>Informasi turis untuk destinasi ini.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex justify-between">
                  Bahasa Utama <span className="text-muted-foreground font-normal text-xs">Opsional</span>
                </label>
                <Input 
                  name="bahasa"
                  placeholder="Contoh: Prancis, Inggris"
                  value={formData.bahasa} onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex justify-between">
                  Mata Uang <span className="text-muted-foreground font-normal text-xs">Opsional</span>
                </label>
                <Input 
                  name="matauang"
                  placeholder="Contoh: Euro (EUR)"
                  value={formData.matauang} onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex justify-between">
                  Waktu Terbaik <span className="text-muted-foreground font-normal text-xs">Opsional</span>
                </label>
                <Input 
                  name="waktuTerbaik"
                  placeholder="Contoh: Musim Semi"
                  value={formData.waktuTerbaik} onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex justify-between">
                  Info Visa <span className="text-muted-foreground font-normal text-xs">Opsional</span>
                </label>
                <Textarea 
                  name="infoVisa" rows={3}
                  placeholder="Butuh Visa Schengen, dll..."
                  value={formData.infoVisa} onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        )}
      </form>
    </div>
  )
}
