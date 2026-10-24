import { describe, it, expect } from 'vitest'
import { breadcrumbLd, faqPageLd, productLd } from './jsonld'

describe('jsonld structured data helpers', () => {
  it('breadcrumbLd generates correct schema.org BreadcrumbList', () => {
    const ld = breadcrumbLd([
      { name: 'Beranda', path: '/' },
      { name: 'Open Trip', path: '/open-trip' },
      { name: 'Eropa Barat 10H', path: '/open-trip/eropa-barat-10h' },
    ])

    expect(ld['@context']).toBe('https://schema.org')
    expect(ld['@type']).toBe('BreadcrumbList')
    const items = ld.itemListElement as any[]
    expect(items).toHaveLength(3)
    expect(items[0]).toMatchObject({ position: 1, name: 'Beranda' })
    expect(items[1]).toMatchObject({ position: 2, name: 'Open Trip' })
    expect(items[2]).toMatchObject({ position: 3, name: 'Eropa Barat 10H' })
  })

  it('faqPageLd generates FAQPage schema when items are present', () => {
    const ld = faqPageLd([
      { question: 'Berapa biaya trip?', answer: 'Mulai dari 20 jutaan.' },
      { question: 'Apakah dibantu visa?', answer: 'Ya, tim kami mendampingi pengurusan visa.' },
    ])

    expect(ld).not.toBeNull()
    expect(ld?.['@context']).toBe('https://schema.org')
    expect(ld?.['@type']).toBe('FAQPage')
    const mainEntity = (ld?.mainEntity || []) as any[]
    expect(mainEntity).toHaveLength(2)
    expect(mainEntity[0].name).toBe('Berapa biaya trip?')
    expect(mainEntity[0].acceptedAnswer.text).toBe('Mulai dari 20 jutaan.')
  })

  it('faqPageLd returns null for empty or invalid items', () => {
    expect(faqPageLd([])).toBeNull()
    expect(faqPageLd([{ question: '', answer: '' }])).toBeNull()
  })

  it('productLd includes TouristTrip and Offer details', () => {
    const ld = productLd({
      name: 'Autumn in Switzerland',
      description: 'Trip musim gugur Swiss',
      path: '/open-trip/autumn-in-switzerland',
      price: 35000000,
      destination: 'Swiss',
    })

    expect(ld['@type']).toEqual(['Product', 'TouristTrip'])
    expect(ld.name).toBe('Autumn in Switzerland')
    expect(ld.offers).toMatchObject({
      '@type': 'Offer',
      price: '35000000',
      priceCurrency: 'IDR',
      availability: 'https://schema.org/InStock',
    })
  })
})
