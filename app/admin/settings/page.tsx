"use client"

import { useState, useEffect } from "react"
import { Settings, Save, Link as LinkIcon, MessageSquare, CreditCard, LayoutTemplate, Info } from "lucide-react"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import AirplaneLoader from "@/components/ui/airplane-loader"

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

    const payload = { ...formData }

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
      <div className="flex items-center justify-center h-64">
        <AirplaneLoader size={32} className="text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Pengaturan Sistem</h2>
          <p className="text-muted-foreground text-sm">Konfigurasi parameter dan identitas utama website Agendain.</p>
        </div>
        <Button 
          onClick={handleSubmit}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? <AirplaneLoader size={18} className="mr-2" /> : <Save size={18} className="mr-2" />}
          Simpan Perubahan
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section: Identitas Website */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutTemplate size={20} className="text-primary" />
              Identitas Website
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="site_name">Nama Website</Label>
              <Input
                id="site_name"
                name="site_name"
                value={formData.site_name}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Logo Website</Label>
              <div className="flex items-center gap-4">
                {formData.site_logo && formData.site_logo !== "/logo.png" ? (
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-muted/20 border flex items-center justify-center shrink-0">
                    <img src={formData.site_logo} alt="Logo" className="w-full h-full object-contain p-1" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-md bg-muted/20 border flex items-center justify-center shrink-0">
                    <LayoutTemplate size={24} className="text-muted-foreground" />
                  </div>
                )}
                <div className="flex flex-col gap-1 w-full">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Button variant="outline" type="button" asChild className="w-full justify-center">
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      {uploadingLogo ? <AirplaneLoader size={16} className="mr-2" /> : null}
                      {uploadingLogo ? "Mengunggah..." : "Pilih Gambar Logo"}
                    </label>
                  </Button>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Disarankan gambar PNG berlatar transparan (rasio 1:1 atau 3:1).
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section: Kontak & Komunikasi */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare size={20} className="text-primary" />
              Kontak & Pesan
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="whatsapp_number">Nomor WhatsApp Utama</Label>
              <Input
                id="whatsapp_number"
                name="whatsapp_number"
                value={formData.whatsapp_number}
                onChange={handleChange}
                placeholder="6281234567890"
              />
              <p className="text-[11px] text-muted-foreground">Gunakan format 62xxx tanpa spasi atau plus.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="whatsapp_message">Teks Pesan WhatsApp Default</Label>
              <Textarea
                id="whatsapp_message"
                name="whatsapp_message"
                value={formData.whatsapp_message}
                onChange={handleChange}
                rows={3}
              />
              <p className="text-[11px] text-muted-foreground">Pesan ini otomatis terisi saat kustomer klik tombol chat WA.</p>
            </div>
          </CardContent>
        </Card>

        {/* Section: Pembayaran */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard size={20} className="text-primary" />
              Instruksi Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="payment_instructions">Informasi Rekening / Metode Pembayaran</Label>
              <Textarea
                id="payment_instructions"
                name="payment_instructions"
                value={formData.payment_instructions}
                onChange={handleChange}
                rows={4}
              />
              <p className="text-[11px] text-muted-foreground">Instruksi ini akan ditampilkan kepada kustomer setelah booking.</p>
            </div>
          </CardContent>
        </Card>

        {/* Section: Informasi & Kebijakan Default */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info size={20} className="text-primary" />
              Informasi & Kebijakan Default (Global)
            </CardTitle>
            <CardDescription>
              Pengaturan ini akan digunakan pada paket yang tidak memiliki kebijakan custom secara spesifik.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="global_informasi_penting">Informasi Penting (Default)</Label>
              <Textarea
                id="global_informasi_penting"
                name="global_informasi_penting"
                value={formData.global_informasi_penting}
                onChange={handleChange}
                rows={4}
                placeholder="Tulis setiap poin di baris baru..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="global_kebijakan_pembatalan">Kebijakan Pembatalan & Pengembalian Dana (Default)</Label>
              <Textarea
                id="global_kebijakan_pembatalan"
                name="global_kebijakan_pembatalan"
                value={formData.global_kebijakan_pembatalan}
                onChange={handleChange}
                rows={4}
                placeholder="Tulis setiap poin di baris baru..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="global_opsi_penjemputan">Opsi Penjemputan (Default)</Label>
              <Textarea
                id="global_opsi_penjemputan"
                name="global_opsi_penjemputan"
                value={formData.global_opsi_penjemputan}
                onChange={handleChange}
                rows={4}
                placeholder="Tulis setiap poin di baris baru..."
              />
            </div>
          </CardContent>
        </Card>

      </form>
    </div>
  )
}
