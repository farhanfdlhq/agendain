"use client";

import PackageCard from "@/components/PackageCard/PackageCard";
import OpenTripFilter, { type DestOption } from "@/components/OpenTripFilter/OpenTripFilter";
import HeroHeader from "@/components/HeroHeader/HeroHeader";
import CallToActionBanner from "@/components/CallToActionBanner/CallToActionBanner";
import Counter from "@/components/Motion/Counter";
import styles from "./page.module.css";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { parseGoldText } from "@/lib/utils/textFormatting";

interface OpenTripContentProps {
  packages: any[];
  destList: DestOption[];
  opentripSettings?: any;
}

export default function OpenTripContent({
  packages,
  destList,
  opentripSettings = {}
}: OpenTripContentProps) {
  const { t, locale } = useTranslation();
  const isEn = locale === 'en'
  const getSetting = (key: string) => {
    const val = isEn ? (opentripSettings[`${key}_en`] || opentripSettings[key]) : opentripSettings[key];
    return val;
  }

  // Hero Image dari CMS; fallback ke aset bawaan bila belum pernah diisi.
  // Gambar tidak dipilih per bahasa, jadi baca langsung tanpa getSetting.
  const heroImage = opentripSettings.heroImage || '/open_trip_hero.webp'

  return (
    <div className={styles.page}>
      <div className={styles.heroContainer}>
        <div className={styles.heroWrapper} style={{ backgroundImage: `url("${heroImage}")` }}>
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              {parseGoldText(getSetting('heroTitle') || (isEn ? 'Explore Europe *More Exciting* With New Friends' : 'Eksplorasi Eropa *Lebih Seru* Bareng Teman Baru'), styles, getSetting('heroTitleWeight'))}
            </h1>
            {getSetting('heroSubtitle') && (
              <p className={styles.heroSubtitle} style={{ fontWeight: getSetting('heroSubtitleWeight') ? Number(getSetting('heroSubtitleWeight')) : undefined }}>
                {getSetting('heroSubtitle')}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className={styles.statsWrapper}>
        <div className={styles.statsContainer}>
          <div className={styles.statBox}>
            <h4><Counter value={2} suffix="+" duration={1.5} /></h4>
            <p>
              {t('openTrip.stats.years') || (isEn ? 'Years of' : 'Pengalaman')}
              <br />
              {t('openTrip.stats.experience') || (isEn ? 'Experience' : 'Bertahun-tahun')}
            </p>
          </div>
          <div className={styles.statBox}>
            <h4><Counter value={63} suffix="+" duration={1.5} /></h4>
            <p>{t("openTrip.stats.dest")}</p>
          </div>
          <div className={styles.statBox}>
            <h4><Counter value={32} suffix="K+" duration={1.5} /></h4>
            <p>{t("openTrip.stats.travelers")}</p>
          </div>
          <div className={styles.statBox}>
            <h4><Counter value={94} suffix="%" duration={1.5} /></h4>
            <p>{t("openTrip.stats.satisfaction")}</p>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            {getSetting('packagesTitle') ? (
              <h2 className={styles.sectionTitle}>
                {parseGoldText(getSetting('packagesTitle'), styles, getSetting('packagesTitleWeight'))}
              </h2>
            ) : (
              <>
                <p className={styles.sectionLabel}>{getSetting('sectionLabel') || t("openTrip.section.label")}</p>
                <h2 className={styles.sectionTitle}>
                  {getSetting('sectionTitle1') || t("openTrip.section.title1")}
                  <br />
                  {getSetting('sectionTitle2') || t("openTrip.section.title2")}
                  <br />
                  {getSetting('sectionTitle3') || t("openTrip.section.title3")}
                </h2>
              </>
            )}
            {getSetting('packagesSubtitle') && (
              <p className={styles.sectionSubtitle} style={{ fontWeight: getSetting('packagesSubtitleWeight') ? Number(getSetting('packagesSubtitleWeight')) : undefined, textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)' }}>
                {getSetting('packagesSubtitle')}
              </p>
            )}
          </div>

          <OpenTripFilter destList={destList} />

          <div className={styles.grid}>
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} {...pkg} />
            ))}
          </div>
        </div>
      </div>

      <CallToActionBanner
        label={getSetting('ctaLabel') || t("openTrip.cta.label")}
        titleLine1={getSetting('ctaTitle') ? parseGoldText(getSetting('ctaTitle'), styles, getSetting('ctaTitleWeight')) : (getSetting('ctaTitle1') || t("openTrip.cta.title1"))}
        titleLine2={getSetting('ctaTitle') ? undefined : (getSetting('ctaTitle2') || t("openTrip.cta.title2"))}
        titleHighlight={getSetting('ctaTitle') ? undefined : (getSetting('ctaTitleHighlight') || "500rb")}
        titleLine3={getSetting('ctaTitle') ? undefined : (getSetting('ctaTitle3') || t("openTrip.cta.title3"))}
        description={getSetting('ctaSubtitle') || getSetting('ctaDesc') || t("openTrip.cta.desc")}
        primaryBtnText={getSetting('ctaBtnText') || t("openTrip.cta.btnPrimary")}
        primaryBtnLink="https://wa.me/6281234567890"
        secondaryBtnText={t("openTrip.cta.btnSecondary")}
        secondaryBtnLink="#jadwal"
      />
    </div>
  );
}
