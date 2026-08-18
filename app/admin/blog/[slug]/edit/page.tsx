import BlogEditorForm from "../../BlogEditorForm"

export const metadata = { title: "Edit Artikel | Admin Agendain" }

type Props = { params: Promise<{ slug: string }> }

export default async function AdminBlogEditPage({ params }: Props) {
  const { slug } = await params
  return <BlogEditorForm mode="edit" slug={slug} />
}
