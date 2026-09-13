"use client"

import { usePathname } from "next/navigation"
import Navbar from "@/components/Navbar/Navbar"
import Footer from "@/components/Footer/Footer"
import FloatingWhatsApp from "@/components/FloatingWhatsApp/FloatingWhatsApp"
import { LanguageProvider } from "@/lib/i18n/LanguageContext"
import { formatWhatsAppNumber } from "@/lib/utils"
import { waFloating } from "@/lib/whatsapp-messages"

export default function FrontLayout({ children, settings, initialLocale = 'id' }: { children: React.ReactNode, settings?: any, initialLocale?: 'id' | 'en' }) {
  const pathname = usePathname()
  
  // Hide global Navbar and Footer on admin routes.
  //
  // `/invoice/<token>` ikut dikecualikan: itu dokumen tagihan yang dibuka klien
  // dari tautan langsung dan dicetak ke PDF — navbar, footer, dan tombol
  // WhatsApp mengambang tidak punya tempat di sana.
  if (pathname.startsWith('/admin') || pathname.startsWith('/invoice') || pathname.startsWith('/itinerary')) {
    return <main>{children}</main>
  }

  const isHome = pathname === '/'
  const isEn = initialLocale === 'en'

  return (
    <LanguageProvider initialLocale={initialLocale}>
      <Navbar settings={settings} />
      <main className={!isHome ? "non-home-main" : ""}>{children}</main>
      <Footer settings={settings} />
      <FloatingWhatsApp
        phoneNumber={formatWhatsAppNumber(settings?.whatsapp_number) || undefined}
        message={waFloating(isEn, pathname)}
      />
    </LanguageProvider>
  )
}
