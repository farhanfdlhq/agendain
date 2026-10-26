"use client"

import { useEffect, useState } from "react"
import Cropper from "react-easy-crop"
import { toast } from "react-hot-toast"
import { Minus, Plus, UploadCloud } from "lucide-react"
import { getCroppedImg } from "@/lib/cropImage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import AirplaneLoader from "@/components/ui/airplane-loader"

type Area = { x: number; y: number; width: number; height: number }

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageSrc: string | null
  /** Rasio kotak crop. Dikosongkan → rasio ASLI gambar (logo bebas lebar). */
  aspect?: number
  cropShape?: "rect" | "round"
  /** < 1 mengizinkan perkecil (gambar tak harus memenuhi kotak), mis. avatar. */
  minZoom?: number
  title?: string
  description?: string
  /** Menerima hasil crop; lempar Error untuk menampilkan pesannya. Dialog
   *  tertutup sendiri bila selesai tanpa error. */
  onConfirm: (cropped: Blob) => Promise<void>
}

// Kotak crop mengikuti rasio gambar (contain di dalam batas ini) supaya logo
// lebar tidak menyisakan pita abu-abu, dan foto tegak tidak kepanjangan.
const CROP_MAX_W = 420
const CROP_MAX_H = 300

/**
 * Dialog geser/zoom bersama untuk semua unggahan gambar ber-crop (logo invoice
 * lewat ImageCropUploader, foto profil admin). Unggahnya sendiri diserahkan ke
 * pemanggil lewat onConfirm karena endpoint-nya berbeda.
 */
export function ImageCropDialog({
  open,
  onOpenChange,
  imageSrc,
  aspect,
  cropShape = "rect",
  minZoom = 1,
  title = "Sesuaikan Gambar",
  description = "Geser dan perbesar gambar untuk menyesuaikan posisinya.",
  onConfirm,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [area, setArea] = useState<Area | null>(null)
  const [busy, setBusy] = useState(false)
  const [naturalRatio, setNaturalRatio] = useState(1)
  const ratio = aspect ?? naturalRatio
  const boxW = ratio >= CROP_MAX_W / CROP_MAX_H ? CROP_MAX_W : Math.round(CROP_MAX_H * ratio)
  const boxH = ratio >= CROP_MAX_W / CROP_MAX_H ? Math.round(CROP_MAX_W / ratio) : CROP_MAX_H

  // Gambar baru → posisi & zoom kembali awal; rasio asli dihitung bila perlu.
  // setState di dalam callback onload, bukan sinkron di badan efek.
  useEffect(() => {
    if (!imageSrc) return
    const img = new Image()
    img.onload = () => {
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setArea(null)
      const r = img.naturalWidth / img.naturalHeight
      setNaturalRatio(Number.isFinite(r) && r > 0 ? r : 1)
    }
    img.src = imageSrc
  }, [imageSrc])

  const simpan = async () => {
    if (!imageSrc || !area) return
    setBusy(true)
    try {
      const cropped = await getCroppedImg(imageSrc, area)
      if (!cropped) throw new Error("Gagal memotong gambar")
      await onConfirm(cropped)
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setBusy(false)
    }
  }

  const step = (delta: number) => setZoom((z) => Math.min(3, Math.max(minZoom, Math.round((z + delta) * 10) / 10)))

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {imageSrc && (
          <div className="relative mx-auto mt-2 max-w-full overflow-hidden rounded-xl bg-muted" style={{ width: boxW, height: boxH }}>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              minZoom={minZoom}
              aspect={ratio}
              cropShape={cropShape}
              restrictPosition={minZoom >= 1}
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={(_: Area, px: Area) => setArea(px)}
              onZoomChange={setZoom}
            />
          </div>
        )}

        <div className="flex items-center gap-3 px-2 py-4">
          <span className="w-12 text-sm font-medium">Zoom</span>
          <Button type="button" variant="ghost" size="icon" className="size-8 shrink-0 rounded-full text-muted-foreground" aria-label="Perkecil" onClick={() => step(-0.1)}>
            <Minus className="size-4" />
          </Button>
          <Input
            type="range"
            aria-label="Zoom"
            value={zoom}
            min={minZoom}
            max={3}
            step={0.1}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 cursor-pointer accent-primary"
          />
          <Button type="button" variant="ghost" size="icon" className="size-8 shrink-0 rounded-full text-muted-foreground" aria-label="Perbesar" onClick={() => step(0.1)}>
            <Plus className="size-4" />
          </Button>
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button type="button" variant="outline" disabled={busy} onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button type="button" onClick={simpan} disabled={busy || !area}>
            {busy ? <AirplaneLoader className="mr-2 h-4 w-4" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            {busy ? "Mengunggah..." : "Simpan & Unggah"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
