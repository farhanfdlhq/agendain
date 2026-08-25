import type { Metadata } from "next";
import FrontLayout from "@/components/FrontLayout/FrontLayout";
import {
  Montserrat,
  Inter,
  Outfit,
  Poppins,
  Playfair_Display,
  Plus_Jakarta_Sans,
  Roboto,
  DM_Sans,
  Lora,
} from "next/font/google";
import "./globals.css";
import {
  DEFAULT_BODY_FONT,
  DEFAULT_HEADING_FONT,
  FONT_CSS_VARS,
  fontCssVar,
  isFontChoice,
  type FontChoice,
} from "@/lib/fonts";

// Seluruh pilihan di /admin/settings/design dimuat di sini. Hanya Montserrat
// yang di-preload (dipakai sebagai fallback & body default); sisanya
// preload:false + display:'swap' supaya tidak lahir 9 <link rel=preload>.
// Konsekuensinya font pilihan tampil lewat swap (FOUT sangat singkat).
//
// Nama var di bawah HARUS sama dengan FONT_CSS_VARS di lib/fonts.ts. next/font
// mewajibkan argumennya literal yang ditulis di tempat ("Font loader values
// must be explicitly written literals"), jadi tidak bisa dibaca dari peta itu;
// blok `satisfies` di bawah yang menjaga keduanya tidak melenceng.
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", display: 'swap' });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: 'swap', preload: false });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: 'swap', preload: false });
// Poppins satu-satunya pilihan yang bukan variable font, jadi bobotnya harus
// disebut eksplisit. Rentangnya menutup 800 yang dipakai .heroTitle.
const poppins = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800", "900"], variable: "--font-poppins", display: 'swap', preload: false });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: 'swap', preload: false });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-plus-jakarta", display: 'swap', preload: false });
const roboto = Roboto({ subsets: ["latin"], variable: "--font-roboto", display: 'swap', preload: false });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: 'swap', preload: false });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora", display: 'swap', preload: false });

// Penjaga tipe: gagal compile bila nama var di atas dan di lib/fonts.ts beda.
const _FONT_VAR_NAMES = {
  Montserrat: "--font-montserrat",
  Inter: "--font-inter",
  Outfit: "--font-outfit",
  Poppins: "--font-poppins",
  "Playfair Display": "--font-playfair",
  "Plus Jakarta Sans": "--font-plus-jakarta",
  Roboto: "--font-roboto",
  "DM Sans": "--font-dm-sans",
  Lora: "--font-lora",
} as const satisfies typeof FONT_CSS_VARS;
void _FONT_VAR_NAMES;

const FONT_CLASSES: Record<FontChoice, string> = {
  "Montserrat": montserrat.variable,
  "Inter": inter.variable,
  "Outfit": outfit.variable,
  "Poppins": poppins.variable,
  "Playfair Display": playfair.variable,
  "Plus Jakarta Sans": plusJakarta.variable,
  "Roboto": roboto.variable,
  "DM Sans": dmSans.variable,
  "Lora": lora.variable,
};

import { prisma } from "@/lib/prisma"

import { unstable_cache } from "next/cache"

const getSettings = unstable_cache(async () => {
  try {
    const settingsArr = await prisma.setting.findMany()
    return settingsArr.reduce((acc: any, curr: { key: string, value: string }) => ({ ...acc, [curr.key]: curr.value }), {})
  } catch (e) {
    console.error("Failed to fetch settings for layout", e)
    return {}
  }
}, ['global-settings'], { tags: ['settings'], revalidate: 3600 })

export async function generateMetadata(): Promise<Metadata> {
  const settingsObj = await getSettings()
  const siteName = settingsObj.site_name || "Agendain"
  const rawFavicon = settingsObj.site_favicon || "/favicon.ico"
  const siteFavicon = rawFavicon.includes("?") ? rawFavicon : `${rawFavicon}?t=${Date.now()}`
  
  return {
    title: `${siteName} | Travel Agency Indonesia ke Eropa`,
    description: `Paket perjalanan terbaik dari Indonesia ke Eropa bersama ${siteName}.`,
    icons: {
      icon: siteFavicon,
      shortcut: siteFavicon,
      apple: siteFavicon,
    },
  }
}

