"use client";
import Image from "next/image";
import styles from "./PrivateTripHero.module.css";
import { Badge } from "@/components/ui/badge";
import { WhatsAppIcon } from "@/components/HomeContent/shared";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { parseGoldText } from "@/lib/utils/textFormatting";

export default function PrivateTripHero({ privatetripSettings = {} }: { privatetripSettings?: any }) {
  const { locale } = useTranslation();
  const isEn = locale === 'en';
  const getSetting = (key: string) => {
    const val = isEn ? (privatetripSettings[`${key}_en`] || privatetripSettings[key]) : privatetripSettings[key];
    return val;
  };
  return (
    <div className={styles.heroSection}>
      <Image
        src={getSetting('heroImage') || "/private_trip_hero.png"}
        alt="Private Trip Europe"
        fill
        className={styles.heroBg}
        priority
        quality={85}
        sizes="100vw"
      />
      <div className={styles.heroOverlay} />

      <div className={styles.heroContent}>
        <h1 className={styles.title}>
          {parseGoldText(getSetting('heroTitle') || (isEn ? 'Exclusive Europe *Your Way*' : 'Eropa Eksklusif *Sesuai Cara* Kamu'), styles, getSetting('heroTitleWeight'))}
        </h1>

        <p className={styles.subtitle} style={{ fontWeight: getSetting('heroSubtitleWeight') ? Number(getSetting('heroSubtitleWeight')) : undefined }}>
          {getSetting('heroSubtitle') || "Itinerary fleksibel, jadwal bebas, personal guide. Cocok untuk keluarga, honeymoon, arisan, kantor, dan komunitas. Kami bantu urus semua dari A sampai Z."}
        </p>

        <div className={styles.badges}>
          <Badge variant="outline" className={styles.badge}>
            {isEn ? 'Indonesian Guide · Europe Expert' : 'Guide Indonesia · Paham Eropa Luar Dalam'}
          </Badge>
          <Badge variant="outline" className={styles.badge}>
            {isEn ? 'Exclusive' : 'Eksklusif'}
          </Badge>
        </div>

        <div className={styles.actions}>
          <a href="#paket" className={styles.link}>
            {isEn ? 'View Private Packages' : 'Lihat Paket Private'} &rarr;
          </a>
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnPrimary}
          >
            <WhatsAppIcon size={20} />
            {isEn ? 'Chat Whatsapp Now' : 'Chat Whatsapp Sekarang'}
          </a>
        </div>
      </div>
    </div>
  );
}
