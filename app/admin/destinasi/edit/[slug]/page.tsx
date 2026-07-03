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

export default function EditDestinasiPage(props: { params: Promise<{ slug: string }> }) {
  const params = use(props.params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetchingDest, setFetchingDest] = useState(true)

  const [formData, setFormData] = useState({
    nama: "",
    slug: "",
    negara: "",
    deskripsi: "",
    fotoUrl: "",
    bahasa: "",
    matauang: "",
    waktuTerbaik: "",
    infoVisa: ""
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
          negara: data.negara || "",
          deskripsi: data.deskripsi || "",
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
        negara: formData.negara,
        deskripsi: formData.deskripsi,
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
        <Button onClick={handleSubmit} disabled={loading || uploadingImage} className="w-full sm:w-auto">
          {loading ? <AirplaneLoader size={18} className="mr-2" /> : <Save size={18} className="mr-2" />}
          Simpan Perubahan
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Utama</CardTitle>
              <CardDescription>Detail inti tentang destinasi ini.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Destinasi (Kota/Wilayah)</label>
                <Input 
                  name="nama"
                  placeholder="Contoh: Paris, Swiss Alps, Cappadocia"
                  value={formData.nama} onChange={handleChange} required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Negara</label>
                <Input 
                  name="negara" 
                  placeholder="Contoh: Prancis, Swiss, Turki"
                  value={formData.negara} onChange={handleChange} required 
                />
              </div>

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

              <div className="space-y-2">
                <label className="text-sm font-medium">Deskripsi Singkat</label>
                <Textarea 
                  name="deskripsi" rows={4}
                  placeholder="Deskripsikan pesona destinasi ini..."
                  value={formData.deskripsi} onChange={handleChange} required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Upload Foto Utama</label>
                <div className="flex flex-col gap-4">
                  <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/40 transition-colors">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="upload-foto"
                    />
                    <label htmlFor="upload-foto" className="cursor-pointer flex flex-col items-center gap-2">
                      {uploadingImage ? (
                        <AirplaneLoader size={32} />
                      ) : (
                        <ImageIcon size={32} className="text-muted-foreground" />
                      )}
                      <span className="font-medium text-sm text-foreground">
                        {uploadingImage ? 'Mengupload gambar...' : 'Klik untuk memilih gambar baru'}
                      </span>
                      <span className="text-xs text-muted-foreground">PNG, JPG atau WEBP (Maks. 5MB)</span>
                    </label>
                  </div>
                  
                  {formData.fotoUrl && (
                    <div className="flex items-center gap-4 p-3 bg-muted/20 border rounded-lg">
                      <div className="w-16 h-16 rounded-md overflow-hidden relative shrink-0">
                        <img src={formData.fotoUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <p className="text-xs text-muted-foreground truncate">{formData.fotoUrl}</p>
                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-500">Berhasil diupload</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card>
            <CardHeader>
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
      </form>
    </div>
  )
}
