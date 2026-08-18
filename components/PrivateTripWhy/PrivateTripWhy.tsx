"use client";

import Image from "next/image";
import FadeIn from "@/components/Motion/FadeIn";
import DynamicIcon from "@/components/DynamicIcon/DynamicIcon";
import styles from "./PrivateTripWhy.module.css";
import { WhatsAppIcon } from "@/components/HomeContent/shared";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { parseGoldText } from "@/lib/utils/textFormatting";

const whyItems = [
  {
    icon: "🌍",
    title: "Khatam Seluk-Beluk Eropa",
    desc: "Bukan cuma hapal rute turis mainstream, tapi paham betul kultur lokal, bahasa, hingga sistem transportasi paling efisien di sana. Kamu bisa keliling Eropa dengan rasa aman penuh.",
  },
  {
    icon: "🔍",
    title: "Kolektor Spot Hidden Gems",
    desc: "Bosan dengan destinasi yang penuh sesak? Kamu bakal diajak blusukan ke sudut-sudut cantik, kafe lokal tersembunyi, dan lanskap rahasia yang gak akan kamu temukan di brosur travel biasa.",
  },
  {
    icon: "📸",
    title: "Fotografer Pro Siap Beraksi",
    desc: "Gak usah pusing mikirin angle atau pasrah sama hasil foto temen yang blur. Berbekal kamera pro dan insting visual yang tajam, guide kamu siap mengabadikan tiap momen sinematikmu.",
  }
];

export default function PrivateTripWhy({ privatetripSettings }: { privatetripSettings?: any }) {
  const { t, locale } = useTranslation();
  
  const gs = (key: string, fallbackText: string) => {
    const dataKey = locale === 'en' ? `${key}_en` : key;
    if (privatetripSettings?.[dataKey] && privatetripSettings[dataKey].trim() !== '') {
      return privatetripSettings[dataKey];
    }
    if (privatetripSettings?.[key] && privatetripSettings[key].trim() !== '') {
      return privatetripSettings[key];
    }
    return fallbackText;
  }

  const rawWhy = privatetripSettings?.[locale === 'en' ? 'whyItems_en' : 'whyItems'] || privatetripSettings?.whyItems;
  const items = (rawWhy && Array.isArray(rawWhy) && rawWhy.length > 0) ? rawWhy : whyItems;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.leftColumn}>
            <FadeIn direction="up">
              <p className={styles.eyebrow}>{gs('whyEyebrow', 'Kenapa Harus Agendain?')}</p>
              <h2 className={styles.title}>
                {parseGoldText(gs('whyTitle', 'Eksplorasi Eropa bareng ahlinya, *semua sudut aman terkendali*'), styles, privatetripSettings?.whyTitleWeight || '800')}
              </h2>
              <p className={styles.description}>
                {gs('whySubtitle', 'Mencari teman perjalanan ke Eropa itu mudah, tapi menemukan yang benar-benar paham luar-dalam sekaligus bisa mengabadikan momen estetikmu itu langka. Di Agendain, trip kamu dikurasi dan dipandu langsung oleh Lead Guide sekaligus Founder kami yang siap menjamin liburanmu bebas dari kata zonk.')}
              </p>
            </FadeIn>

            <div className={styles.features}>
              {items.map((item: any, index: number) => (
                <FadeIn key={index} direction="up" delay={0.1 * (index + 1)}>
                  <div className={styles.featureItem}>
                    <div className={styles.iconBox}>
                      <DynamicIcon name={item.icon} size={32} />
                    </div>
                    <div className={styles.featureContent}>
                      <h3>{item.title}</h3>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>

          <div className={styles.rightColumn}>
            <FadeIn
              direction="left"
              delay={0.2}
              className={styles.imageWrapper}
            >
              <Image
                src="/private_trip_why.png"
                alt="Private Trip di Eropa"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={styles.image}
              />
            </FadeIn>

            <FadeIn direction="up" delay={0.4} className={styles.ctaWrapper}>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btnPrimary}
              >
                <WhatsAppIcon size={20} />
                {gs('whyBtnText', 'Chat Whatsapp Sekarang')}
              </a>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
