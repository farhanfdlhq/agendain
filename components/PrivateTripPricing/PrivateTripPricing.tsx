import Image from "next/image";
import FadeIn from "@/components/Motion/FadeIn";
import styles from "./PrivateTripPricing.module.css";
import { WhatsAppIcon } from "@/components/HomeContent/shared";

interface PrivateTripPackageData {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  locationTab: string;
  chips: any;
  features: any;
}

interface PrivateTripPricingProps {
  packages: PrivateTripPackageData[];
}

export default function PrivateTripPricing({
  packages,
}: PrivateTripPricingProps) {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {packages.map((tier, idx) => (
            <FadeIn key={idx} direction="up" delay={0.1 * (idx + 1)}>
              <div className={styles.card}>
                {/* Image Header */}
                <div className={styles.imageHeader}>
                  <Image
                    src={tier.image}
                    alt={tier.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className={styles.cardImage}
                  />
                  <div className={styles.locationTab}>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ marginRight: 4 }}
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    {tier.locationTab}
                  </div>
                </div>

                {/* Card Body */}
                <div className={styles.cardBody}>
                  <p className={styles.subtitle}>{tier.subtitle}</p>
                  <h3 className={styles.title}>{tier.title}</h3>

                  {/* Chips */}
                  <div className={styles.chipsRow}>
                    {Array.isArray(tier.chips) &&
                      tier.chips.map((chip: string, cIdx: number) => (
                        <span key={cIdx} className={styles.chip}>
                          {cIdx === 0 && (
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                          )}
                          {cIdx === 1 && (
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                              <circle cx="9" cy="7" r="4"></circle>
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                          )}
                          {cIdx === 2 && (
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <rect
                                x="3"
                                y="4"
                                width="18"
                                height="18"
                                rx="2"
                                ry="2"
                              ></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                          )}
                          <span style={{ marginLeft: 4 }}>{chip}</span>
                        </span>
                      ))}
                  </div>

                  {/* Feature Lists */}
                  <ul className={styles.featureList}>
                    {Array.isArray(tier.features) &&
                      tier.features.map((feature: string, fIdx: number) => (
                        <li key={fIdx}>
                          <span className={styles.hollowCircle}></span>
                          <span className={styles.featureText}>{feature}</span>
                        </li>
                      ))}
                  </ul>

                  {/* Button */}
                  <div className={styles.actionRow}>
                    <a
                      href="https://wa.me/6281234567890"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.btnPrimary}
                    >
                      <WhatsAppIcon size={18} /> Tanya Gratis Via Whatsapp
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
