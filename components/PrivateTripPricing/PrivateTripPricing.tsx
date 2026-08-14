"use client";

import Image from "next/image";
import FadeIn from "@/components/Motion/FadeIn";
import styles from "./PrivateTripPricing.module.css";
import { WhatsAppIcon } from "@/components/HomeContent/shared";
import { parseGoldText } from "@/lib/utils/textFormatting";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface PrivateTripPackageData {
  id?: number;
  title: string;
  subtitle: string;
  image: string;
  locationTab: string;
  chips: any;
  features: any;
}

interface PrivateTripPricingProps {
  packages: PrivateTripPackageData[];
  privatetripSettings?: any;
}

const DEFAULT_PACKAGES: PrivateTripPackageData[] = [
  {
    title: "VALUE TRIP — Jelajahi Lebih Banyak, Bayar Lebih Hemat!",
    subtitle: "Italy - Value",
    image: "/gallery-colosseum.webp",
    locationTab: "Italy",
    chips: ["Durasi Fleksibel", "Semua Ukuran Grup", "Jadwal Bebas"],
    features: [
      "Solusi terbaik buat kamu yang pengen keliling Eropa hemat tapi gak mau keganggu orang lain di open trip.",
      "Rasakan pengalaman otentik naik transportasi lokal, serasa jadi traveler sejati!",
      "Menginap nyaman di Hotel Bintang 2/3 atau Apartemen pilihan terbaik",
      "Bebas pilih sarapan (Tidak Termasuk)",
    ],
  },
  {
    title: "BALANCE TRIP — Nyaman, Seru, Tetap Worth It!",
    subtitle: "Italy - Balance",
    image: "/dest-italy.webp",
    locationTab: "Italy",
    chips: ["Durasi Fleksibel", "Semua Ukuran Grup", "Jadwal Bebas"],
    features: [
      "Pilihan paling cerdas buat kamu yang mau liburan berkesan tanpa kompromi kenyamanan",
      "Nikmati istirahat berkualitas di Hotel Bintang 3 yang cozy",
      "Bebas pilih sarapan (Tidak Termasuk)",
      "Dilengkapi 1x Private Car — bebas macet, bebas ribet!",
    ],
  },
  {
    title: "PREMIUM TRIP — Liburan Mewah, Semua Sudah Beres!",
    subtitle: "Italy - Premium",
    image: "/dest-france.webp",
    locationTab: "Italy",
    chips: ["Durasi Fleksibel", "Semua Ukuran Grup", "Jadwal Bebas"],
    features: [
      "Untuk kamu yang percaya bahwa liburan terbaik = tanpa drama dan tanpa ribet",
      "Tidur pulas di Hotel Bintang 4 pilihan eksklusif",
      "3-4x Private Car siap mengantar ke mana pun kamu mau",
      "Luggage Forwarding Service — kopermu duluan sampai, kamu tinggal santai!",
    ],
  },
];

export default function PrivateTripPricing({
  packages,
  privatetripSettings = {},
}: PrivateTripPricingProps) {
  const displayPackages = (!packages || packages.length === 0) ? DEFAULT_PACKAGES : packages;
  const { locale } = useTranslation();
  const isEn = locale === 'en';
  const getSetting = (key: string) => {
    const val = isEn ? (privatetripSettings[`${key}_en`] || privatetripSettings[key]) : privatetripSettings[key];
    return val;
  };

  const renderChipIcon = (index: number) => {
    if (index === 0) {
      return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      );
    }
    if (index === 1) {
      return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      );
    }
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    );
  };

  return (
    <section id="paket" className={styles.section}>
      <div className={styles.container}>
        {getSetting('packagesTitle') && (
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {parseGoldText(getSetting('packagesTitle'), styles, getSetting('packagesTitleWeight'))}
            </h2>
            {getSetting('packagesSubtitle') && (
              <p className={styles.sectionSubtitle} style={{ fontWeight: getSetting('packagesSubtitleWeight') ? Number(getSetting('packagesSubtitleWeight')) : undefined }}>
                {getSetting('packagesSubtitle')}
              </p>
            )}
          </div>
        )}
        <div className={styles.grid}>
          {displayPackages.map((tier, idx) => (
            <FadeIn key={idx} direction="up" delay={0.1 * (idx + 1)}>
              <div className={styles.card}>
                
                {/* Inset Image Header with Rounded Corners */}
                <div className={styles.imageContainer}>
                  <Image
                    src={tier.image}
                    alt={tier.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className={styles.cardImage}
                  />
                  {tier.locationTab && (
                    <div className={styles.locationBadge}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span>{tier.locationTab}</span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className={styles.cardBody}>
                  <p className={styles.subtitle}>{tier.subtitle}</p>
                  <h3 className={styles.title}>{tier.title}</h3>

                  {/* Chips Row */}
                  <div className={styles.chipsRow}>
                    {Array.isArray(tier.chips) &&
                      tier.chips.map((chip: string, cIdx: number) => (
                        <span key={cIdx} className={styles.chip}>
                          {renderChipIcon(cIdx)}
                          <span>{chip}</span>
                        </span>
                      ))}
                  </div>

                  {/* Feature Bullet List */}
                  <ul className={styles.featureList}>
                    {Array.isArray(tier.features) &&
                      tier.features.map((feature: string, fIdx: number) => (
                        <li key={fIdx} className={styles.featureItem}>
                          <span className={styles.hollowCircle}></span>
                          <span className={styles.featureText}>{feature}</span>
                        </li>
                      ))}
                  </ul>

                  {/* WhatsApp Action Button */}
                  <div className={styles.actionRow}>
                    <a
                      href="https://wa.me/6281234567890"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.btnPrimary}
                    >
                      <span className={styles.waIconWrapper}>
                        <WhatsAppIcon size={14} />
                      </span>
                      <span>Tanya Gratis Via Whatsapp</span>
                    </a>
                  </div>
                </div>

              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
