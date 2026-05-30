import type { Metadata } from "next";
import FrontLayout from "@/components/FrontLayout/FrontLayout";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agendain | Travel Agency Indonesia ke Eropa",
  description: "Paket perjalanan terbaik dari Indonesia ke Eropa dengan guide profesional.",
};

import { Providers } from "@/components/Providers/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body suppressHydrationWarning>
        <Providers>
          <FrontLayout>{children}</FrontLayout>
        </Providers>
      </body>
    </html>
  );
}
