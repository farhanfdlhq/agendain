"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { Save, Eye, ArrowLeft, ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TiptapEditor } from "@/components/ui/tiptap-editor"
import { MediaPicker } from "@/components/ui/media-picker"
import AirplaneLoader from "@/components/ui/airplane-loader"
import Link from "next/link"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

type BlogCategory = { id: number; nama: string; slug: string }

interface BlogEditorFormProps {
  mode: "create" | "edit"
  slug?: string
}

export default function BlogEditorForm({ mode, slug }: BlogEditorFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(mode === "edit")
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [seoOpen, setSeoOpen] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [titleEn, setTitleEn] = useState("")
  const [formSlug, setFormSlug] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [excerptEn, setExcerptEn] = useState("")
  const [content, setContent] = useState("")
  const [contentEn, setContentEn] = useState("")
  const [thumbnail, setThumbnail] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [status, setStatus] = useState("draft")
  const [metaTitle, setMetaTitle] = useState("")
  const [metaDescription, setMetaDescription] = useState("")
  const [ogImage, setOgImage] = useState("")

  useEffect(() => {
    fetch("/api/blog/categories").then(r => r.json()).then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    if (mode === "edit" && slug) {
      fetch(`/api/blog/${slug}?preview=true`)
        .then(r => { if (!r.ok) throw new Error(); return r.json() })
        .then(post => {
          setTitle(post.title || "")
          setTitleEn(post.titleEn || "")
          setFormSlug(post.slug || "")
          setExcerpt(post.excerpt || "")
          setExcerptEn(post.excerptEn || "")
          setContent(post.content || "")
          setContentEn(post.contentEn || "")
          setThumbnail(post.thumbnail || "")
          setCategoryId(String(post.categoryId || ""))
          setTags(Array.isArray(post.tags) ? post.tags : [])
          setStatus(post.status || "draft")
          setMetaTitle(post.metaTitle || "")
          setMetaDescription(post.metaDescription || "")
          setOgImage(post.ogImage || "")
          setLoading(false)
        })
        .catch(() => { toast.error("Gagal memuat artikel"); router.push("/admin/blog") })
    }
  }, [mode, slug, router])

  // Auto-generate slug from title
  useEffect(() => {
    if (mode === "create" && title) {
      setFormSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""))
    }
  }, [title, mode])

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault()
      const newTag = tagInput.trim().toLowerCase()
      if (!tags.includes(newTag)) setTags([...tags, newTag])
      setTagInput("")
    }
    if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1))
    }
  }

  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag))

  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const clearError = (name: string) =>
    setErrors(prev => (prev[name] ? { ...prev, [name]: false } : prev))

  const handleSave = async () => {
    // Field wajib. Tombol simpan `<Button onClick>` (bukan submit di dalam
    // <form>), jadi divalidasi manual + border merah, bukan `required` native.
    const fieldErrors: Record<string, boolean> = {
      title: !title.trim(),
      excerpt: !excerpt.trim(),
      content: !content.trim(),
      thumbnail: !thumbnail,
      category: !categoryId,
    }
    if (Object.values(fieldErrors).some(Boolean)) {
      setErrors(fieldErrors)
      toast.error("Ada field wajib yang belum benar. Cek bagian bertanda merah.")
      return
    }
    setErrors({})

    setSaving(true)
    try {
      const body = {
        title: title.trim(),
        titleEn: titleEn.trim() || null,
        slug: formSlug.trim(),
        excerpt: excerpt.trim(),
        excerptEn: excerptEn.trim() || null,
        content,
        contentEn: contentEn || null,
        thumbnail,
        categoryId: parseInt(categoryId),
        tags,
        status,
        metaTitle: metaTitle.trim() || null,
        metaDescription: metaDescription.trim() || null,
        ogImage: ogImage || null,
      }

      const url = mode === "create" ? "/api/blog" : `/api/blog/${slug}`
      const method = mode === "create" ? "POST" : "PUT"
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Gagal menyimpan")
      }

      toast.success(mode === "create" ? "Artikel berhasil dibuat!" : "Artikel berhasil diperbarui!")
      router.push("/admin/blog")
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><AirplaneLoader size={32} /></div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/blog">
            <Button variant="ghost" size="sm" className="gap-1"><ArrowLeft size={16} /> Kembali</Button>
          </Link>
          <h1 className="text-2xl font-bold">{mode === "create" ? "Buat Artikel Baru" : "Edit Artikel"}</h1>
        </div>
        <div className="flex gap-2">
          {formSlug && (
            <Link href={`/blog/${formSlug}?preview=true`} target="_blank">
              <Button variant="outline" className="gap-2"><Eye size={16} /> Preview</Button>
            </Link>
          )}
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save size={16} /> {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="id">
            <TabsList>
              <TabsTrigger value="id">🇮🇩 Indonesia</TabsTrigger>
              <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
            </TabsList>

            <TabsContent value="id" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Judul</Label>
                <Input value={title} onChange={(e) => { setTitle(e.target.value); clearError('title') }} placeholder="Judul artikel..." aria-invalid={!!errors.title} />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={formSlug} onChange={(e) => setFormSlug(e.target.value)} placeholder="slug-artikel" className="font-mono text-sm" />
              </div>
              <div className="space-y-2">
                <Label>Ringkasan</Label>
                <Textarea value={excerpt} onChange={(e) => { setExcerpt(e.target.value); clearError('excerpt') }} placeholder="Ringkasan singkat artikel..." rows={3} aria-invalid={!!errors.excerpt} />
              </div>
              <div className="space-y-2">
                <Label>Konten</Label>
                <div className={errors.content ? "rounded-xl ring-2 ring-destructive" : ""}>
                  <TiptapEditor value={content} onChange={(v) => { setContent(v); clearError('content') }} placeholder="Tulis konten artikel di sini..." />
                </div>
                {errors.content && <p className="text-xs text-destructive">Konten harus diisi.</p>}
              </div>
            </TabsContent>

            <TabsContent value="en" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Title (EN)</Label>
                <Input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} placeholder="Article title..." />
              </div>
              <div className="space-y-2">
                <Label>Excerpt (EN)</Label>
                <Textarea value={excerptEn} onChange={(e) => setExcerptEn(e.target.value)} placeholder="Short summary..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Content (EN)</Label>
                <TiptapEditor value={contentEn} onChange={setContentEn} placeholder="Write article content here..." />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Thumbnail */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Thumbnail</CardTitle></CardHeader>
            <CardContent>
              <div className={errors.thumbnail ? "rounded-xl ring-2 ring-destructive" : ""}>
                <MediaPicker value={thumbnail} onChange={(url) => { setThumbnail(url); clearError('thumbnail') }} label="Pilih cover image" />
              </div>
              {errors.thumbnail && <p className="text-xs text-destructive mt-2">Thumbnail harus dipilih.</p>}
            </CardContent>
          </Card>

          {/* Category */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Kategori</CardTitle></CardHeader>
            <CardContent>
              <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); clearError('category') }}>
                <SelectTrigger aria-invalid={!!errors.category}><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Tag / Hashtag</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 bg-white rounded-xl border p-3">
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <div key={tag} className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-xs font-medium border border-blue-100">
                        {tag}
                        <button 
                          type="button" 
                          onClick={() => removeTag(tag)}
                          className="text-blue-400 hover:text-blue-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="relative mt-1">
                  <Input 
                    value={tagInput} 
                    onChange={(e) => setTagInput(e.target.value)} 
                    onKeyDown={handleTagKeyDown} 
                    placeholder="Ketik tag..." 
                    className="w-full text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg pr-20" 
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border pointer-events-none">+ Tambah</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Tekan Enter atau koma (,) untuk menambahkan.</p>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Status</CardTitle></CardHeader>
            <CardContent>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* SEO */}
          <Collapsible open={seoOpen} onOpenChange={setSeoOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">SEO Settings</CardTitle>
                    <ChevronDown size={16} className={`text-muted-foreground transition-transform ${seoOpen ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-3 pt-0">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Meta Title</Label>
                    <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="Override judul untuk SEO" className="text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Meta Description</Label>
                    <Textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="Deskripsi untuk mesin pencari" rows={2} className="text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">OG Image</Label>
                    <MediaPicker value={ogImage} onChange={setOgImage} label="Pilih OG image" />
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>
      </div>
    </div>
  )
}
