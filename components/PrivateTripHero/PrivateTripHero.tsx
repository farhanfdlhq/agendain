import Image from "next/image";
import styles from "./PrivateTripHero.module.css";
import { Badge } from "@/components/ui/badge";
import { WhatsAppIcon } from "@/components/HomeContent/shared";

export default function PrivateTripHero() {
  return (
    <div className={styles.heroSection}>
      <Image
        src="/private_trip_hero.png"
        alt="Private Trip Europe"
        fill
        className={styles.heroBg}
        priority
      />
      <div className={styles.heroOverlay} />

      <div className={styles.heroContent}>
        <h1 className={styles.title}>
          Private Trip <span className={styles.textGold}>Eropa</span>
          <br />
          Sesuai Keinginanmu
        </h1>

        <p className={styles.subtitle}>
          Itinerary fleksibel, jadwal bebas, personal guide. Cocok untuk
          keluarga, honeymoon, arisan, kantor, dan komunitas. Kami bantu urus
          semua dari A sampai Z.
        </p>

        <div className={styles.badges}>
          <Badge variant="outline" className={styles.badge}>
            Guide Indonesia · Paham Eropa Luar Dalam
          </Badge>
          <Badge variant="outline" className={styles.badge}>
            Eksklusif
          </Badge>
        </div>

        <div className={styles.actions}>
          <a href="#paket" className={styles.link}>
            Lihat Paket Private &rarr;
          </a>
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnPrimary}
          >
            <WhatsAppIcon size={20} />
            Chat Whatsapp Sekarang
          </a>
        </div>
      </div>
    </div>
  );
}
