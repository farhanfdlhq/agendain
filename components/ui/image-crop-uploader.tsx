"use client"

import { useRef, useState } from "react"
import { toast } from "react-hot-toast"
import { ImageIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MediaPicker } from "@/components/ui/media-picker"
import { ImageCropDialog } from "@/components/ui/image-crop-dialog"

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
  const fileRef = useRef<HTMLInputElement>(null)

  const bukaCrop = (src: string) => {
    setImageSrc(src)
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

  const unggah = async (cropped: Blob) => {
    const fd = new FormData()
    fd.append("file", cropped)
    const res = await fetch("/api/upload", { method: "POST", body: fd })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Gagal mengunggah gambar")
    onChange(data.url)
    toast.success("Gambar berhasil diunggah")
  }

  const tutupCrop = (next: boolean) => {
    setOpen(next)
    if (!next && fileRef.current) fileRef.current.value = ""
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

      <ImageCropDialog
        open={open}
        onOpenChange={tutupCrop}
        imageSrc={imageSrc}
        aspect={aspect}
        cropShape={cropShape}
        onConfirm={unggah}
      />
    </div>
  )
}
