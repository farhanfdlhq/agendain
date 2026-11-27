import { describe, expect, it } from 'vitest'
import { DEFAULT_FRAME, cropToFrame, formatFrame, frameStyle, frameToCrop, isDefaultFrame, parseFrame } from './image-frame'

describe('konversi area crop ↔ bingkai', () => {
  it('area tengah pada zoom 1 = bingkai default', () => {
    // Foto 3:2 di kotak 4:3: lebar terlihat 88.9%, tinggi penuh.
    const area = frameToCrop(DEFAULT_FRAME, 3 / 2, 4 / 3)
    expect(area.height).toBeCloseTo(100)
    expect(area.width).toBeCloseTo(88.89, 1)
    expect(cropToFrame(area, 1)).toEqual(DEFAULT_FRAME)
  })

  it('bolak-balik bingkai → area → bingkai tetap sama (foto lebar & tegak)', () => {
    for (const [img, box] of [[3 / 2, 4 / 3], [2 / 3, 4 / 3], [16 / 9, 3 / 4]]) {
      const f = { x: 25, y: 70, zoom: 1.8 }
      const back = cropToFrame(frameToCrop(f, img, box), f.zoom)
      expect(back.zoom).toBeCloseTo(1.8)
      expect(back.x).toBeCloseTo(25, 0)
      expect(back.y).toBeCloseTo(70, 0)
    }
  })

  it('area di tepi kiri-atas = posisi 0%, tepi kanan-bawah = 100%', () => {
    expect(cropToFrame({ x: 0, y: 0, width: 50, height: 50 }, 2)).toMatchObject({ x: 0, y: 0 })
    expect(cropToFrame({ x: 50, y: 50, width: 50, height: 50 }, 2)).toMatchObject({ x: 100, y: 100 })
  })
})

describe('image-frame', () => {
  it('nilai kosong atau rusak jatuh ke bingkai default (tengah, zoom 1)', () => {
    expect(parseFrame('')).toEqual(DEFAULT_FRAME)
    expect(parseFrame(undefined)).toEqual(DEFAULT_FRAME)
    expect(parseFrame('abc')).toEqual(DEFAULT_FRAME)
    expect(parseFrame(42)).toEqual(DEFAULT_FRAME)
  })

  it('membaca "x,y,zoom" dan membatasi ke rentang aman', () => {
    expect(parseFrame('30,70,1.5')).toEqual({ x: 30, y: 70, zoom: 1.5 })
    expect(parseFrame('-20,140,9')).toEqual({ x: 0, y: 100, zoom: 3 })
    expect(parseFrame('10,20,0.2')).toEqual({ x: 10, y: 20, zoom: 1 })
  })

  it('format bolak-balik stabil dan dibulatkan', () => {
    const s = formatFrame({ x: 33.333, y: 66.666, zoom: 1.2345 })
    expect(s).toBe('33.3,66.7,1.23')
    expect(formatFrame(parseFrame(s))).toBe(s)
  })

  it('mengenali bingkai default', () => {
    expect(isDefaultFrame(parseFrame(''))).toBe(true)
    expect(isDefaultFrame(parseFrame('50,50,1'))).toBe(true)
    expect(isDefaultFrame(parseFrame('50,50,1.1'))).toBe(false)
  })

  it('gaya memakai titik fokus yang sama untuk posisi dan asal zoom', () => {
    const st = frameStyle({ x: 20, y: 80, zoom: 2 }) as Record<string, string>
    expect(st.objectPosition).toBe('20% 80%')
    expect(st.transformOrigin).toBe('20% 80%')
    expect(st['--frame-zoom']).toBe('2')
  })
})
