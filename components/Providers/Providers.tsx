"use client"

import { SessionProvider } from "next-auth/react"
import { Toaster } from "react-hot-toast"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Toaster position="top-center" toastOptions={{ 
        style: { 
          borderRadius: '12px', 
          background: '#1e293b', 
          color: '#fff', 
          padding: '16px 24px', 
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }
      }} />
      {children}
    </SessionProvider>
  )
}
