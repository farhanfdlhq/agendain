import type { CSSProperties } from 'react'

/**
 * Bingkai gambar non-destruktif untuk CMS: titik fokus (x, y dalam persen) dan
 * zoom. File gambar asli tidak dipotong; situs menampilkannya dengan
 * object-position + scale, sehingga tetap pas di semua ukuran layar.
 * Disimpan di CMS sebagai teks "x,y,zoom", mis. "50,50,1".
 */
export type ImageFrame = { x: number; y: number; zoom: number }

export const DEFAULT_FRAME: ImageFrame = { x: 50, y: 50, zoom: 1 }
export const MIN_ZOOM = 1
export const MAX_ZOOM = 3

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))
const round = (n: number, step: number) => Math.round(n / step) * step

export function parseFrame(raw: unknown): ImageFrame {
  if (typeof raw !== 'string' || !raw.trim()) return { ...DEFAULT_FRAME }
  const [x, y, zoom] = raw.split(',').map((s) => Number(s.trim()))
  return {
    x: Number.isFinite(x) ? clamp(x, 0, 100) : DEFAULT_FRAME.x,
    y: Number.isFinite(y) ? clamp(y, 0, 100) : DEFAULT_FRAME.y,
    zoom: Number.isFinite(zoom) ? clamp(zoom, MIN_ZOOM, MAX_ZOOM) : DEFAULT_FRAME.zoom,
  }
}

export function normalizeFrame(f: ImageFrame): ImageFrame {
  return {
    x: round(clamp(f.x, 0, 100), 0.1),
    y: round(clamp(f.y, 0, 100), 0.1),
    zoom: round(clamp(f.zoom, MIN_ZOOM, MAX_ZOOM), 0.01),
  }
}

export function formatFrame(f: ImageFrame): string {
  const n = normalizeFrame(f)
  const num = (v: number) => String(Number(v.toFixed(2)))
  return `${num(n.x)},${num(n.y)},${num(n.zoom)}`
}

export function isDefaultFrame(f: ImageFrame): boolean {
  const n = normalizeFrame(f)
  return n.x === DEFAULT_FRAME.x && n.y === DEFAULT_FRAME.y && n.zoom === DEFAULT_FRAME.zoom
}

/** Area crop react-easy-crop dalam persen ukuran gambar asli. */
export type CropArea = { x: number; y: number; width: number; height: number }

/**
 * Area crop (dialog CMS) → bingkai situs. Situs memakai object-fit cover +
 * object-position p% + scale(zoom) dengan transform-origin p%; area yang terlihat
 * kiri = p·(100 − lebar)/100, sehingga p = x / (100 − lebar) · 100 (tepat untuk
 * rasio kotak yang sama dengan dialog, dan tetap memusatkan bagian itu di rasio lain).
 */
export function cropToFrame(area: CropArea, zoom: number): ImageFrame {
  const axis = (start: number, size: number) => (size >= 99.95 ? 50 : (start / (100 - size)) * 100)
  return normalizeFrame({ x: axis(area.x, area.width), y: axis(area.y, area.height), zoom })
}

/** Kebalikan cropToFrame: memulihkan area crop dari bingkai tersimpan. */
export function frameToCrop(f: ImageFrame, imageRatio: number, boxRatio: number): CropArea {
  // Area terlihat pada zoom 1 (object-fit cover) dalam persen gambar.
  const w1 = imageRatio > boxRatio ? (boxRatio / imageRatio) * 100 : 100
  const h1 = imageRatio > boxRatio ? 100 : (imageRatio / boxRatio) * 100
  const width = w1 / f.zoom
  const height = h1 / f.zoom
  return { x: (f.x * (100 - width)) / 100, y: (f.y * (100 - height)) / 100, width, height }
}

/**
 * Gaya untuk <img>/<Image fill> ber-object-fit cover. Zoom lewat variabel CSS
 * --frame-zoom agar efek hover di situs (scale tambahan) tetap bisa digabung.
 */
export function frameStyle(f: ImageFrame): CSSProperties {
  const pos = `${f.x}% ${f.y}%`
  return {
    objectPosition: pos,
    transformOrigin: pos,
    ['--frame-zoom' as string]: String(f.zoom),
  } as CSSProperties
}
