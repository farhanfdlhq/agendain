'use client'
import Hero from '@/components/Hero/Hero'
import PackageCard from '@/components/PackageCard/PackageCard'
import DestinationCard from '@/components/DestinationCard/DestinationCard'
import Link from 'next/link'
import styles from '@/app/page.module.css'
import { Landmark, ShieldCheck, Compass, Route } from 'lucide-react'
import FadeIn from '@/components/Motion/FadeIn'
import Stagger from '@/components/Motion/Stagger'
import { useTranslation } from '@/lib/i18n/useTranslation'

export default function HomeContent({ 
  packages, 
  destinations, 
  homeSettings 
}: { 
  packages: any[], 
  destinations: any[], 
  homeSettings: any 
}) {
  const { t, locale } = useTranslation()

  const heroTitle = locale === 'en' ? (homeSettings.heroTitle_en || homeSettings.heroTitle) : homeSettings.heroTitle
  const heroSubtitle = locale === 'en' ? (homeSettings.heroSubtitle_en || homeSettings.heroSubtitle) : homeSettings.heroSubtitle
  const featuresTitle = locale === 'en' ? (homeSettings.featuresTitle_en || homeSettings.featuresTitle) : homeSettings.featuresTitle
  const ctaTitle = locale === 'en' ? (homeSettings.ctaTitle_en || homeSettings.ctaTitle) : homeSettings.ctaTitle
  const ctaText = locale === 'en' ? (homeSettings.ctaText_en || homeSettings.ctaText) : homeSettings.ctaText
  
  const ctaBtn1Text = locale === 'en' ? (homeSettings.ctaBtn1Text_en || homeSettings.ctaBtn1Text || t('home.ctaPrimary')) : (homeSettings.ctaBtn1Text || t('home.ctaPrimary'))
  const ctaBtn2Text = locale === 'en' ? (homeSettings.ctaBtn2Text_en || homeSettings.ctaBtn2Text || t('home.ctaSecondary')) : (homeSettings.ctaBtn2Text || t('home.ctaSecondary'))
  
  const ctaBtn1Link = homeSettings.ctaBtn1Link || '/private-trip'
  const ctaBtn2Link = homeSettings.ctaBtn2Link || 'https://wa.me/6281234567890'

  const sectionOrderString = homeSettings.sectionOrder || 'packages,destinations,features,cta'
  const sectionOrder = sectionOrderString.split(',')

  const renderSection = (key: string) => {
    switch(key) {
      case 'packages':
        return (
          <section key="packages" className={styles.section}>
            <div className={styles.container}>
              <FadeIn direction="up">
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>{t('home.featuredPackages')}</h2>
                  <Link href="/paket" className={styles.viewAll}>{t('home.viewAll')}</Link>
                </div>
              </FadeIn>
              
              <Stagger className={styles.packageGrid}>
                {packages.map((pkg) => (
                  <PackageCard key={pkg.slug} {...pkg} />
                ))}
              </Stagger>
            </div>
          </section>
        )
      case 'destinations':
        return (
          <section key="destinations" className={styles.sectionAlt}>
            <div className={styles.container}>
              <FadeIn direction="up">
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>{t('home.popularDest')}</h2>
                  <Link href="/destinasi" className={styles.viewAll}>{t('home.exploreDest')}</Link>
                </div>
              </FadeIn>
              
              <Stagger className={styles.destinationGrid}>
                {destinations.map((dest) => (
                  <DestinationCard key={dest.slug} {...dest} />
                ))}
              </Stagger>
            </div>
          </section>
        )
      case 'features':
        return (
          <section key="features" className={styles.features}>
            <div className={styles.container}>
              <div className={styles.featuresHeader}>
                <FadeIn direction="up">
                  <h2 className={styles.featuresTitle} style={homeSettings.featuresTitleColor ? { color: homeSettings.featuresTitleColor } : {}}>
                    {featuresTitle}
                  </h2>
                </FadeIn>
              </div>
              <div className={styles.featuresGrid}>
                <FadeIn delay={0.1} className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <Landmark size={32} strokeWidth={1.5} color="currentColor" />
                  </div>
                  <div className={styles.featureText}>
                    <h3>{t('feat.euro')}</h3>
                    <p>{t('feat.euroDesc')}</p>
                  </div>
                </FadeIn>
                <FadeIn delay={0.2} className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <ShieldCheck size={32} strokeWidth={1.5} color="currentColor" />
                  </div>
                  <div className={styles.featureText}>
                    <h3>{t('feat.price')}</h3>
                    <p>{t('feat.priceDesc')}</p>
                  </div>
                </FadeIn>
                <FadeIn delay={0.3} className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <Compass size={32} strokeWidth={1.5} color="currentColor" />
                  </div>
                  <div className={styles.featureText}>
                    <h3>{t('feat.guide')}</h3>
                    <p>{t('feat.guideDesc')}</p>
                  </div>
                </FadeIn>
                <FadeIn delay={0.4} className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <Route size={32} strokeWidth={1.5} color="currentColor" />
                  </div>
                  <div className={styles.featureText}>
                    <h3>{t('feat.itin')}</h3>
                    <p>{t('feat.itinDesc')}</p>
                  </div>
                </FadeIn>
              </div>
            </div>
          </section>
        )
      case 'cta':
        return (
          <section key="cta" className={styles.ctaBand}>
            <div className={styles.container}>
              <FadeIn direction="up" className={styles.ctaContent}>
                <h2 className={styles.ctaTitle} style={homeSettings.ctaTitleColor ? { color: homeSettings.ctaTitleColor } : {}}>
                  {ctaTitle}
                </h2>
                <p className={styles.ctaText} style={homeSettings.ctaTextColor ? { color: homeSettings.ctaTextColor } : {}}>
                  {ctaText}
                </p>
                <div className={styles.ctaButtons}>
                  <Link 
                    href={ctaBtn1Link} 
                    className={styles.btnPrimary}
                    style={{
                      ...(homeSettings.ctaBtn1Color ? { background: homeSettings.ctaBtn1Color } : {}),
                      ...(homeSettings.ctaBtn1HoverColor ? { '--hover-bg': homeSettings.ctaBtn1HoverColor } : {}),
                      ...(homeSettings.ctaBtn1TextColor ? { color: homeSettings.ctaBtn1TextColor } : {})
                    } as React.CSSProperties}
                  >
                    {ctaBtn1Text}
                  </Link>
                  <a 
                    href={ctaBtn2Link} 
                    target="_blank" 
                    rel="noreferrer" 
                    className={styles.btnSecondary}
                    style={{
                      ...(homeSettings.ctaBtn2Color ? { background: homeSettings.ctaBtn2Color } : {}),
                      ...(homeSettings.ctaBtn2HoverColor ? { '--hover-bg': homeSettings.ctaBtn2HoverColor } : {}),
                      ...(homeSettings.ctaBtn2TextColor ? { color: homeSettings.ctaBtn2TextColor } : {})
                    } as React.CSSProperties}
                  >
                    {ctaBtn2Text}
                  </a>
                </div>
              </FadeIn>
            </div>
          </section>
        )
      default:
        return null
    }
  }

  return (
    <>
      <Hero 
        title={heroTitle} 
        subtitle={heroSubtitle} 
        titleColor={homeSettings.heroTitleColor}
        subtitleColor={homeSettings.heroSubtitleColor}
      />
      
      {sectionOrder.map(renderSection)}
    </>
  )
}
