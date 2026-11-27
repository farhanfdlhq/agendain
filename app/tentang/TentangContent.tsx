'use client'
import { fontStyleFrom } from '@/lib/font-style'
import type { CmsFields } from "@/lib/types/cms"
import type { RecentPost } from "./page"
import { useRef, useState } from 'react'
import Image from 'next/image'
import { frameStyle, parseFrame } from '@/lib/image-frame'
import Link from 'next/link'
import styles from './page.module.css'
import FadeIn from '@/components/Motion/FadeIn'
import Stagger from '@/components/Motion/Stagger'
import HeroHeader from '@/components/HeroHeader/HeroHeader'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { parseGoldText } from '@/lib/utils/textFormatting'
import { sanitizeRichText } from '@/lib/sanitize-richtext'
import Pagination from '@/components/Pagination/Pagination'

const POSTS_PER_PAGE = 2

const OPEN_QUOTE = /^["“]/
const CLOSE_QUOTE = /["”]$/

/** Kutipan tour leader. Bila teks CMS diapit tanda petik, tanda itu ditampilkan
 *  sebagai petik emas; isi kalimat tidak diubah. Tanpa tanda petik → teks polos. */
function GuideQuote({ text }: { text: string }) {
  const s = text.trim()
  if (!s) return null
  const open = OPEN_QUOTE.test(s)
  const close = s.length > 1 && CLOSE_QUOTE.test(s)
  const body = s.slice(open ? 1 : 0, close ? -1 : undefined)
  return (
    <p className={styles.guideQuote}>
      {open && <span className={styles.guideQuoteMark} aria-hidden="true">“</span>}
      {body}
      {close && <span className={styles.guideQuoteEnd} aria-hidden="true">”</span>}
    </p>
  )
}

export default function TentangContent({ aboutSettings = {}, recentPosts = [] }: { aboutSettings?: CmsFields, recentPosts?: RecentPost[] }) {
  const { t, locale } = useTranslation()
  const isEn = locale === 'en'
  const [postPage, setPostPage] = useState(1)
  const pageCount = Math.ceil(recentPosts.length / POSTS_PER_PAGE)
  const visiblePosts = recentPosts.slice((postPage - 1) * POSTS_PER_PAGE, postPage * POSTS_PER_PAGE)
  const articlesRef = useRef<HTMLDivElement>(null)
  // Di mobile kartu bertumpuk: setelah pindah halaman, bawa awal daftar artikel
  // kembali ke layar bila sudah tergulir lewat (tidak menggulir bila masih terlihat).
  const goToPostPage = (p: number) => {
    setPostPage(p)
    const el = articlesRef.current
    if (el && el.getBoundingClientRect().top < 0) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    }
  }
  const getSetting = (key: string) => {
    const val = isEn ? (aboutSettings[`${key}_en`] || aboutSettings[key]) : aboutSettings[key];
    return val;
  }

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <HeroHeader 
        backgroundImage={getSetting('heroImage') || "/dest-swiss.webp"}
        imageFrame={getSetting('heroImageFrame')}
        title={parseGoldText(getSetting('heroTitle') || (isEn ? 'What is *Agendain*?' : 'Apa itu *Agendain*?'), styles, getSetting('heroTitleWeight'), getSetting('heroTitleSize'))}
        subtitle={<span style={{ ...fontStyleFrom(getSetting('heroSubtitleWeight'), getSetting('heroSubtitleSize')) }}>{getSetting('heroSubtitle') || t('about.new.heroSubtitle')}</span>}
        minHeight="600px"
        paddingBottom="200px"
      />

      <div className={styles.container}>
        {/* Overlapping Mission Card */}
        <FadeIn direction="up" delay={0.2}>
          <div className={styles.missionCard}>
            <div className={styles.missionImageWrapper}>
              <div className={styles.missionImageInner}>
                <Image 
                  src={getSetting('missionImage') || "/dest-italy.webp"} 
                  alt="Misi Agendain"
                  fill
                  style={{ objectFit: 'cover', borderRadius: 'var(--radius-lg)', ...frameStyle(parseFrame(getSetting('missionImageFrame'))), transform: 'scale(var(--frame-zoom, 1))' }}
                  sizes="(max-width: 900px) 100vw, 50vw"
                />
              </div>
            </div>
            <div className={styles.missionText}>
              <h3 className={styles.missionLabel} style={{ ...fontStyleFrom(getSetting('missionLabelWeight'), getSetting('missionLabelSize')) }}>
                {getSetting('missionLabel') || t('about.new.missionLabel')}
              </h3>
              <h2 className={styles.missionTitle} style={{ ...fontStyleFrom(getSetting('missionTitleWeight'), getSetting('missionTitleSize')) }}>
                {getSetting('missionTitle') || t('about.new.missionTitle')}
              </h2>
              <p className={styles.missionDesc} style={{ ...fontStyleFrom(getSetting('missionDescWeight'), getSetting('missionDescSize')) }} dangerouslySetInnerHTML={{ __html: sanitizeRichText(getSetting('missionDesc') || t('about.new.missionDesc')).replace(/\\n/g, '<br/>') }} />
            </div>
          </div>
        </FadeIn>

        {/* Articles Grid Section */}
        {recentPosts && recentPosts.length > 0 && (
          <div className={styles.articlesSection} ref={articlesRef}>
            <Stagger staggerDelay={0.1}>
              <div className={styles.articleGrid}>
                {visiblePosts.map((post, index) => {
                  const title = isEn ? (post.titleEn || post.title) : post.title;
                  const excerpt = isEn ? (post.excerptEn || post.excerpt) : post.excerpt;
                  const categoryName = isEn ? (post.category?.namaEn || post.category?.nama) : post.category?.nama;
                  
                  return (
                    <FadeIn direction="up" delay={0.3 + (index * 0.1)} key={post.id}>
                      <div className={styles.articleCard}>
                        <div className={styles.articleImageWrapper}>
                          <Image 
                            src={post.thumbnail || "/placeholder.webp"} 
                            alt={title}
                            fill
                            sizes="(max-width: 900px) 100vw, (max-width: 1280px) 50vw, 600px"
                            className={styles.articleImage}
                          />
                        </div>
                        <div className={styles.articleContent}>
                          <div className={styles.articleMeta}>
                            <span className={styles.metaDate}>
                              <span className={styles.bullet}>•</span> {new Date(post.publishedAt || post.createdAt).toLocaleDateString(isEn ? 'en-US' : 'id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                            {categoryName && <span className={styles.metaCategory}>{categoryName}</span>}
                          </div>
                          <h3 className={styles.articleTitle}>{title}</h3>
                          <p className={styles.articleExcerpt}>{excerpt}</p>
                          <Link href={`/blog/${post.slug}`} className={styles.readMoreBtn}>{t('about.new.readMore')}</Link>
                        </div>
                      </div>
                    </FadeIn>
                  )
                })}
              </div>
            </Stagger>
            <Pagination
              page={postPage}
              pageCount={pageCount}
              onPageChange={goToPostPage}
              label={isEn ? 'Article pages' : 'Halaman artikel'}
              prevLabel={isEn ? 'Previous page' : 'Halaman sebelumnya'}
              nextLabel={isEn ? 'Next page' : 'Halaman berikutnya'}
            />
          </div>
        )}

        {/* Lead Guide Section */}
        <FadeIn direction="up" delay={0.6}>
          <div className={styles.guideSection}>
            <div className={styles.guideContent}>
              <div className={styles.guidePill}>{getSetting('guidePill') || t('about.new.guidePill')}</div>
              <h2 className={styles.guideTitle}>{parseGoldText(getSetting('guideTitle') || (isEn ? 'Meet Our *Lead Guide*' : 'Meet Our *Lead Guide*'), styles, getSetting('guideTitleWeight'), getSetting('guideTitleSize'))}</h2>
              {/* Paragraf 1 (kutipan tour leader) ditonjolkan; teks CMS tidak diubah —
                  tanda petik pembuka/penutup yang sudah ada hanya diberi gaya emas. */}
              <GuideQuote text={getSetting('guideDescP1') || t('about.new.guideDescP1')} />
              <p className={styles.guideDesc} style={{ ...fontStyleFrom(getSetting('guideDescWeight'), getSetting('guideDescSize')) }}>
                {getSetting('guideDescP2') || t('about.new.guideDescP2')}
              </p>
              <Link href="/private-trip" className={styles.guideBtn}>
                {t('about.new.guideBtn')}
              </Link>
            </div>
            <div className={styles.guidePassportWrap}>
              <div className={styles.guidePassport}>
                <Image
                  src={getSetting('guideImage') || "/tour-leader-passport.webp"}
                  alt={isEn ? 'Tour leader passport' : 'Paspor tour leader'}
                  fill
                  quality={95}
                  sizes="(max-width: 900px) 320px, 640px"
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
