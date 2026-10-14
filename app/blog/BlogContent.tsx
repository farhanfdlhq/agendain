'use client'
import { fontStyleFrom } from '@/lib/font-style'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { Calendar, Clock, ChevronRight, Search, X } from 'lucide-react'
import styles from './page.module.css'
import { useTranslation } from '@/lib/i18n/useTranslation'
import FadeIn from '@/components/Motion/FadeIn'
import Stagger from '@/components/Motion/Stagger'
import HeroHeader from '@/components/HeroHeader/HeroHeader'
import Pagination from '@/components/Pagination/Pagination'
import { parseGoldText } from '@/lib/utils/textFormatting'
import { blogListHref } from '@/lib/blog-list'

type BlogCategory = { id: number; nama: string; namaEn: string | null; slug: string }
type BlogPost = {
  id: number
  title: string
  titleEn: string | null
  slug: string
  excerpt: string
  excerptEn: string | null
  thumbnail: string
  date: string
  readMin: number
  readMinEn: number | null
  category: BlogCategory
}

type BlogContentProps = {
  blogSettings?: any
  categories: BlogCategory[]
  posts: BlogPost[]
  /** Artikel terbaru tampil besar di atas (hanya halaman 1 tanpa filter). */
  featured: boolean
  total: number
  page: number
  pageCount: number
  kategori: string | null
  q: string
}

