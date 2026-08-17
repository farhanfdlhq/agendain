'use client'

import styles from './page.module.css'
import HeroHeader from '@/components/HeroHeader/HeroHeader'
import FadeIn from '@/components/Motion/FadeIn'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { parseGoldText } from '@/lib/utils/textFormatting'
import { sanitizeHtml } from '@/lib/sanitize'

export default function PrivacyPolicyContent({ privacySettings = {} }: { privacySettings?: any }) {
  const { t, locale } = useTranslation()
  const isEn = locale === 'en';
  
  const content = isEn
    ? (privacySettings.privacyContent_en || privacySettings.privacyContent) 
    : privacySettings.privacyContent;
  const safeContent = sanitizeHtml(content);

  const getSetting = (key: string) => {
    const val = isEn ? (privacySettings[`${key}_en`] || privacySettings[key]) : privacySettings[key];
    return val;
  };

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <HeroHeader 
        backgroundImage={getSetting('heroImage') || "/hero-coastal.webp"}
        title={
          getSetting('heroTitle') 
            ? parseGoldText(getSetting('heroTitle'), styles, getSetting('heroTitleWeight'))
            : <>{t('privacy.title')} <span className={styles.textGold}>Policy</span></>
        }
        subtitle={
          getSetting('heroSubtitle') ? (
            <span style={{ fontWeight: getSetting('heroSubtitleWeight') ? Number(getSetting('heroSubtitleWeight')) : undefined }}>
              {getSetting('heroSubtitle')}
            </span>
          ) : (
            t('privacy.subtitle')
          )
        }
        minHeight="500px"
        paddingBottom="150px"
      />

      <div className={styles.container}>
        <FadeIn direction="up" delay={0.2}>
          <div className={styles.contentCard}>
            {safeContent ? (
              <div 
                className="whitespace-pre-wrap leading-relaxed text-slate-700 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4"
                dangerouslySetInnerHTML={{ __html: safeContent }} 
              />
            ) : (
              <>
                <h2>{t('privacy.section1.title')}</h2>
                <p>{t('privacy.section1.p1')}</p>
                <p>{t('privacy.section1.p2')}</p>

                <h2>{t('privacy.section2.title')}</h2>
                <p>{t('privacy.section2.desc')}</p>
                
                <h3>{t('privacy.section2.direct.title')}</h3>
                <ul>
                  <li><strong>{t('privacy.section2.direct.li1').split(':')[0]}:</strong> {t('privacy.section2.direct.li1').split(':').slice(1).join(':')}</li>
                  <li><strong>{t('privacy.section2.direct.li2').split(':')[0]}:</strong> {t('privacy.section2.direct.li2').split(':').slice(1).join(':')}</li>
                  <li><strong>{t('privacy.section2.direct.li3').split(':')[0]}:</strong> {t('privacy.section2.direct.li3').split(':').slice(1).join(':')}</li>
                  <li><strong>{t('privacy.section2.direct.li4').split(':')[0]}:</strong> {t('privacy.section2.direct.li4').split(':').slice(1).join(':')}</li>
                  <li><strong>{t('privacy.section2.direct.li5').split(':')[0]}:</strong> {t('privacy.section2.direct.li5').split(':').slice(1).join(':')}</li>
                </ul>

                <h3>{t('privacy.section2.auto.title')}</h3>
                <ul>
                  <li>{t('privacy.section2.auto.li1')}</li>
                  <li>{t('privacy.section2.auto.li2')}</li>
                  <li>{t('privacy.section2.auto.li3')}</li>
                </ul>

                <h2>{t('privacy.section3.title')}</h2>
                <p>{t('privacy.section3.desc')}</p>
                <ul>
                  <li><strong>{t('privacy.section3.li1').split(':')[0]}:</strong> {t('privacy.section3.li1').split(':').slice(1).join(':')}</li>
                  <li><strong>{t('privacy.section3.li2').split(':')[0]}:</strong> {t('privacy.section3.li2').split(':').slice(1).join(':')}</li>
                  <li><strong>{t('privacy.section3.li3').split(':')[0]}:</strong> {t('privacy.section3.li3').split(':').slice(1).join(':')}</li>
                  <li><strong>{t('privacy.section3.li4').split(':')[0]}:</strong> {t('privacy.section3.li4').split(':').slice(1).join(':')}</li>
                  <li><strong>{t('privacy.section3.li5').split(':')[0]}:</strong> {t('privacy.section3.li5').split(':').slice(1).join(':')}</li>
                  <li><strong>{t('privacy.section3.li6').split(':')[0]}:</strong> {t('privacy.section3.li6').split(':').slice(1).join(':')}</li>
                </ul>
              </>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
