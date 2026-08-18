'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useMemo, useDeferredValue } from 'react'
import { Calendar, Clock, ChevronRight, Search, RefreshCw } from 'lucide-react'
import styles from './page.module.css'
import { useTranslation } from '@/lib/i18n/useTranslation'
import FadeIn from '@/components/Motion/FadeIn'
import Stagger from '@/components/Motion/Stagger'
import HeroHeader from '@/components/HeroHeader/HeroHeader'
import AirplaneLoader from '@/components/ui/airplane-loader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type BlogCategory = { id: number; nama: string; namaEn: string | null; slug: string }
type BlogPost = {
  id: number
  title: string
  titleEn: string | null
  slug: string
  excerpt: string
  excerptEn: string | null
  thumbnail: string
  publishedAt: string
  createdAt: string
  category: BlogCategory
  content: string // To calculate read time
  contentEn: string | null
}

export default function BlogContent() {
  const { t, locale: language } = useTranslation()
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [activeCategorySlug, setActiveCategorySlug] = useState('semua')
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearch = useDeferredValue(searchQuery)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [catRes, postRes] = await Promise.all([
        fetch('/api/blog/categories'),
        fetch('/api/blog?pageSize=100') // Fetch max 100 for client-side filtering for simplicity on public page
      ])
      
      if (!catRes.ok || !postRes.ok) throw new Error('Gagal memuat artikel')
      
      setCategories(await catRes.json())
      const postData = await postRes.json()
      setPosts(postData.posts || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const title = language === 'en' ? (post.titleEn || post.title) : post.title
      const excerpt = language === 'en' ? (post.excerptEn || post.excerpt) : post.excerpt
      
      const matchesCategory = activeCategorySlug === 'semua' || post.category.slug === activeCategorySlug
      const matchesSearch = title.toLowerCase().includes(deferredSearch.toLowerCase()) || 
                            excerpt.toLowerCase().includes(deferredSearch.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [posts, activeCategorySlug, deferredSearch, language])

  // Get the first post as featured if no search is active
  const featuredPost = (activeCategorySlug === 'semua' && deferredSearch === '' && filteredPosts.length > 0) 
    ? filteredPosts[0] 
    : null
    
  const gridPosts = featuredPost ? filteredPosts.slice(1) : filteredPosts

  const getTitle = (post: BlogPost) => language === 'en' ? (post.titleEn || post.title) : post.title
  const getExcerpt = (post: BlogPost) => language === 'en' ? (post.excerptEn || post.excerpt) : post.excerpt
  const getCategoryName = (cat: BlogCategory) => language === 'en' ? (cat.namaEn || cat.nama) : cat.nama
  
  const getReadTime = (content: string) => {
    const words = content.replace(/<[^>]*>?/gm, '').split(/\s+/).length
    return Math.max(1, Math.ceil(words / 200)) // 200 words per minute average
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(language === 'en' ? 'en-GB' : 'id-ID', { 
      day: 'numeric', month: 'short', year: 'numeric' 
    })
  }

  return (
    <div className={styles.page}>
      <HeroHeader 
        backgroundImage="/dest-italy.webp"
        title={<>{language === 'en' ? 'Agendain' : 'Jurnal'} <span className={styles.textGold}>{language === 'en' ? 'Journal' : 'Agendain'}</span></>}
        subtitle={language === 'en' 
          ? "Discover your dream vacation inspiration, practical travel tips, and exciting stories from around Europe."
          : "Temukan inspirasi liburan impianmu, tips perjalanan praktis, dan cerita seru dari berbagai sudut Eropa."}
      />

      <div className={styles.container}>
        <FadeIn direction="up" delay={0.2}>
          <div className={styles.filterSection}>
            <div className={styles.categoryScroll}>
              <button 
                onClick={() => setActiveCategorySlug('semua')}
                className={`${styles.categoryBadge} ${activeCategorySlug === 'semua' ? styles.categoryActive : ''}`}
              >
                {language === 'en' ? 'All' : 'Semua'}
              </button>
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setActiveCategorySlug(cat.slug)}
                  className={`${styles.categoryBadge} ${activeCategorySlug === cat.slug ? styles.categoryActive : ''}`}
                >
                  {getCategoryName(cat)}
                </button>
              ))}
            </div>
            
            <div className={styles.searchWrapper}>
              <Search size={18} className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder={language === 'en' ? "Search articles..." : "Cari artikel..."}
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </FadeIn>

        {loading ? (
          <div className="flex justify-center py-20"><AirplaneLoader size={48} /></div>
        ) : error ? (
          <div className="text-center py-20 space-y-4">
            <p className="text-destructive font-medium">{error}</p>
            <Button variant="outline" onClick={fetchData} className="gap-2"><RefreshCw size={16} /> Coba lagi</Button>
          </div>
        ) : (
          <>
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
                    <span className={styles.featuredTag}>{language === 'en' ? 'Featured Article' : 'Artikel Utama'}</span>
                  </div>
                  <div className={styles.featuredContent}>
                    <span className={styles.postCategory}>{getCategoryName(featuredPost.category)}</span>
                    <h2 className={styles.featuredTitle}>{getTitle(featuredPost)}</h2>
                    <p className={styles.featuredExcerpt}>{getExcerpt(featuredPost)}</p>
                    
                    <div className={styles.postMeta}>
                      <div className={styles.metaItem}>
                        <Calendar size={16} /> {formatDate(featuredPost.publishedAt || featuredPost.createdAt)}
                      </div>
                      <div className={styles.metaItem}>
                        <Clock size={16} /> {getReadTime(language === 'en' && featuredPost.contentEn ? featuredPost.contentEn : featuredPost.content)} min read
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
                              <Calendar size={14} /> {formatDate(post.publishedAt || post.createdAt)}
                            </div>
                            <div className={styles.metaItem}>
                              <Clock size={14} /> {getReadTime(language === 'en' && post.contentEn ? post.contentEn : post.content)} min read
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
          </>
        )}
      </div>
    </div>
  )
}
