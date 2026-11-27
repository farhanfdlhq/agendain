'use client'

import { useEffect, useState } from 'react'
import Cropper from 'react-easy-crop'
import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import AirplaneLoader from '@/components/ui/airplane-loader'
import {
  MAX_ZOOM, MIN_ZOOM, cropToFrame, formatFrame, frameToCrop, isDefaultFrame, parseFrame,
  type CropArea, type ImageFrame,
} from '@/lib/image-frame'

type Props = {
  /** URL gambar yang sedang dipakai slot ini. */
  src: string
  /** Nilai CMS "x,y,zoom" (kosong = tengah, tanpa zoom). */
  value: string
  onChange: (value: string) => void
  /** Rasio lebar/tinggi kotak di situs, mis. 4/3 atau 3/4. */
  aspect: number
  label: string
  /** Catatan tambahan di dialog, mis. perilaku di HP. */
  hint?: string
}

/**
 * Tombol + dialog "Atur posisi & zoom" bergaya sama dengan dialog foto profil
 * (react-easy-crop: seluruh foto terlihat, area di luar bingkai digelapkan).
 * Bedanya: file TIDAK dipotong — bingkai disimpan sebagai titik fokus + zoom.
 */
export function ImageFrameEditor({ src, value, onChange, aspect, label, hint }: Props) {
  const [open, setOpen] = useState(false)
  const saved = parseFrame(value)
  const custom = !isDefaultFrame(saved)

  if (!src) return null
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        {/* Latar putih + teks/garis warna utama agar kontras dengan kartu abu-abu CMS. */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-primary/40 bg-background text-primary hover:bg-primary/10 hover:text-primary"
          onClick={() => setOpen(true)}
        >
          Atur posisi &amp; zoom
        </Button>
        <span className="text-[11px] text-muted-foreground">
          {custom ? `Disesuaikan, zoom ${Math.round(saved.zoom * 100)}%` : 'Posisi tengah'}
        </span>
      </div>
      {open && (
        <FrameDialog
          src={src} initial={saved} aspect={aspect} label={label} hint={hint}
          onClose={() => setOpen(false)}
          onSave={(f) => { onChange(isDefaultFrame(f) ? '' : formatFrame(f)); setOpen(false) }}
        />
      )}
    </>
  )
}

const BOX_W = 440
const BOX_H = 320

function FrameDialog({ src, initial, aspect, label, hint, onClose, onSave }: {
  src: string; initial: ImageFrame; aspect: number; label: string; hint?: string
  onClose: () => void; onSave: (f: ImageFrame) => void
}) {
  // Zoom naik/turun per 1% (slider & tombol − / +).
  // Rasio asli foto dibutuhkan untuk memulihkan bingkai tersimpan ke posisi crop.
  const [imgRatio, setImgRatio] = useState<number | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(initial.zoom)
  const [area, setArea] = useState<CropArea | null>(null)
  const [resetKey, setResetKey] = useState(0)

  useEffect(() => {
    const img = new window.Image()
    img.onload = () => {
      const r = img.naturalWidth / img.naturalHeight
      setImgRatio(Number.isFinite(r) && r > 0 ? r : aspect)
    }
    img.onerror = () => setImgRatio(aspect)
    img.src = src
  }, [src, aspect])

  const step = (delta: number) =>
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round((z + delta) * 100) / 100)))

  const reset = () => {
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setResetKey((k) => k + 1)
  }

  // Bingkai awal: saat pertama dibuka pakai nilai tersimpan; setelah "Atur ulang" pakai tengah.
  const startFrame = resetKey === 0 ? initial : { x: 50, y: 50, zoom: 1 }

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Atur posisi &amp; zoom: {label}</DialogTitle>
          <DialogDescription>
            Geser dan perbesar gambar untuk memilih bagian yang tampil di dalam bingkai. File gambar asli
            tidak dipotong. Setelah Terapkan, klik Simpan Perubahan agar tampil di situs.
            {hint && <span className="mt-1 block">{hint}</span>}
          </DialogDescription>
        </DialogHeader>

        <div
          className="relative mx-auto mt-2 max-w-full overflow-hidden rounded-xl bg-muted"
          style={{ width: BOX_W, height: BOX_H }}
        >
          {imgRatio === null ? (
            <div className="flex h-full items-center justify-center"><AirplaneLoader className="h-6 w-6" /></div>
          ) : (
            <Cropper
              key={resetKey}
              image={src}
              crop={crop}
              zoom={zoom}
              minZoom={MIN_ZOOM}
              maxZoom={MAX_ZOOM}
              aspect={aspect}
              showGrid={false}
              restrictPosition
              initialCroppedAreaPercentages={frameToCrop(startFrame, imgRatio, aspect)}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(pct: CropArea) => setArea(pct)}
            />
          )}
        </div>

        <div className="flex items-center gap-3 px-2 py-4">
          <span className="w-12 text-sm font-medium">Zoom</span>
          <Button type="button" variant="ghost" size="icon" className="size-8 shrink-0 rounded-full text-muted-foreground" aria-label="Perkecil" onClick={() => step(-0.01)}>
            <Minus className="size-4" />
          </Button>
          <Input
            type="range"
            aria-label="Zoom"
            value={zoom}
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 cursor-pointer accent-primary"
          />
          <Button type="button" variant="ghost" size="icon" className="size-8 shrink-0 rounded-full text-muted-foreground" aria-label="Perbesar" onClick={() => step(0.01)}>
            <Plus className="size-4" />
          </Button>
          <span className="w-11 text-right text-sm tabular-nums text-muted-foreground">{Math.round(zoom * 100)}%</span>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button type="button" variant="ghost" onClick={reset}>Atur ulang</Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
            <Button type="button" disabled={!area} onClick={() => area && onSave(cropToFrame(area, zoom))}>Terapkan</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
