'use client'
import { useEffect, useMemo, useState } from 'react'
import { fontStyleFrom } from '@/lib/font-style'
import styles from './page.module.css'
import HeroHeader from '@/components/HeroHeader/HeroHeader'
import FadeIn from '@/components/Motion/FadeIn'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { parseGoldText } from '@/lib/utils/textFormatting'
import { sanitizeRichText } from '@/lib/sanitize-richtext'
import { buildDocOutline } from '@/lib/doc-outline'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** "Label: isi" → <li><strong>Label:</strong> isi</li> (untuk konten bawaan). */
const labeledLi = (text: string) => {
  const [head, ...rest] = text.split(':')
  return rest.length ? `<li><strong>${esc(head)}:</strong>${esc(rest.join(':'))}</li>` : `<li>${esc(text)}</li>`
}

export default function PrivacyPolicyContent({ privacySettings = {} }: { privacySettings?: any }) {
  const { t, locale } = useTranslation()
  const isEn = locale === 'en'

  const getSetting = (key: string) =>
    isEn ? (privacySettings[`${key}_en`] || privacySettings[key]) : privacySettings[key]

  const cmsContent = isEn
    ? (privacySettings.privacyContent_en || privacySettings.privacyContent)
    : privacySettings.privacyContent

  // Konten bawaan (bila CMS kosong) dirakit sebagai HTML juga, supaya melewati
  // jalur yang sama: daftar isi + penomoran bagian.
  const fallbackHtml = useMemo(() => {
    const li = (keys: string[]) => keys.map((k) => labeledLi(t(k))).join('')
    return [
      `<h2>${esc(t('privacy.section1.title'))}</h2>`,
      `<p>${esc(t('privacy.section1.p1'))}</p><p>${esc(t('privacy.section1.p2'))}</p>`,
      `<h2>${esc(t('privacy.section2.title'))}</h2><p>${esc(t('privacy.section2.desc'))}</p>`,
      `<h3>${esc(t('privacy.section2.direct.title'))}</h3><ul>${li([1, 2, 3, 4, 5].map((n) => `privacy.section2.direct.li${n}`))}</ul>`,
      `<h3>${esc(t('privacy.section2.auto.title'))}</h3><ul>${[1, 2, 3].map((n) => `<li>${esc(t(`privacy.section2.auto.li${n}`))}</li>`).join('')}</ul>`,
      `<h2>${esc(t('privacy.section3.title'))}</h2><p>${esc(t('privacy.section3.desc'))}</p>`,
      `<ul>${li([1, 2, 3, 4, 5, 6].map((n) => `privacy.section3.li${n}`))}</ul>`,
    ].join('')
  }, [t])

  const { html, items } = useMemo(
    () => buildDocOutline(cmsContent ? sanitizeRichText(cmsContent) : fallbackHtml),
    [cmsContent, fallbackHtml],
  )

  // Scroll-spy: tandai bagian yang sedang dibaca di daftar isi.
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null)
  useEffect(() => {
    const headings = items
      .map((it) => document.querySelector<HTMLElement>(`main #${it.id}`) ?? document.getElementById(it.id))
      .filter((el): el is HTMLElement => !!el)
    if (!headings.length) return
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-20% 0px -65% 0px' },
    )
    headings.forEach((h) => io.observe(h))
    return () => io.disconnect()
  }, [items])

  const tocLabel = isEn ? 'Contents' : 'Daftar Isi'

  const tocList = (
    <ol className={styles.tocList}>
      {items.map((it) => (
        <li key={it.id}>
          <a
            href={`#${it.id}`}
            className={`${styles.tocLink} ${activeId === it.id ? styles.tocActive : ''}`}
            aria-current={activeId === it.id ? 'location' : undefined}
          >
            <span className={styles.tocNum}>{it.num}</span>
            <span>{it.title}</span>
          </a>
        </li>
      ))}
    </ol>
  )

  return (
    <div className={styles.page}>
      <HeroHeader
        backgroundImage={getSetting('heroImage') || '/hero-coastal.webp'}
        title={
          getSetting('heroTitle')
            ? parseGoldText(getSetting('heroTitle'), styles, getSetting('heroTitleWeight'), getSetting('heroTitleSize'))
            : <>{t('privacy.title')} <span className={styles.textGold}>Policy</span></>
        }
        subtitle={
          getSetting('heroSubtitle') ? (
            <span style={{ ...fontStyleFrom(getSetting('heroSubtitleWeight'), getSetting('heroSubtitleSize')) }}>
              {getSetting('heroSubtitle')}
            </span>
          ) : (
            t('privacy.subtitle')
          )
        }
        minHeight="420px"
      />

      <div className={`${styles.container} ${items.length ? styles.withToc : ''}`}>
        {items.length > 0 && (
          <aside className={styles.toc} aria-label={tocLabel}>
            {/* Mobile: daftar isi bisa dilipat agar tidak mendorong isi terlalu jauh. */}
            <details className={styles.tocMobile}>
              <summary className={styles.tocTitle}>{tocLabel}</summary>
              {tocList}
            </details>
            <div className={styles.tocDesktop}>
              <p className={styles.tocTitle}>{tocLabel}</p>
              {tocList}
            </div>
          </aside>
        )}

        <FadeIn direction="up" delay={0.1}>
          <article className={styles.contentCard}>
            <div className={`richtext ${styles.doc}`} dangerouslySetInnerHTML={{ __html: html }} />
          </article>
        </FadeIn>
      </div>
    </div>
  )
}
