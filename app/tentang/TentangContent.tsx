'use client'
import Image from 'next/image'
import Link from 'next/link'
import styles from './page.module.css'
import FadeIn from '@/components/Motion/FadeIn'
import Stagger from '@/components/Motion/Stagger'
import HeroHeader from '@/components/HeroHeader/HeroHeader'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { parseGoldText } from '@/lib/utils/textFormatting'
import { sanitizeRichText } from '@/lib/sanitize-richtext'

export default function TentangContent({ aboutSettings = {}, recentPosts = [] }: { aboutSettings?: any, recentPosts?: any[] }) {
  const { t, locale } = useTranslation()
  const isEn = locale === 'en'
  const getSetting = (key: string) => {
    const val = isEn ? (aboutSettings[`${key}_en`] || aboutSettings[key]) : aboutSettings[key];
    return val;
  }

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <HeroHeader 
        backgroundImage={getSetting('heroImage') || "/dest-swiss.webp"}
        title={parseGoldText(getSetting('heroTitle') || (isEn ? 'What is *Agendain*?' : 'Apa itu *Agendain*?'), styles, getSetting('heroTitleWeight'))}
        subtitle={<span style={{ fontWeight: getSetting('heroSubtitleWeight') ? Number(getSetting('heroSubtitleWeight')) : undefined }}>{getSetting('heroSubtitle') || t('about.new.heroSubtitle')}</span>}
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
                  style={{ objectFit: 'cover', borderRadius: 'var(--radius-lg)' }}
                  sizes="(max-width: 900px) 100vw, 50vw"
                />
              </div>
            </div>
            <div className={styles.missionText}>
              <h3 className={styles.missionLabel} style={{ fontWeight: getSetting('missionLabelWeight') ? Number(getSetting('missionLabelWeight')) : undefined }}>
                {getSetting('missionLabel') || t('about.new.missionLabel')}
              </h3>
              <h2 className={styles.missionTitle} style={{ fontWeight: getSetting('missionTitleWeight') ? Number(getSetting('missionTitleWeight')) : undefined }}>
                {getSetting('missionTitle') || t('about.new.missionTitle')}
              </h2>
              <p className={styles.missionDesc} style={{ fontWeight: getSetting('missionDescWeight') ? Number(getSetting('missionDescWeight')) : undefined }} dangerouslySetInnerHTML={{ __html: sanitizeRichText(getSetting('missionDesc') || t('about.new.missionDesc')).replace(/\\n/g, '<br/>') }} />
            </div>
          </div>
        </FadeIn>

        {/* Articles Grid Section */}
        {recentPosts && recentPosts.length > 0 && (
          <div className={styles.articlesSection}>
            <Stagger staggerDelay={0.1}>
              <div className={styles.articleGrid}>
                {recentPosts.map((post, index) => {
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
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
          </div>
        )}

        {/* Lead Guide Section */}
        <FadeIn direction="up" delay={0.6}>
          <div className={styles.guideSection}>
            <div className={styles.guideContent}>
              <div className={styles.guidePill}>{getSetting('guidePill') || t('about.new.guidePill')}</div>
              <h2 className={styles.guideTitle}>{parseGoldText(getSetting('guideTitle') || (isEn ? 'Meet Our *Lead Guide*' : 'Meet Our *Lead Guide*'), styles, getSetting('guideTitleWeight'))}</h2>
              <p className={styles.guideDesc} style={{ fontWeight: getSetting('guideDescWeight') ? Number(getSetting('guideDescWeight')) : undefined }}>
                {getSetting('guideDescP1') || t('about.new.guideDescP1')}<br/><br/>
                {getSetting('guideDescP2') || t('about.new.guideDescP2')}
              </p>
              <Link href="/konsultasi" className={styles.guideBtn}>
                {t('about.new.guideBtn')}
              </Link>
            </div>
            <div className={styles.guideImageWrapper}>
              <div className={styles.guideImageInner}>
                <Image 
                  src={getSetting('guideImage') || "/why-camera.webp"} 
                  alt="Lead Guide"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
