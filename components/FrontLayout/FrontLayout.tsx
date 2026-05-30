"use client"

import { usePathname } from "next/navigation"
import Navbar from "@/components/Navbar/Navbar"
import Footer from "@/components/Footer/Footer"

export default function FrontLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Hide global Navbar and Footer on admin routes
  if (pathname.startsWith('/admin')) {
    return <main>{children}</main>
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}
