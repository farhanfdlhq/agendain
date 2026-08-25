import { describe, it, expect } from 'vitest'
import { formatPriceShort, formatIDR } from './currency'

describe('formatPriceShort', () => {
  it('meringkas kelipatan bulat satu juta', () => {
    expect(formatPriceShort(35000000, 'id')).toBe('35 Juta')
    expect(formatPriceShort(18000000, 'id')).toBe('18 Juta')
    expect(formatPriceShort(1000000, 'id')).toBe('1 Juta')
  })

  // Regresi: nilai non-bulat pernah jatuh ke "Rp 28.500.000" sehingga kolom
  // grid kartu beranda melebar dan keluar dari kontainer.
  it('tetap ringkas untuk nilai non-bulat, satu angka desimal', () => {
    expect(formatPriceShort(28500000, 'id')).toBe('28,5 Juta')
    expect(formatPriceShort(18900000, 'id')).toBe('18,9 Juta')
  })

  it('membulatkan pecahan panjang ke satu desimal', () => {
    expect(formatPriceShort(28543210, 'id')).toBe('28,5 Juta')
  })

  it('memakai titik desimal dan "Million" pada locale en', () => {
    expect(formatPriceShort(28500000, 'en')).toBe('28.5 Million')
    expect(formatPriceShort(35000000, 'en')).toBe('35 Million')
  })

  it('jatuh ke format rupiah penuh di bawah satu juta', () => {
    expect(formatPriceShort(500000, 'id')).toBe(formatIDR(500000))
  })

  it('default locale adalah id', () => {
    expect(formatPriceShort(28500000)).toBe('28,5 Juta')
  })
})
