import BlogEditorForm from "../BlogEditorForm"

export const metadata = { title: "Buat Artikel Baru | Admin Agendain" }

export default function AdminBlogBaruPage() {
  return <BlogEditorForm mode="create" />
}
