'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Calendar, Clock, ChevronRight, Search } from 'lucide-react'
import styles from './page.module.css'
import { useTranslation } from '@/lib/i18n/useTranslation'
import FadeIn from '@/components/Motion/FadeIn'
import Stagger from '@/components/Motion/Stagger'
import HeroHeader from '@/components/HeroHeader/HeroHeader'

const BLOG_POSTS = [
  {
    id: 1,
    title: '5 Spot Tersembunyi di Roma yang Wajib Kamu Kunjungi',
    excerpt: 'Lupakan sejenak Colosseum, ini dia 5 tempat rahasia di Roma yang jarang diketahui turis tapi punya pemandangan spektakuler.',
    category: 'Destinasi',
    date: '12 Okt 2026',
    readTime: '4 min read',
    image: '/dest-italy.webp', // Using existing image
    featured: true
  },
  {
    id: 2,
    title: 'Tips Packing Musim Dingin ke Eropa Tanpa Koper Overweight',
    excerpt: 'Cara cerdas menyusun pakaian musim dingin agar tetap stylish di Eropa tanpa harus pusing memikirkan bagasi berlebih.',
    category: 'Tips',
    date: '08 Okt 2026',
    readTime: '5 min read',
    image: '/why-hotel.webp',
    featured: false
  },
  {
    id: 3,
    title: 'Rekomendasi Gelato Paling Otentik di Florence',
    excerpt: 'Perjalanan ke Italia belum lengkap tanpa mencoba Gelato asli. Berikut rekomendasi kedai Gelato terbaik menurut warga lokal.',
    category: 'Kuliner',
    date: '03 Okt 2026',
    readTime: '3 min read',
    image: '/dest-swiss.webp',
    featured: false
  },
  {
    id: 4,
    title: 'Itinerary 7 Hari Keliling Swiss Pakai Kereta',
    excerpt: 'Menjelajahi keindahan pegunungan Alpen dan danau-danau Swiss dengan Swiss Travel Pass. Praktis, nyaman, dan tak terlupakan.',
    category: 'Itinerary',
    date: '28 Sep 2026',
    readTime: '6 min read',
    image: '/why-camera.webp',
    featured: false
  },
  {
    id: 5,
    title: 'Berapa Budget Ideal Liburan ke Paris Selama Seminggu?',
    excerpt: 'Rincian lengkap biaya mulai dari tiket pesawat, akomodasi, transportasi lokal, hingga tiket masuk museum Louvre.',
    category: 'Tips',
    date: '21 Sep 2026',
    readTime: '7 min read',
    image: '/placeholder.webp',
    featured: false
  },
]

const CATEGORIES = ['Semua', 'Destinasi', 'Tips', 'Kuliner', 'Itinerary']

export default function BlogContent() {
  const { t } = useTranslation()
  const [activeCategory, setActiveCategory] = useState('Semua')
  const [searchQuery, setSearchQuery] = useState('')

  const featuredPost = BLOG_POSTS.find(post => post.featured)
  
  const filteredPosts = BLOG_POSTS.filter(post => {
    const matchesCategory = activeCategory === 'Semua' || post.category === activeCategory
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch && !post.featured
  })

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <HeroHeader 
        backgroundImage="/dest-italy.webp"
        title={<>Jurnal <span className={styles.textGold}>Agendain</span></>}
        subtitle="Temukan inspirasi liburan impianmu, tips perjalanan praktis, dan cerita seru dari berbagai sudut Eropa."
      />

      <div className={styles.container}>
        {/* Search & Filter Bar */}
        <FadeIn direction="up" delay={0.2}>
          <div className={styles.filterSection}>
            <div className={styles.categoryScroll}>
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`${styles.categoryBadge} ${activeCategory === cat ? styles.categoryActive : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            <div className={styles.searchWrapper}>
              <Search size={18} className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Cari artikel..." 
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </FadeIn>

        {/* Featured Post (Only show if 'Semua' and no search) */}
        {activeCategory === 'Semua' && searchQuery === '' && featuredPost && (
          <FadeIn direction="up" delay={0.3}>
            <Link href={`/blog/${featuredPost.id}`} className={styles.featuredCard}>
              <div className={styles.featuredImageWrapper}>
                <Image 
                  src={featuredPost.image} 
                  alt={featuredPost.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={true}
                  className={styles.featuredImage}
                />
                <span className={styles.featuredTag}>Artikel Utama</span>
              </div>
              <div className={styles.featuredContent}>
                <span className={styles.postCategory}>{featuredPost.category}</span>
                <h2 className={styles.featuredTitle}>{featuredPost.title}</h2>
                <p className={styles.featuredExcerpt}>{featuredPost.excerpt}</p>
                
                <div className={styles.postMeta}>
                  <div className={styles.metaItem}>
                    <Calendar size={16} /> {featuredPost.date}
                  </div>
                  <div className={styles.metaItem}>
                    <Clock size={16} /> {featuredPost.readTime}
                  </div>
                </div>
                
                <div className={styles.readMoreBtn}>
                  Baca Selengkapnya <ChevronRight size={18} />
                </div>
              </div>
            </Link>
          </FadeIn>
        )}

        {filteredPosts.length > 0 ? (
          <Stagger staggerDelay={0.1} className={styles.postsGrid}>
            {filteredPosts.map((post, i) => (
              <FadeIn key={post.id} direction="up" delay={0.2 + (i * 0.1)} className={styles.postCardWrapper}>
                <Link href={`/blog/${post.id}`} className={styles.postCard}>
                    <div className={styles.postImageWrapper}>
                      <Image 
                        src={post.image} 
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className={styles.postImage}
                      />
                      <span className={styles.postCategoryBadge}>{post.category}</span>
                    </div>
                    <div className={styles.postContent}>
                      <h3 className={styles.postTitle}>{post.title}</h3>
                      <p className={styles.postExcerpt}>{post.excerpt}</p>
                      
                      <div className={styles.postMetaBottom}>
                        <div className={styles.postMeta}>
                          <div className={styles.metaItem}>
                            <Calendar size={14} /> {post.date}
                          </div>
                          <div className={styles.metaItem}>
                            <Clock size={14} /> {post.readTime}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </FadeIn>
              ))}
            </Stagger>
          ) : (
            <div className={styles.emptyState}>
              <h3>Tidak ada artikel yang ditemukan</h3>
              <p>Coba gunakan kata kunci lain atau pilih kategori yang berbeda.</p>
            </div>
          )}
      </div>
    </div>
  )
}
