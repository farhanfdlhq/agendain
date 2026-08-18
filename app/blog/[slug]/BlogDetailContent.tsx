'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, ChevronRight, Share2, ArrowLeft } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/useTranslation'
import FadeIn from '@/components/Motion/FadeIn'
import Stagger from '@/components/Motion/Stagger'
import { Badge } from '@/components/ui/badge'
import DOMPurify from 'isomorphic-dompurify'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'

type BlogCategory = { id: number; nama: string; namaEn: string | null; slug: string }
type BlogPost = {
  id: number
  title: string
  titleEn: string | null
  slug: string
  excerpt: string
  excerptEn: string | null
  content: string
  contentEn: string | null
  thumbnail: string
  publishedAt: string | null
  createdAt: string
  tags: any
  category: BlogCategory
}

export default function BlogDetailContent({ post, related }: { post: BlogPost; related: BlogPost[] }) {
  const { t, locale: language } = useTranslation()

  const title = language === 'en' ? (post.titleEn || post.title) : post.title
  const contentRaw = language === 'en' ? (post.contentEn || post.content) : post.content
  const categoryName = language === 'en' ? (post.category.namaEn || post.category.nama) : post.category.nama
  const tags = Array.isArray(post.tags) ? post.tags : []

  // Clean HTML to allow Tiptap formatting + images
  const cleanHtml = DOMPurify.sanitize(contentRaw, {
    ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'br', 'hr', 'img', 's', 'u'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title', 'class', 'style']
  })

  const getReadTime = (html: string) => {
    const words = html.replace(/<[^>]*>?/gm, '').split(/\s+/).length
    return Math.max(1, Math.ceil(words / 200))
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(language === 'en' ? 'en-GB' : 'id-ID', { 
      day: 'numeric', month: 'long', year: 'numeric' 
    })
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success(language === 'en' ? 'Link copied!' : 'Link disalin!')
  }

  return (
    <div className="bg-background min-h-screen pt-24 pb-16">
      <div className="container max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
          <ChevronRight size={14} />
          <Link href={`/blog?category=${post.category.slug}`} className="hover:text-primary transition-colors">{categoryName}</Link>
        </div>

        <FadeIn direction="up">
          <Badge className="mb-4" variant="secondary">{categoryName}</Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6">{title}</h1>
          
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 text-muted-foreground border-b pb-6">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5"><Calendar size={16} /> {formatDate(post.publishedAt || post.createdAt)}</div>
              <div className="flex items-center gap-1.5"><Clock size={16} /> {getReadTime(cleanHtml)} min read</div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-2">
                <Share2 size={14} /> {language === 'en' ? 'Share' : 'Bagikan'}
              </Button>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-12 shadow-md">
            <Image 
              src={post.thumbnail} 
              alt={title}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              priority
              className="object-cover"
            />
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.2}>
          {/* Article Content */}
          <article 
            className="prose prose-zinc dark:prose-invert prose-lg max-w-none 
              prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80 
              prose-img:rounded-xl prose-img:shadow-sm prose-img:mx-auto"
            dangerouslySetInnerHTML={{ __html: cleanHtml }}
          />
        </FadeIn>

        {/* Tags */}
        {tags.length > 0 && (
          <FadeIn direction="up" delay={0.3}>
            <div className="mt-12 pt-8 border-t">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                {language === 'en' ? 'Tags' : 'Tag'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="bg-muted/50 hover:bg-muted cursor-default">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          </FadeIn>
        )}

        {/* Related Posts */}
        {related.length > 0 && (
          <FadeIn direction="up" delay={0.4}>
            <div className="mt-16 pt-10 border-t">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">{language === 'en' ? 'Related Articles' : 'Artikel Terkait'}</h2>
                <Link href="/blog">
                  <Button variant="ghost" className="gap-1">{language === 'en' ? 'See all' : 'Lihat semua'} <ArrowLeft size={16} className="rotate-180" /></Button>
                </Link>
              </div>
              
              <Stagger className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {related.map((rel, i) => {
                  const relTitle = language === 'en' ? (rel.titleEn || rel.title) : rel.title
                  return (
                    <FadeIn key={rel.id} direction="up" delay={i * 0.1}>
                      <Link href={`/blog/${rel.slug}`} className="group block h-full bg-card rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-all">
                        <div className="relative aspect-[3/2] overflow-hidden">
                          <Image src={rel.thumbnail} alt={relTitle} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                          <Badge className="absolute top-3 left-3 shadow-sm">{categoryName}</Badge>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">{relTitle}</h3>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-4">
                            <Calendar size={12} /> {formatDate(rel.publishedAt || rel.createdAt)}
                          </div>
                        </div>
                      </Link>
                    </FadeIn>
                  )
                })}
              </Stagger>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  )
}