// Data sudah dipaginasi & difilter di server (app/blog/page.tsx) supaya tautan
// artikel ada di HTML awal untuk mesin pencari. Komponen ini hanya merender dan
// mengubah URL (kategori, pencarian, halaman).
export default function BlogContent({
  blogSettings = {},
  categories,
  posts,
  featured,
  total,
  page,
  pageCount,
  kategori,
  q,
}: BlogContentProps) {
  const { locale: language } = useTranslation()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState(q)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sinkron dengan URL (mis. tombol Back) hanya saat kolom tidak sedang diketik,
  // agar spasi di akhir ketikan tidak terhapus oleh hasil yang sudah di-trim.
  useEffect(() => {
    if (document.activeElement !== inputRef.current) setSearchQuery(q)
  }, [q])

  // Pencarian di server: tunggu jeda mengetik lalu ganti URL (kembali ke halaman 1).
  useEffect(() => {
    const next = searchQuery.trim()
    if (next === q) return
    const id = setTimeout(() => {
      startTransition(() => {
        router.replace(blogListHref({ kategori, q: next }, false), { scroll: false })
      })
    }, 400)
    return () => clearTimeout(id)
  }, [searchQuery, q, kategori, router])

  const featuredPost = featured ? posts[0] ?? null : null
  const gridPosts = featuredPost ? posts.slice(1) : posts
  const filtering = !!kategori || !!q

  const getTitle = (post: BlogPost) => language === 'en' ? (post.titleEn || post.title) : post.title
  const getExcerpt = (post: BlogPost) => language === 'en' ? (post.excerptEn || post.excerpt) : post.excerpt
  const getCategoryName = (cat: BlogCategory) => language === 'en' ? (cat.namaEn || cat.nama) : cat.nama
  const getReadTime = (post: BlogPost) => (language === 'en' && post.readMinEn ? post.readMinEn : post.readMin)

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(language === 'en' ? 'en-GB' : 'id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  // Header dari blog_settings (CMS). Nilai lama yang sebelumnya di-hardcode
  // sekarang menjadi fallback, jadi tampilan tidak berubah selama key-nya
  // belum pernah disimpan. Gambar tidak per-bahasa, jadi dibaca langsung.
  const getSetting = (key: string) =>
    (language === 'en' ? (blogSettings[`${key}_en`] || blogSettings[key]) : blogSettings[key]) || ''

  const heroImage = blogSettings.heroImage || '/dest-italy.webp'
  const heroTitle = getSetting('heroTitle')
  const heroSubtitle = getSetting('heroSubtitle')

  return (
    <div className={styles.page}>
      <HeroHeader
        backgroundImage={heroImage}
        title={heroTitle
          ? parseGoldText(heroTitle, styles, blogSettings.heroTitleWeight, blogSettings.heroTitleSize)
          : <>{language === 'en' ? 'Agendain' : 'Jurnal'} <span className={styles.textGold}>{language === 'en' ? 'Journal' : 'Agendain'}</span></>}
        subtitle={heroSubtitle
          ? <span style={fontStyleFrom(blogSettings.heroSubtitleWeight, blogSettings.heroSubtitleSize)}>{heroSubtitle}</span>
          : (language === 'en'
            ? "Discover your dream vacation inspiration, practical travel tips, and exciting stories from around Europe."
            : "Temukan inspirasi liburan impianmu, tips perjalanan praktis, dan cerita seru dari berbagai sudut Eropa.")}
      />

      <div className={styles.container}>
        <FadeIn direction="up" delay={0.2}>
          <div className={styles.filterSection} id="artikel">
            <nav className={styles.categoryScroll} aria-label={language === 'en' ? 'Categories' : 'Kategori'}>
              <Link
                href={blogListHref({ q })}
                className={`${styles.categoryBadge} ${!kategori ? styles.categoryActive : ''}`}
                aria-current={!kategori ? 'page' : undefined}
              >
                {language === 'en' ? 'All' : 'Semua'}
              </Link>
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  href={blogListHref({ kategori: cat.slug, q })}
                  className={`${styles.categoryBadge} ${kategori === cat.slug ? styles.categoryActive : ''}`}
                  aria-current={kategori === cat.slug ? 'page' : undefined}
                >
                  {getCategoryName(cat)}
                </Link>
              ))}
            </nav>

            <div className={styles.searchWrapper}>
              <Search size={18} className={styles.searchIcon} />
              <input
                ref={inputRef}
                type="search"
                placeholder={language === 'en' ? "Search articles..." : "Cari artikel..."}
                aria-label={language === 'en' ? 'Search articles' : 'Cari artikel'}
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className={styles.searchClear}
                  aria-label={language === 'en' ? 'Clear search' : 'Hapus pencarian'}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </FadeIn>

        <div className={isPending ? styles.listPending : undefined} aria-busy={isPending}>
            {/* Umpan balik hasil: tampil hanya saat pencarian/filter aktif. */}
            {filtering && (
              <p className={styles.resultCount}>
                {total}{' '}
                {language === 'en'
                  ? `article${total === 1 ? '' : 's'} found`
                  : 'artikel ditemukan'}
                {q && <> · &ldquo;{q}&rdquo;</>}
              </p>
            )}

            {/* Featured Post */}
            {featuredPost && (
              <FadeIn direction="up" delay={0.3}>
                <Link href={`/blog/${featuredPost.slug}`} className={styles.featuredCard}>
                  <div className={styles.featuredImageWrapper}>
                    <Image 
                      src={featuredPost.thumbnail} 
                      alt={getTitle(featuredPost)}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={true}
                      className={styles.featuredImage}
                    />
                    <span className={styles.featuredTag}>{language === 'en' ? 'Latest Article' : 'Artikel Terbaru'}</span>
                  </div>
                  <div className={styles.featuredContent}>
                    <span className={styles.postCategory}>{getCategoryName(featuredPost.category)}</span>
                    <h2 className={styles.featuredTitle}>{getTitle(featuredPost)}</h2>
                    <p className={styles.featuredExcerpt}>{getExcerpt(featuredPost)}</p>
                    
                    <div className={styles.postMeta}>
                      <div className={styles.metaItem}>
                        <Calendar size={16} /> {formatDate(featuredPost.date)}
                      </div>
                      <div className={styles.metaItem}>
                        <Clock size={16} /> {getReadTime(featuredPost)} min read
                      </div>
                    </div>
                    
                    <div className={styles.readMoreBtn}>
                      {language === 'en' ? 'Read More' : 'Baca Selengkapnya'} <ChevronRight size={18} />
                    </div>
                  </div>
                </Link>
              </FadeIn>
            )}

            {/* Grid Posts */}
            {gridPosts.length > 0 ? (
              <Stagger staggerDelay={0.1} className={styles.postsGrid}>
                {gridPosts.map((post, i) => (
                  <FadeIn key={post.id} direction="up" delay={0.2 + (i * 0.1)} className={styles.postCardWrapper}>
                    <Link href={`/blog/${post.slug}`} className={styles.postCard}>
                      <div className={styles.postImageWrapper}>
                        <Image 
                          src={post.thumbnail} 
                          alt={getTitle(post)}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className={styles.postImage}
                        />
                        <span className={styles.postCategoryBadge}>{getCategoryName(post.category)}</span>
                      </div>
                      <div className={styles.postContent}>
                        <h3 className={styles.postTitle}>{getTitle(post)}</h3>
                        <p className={styles.postExcerpt}>{getExcerpt(post)}</p>
                        
                        <div className={styles.postMetaBottom}>
                          <div className={styles.postMeta}>
                            <div className={styles.metaItem}>
                              <Calendar size={14} /> {formatDate(post.date)}
                            </div>
                            <div className={styles.metaItem}>
                              <Clock size={14} /> {getReadTime(post)} min read
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </FadeIn>
                ))}
              </Stagger>
            ) : (
              !featuredPost && (
                <div className={styles.emptyState}>
                  <h3>{language === 'en' ? 'No articles found' : 'Tidak ada artikel yang ditemukan'}</h3>
                  <p>{language === 'en' ? 'Try using different keywords or categories.' : 'Coba gunakan kata kunci lain atau pilih kategori yang berbeda.'}</p>
                </div>
              )
            )}

            <Pagination
              page={page}
              pageCount={pageCount}
              hrefFor={(p) => blogListHref({ kategori, q, page: p })}
              label={language === 'en' ? 'Article pages' : 'Halaman artikel'}
              prevLabel={language === 'en' ? 'Previous page' : 'Halaman sebelumnya'}
              nextLabel={language === 'en' ? 'Next page' : 'Halaman berikutnya'}
            />
        </div>
      </div>
    </div>
  )
}
