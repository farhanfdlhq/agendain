"use client"

import { useState } from "react"
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

  // handleImageUpload is now handled internally by MediaPicker.

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
        toast.success("Destinasi berhasil ditambahkan!")
        router.push("/admin/destinasi")
        router.refresh()
      } else {
        toast.error("Gagal menambahkan destinasi.")
      }
    } catch (err) {
      toast.error("Terjadi kesalahan server.")
    } finally {
      setLoading(false)
    }
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
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Tambah Destinasi</h2>
            <p className="text-muted-foreground text-sm mt-1">Tambahkan kota atau negara tujuan baru.</p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={loading} className="w-full sm:w-auto">
          {loading ? <AirplaneLoader size={18} className="mr-2" /> : <Save size={18} className="mr-2" />}
          Simpan Destinasi
        </Button>
      </div>

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
                <label className="text-sm font-medium">Deskripsi Singkat</label>
                <Textarea 
                  name="deskripsi" rows={4}
                  placeholder="Deskripsikan pesona destinasi ini..."
                  value={formData.deskripsi} onChange={handleChange} required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Upload Foto Utama</label>
                <MediaPicker 
                  value={formData.foto} 
                  onChange={(url) => setFormData(prev => ({ ...prev, foto: url }))} 
                />
              </div>
            </CardContent>
          </Card>
        </div>

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
      </form>
    </div>
  )
}