import { Providers } from "@/components/Providers/Providers";
import OfflineDetector from "@/components/ui/offline-detector";
import { getServerLocale } from "@/lib/i18n/server";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settingsObj = await getSettings()
  const initialLocale = await getServerLocale()

  let theme = {
    colorPrimary: '#054569',
    colorSecondary: '#FFC704',
    colorAccent: '#056da2',
    colorSuccess: '#22c55e',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#3b82f6',
    colorBackground: '#ffffff',
    colorText: '#1c1c1c',
    navbarBackground: '#054569',
    navbarText: '#ffffff',
    navbarHover: '#FFC704',
    footerBackground: '#054569',
    footerText: '#ffffff',
    headingFont: DEFAULT_HEADING_FONT as string,
    bodyFont: DEFAULT_BODY_FONT as string,
    borderRadius: '0.5rem',
  }

  if (settingsObj.theme_settings) {
    try {
      theme = { ...theme, ...JSON.parse(settingsObj.theme_settings) }
    } catch(e) {
      console.error("Failed to parse theme settings", e)
    }
  }

  // Hanya font terpilih yang kelas variable-nya dipasang, jadi tidak semua
  // sembilan font ikut ter-request. Montserrat selalu ikut sebagai jaring
  // pengaman: bila nilai theme_settings tidak dikenal, fontCssVar() jatuh ke
  // sana dan var-nya harus tetap terdefinisi.
  const headingFont: FontChoice = isFontChoice(theme.headingFont) ? theme.headingFont : DEFAULT_HEADING_FONT
  const bodyFont: FontChoice = isFontChoice(theme.bodyFont) ? theme.bodyFont : DEFAULT_BODY_FONT
  const fontClassName = Array.from(new Set([
    montserrat.variable,
    FONT_CLASSES[headingFont],
    FONT_CLASSES[bodyFont],
  ])).join(' ')

  // Tinggi navbar. Bukan konstanta: header memakai min-height 72px tetapi
  // logonya setinggi `logo_height` dari Pengaturan Sistem (bisa sampai 120px)
  // plus padding 12px atas & bawah, jadi navbar ikut tumbuh. Nilainya
  // dipublikasikan sebagai CSS var supaya hero tiap halaman menyisakan ruang
  // yang PAS — sebelumnya 72px/80px/120px di-hardcode di beberapa file CSS dan
  // di beranda hero-nya tidak menyisakan ruang sama sekali (di-center dalam
  // 100dvh), sehingga di layar pendek judulnya menabrak logo & tombol menu.
  const logoHeight = Math.min(Math.max(Number(settingsObj.logo_height) || 42, 24), 120)
  const navbarHeight = Math.max(72, logoHeight + 24)

  const generateScale = (colorName: string, hexCode: string) => `    --color-${colorName}: ${hexCode} !important;
    --color-${colorName}-50: color-mix(in srgb, ${hexCode} 5%, white) !important;
    --color-${colorName}-100: color-mix(in srgb, ${hexCode} 10%, white) !important;
    --color-${colorName}-200: color-mix(in srgb, ${hexCode} 25%, white) !important;
    --color-${colorName}-300: color-mix(in srgb, ${hexCode} 40%, white) !important;
    --color-${colorName}-400: color-mix(in srgb, ${hexCode} 60%, white) !important;
    --color-${colorName}-500: ${hexCode} !important;
    --color-${colorName}-600: color-mix(in srgb, ${hexCode} 80%, black) !important;
    --color-${colorName}-700: color-mix(in srgb, ${hexCode} 60%, black) !important;
    --color-${colorName}-800: color-mix(in srgb, ${hexCode} 40%, black) !important;
    --color-${colorName}-900: color-mix(in srgb, ${hexCode} 20%, black) !important;
  `

  return (
    <html lang={initialLocale} data-scroll-behavior="smooth" className={fontClassName} suppressHydrationWarning>
      <head>
        <style>{`
          :root {
            ${generateScale('primary', theme.colorPrimary)}
            ${generateScale('dominant', theme.colorSecondary)}
            ${generateScale('accent', theme.colorAccent)}
            
            --color-success: ${theme.colorSuccess} !important;
            --color-warning: ${theme.colorWarning} !important;
            --color-error: ${theme.colorError} !important;
            --color-info: ${theme.colorInfo} !important;
            
            --color-on-primary: #ffffff !important;
            --color-on-dominant: #1c1c1c !important;
            
            --color-canvas: ${theme.colorBackground} !important;
            --color-surface: ${theme.colorBackground} !important;
            --color-ink: ${theme.colorText} !important;
            
            --color-navbar-bg: ${theme.navbarBackground} !important;
            --color-navbar-text: ${theme.navbarText} !important;
            --color-navbar-hover: ${theme.navbarHover} !important;
            
            --color-footer-bg: ${theme.footerBackground} !important;
            --color-footer-text: ${theme.footerText} !important;

            --font-display: var(${fontCssVar(headingFont, DEFAULT_HEADING_FONT)}), system-ui, sans-serif !important;
            --font-body: var(${fontCssVar(bodyFont, DEFAULT_BODY_FONT)}), system-ui, sans-serif !important;

            /* Tinggi header sesungguhnya + jeda 8px. Dipakai hero di beranda,
               HeroHeader, private-trip, dan .non-home-main di globals.css. */
            --logo-height: ${logoHeight}px;
            --navbar-height: ${navbarHeight}px;
            --navbar-offset: ${navbarHeight + 8}px;

            --radius-md: ${theme.borderRadius} !important;
          }
        `}</style>
      </head>
      <body suppressHydrationWarning>
        <OfflineDetector />
        <Providers>
          <FrontLayout settings={settingsObj} initialLocale={initialLocale}>{children}</FrontLayout>
        </Providers>
      </body>
    </html>
  );
}
