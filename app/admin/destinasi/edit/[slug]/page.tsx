import { redirect } from "next/navigation"

// Destinasi kini dikelola lewat modal "Kelola Destinasi" di halaman Paket Wisata.
export default function DestinasiRedirect() {
  redirect("/admin/open-trip?kelola=destinasi")
}
