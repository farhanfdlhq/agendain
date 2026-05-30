import type { Metadata } from "next";
import FrontLayout from "@/components/FrontLayout/FrontLayout";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agendain | Travel Agency Indonesia ke Eropa",
  description: "Paket perjalanan terbaik dari Indonesia ke Eropa dengan guide profesional.",
};

import { Providers } from "@/components/Providers/Providers";

import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
          <FrontLayout>{children}</FrontLayout>
        </Providers>
      </body>
    </html>
  );
}
