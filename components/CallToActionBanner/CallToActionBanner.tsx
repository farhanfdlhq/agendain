import styles from "./CallToActionBanner.module.css";

interface CallToActionBannerProps {
  label?: string;
  titleLine1?: string;
  titleLine2?: string;
  titleHighlight?: string;
  titleLine3?: string;
  description?: string;
  primaryBtnText?: string;
  primaryBtnLink?: string;
  secondaryBtnText?: string;
  secondaryBtnLink?: string;
}

export default function CallToActionBanner({
  label,
  titleLine1,
  titleLine2,
  titleHighlight,
  titleLine3,
  description,
  primaryBtnText,
  primaryBtnLink = "https://wa.me/6281234567890",
  secondaryBtnText,
  secondaryBtnLink = "#jadwal",
}: CallToActionBannerProps) {
  return (
    <div className={styles.ctaBannerWrapper}>
      <div className={styles.ctaBanner}>
        <div className={styles.ctaContent}>
          {label && <p className={styles.ctaLabel}>{label}</p>}
          <h2>
            {titleLine1 && (
              <>
                {titleLine1}
                <br />
              </>
            )}
            {titleLine2}{" "}
            {titleHighlight && (
              <span className={styles.textGold}>{titleHighlight}</span>
            )}{" "}
            {titleLine3}
          </h2>
          {description && <p>{description}</p>}
        </div>
        <div className={styles.ctaActions}>
          <a
            href={primaryBtnLink}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnPrimary}
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              aria-hidden="true"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            {primaryBtnText || "Tanya Jadwal"}
          </a>
          <a href={secondaryBtnLink} className={styles.btnSecondary}>
            {secondaryBtnText || "Lihat Paket Lain"} &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
