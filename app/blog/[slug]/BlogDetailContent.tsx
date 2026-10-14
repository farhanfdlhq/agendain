'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Calendar, Clock, ChevronRight, Share2, User, RefreshCw, BookOpen } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/useTranslation'
import FadeIn from '@/components/Motion/FadeIn'
import ReadingProgress from '@/components/ReadingProgress/ReadingProgress'
import { blogListHref } from '@/lib/blog-list'
import { formatReadCount, shouldShowReadCount } from '@/lib/blog-reads'
import ReadTracker from './ReadTracker'
import Stagger from '@/components/Motion/Stagger'
import { sanitizeRichText } from '@/lib/sanitize-richtext'
import ShareModal from '@/components/blog/ShareModal'
import styles from './BlogDetail.module.css'

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
  author: string | null
  publishedAt: Date | string | null
  createdAt: Date | string
  updatedAt: Date | string
  tags: any
  readCount?: number
  category: BlogCategory
}

export default function BlogDetailContent({ post, related }: { post: BlogPost; related: BlogPost[] }) {
  const { t, locale: language } = useTranslation()

  const title = language === 'en' ? (post.titleEn || post.title) : post.title
  const contentRaw = language === 'en' ? (post.contentEn || post.content) : post.content
  const categoryName = language === 'en' ? (post.category.namaEn || post.category.nama) : post.category.nama
  const tags = Array.isArray(post.tags) ? post.tags : []

  // Sanitizer bersama — allowlist cocok schema editor TipTap (lihat lib/sanitize-richtext.ts)
  const cleanHtml = sanitizeRichText(contentRaw)

  const getReadTime = (html: string) => {
    const words = html.replace(/<[^>]*>?/gm, '').split(/\s+/).length
    return Math.max(1, Math.ceil(words / 200))
  }

  const formatDate = (dateStr: Date | string) => {
    return new Date(dateStr).toLocaleDateString(language === 'en' ? 'en-GB' : 'id-ID', { 
      day: 'numeric', month: 'long', year: 'numeric' 
    })
  }

  // Tampilkan "Diperbarui" hanya bila update terakhir cukup jauh (>1 menit)
  // setelah publish/dibuat — supaya artikel yang belum pernah diedit tak berisik.
  const publishedRef = post.publishedAt || post.createdAt
  const showUpdated = new Date(post.updatedAt).getTime() - new Date(publishedRef).getTime() > 60_000

  const [shareOpen, setShareOpen] = useState(false)

  return (
    <div className={`${styles.page} [timeline-scope:--article]`}>
      <ReadingProgress targetId="isi-artikel" />
      <ReadTracker slug={post.slug} targetId="isi-artikel" />
      <div className="container max-w-4xl mx-auto px-4 sm:px-6">

        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">{t('nav.home')}</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <Link href="/blog">Blog</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <Link href={blogListHref({ kategori: post.category.slug })}>{categoryName}</Link>
        </nav>

        <FadeIn direction="up">
          <Link href={blogListHref({ kategori: post.category.slug })} className={styles.kicker}>{categoryName}</Link>
          <h1 className={styles.title}>{title}</h1>

          <div className={styles.metaBar}>
            <div className={styles.meta}>
              <span className={styles.metaItem}><User size={16} /> {post.author || (language === 'en' ? 'Agendain Team' : 'Tim Agendain')}</span>
              <span className={styles.metaItem}><Calendar size={16} /> {formatDate(post.publishedAt || post.createdAt)}</span>
              {showUpdated && (
                <span className={styles.metaItem} title={language === 'en' ? 'Last updated' : 'Terakhir diperbarui'}>
                  <RefreshCw size={14} /> {language === 'en' ? 'Updated' : 'Diperbarui'} {formatDate(post.updatedAt)}
                </span>
              )}
              <span className={styles.metaItem}><Clock size={16} /> {getReadTime(cleanHtml)} min read</span>
              {/* Angka publik baru tampil setelah ambang (lib/blog-reads); admin melihat semua di tabel Blog. */}
              {shouldShowReadCount(post.readCount) && (
                <span className={styles.metaItem}><BookOpen size={16} /> {formatReadCount(post.readCount!, language)}</span>
              )}
            </div>

            <button type="button" onClick={() => setShareOpen(true)} className={styles.shareBtn}>
              <Share2 size={16} /> {language === 'en' ? 'Share' : 'Bagikan'}
            </button>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <div className={styles.cover}>
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
          {/* Article Content — kelas .richtext sama dengan kanvas editor CMS (WYSIWYG) */}
          <article
            id="isi-artikel"
            className="richtext [view-timeline:--article_block]"
            dangerouslySetInnerHTML={{ __html: cleanHtml }}
          />
        </FadeIn>

        {/* Tags */}
        {tags.length > 0 && (
          <FadeIn direction="up" delay={0.3}>
            <div className={styles.section}>
              <h3 className={styles.sectionLabel}>{language === 'en' ? 'Tags' : 'Tag'}</h3>
              <div className={styles.tags}>
                {tags.map((tag: string) => (
                  <span key={tag} className={styles.tag}>#{tag}</span>
                ))}
              </div>
            </div>
          </FadeIn>
        )}

        {/* Related Posts */}
        {related.length > 0 && (
          <FadeIn direction="up" delay={0.4}>
            <div className={styles.section}>
              <div className={styles.relatedHead}>
                <h2 className={styles.relatedTitle}>{language === 'en' ? 'Related Articles' : 'Artikel Terkait'}</h2>
                <Link href="/blog" className={styles.seeAll}>{language === 'en' ? 'See all' : 'Lihat semua'}</Link>
              </div>

              <Stagger className={styles.relatedGrid}>
                {related.map((rel) => {
                  const relTitle = language === 'en' ? (rel.titleEn || rel.title) : rel.title
                  const relCategory = language === 'en' ? (rel.category.namaEn || rel.category.nama) : rel.category.nama
                  return (
                    <Link key={rel.id} href={`/blog/${rel.slug}`} className={styles.relCard}>
                      <div className={styles.relImage}>
                        <Image src={rel.thumbnail} alt={relTitle} fill sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 300px" />
                        <span className={styles.relBadge}>{relCategory}</span>
                      </div>
                      <div className={styles.relBody}>
                        <h3 className={styles.relCardTitle}>{relTitle}</h3>
                        <span className={styles.relDate}><Calendar size={12} /> {formatDate(rel.publishedAt || rel.createdAt)}</span>
                      </div>
                    </Link>
                  )
                })}
              </Stagger>
            </div>
          </FadeIn>
        )}
      </div>

      <ShareModal open={shareOpen} onOpenChange={setShareOpen} title={title} language={language} />
    </div>
  )
}
