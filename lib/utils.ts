import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatWhatsAppNumber(number?: string): string {
  if (!number) return ""
  
  // Hapus semua karakter selain angka (seperti spasi, +, -)
  let cleanNumber = number.replace(/\D/g, "")
  
  // Jika nomor diawali dengan 0, ubah menjadi 62 (kode negara Indonesia)
  if (cleanNumber.startsWith("0")) {
    cleanNumber = "62" + cleanNumber.substring(1)
  }
  
  return cleanNumber
}

export function generateWhatsAppLink(number?: string, message?: string) {
  const cleanNumber = formatWhatsAppNumber(number) || "6281995264565"
  const cleanMessage = message || "Halo, saya ingin bertanya mengenai paket wisata."
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(cleanMessage)}`
}

