import HomeContent from '@/components/HomeContent/HomeContent'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'
import { pageMeta } from '@/lib/og'
import { PUBLISHED_OPEN_TRIP, toOpenTripCard, type OpenTripCardData } from '@/lib/open-trip-card'
import { JsonLd, organizationLd, websiteLd, faqPageLd } from '@/lib/jsonld'
import { parseFooterSettings, safeHref } from '@/lib/footer-settings'

export const revalidate = 60;

// og:image beranda = foto hero beranda (dari CMS `home_settings.heroBgImage`),
// jadi pratinjau share menampilkan hero yang sedang tayang. Canonical self-ref.
export async function generateMetadata(): Promise<Metadata> {
  let hero: string | undefined;
  let heroTitle: string | undefined;
  let heroSubtitle: string | undefined;
  try {
    const row = await prisma.setting.findUnique({ where: { key: "home_settings" } });
    if (row) {
      const o = JSON.parse(row.value);
      hero = o?.heroBgImage;
      heroTitle = o?.heroTitle;
      heroSubtitle = o?.heroSubtitle;
    }
  } catch {}
  return pageMeta({
    title: "Agendain | Travel Eropa & Italia dari Indonesia",
    description:
      "Open trip & private trip Eropa dari Indonesia bersama tour leader orang Indonesia yang tinggal di Italia. Tiket pesawat, hotel, dan itinerary kami siapkan.",
    path: "/",
    image: hero || "/hero-coastal.webp",
    // Kartu share meniru hero beranda: foto + judul & subjudul hero (dari CMS).
    card: {
      title: heroTitle || "Jangan Cuma Jadi Wacana, *Agendain* Aja!",
      subtitle:
        heroSubtitle ||
        "Dari tiket, hotel, sampai itinerary, semua udah kami siapkan. Kamu tinggal ajak teman dan siap berangkat.",
    },
  });
}

import { LOGO_BLUE } from '@/lib/site-logo'

async function HomeDataFetcher() {
  // Sama persis dengan /open-trip (urutan terbaru, hanya published) supaya
  // kartu beranda selalu sinkron; DB kosong = section tanpa kartu, bukan dummy.
  let packages: OpenTripCardData[] = []
  try {
    const dbPackages = await prisma.openTrip.findMany({
      where: PUBLISHED_OPEN_TRIP,
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: { destinasi: true },
    })
    packages = dbPackages.map(toOpenTripCard)
  } catch (error) {
    console.error('DB fetch failed (home packages)', error)
  }

  let homeSettings: any = {
    heroTitle: 'Jangan Cuma Jadi Wacana, Agendain Aja!',
    heroSubtitle: 'Dari tiket, hotel, sampai itinerary, semua udah kami siapkan. Kamu tinggal ajak teman dan siap berangkat.',
    sectionOrder: 'hero,why,destinations,testimonial,accordion,socialproof,faq',
  }

  try {
    const setting = await prisma.setting.findUnique({ where: { key: 'home_settings' } })
    if (setting) {
      const parsedSettings = JSON.parse(setting.value)
      // Fix for legacy database data
      if (parsedSettings.sectionOrder) {
        if (!parsedSettings.sectionOrder.includes('hero')) {
          parsedSettings.sectionOrder = 'hero,' + parsedSettings.sectionOrder
        }
        if (parsedSettings.sectionOrder.includes('packages')) {
          parsedSettings.sectionOrder = parsedSettings.sectionOrder.replace('packages,', '').replace(',packages', '').replace('packages', '')
        }
      }
      homeSettings = { ...homeSettings, ...parsedSettings }
    }
  } catch (error) {
    console.error('Failed to fetch home settings', error)
  }

  return (
    <HomeContent 
      packages={packages}
      homeSettings={homeSettings} 
    />
  )
}

// Structured data brand + situs (JSON-LD). Dibangun sekali dari settings; gagal
// baca DB tidak menjatuhkan halaman — jatuh ke identitas minimal yang valid.
async function buildSiteLd() {
  try {
    const rows = await prisma.setting.findMany()
    const map = rows.reduce((a: any, c: any) => { a[c.key] = c.value; return a }, {})
    const name = map.site_name || 'Agendain'
    // `site_logo` = versi putih untuk navbar gelap; Google menampilkan logo
    // organisasi di atas latar putih, jadi pakai versi biru.
    const logo = LOGO_BLUE
    const footer = parseFooterSettings(map.footer_settings)
    const sameAs = footer.socials.map((s) => safeHref(s.url)).filter((u) => /^https?:\/\//i.test(u))
    let telephone: string | undefined
    let faqData: Record<string, unknown> | null = null
    try {
      const hs = JSON.parse(map.home_settings || '{}')
      telephone = hs?.whatsapp_number || undefined
      if (Array.isArray(hs?.faqItems) && hs.faqItems.length > 0) {
        faqData = faqPageLd(
          hs.faqItems.map((item: any) => ({
            question: item?.q || item?.question || '',
            answer: item?.a || item?.answer || '',
          }))
        )
      }
    } catch {}
    const entries: Record<string, unknown>[] = [
      organizationLd({ name, logo, sameAs, telephone }),
      websiteLd(name),
    ]
    if (faqData) entries.push(faqData)
    return entries
  } catch {
    return [organizationLd({ name: 'Agendain', logo: LOGO_BLUE }), websiteLd('Agendain')]
  }
}

export default async function Home() {
  const [siteLd, homeContent] = await Promise.all([
    buildSiteLd(),
    HomeDataFetcher(),
  ])
  return (
    <>
      <JsonLd data={siteLd} />
      {homeContent}
    </>
  )
}
