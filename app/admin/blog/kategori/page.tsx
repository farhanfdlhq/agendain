import { redirect } from "next/navigation"

// Kategori blog kini dikelola lewat modal "Kelola Kategori" di halaman Artikel Blog.
export default function BlogKategoriRedirect() {
  redirect("/admin/blog?kelola=kategori")
}
