import type { Metadata } from "next";
import FrontLayout from "@/components/FrontLayout/FrontLayout";
import "./globals.css";

import { prisma } from "@/lib/prisma"

export async function generateMetadata(): Promise<Metadata> {
  let siteName = "Agendain"
  try {
    const setting = await prisma.setting.findUnique({ where: { key: "site_name" } })
    if (setting) siteName = setting.value
  } catch (e) {
    console.error(e)
  }
  
  return {
    title: `${siteName} | Travel Agency Indonesia ke Eropa`,
    description: `Paket perjalanan terbaik dari Indonesia ke Eropa bersama ${siteName}.`,
  }
}

import { Providers } from "@/components/Providers/Providers";

import { Toaster } from 'react-hot-toast';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let settingsObj: any = {}
  try {
    const settingsArr = await prisma.setting.findMany()
    settingsObj = settingsArr.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {})
  } catch (e) {
    console.error("Failed to fetch settings for layout", e)
  }

  return (
    <html lang="id">
      <body suppressHydrationWarning>
        <Toaster position="top-center" toastOptions={{ 
          style: { 
            borderRadius: '12px', 
            background: '#1e293b', 
            color: '#fff', 
            padding: '16px 24px', 
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
          }
        }} />
        <Providers>
          <FrontLayout settings={settingsObj}>{children}</FrontLayout>
        </Providers>
      </body>
    </html>
  );
}
