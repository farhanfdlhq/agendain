import type { Metadata } from "next";
import FrontLayout from "@/components/FrontLayout/FrontLayout";
import "./globals.css";

import { prisma } from "@/lib/prisma"

export async function generateMetadata(): Promise<Metadata> {
  let siteName = "Agendain"
  try {
    const settings: any[] = await prisma.$queryRaw`SELECT * FROM Setting WHERE \`key\` = 'site_name'`
    if (settings && settings.length > 0) siteName = settings[0].value
  } catch (e) {
    console.error(e)
  }
  
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
  let settingsObj: any = {}
  try {
    const settingsArr: any[] = await prisma.$queryRaw`SELECT * FROM Setting`
    settingsObj = settingsArr.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {})
  } catch (e) {
    console.error("Failed to fetch settings for layout", e)
  }

  return (
    <html lang="id">
      <body suppressHydrationWarning>
        <Providers>
          <FrontLayout settings={settingsObj}>{children}</FrontLayout>
        </Providers>
      </body>
    </html>
  );
}
