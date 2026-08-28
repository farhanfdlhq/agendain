"use client"

import { useState, useEffect, useCallback } from "react"
import { Settings, Save, Link as LinkIcon, MessageSquare, CreditCard, LayoutTemplate, Info } from "lucide-react"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import AirplaneLoader from "@/components/ui/airplane-loader"
import { Alert, AlertTitle, AlertDescription } from "@/components/reui/alert"
import { MediaPicker } from "@/components/ui/media-picker"
import { formatWhatsAppNumber } from "@/lib/utils"
import Cropper from "react-easy-crop"
import { getCroppedImg } from "@/lib/cropImage"
import { Minus, Plus, UploadCloud } from "lucide-react"

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
    site_favicon: "/favicon.ico",
    logo_height: "42",
    global_informasi_penting: "Paspor minimal masa berlaku 6 bulan dari tanggal kepulangan.\nVisa Schengen diwajibkan bagi pemegang paspor Indonesia.\nJadwal perjalanan dan akomodasi dapat berubah sewaktu-waktu menyesuaikan kondisi cuaca.",
    global_kebijakan_pembatalan: "Pembatalan > 30 hari sebelum keberangkatan: Pengembalian 50% dari total.\nPembatalan 15-30 hari sebelum keberangkatan: Pengembalian 25% dari total.\nPembatalan < 14 hari sebelum keberangkatan: Tidak ada pengembalian dana (Non-refundable).\nJika visa ditolak, biaya visa tidak dapat dikembalikan.",
    global_opsi_penjemputan: "Bandara Internasional Soekarno Hatta (Terminal 3).\nPenjemputan area Jakarta (sesuai konfirmasi).\nSilakan kumpul 4 jam sebelum keberangkatan.",
    // Versi Inggris (opsional) — dibaca detail page saat locale=en, kosong = jatuh ke versi ID.
    global_informasi_penting_en: "",
    global_kebijakan_pembatalan_en: "",
    global_opsi_penjemputan_en: ""
  })

  // Cropper states for Favicon
  const [cropDialogOpen, setCropDialogOpen] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [uploadingCropped, setUploadingCropped] = useState(false)

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleUploadCropped = async () => {
    if (!imageToCrop || !croppedAreaPixels) return
    setUploadingCropped(true)
    try {
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels)
      if (!croppedImage) throw new Error("Gagal memotong gambar")

      const formDataUpload = new FormData()
      formDataUpload.append("file", croppedImage)
      formDataUpload.append("type", "system")

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah foto")
      
      setFormData(prev => ({ ...prev, site_favicon: data.url }))
      toast.success("Favicon berhasil dipotong")
      setCropDialogOpen(false)
      setImageToCrop(null)
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan saat memotong gambar")
    } finally {
      setUploadingCropped(false)
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

  const handleWhatsAppBlur = () => {
    if (formData.whatsapp_number) {
      setFormData(prev => ({ ...prev, whatsapp_number: formatWhatsAppNumber(prev.whatsapp_number) }))
    }
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
            <div className="space-y-6">
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
                <div className="flex flex-col gap-2">
                  <MediaPicker 
                    value={formData.site_logo}
                    onChange={(url) => setFormData(prev => ({ ...prev, site_logo: url }))}
                    label="Pilih Logo"
                    description="Disarankan gambar PNG berlatar transparan."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Logo Title (Favicon Browser)</Label>
                <div className="flex flex-col gap-2">
                  <MediaPicker
                    value={formData.site_favicon || ""}
                    onChange={(url) => {
                      // ICO tidak bisa dilewatkan cropper — getCroppedImg
                      // meng-encode PNG via canvas sehingga ICO akan hilang.
                      // Untuk .ico, terapkan langsung tanpa membuka dialog crop.
                      if (/\.ico(\?|#|$)/i.test(url)) {
                        setFormData(prev => ({ ...prev, site_favicon: url }))
                        toast.success("Favicon (ICO) diterapkan")
                        return
                      }
                      setImageToCrop(url)
                      setCropDialogOpen(true)
                    }}
                    accept="image/png,image/x-icon,image/vnd.microsoft.icon,.ico"
                    label="Pilih Favicon"
                    description="Ikon untuk penampil judul tab di browser."
                  />
                </div>
              </div>

              {/* Alert custom (components/reui/alert.tsx), bukan kotak buatan
                  tangan: varian `info` inilah yang memakai warna Info dari
                  Tema & Tampilan. */}
              <Alert variant="info" className="shadow-xs">
                <Info className="h-5 w-5" />
                <AlertTitle>TIP: Saran Praktik Terbaik</AlertTitle>
                <AlertDescription className="text-xs leading-relaxed">
                  <p>
                    Gunakan format <span className="font-semibold text-foreground">PNG</span> (mendukung transparansi) atau <span className="font-semibold text-foreground">ICO</span>, sebaiknya berwujud <span className="font-semibold text-foreground">Bujur Sangkar (contoh: 512×512 piksel)</span>, maksimal <span className="font-semibold text-foreground">10MB</span>. File PNG disimpan tetap PNG (tidak dikonversi ke WebP), dan file ICO diunggah apa adanya agar langsung termuat di tab semua perangkat.
                  </p>
                </AlertDescription>
              </Alert>
            </div>
            
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="logo_height">Ukuran Tinggi Logo (px)</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="range"
                  id="logo_height"
                  name="logo_height"
                  min="24"
                  max="100"
                  value={formData.logo_height || "42"}
                  onChange={handleChange}
                  className="flex-1 cursor-pointer"
                />
                <span className="w-12 text-sm font-medium">{formData.logo_height || "42"}px</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Sesuaikan ukuran tampilan logo pada Navbar dan Footer (Default: 42px).
              </p>
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
                onBlur={handleWhatsAppBlur}
                placeholder="0819-9526-4565"
              />
              <p className="text-[11px] text-muted-foreground">Otomatis diformat ke awalan 62 saat Anda klik di luar kolom.</p>
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
              <Label htmlFor="global_informasi_penting_en" className="text-xs text-muted-foreground font-normal pt-1">🇬🇧 English (opsional — kosongkan untuk pakai versi Indonesia)</Label>
              <Textarea
                id="global_informasi_penting_en"
                name="global_informasi_penting_en"
                value={formData.global_informasi_penting_en}
                onChange={handleChange}
                rows={4}
                placeholder={formData.global_informasi_penting || "Write each point on a new line..."}
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
              <Label htmlFor="global_kebijakan_pembatalan_en" className="text-xs text-muted-foreground font-normal pt-1">🇬🇧 English (opsional — kosongkan untuk pakai versi Indonesia)</Label>
              <Textarea
                id="global_kebijakan_pembatalan_en"
                name="global_kebijakan_pembatalan_en"
                value={formData.global_kebijakan_pembatalan_en}
                onChange={handleChange}
                rows={4}
                placeholder={formData.global_kebijakan_pembatalan || "Write each point on a new line..."}
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
              <Label htmlFor="global_opsi_penjemputan_en" className="text-xs text-muted-foreground font-normal pt-1">🇬🇧 English (opsional — kosongkan untuk pakai versi Indonesia)</Label>
              <Textarea
                id="global_opsi_penjemputan_en"
                name="global_opsi_penjemputan_en"
                value={formData.global_opsi_penjemputan_en}
                onChange={handleChange}
                rows={4}
                placeholder={formData.global_opsi_penjemputan || "Write each point on a new line..."}
              />
            </div>
          </CardContent>
        </Card>

      </form>

      <Dialog open={cropDialogOpen} onOpenChange={(open) => {
        setCropDialogOpen(open)
        if (!open) setImageToCrop(null)
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sesuaikan Favicon</DialogTitle>
            <DialogDescription>
              Geser dan perbesar gambar untuk menyesuaikan posisi Favicon Anda (berbentuk kotak).
            </DialogDescription>
          </DialogHeader>
          
          {imageToCrop && (
            <div className="relative w-full h-[300px] mt-2 rounded-xl overflow-hidden bg-muted">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="rect"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
          )}
          
          <div className="flex items-center gap-3 py-4 px-2">
            <span className="text-sm font-medium w-12">Zoom</span>
            <button 
              type="button" 
              onClick={() => setZoom(Math.max(1, zoom - 0.1))} 
              className="p-1.5 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground shrink-0"
            >
              <Minus className="h-4 w-4" />
            </button>
            <Input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 cursor-pointer accent-primary"
            />
            <button 
              type="button" 
              onClick={() => setZoom(Math.min(3, zoom + 0.1))} 
              className="p-1.5 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground shrink-0"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <DialogFooter className="sm:justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => {
              setCropDialogOpen(false)
              setImageToCrop(null)
            }}>
              Batal
            </Button>
            <Button type="button" onClick={handleUploadCropped} disabled={uploadingCropped}>
              {uploadingCropped ? <AirplaneLoader className="mr-2 h-4 w-4" /> : <UploadCloud className="mr-2 h-4 w-4" />}
              {uploadingCropped ? "Menyimpan..." : "Simpan Potongan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
