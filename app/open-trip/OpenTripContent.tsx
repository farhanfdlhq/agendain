"use client";

import PackageCard from "@/components/PackageCard/PackageCard";
import OpenTripFilter from "@/components/OpenTripFilter/OpenTripFilter";
import HeroHeader from "@/components/HeroHeader/HeroHeader";
import CallToActionBanner from "@/components/CallToActionBanner/CallToActionBanner";
import styles from "./page.module.css";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface OpenTripContentProps {
  packages: any[];
  destList: string[];
}

export default function OpenTripContent({
  packages,
  destList,
}: OpenTripContentProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.page}>
      <div className={styles.heroContainer}>
        <div className={styles.heroWrapper}>
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              {t("openTrip.hero.title1")}
              <br />
              {t("openTrip.hero.title2")}
              <br />
              {t("openTrip.hero.title3")}{" "}
              <span className={styles.textGold}>Agendain.</span>
            </h1>
          </div>
        </div>
      </div>

      <div className={styles.statsWrapper}>
        <div className={styles.statsContainer}>
          <div className={styles.statBox}>
            <h4>2+</h4>
            <p>
              Pengalaman
              <br />
              Bertahun-tahun
            </p>
          </div>
          <div className={styles.statBox}>
            <h4>63+</h4>
            <p>Destinasi Unik</p>
          </div>
          <div className={styles.statBox}>
            <h4>32K+</h4>
            <p>Traveler Senang</p>
          </div>
          <div className={styles.statBox}>
            <h4>94%</h4>
            <p>Traveler Senang</p>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionLabel}>{t("openTrip.section.label")}</p>
            <h2 className={styles.sectionTitle}>
              {t("openTrip.section.title1")}
              <br />
              {t("openTrip.section.title2")}
              <br />
              {t("openTrip.section.title3")}
            </h2>
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
        label={t("openTrip.cta.label")}
        titleLine1={t("openTrip.cta.title1")}
        titleLine2={t("openTrip.cta.title2")}
        titleHighlight="500rb"
        titleLine3={t("openTrip.cta.title3")}
        description={t("openTrip.cta.desc")}
        primaryBtnText={t("openTrip.cta.btnPrimary")}
        primaryBtnLink="https://wa.me/6281234567890"
        secondaryBtnText={t("openTrip.cta.btnSecondary")}
        secondaryBtnLink="#jadwal"
      />
    </div>
  );
}
