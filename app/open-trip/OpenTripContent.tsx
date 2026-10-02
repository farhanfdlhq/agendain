"use client";
import { useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { fontStyleFrom } from '@/lib/font-style'
import Image from "next/image";
import PackageCard from "@/components/PackageCard/PackageCard";
import type { OpenTripCardData } from "@/lib/open-trip-card";
import OpenTripFilter, {
  type DestOption,
} from "@/components/OpenTripFilter/OpenTripFilter";
import HeroHeader from "@/components/HeroHeader/HeroHeader";
import CallToActionBanner from "@/components/CallToActionBanner/CallToActionBanner";
import Counter from "@/components/Motion/Counter";
import styles from "./page.module.css";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { parseGoldText } from "@/lib/utils/textFormatting";
import { generateWhatsAppLink } from "@/lib/utils";
import { waOpenTripGeneral } from "@/lib/whatsapp-messages";

interface OpenTripContentProps {
  packages: OpenTripCardData[];
  destList: DestOption[];
  opentripSettings?: any;
}

export default function OpenTripContent({
  packages,
  destList,
  opentripSettings = {},
}: OpenTripContentProps) {
  const { t, locale } = useTranslation();
  const isEn = locale === "en";
  // Navigasi filter dibungkus transition → selama data baru dimuat, grid
  // diredupkan (bukan kosong), lalu kartu keluar/masuk dengan animasi.
  const [isPending, startTransition] = useTransition();
  const reduceMotion = useReducedMotion();
  const ease = [0.25, 1, 0.5, 1] as const;
  const getSetting = (key: string) => {
    const val = isEn
      ? opentripSettings[`${key}_en`] || opentripSettings[key]
      : opentripSettings[key];
    return val;
  };

  // Hero Image dari CMS; fallback ke aset bawaan bila belum pernah diisi.
  // Gambar tidak dipilih per bahasa, jadi baca langsung tanpa getSetting.
  const heroImage = opentripSettings.heroImage || "/open_trip_hero.webp";

  return (
    <div className={styles.page}>
      <div className={styles.heroContainer}>
        <div className={styles.heroWrapper}>
          {/* next/image, bukan CSS background-image: background biasa memaksa
              browser memakai satu file yang sama untuk semua lebar layar & DPR.
              Hero ini dibatasi .heroContainer (max 1320px - 2x --space-lg). */}
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            className={styles.heroImage}
            quality={85}
            sizes="(min-width: 1320px) 1272px, 100vw"
          />
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              {parseGoldText(
                getSetting("heroTitle") ||
                  (isEn
                    ? "Explore Europe *More Exciting* With New Friends"
                    : "Eksplorasi Eropa *Lebih Seru* Bareng Teman Baru"),
                styles,
                getSetting("heroTitleWeight"),
              )}
            </h1>
            {getSetting("heroSubtitle") && (
              <p
                className={styles.heroSubtitle}
                style={{
                  ...fontStyleFrom(getSetting("heroSubtitleWeight"), getSetting("heroSubtitleSize")),
                }}
              >
                {getSetting("heroSubtitle")}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className={styles.statsWrapper}>
        <div className={styles.statsContainer}>
          <div className={styles.statBox}>
            <h4>
              <Counter value={2} suffix="+" duration={1.5} />
            </h4>
            <p>
              {t("openTrip.stats.years") || (isEn ? "Years of" : "Pengalaman")}
              <br />
              {t("openTrip.stats.experience") ||
                (isEn ? "Experience" : "Bertahun-tahun")}
            </p>
          </div>
          <div className={styles.statBox}>
            <h4>
              <Counter value={63} suffix="+" duration={1.5} />
            </h4>
            <p>{t("openTrip.stats.dest")}</p>
          </div>
          <div className={styles.statBox}>
            <h4>
              <Counter value={32} suffix="K+" duration={1.5} />
            </h4>
            <p>{t("openTrip.stats.travelers")}</p>
          </div>
          <div className={styles.statBox}>
            <h4>
              <Counter value={94} suffix="%" duration={1.5} />
            </h4>
            <p>{t("openTrip.stats.satisfaction")}</p>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            {getSetting("packagesTitle") ? (
              <h2 className={styles.sectionTitle}>
                {parseGoldText(
                  getSetting("packagesTitle"),
                  styles,
                  getSetting("packagesTitleWeight"),
                )}
              </h2>
            ) : (
              <>
                <p className={styles.sectionLabel}>
                  {getSetting("sectionLabel") || t("openTrip.section.label")}
                </p>
                <h2 className={styles.sectionTitle}>
                  {getSetting("sectionTitle1") || t("openTrip.section.title1")}
                  <br />
                  {getSetting("sectionTitle2") || t("openTrip.section.title2")}
                  <br />
                  {getSetting("sectionTitle3") || t("openTrip.section.title3")}
                </h2>
              </>
            )}
            {getSetting("packagesSubtitle") && (
              <p
                className={styles.sectionSubtitle}
                style={fontStyleFrom(getSetting("packagesSubtitleWeight"), getSetting("packagesSubtitleSize"))}
              >
                {getSetting("packagesSubtitle")}
              </p>
            )}
          </div>

          <OpenTripFilter
            destList={destList}
            resultCount={packages.length}
            isPending={isPending}
            startTransition={startTransition}
          />

          <div className={styles.results} data-pending={isPending || undefined} aria-busy={isPending}>
            {packages.length > 0 ? (
              <div className={styles.grid}>
                <AnimatePresence mode="popLayout" initial={false}>
                  {packages.map((pkg, i) => (
                    <motion.div
                      key={pkg.id}
                      layout={!reduceMotion}
                      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, ease, delay: reduceMotion ? 0 : i * 0.05 }}
                      className={styles.gridItem}
                    >
                      <PackageCard {...pkg} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <motion.p
                key="empty"
                initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease }}
                className={styles.empty}
              >
                {t("openTrip.empty")}
              </motion.p>
            )}
          </div>
        </div>
      </div>

      <CallToActionBanner
        label={getSetting("ctaLabel") || t("openTrip.cta.label")}
        titleLine1={
          getSetting("ctaTitle")
            ? parseGoldText(
                getSetting("ctaTitle"),
                styles,
                getSetting("ctaTitleWeight"),
              )
            : getSetting("ctaTitle1") || t("openTrip.cta.title1")
        }
        titleLine2={
          getSetting("ctaTitle")
            ? undefined
            : getSetting("ctaTitle2") || t("openTrip.cta.title2")
        }
        titleHighlight={
          getSetting("ctaTitle")
            ? undefined
            : getSetting("ctaTitleHighlight") || "500rb"
        }
        titleLine3={
          getSetting("ctaTitle")
            ? undefined
            : getSetting("ctaTitle3") || t("openTrip.cta.title3")
        }
        description={
          getSetting("ctaSubtitle") ||
          getSetting("ctaDesc") ||
          t("openTrip.cta.desc")
        }
        primaryBtnText={
          getSetting("ctaBtnText") || t("openTrip.cta.btnPrimary")
        }
        primaryBtnLink={generateWhatsAppLink(
          opentripSettings?.whatsapp_number,
          waOpenTripGeneral(isEn),
        )}
        secondaryBtnText={t("openTrip.cta.btnSecondary")}
        secondaryBtnLink="#jadwal"
      />
    </div>
  );
}
