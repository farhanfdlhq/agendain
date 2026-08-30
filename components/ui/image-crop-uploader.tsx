"use client"

import { useEffect, useRef, useState } from "react"
import Cropper from "react-easy-crop"
import { toast } from "react-hot-toast"
import { ImageIcon, Minus, Plus, UploadCloud, X } from "lucide-react"
import { getCroppedImg } from "@/lib/cropImage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { MediaPicker } from "@/components/ui/media-picker"
import AirplaneLoader from "@/components/ui/airplane-loader"

type Area = { x: number; y: number; width: number; height: number }

interface Props {
  value: string
  onChange: (url: string) => void
  /** Rasio kotak crop. Dikosongkan → memakai rasio ASLI gambar (trim tanpa
   *  mendistorsi — ideal untuk logo yang lebarnya bebas). Avatar memakai 1. */
  aspect?: number
  cropShape?: "rect" | "round"
  label?: string
  description?: string
}

/**
 * Unggah gambar dengan penyesuaian geser/zoom (crop) — pola yang sama dengan
 * "Sesuaikan Foto Profil". Dua jalur masuk (unggah dari perangkat / pilih dari
 * Bank Media) sama-sama melewati dialog crop, lalu hasil crop diunggah ke
 * /api/upload dan URL-nya dikembalikan lewat onChange.
 */
export function ImageCropUploader({
  value,
  onChange,
  aspect,
  cropShape = "rect",
  label = "Upload Gambar",
  description = "PNG, JPG atau WEBP (Maks. 10MB)",
}: Props) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [area, setArea] = useState<Area | null>(null)
  const [uploading, setUploading] = useState(false)
  // Rasio efektif: prop `aspect` bila diberi, jika tidak rasio ASLI gambar.
  const [computedRatio, setComputedRatio] = useState(1)
  const ratio = aspect ?? computedRatio
  const fileRef = useRef<HTMLInputElement>(null)

  // Hitung rasio asli gambar saat mode bebas (aspect tak diberi). setState hanya
  // di dalam callback onload (bukan sinkron di badan efek).
  useEffect(() => {
    if (aspect || !imageSrc) return
    const img = new Image()
    img.onload = () => {
      const r = img.naturalWidth / img.naturalHeight
      setComputedRatio(Number.isFinite(r) && r > 0 ? r : 1)
    }
    img.src = imageSrc
  }, [imageSrc, aspect])

  const bukaCrop = (src: string) => {
    setImageSrc(src)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setArea(null)
    setOpen(true)
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 10MB")
      if (fileRef.current) fileRef.current.value = ""
      return
    }
    const reader = new FileReader()
    reader.addEventListener("load", () => bukaCrop(reader.result?.toString() || ""))
    reader.readAsDataURL(file)
  }

  const simpan = async () => {
    if (!imageSrc || !area) return
    setUploading(true)
    try {
      const cropped = await getCroppedImg(imageSrc, area)
      if (!cropped) throw new Error("Gagal memotong gambar")
      const fd = new FormData()
      fd.append("file", cropped)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah gambar")
      onChange(data.url)
      toast.success("Gambar berhasil diunggah")
      setOpen(false)
      setImageSrc(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

      {value ? (
        <div className="relative group rounded-xl border bg-black/5 overflow-hidden flex items-center justify-center min-h-[160px] p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="max-h-[200px] max-w-full object-contain" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <Button type="button" variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>Ganti & Sesuaikan</Button>
            <Button type="button" variant="destructive" size="sm" onClick={() => onChange("")}><X size={16} /></Button>
          </div>
        </div>
      ) : (
        <div
          className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center bg-muted/10 hover:bg-muted/30 transition-colors cursor-pointer min-h-[160px]"
          onClick={() => fileRef.current?.click()}
        >
          <div className="bg-primary/10 text-primary p-3 rounded-full mb-3"><ImageIcon size={28} /></div>
          <span className="font-semibold text-sm text-foreground mb-1">{label}</span>
          <span className="text-xs text-muted-foreground">{description}</span>
        </div>
      )}

      {/* Jalur kedua: pilih gambar yang sudah ada, lalu tetap lewat crop. */}
      <MediaPicker
        value=""
        onChange={(url) => url && bukaCrop(url)}
        trigger={
          <span className="text-xs text-primary font-medium hover:underline cursor-pointer">Pilih dari Media Bank</span>
        }
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sesuaikan Gambar</DialogTitle>
            <DialogDescription>Geser dan perbesar gambar untuk menyesuaikan posisinya.</DialogDescription>
          </DialogHeader>

          {imageSrc && (
            <div className="relative w-full h-[300px] mt-2 rounded-xl overflow-hidden bg-muted">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={ratio}
                cropShape={cropShape}
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={(_: Area, px: Area) => setArea(px)}
                onZoomChange={setZoom}
              />
            </div>
          )}

          <div className="flex items-center gap-3 py-4 px-2">
            <span className="text-sm font-medium w-12">Zoom</span>
            <button type="button" onClick={() => setZoom((z) => Math.max(1, z - 0.1))} className="p-1.5 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground shrink-0">
              <Minus className="h-4 w-4" />
            </button>
            <Input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="flex-1 cursor-pointer accent-primary" />
            <button type="button" onClick={() => setZoom((z) => Math.min(3, z + 0.1))} className="p-1.5 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground shrink-0">
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <DialogFooter className="sm:justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => { setOpen(false); if (fileRef.current) fileRef.current.value = "" }}>Batal</Button>
            <Button type="button" onClick={simpan} disabled={uploading}>
              {uploading ? <AirplaneLoader className="mr-2 h-4 w-4" /> : <UploadCloud className="mr-2 h-4 w-4" />}
              {uploading ? "Mengunggah..." : "Simpan & Unggah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
