import type { Metadata } from "next";
import FrontLayout from "@/components/FrontLayout/FrontLayout";
import "./globals.css";

import { prisma } from "@/lib/prisma"

import { unstable_cache } from "next/cache"

const getSettings = unstable_cache(async () => {
  try {
    const settingsArr: any[] = await prisma.$queryRaw`SELECT * FROM Setting`
    return settingsArr.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {})
  } catch (e) {
    console.error("Failed to fetch settings for layout", e)
    return {}
  }
}, ['global-settings'], { tags: ['settings'], revalidate: 3600 })

export async function generateMetadata(): Promise<Metadata> {
  const settingsObj = await getSettings()
  const siteName = settingsObj.site_name || "Agendain"
  
  return {
    title: `${siteName} | Travel Agency Indonesia ke Eropa`,
    description: `Paket perjalanan terbaik dari Indonesia ke Eropa bersama ${siteName}.`,
  }
}

import { Providers } from "@/components/Providers/Providers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settingsObj = await getSettings()

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
    headingFont: 'Montserrat',
    bodyFont: 'Montserrat',
    borderRadius: '0.5rem',
  }

  if (settingsObj.theme_settings) {
    try {
      theme = { ...theme, ...JSON.parse(settingsObj.theme_settings) }
    } catch(e) {
      console.error("Failed to parse theme settings", e)
    }
  }

  const fontUrl = `https://fonts.googleapis.com/css2?family=${theme.headingFont.replace(/ /g, '+')}:wght@300;400;500;600;700;800&family=${theme.bodyFont.replace(/ /g, '+')}:wght@300;400;500;600;700;800&display=swap`

  const generateScale = (colorName: string, hexCode: string) => `
    --color-${colorName}: ${hexCode} !important;
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
    <html lang="id" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={fontUrl} rel="stylesheet" />
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

            --font-display: '${theme.headingFont}', system-ui, sans-serif !important;
            --font-body: '${theme.bodyFont}', system-ui, sans-serif !important;
            
            --radius-md: ${theme.borderRadius} !important;
          }
        `}</style>
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <FrontLayout settings={settingsObj}>{children}</FrontLayout>
        </Providers>
      </body>
    </html>
  );
}
