import FadeIn from "@/components/Motion/FadeIn";
import styles from "./PrivateTripWorkflow.module.css";

const workflowSteps = [
  {
    number: "1",
    title: "Konsultasi Gratis",
    desc: "Chat tim Agendain via WA. Ceritakan jumlah pax, budget, tanggal, dan keinginan destinasi — kami bantu susun opsi terbaik.",
  },
  {
    number: "2",
    title: "Terima Itinerary Custom",
    desc: "Kami kirimkan draft itinerary dalam 1x24 jam. Revisi sampai sesuai keinginan kamu — tanpa biaya tambahan.",
  },
  {
    number: "3",
    title: "DP & Konfirmasi",
    desc: "Amankan slot dengan DP Rp 500.000/pax. Tim AWSTour mulai proses visa, tiket pesawat, dan akomodasi.",
  },
  {
    number: "4",
    title: "Berangkat & Nikmati!",
    desc: "Guide pribadi siap menemani baik dari Jepang maupun Indonesia. Semua sudah kami urus — kamu tinggal menikmati.",
  },
];

export default function PrivateTripWorkflow() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <FadeIn direction="up">
          <div className={styles.header}>
            <h2 className={styles.title}>Cara Booking Private Trip</h2>
            <p className={styles.subtitle}>Dari Konsultasi Sampai Berangkat</p>
          </div>
        </FadeIn>

        <div className={styles.grid}>
          {workflowSteps.map((step, idx) => (
            <FadeIn key={idx} direction="up" delay={0.1 * (idx + 1)}>
              <div className={styles.stepItem}>
                <div className={styles.iconBox}>
                  {idx === 0 && (
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  )}
                  {idx === 1 && (
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                  )}
                  {idx === 2 && (
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M20 7h-3a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"></path>
                      <rect x="9" y="11" width="6" height="4" rx="1"></rect>
                    </svg>
                  )}
                  {idx === 3 && (
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M22 2 11 13"></path>
                      <path d="m22 2-7 20-4-9-9-4 20-7z"></path>
                    </svg>
                  )}
                </div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
