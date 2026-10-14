"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import FadeIn from "@/components/Motion/FadeIn";
import { NumberStepper } from "@/components/ui/number-stepper";
import { parseGoldText } from "@/lib/utils/textFormatting";
import { fontStyleFrom } from "@/lib/font-style";
import { localizeRepeater, PRIVATE_TRIP_REPEATERS } from "@/lib/i18n/localize";
import MonthPicker from "./MonthPicker";
import styles from "./PrivateTripForm.module.css";

// Nilai `value` dikirim apa adanya ke /api/private-trip (dibaca admin Inquiry),
// jadi jangan diubah; label dibuat ringkas agar muat sebagai pilihan chip.
const BUDGET_OPTIONS = [
  { value: "< 20jt", label: "< Rp 20 jt" },
  { value: "20jt-30jt", label: "Rp 20–30 jt" },
  { value: "30jt-50jt", label: "Rp 30–50 jt" },
  { value: "> 50jt", label: "> Rp 50 jt" },
];

const EMPTY_FORM = {
  nama: "",
  email: "",
  noWa: "",
  destinasi: "",
  tanggal: "",
  pax: "2",
  budget: "< 20jt",
  catatan: "",
};

export default function PrivateTripForm({
  privatetripSettings,
}: {
  privatetripSettings?: any;
}) {
  const { t, locale } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("6281995264565");

  const gs = (key: string, fallbackText: string) => {
    const dataKey = locale === "en" ? `${key}_en` : key;
    if (
      privatetripSettings?.[dataKey] &&
      privatetripSettings[dataKey].trim() !== ""
    ) {
      return privatetripSettings[dataKey];
    }
    if (privatetripSettings?.[key] && privatetripSettings[key].trim() !== "") {
      return privatetripSettings[key];
    }
    return fallbackText;
  };

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.whatsapp_number) {
          setWhatsappNumber(data.whatsapp_number.replace(/\D/g, ""));
        }
      })
      .catch(console.error);
  }, []);

  const [formData, setFormData] = useState(EMPTY_FORM);

  const setField = (name: keyof typeof EMPTY_FORM, value: string) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setField(e.target.name as keyof typeof EMPTY_FORM, e.target.value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/private-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, pax: Number(formData.pax) }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        toast.error(t("pt.errSubmit"));
      }
    } catch (err) {
      toast.error(t("pt.errNetwork"));
    } finally {
      setLoading(false);
    }
  };

  const successDesc = t("pt.successDesc")
    .split(/(\{name\}|\{dest\})/)
    .map((part, i) =>
      part === "{name}" ? (
        <strong key={i}>{formData.nama}</strong>
      ) : part === "{dest}" ? (
        <strong key={i}>{formData.destinasi}</strong>
      ) : (
        part
      ),
    );

  // Poin keunggulan dari CMS (repeater); belum pernah diisi → 3 poin bawaan.
  const cmsPoints = localizeRepeater(
    privatetripSettings,
    "formPoints",
    locale,
    PRIVATE_TRIP_REPEATERS.formPoints,
  );
  const points: string[] = cmsPoints
    ? cmsPoints.map((p) => String(p?.text ?? "").trim()).filter(Boolean)
    : [t("pt.point1"), t("pt.point2"), t("pt.point3")];

  const directWa = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Halo Agendain, saya ingin konsultasi Private Trip.",
  )}`;

  return (
    <section className={styles.section} id="form-booking">
      <div className={styles.container}>
        <FadeIn direction="up" delay={0.1}>
          <div className={styles.shell}>
            <aside className={styles.aside}>
              <h2 className={styles.title}>
                {parseGoldText(
                  gs("formTitle", t("pt.formTitle")),
                  styles,
                  privatetripSettings?.formTitleWeight,
                  privatetripSettings?.formTitleSize,
                )}
              </h2>
              <p
                className={styles.subtitle}
                style={fontStyleFrom(
                  privatetripSettings?.formSubtitleWeight,
                  privatetripSettings?.formSubtitleSize,
                )}
              >
                {gs("formSubtitle", t("pt.formDesc"))}
              </p>

              {points.length > 0 && (
                <ul className={styles.points}>
                  {points.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              )}

              <div className={styles.direct}>
                <span>{gs("formWaPrompt", t("pt.waPrompt"))}</span>
                <a href={directWa} target="_blank" rel="noreferrer">
                  {gs("formWaLink", t("pt.waLink"))}
                </a>
              </div>
            </aside>

            <div className={styles.formPane}>
              {!success ? (
                <form className={styles.form} onSubmit={handleSubmit}>
                  <fieldset className={styles.group}>
                    <legend className={styles.legend}>
                      {t("pt.groupContact")}
                    </legend>
                    <div className={styles.grid}>
                      <div className={`${styles.inputGroup} ${styles.full}`}>
                        <label htmlFor="nama">{t("pt.name")}</label>
                        <input
                          type="text"
                          id="nama"
                          name="nama"
                          autoComplete="name"
                          value={formData.nama}
                          onChange={handleChange}
                          className={styles.input}
                          required
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label htmlFor="email">{t("pt.email")}</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          autoComplete="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={styles.input}
                          required
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label htmlFor="nowa">{t("pt.wa")}</label>
                        <input
                          type="tel"
                          id="nowa"
                          name="noWa"
                          autoComplete="tel"
                          inputMode="tel"
                          value={formData.noWa}
                          onChange={handleChange}
                          className={styles.input}
                          required
                        />
                      </div>
                    </div>
                  </fieldset>

                  <fieldset className={styles.group}>
                    <legend className={styles.legend}>
                      {t("pt.groupTrip")}
                    </legend>
                    <div className={styles.grid}>
                      <div className={`${styles.inputGroup} ${styles.full}`}>
                        <label htmlFor="destinasi">{t("pt.dest")}</label>
                        <input
                          type="text"
                          id="destinasi"
                          name="destinasi"
                          value={formData.destinasi}
                          onChange={handleChange}
                          placeholder={t("pt.destPh")}
                          className={styles.input}
                          required
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label htmlFor="tanggal">{t("pt.date")}</label>
                        <MonthPicker
                          id="tanggal"
                          name="tanggal"
                          value={formData.tanggal}
                          onChange={(v) => setField("tanggal", v)}
                          locale={locale}
                          placeholder={t("pt.datePh")}
                          prevYearLabel={t("pt.prevYear")}
                          nextYearLabel={t("pt.nextYear")}
                          className={styles.input}
                          required
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label htmlFor="pax">{t("pt.pax")}</label>
                        <NumberStepper
                          variant="public"
                          id="pax"
                          name="pax"
                          min={2}
                          value={formData.pax}
                          onValueChange={(v) => setField("pax", v)}
                          decrementLabel={t("pt.paxDec")}
                          incrementLabel={t("pt.paxInc")}
                          className={styles.stepper}
                          required
                        />
                      </div>

                      <div
                        className={`${styles.inputGroup} ${styles.full}`}
                        role="radiogroup"
                        aria-labelledby="budget-label"
                      >
                        <span id="budget-label" className={styles.label}>
                          {t("pt.budget")}
                        </span>
                        <div className={styles.chips}>
                          {BUDGET_OPTIONS.map((opt) => (
                            <label key={opt.value} className={styles.chip}>
                              <input
                                type="radio"
                                name="budget"
                                value={opt.value}
                                checked={formData.budget === opt.value}
                                onChange={handleChange}
                              />
                              <span>{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className={`${styles.inputGroup} ${styles.full}`}>
                        <label htmlFor="catatan">
                          {t("pt.notes")}{" "}
                          <span className={styles.optional}>
                            {t("pt.optional")}
                          </span>
                        </label>
                        <textarea
                          id="catatan"
                          name="catatan"
                          value={formData.catatan}
                          onChange={handleChange}
                          className={styles.textarea}
                          rows={3}
                          placeholder={t("pt.notesPh")}
                        ></textarea>
                      </div>
                    </div>
                  </fieldset>

                  <div className={styles.submitRow}>
                    <button
                      type="submit"
                      className={styles.submitBtn}
                      disabled={loading}
                    >
                      {loading ? t("pt.submitting") : t("pt.submit")}
                    </button>
                    <p className={styles.note}>{t("pt.formNote")}</p>
                  </div>
                </form>
              ) : (
                <div className={styles.successState} role="status">
                  <CheckCircle
                    size={56}
                    strokeWidth={1.75}
                    className={styles.successIcon}
                  />
                  <h3 className={styles.successTitle}>{t("pt.success")}</h3>
                  <p className={styles.successDesc}>{successDesc}</p>
                  <div className={styles.successActions}>
                    <a
                      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Halo Agendain, saya ${formData.nama} baru saja mengisi form Private Trip untuk ke ${formData.destinasi} pada ${formData.tanggal}. Mohon info selanjutnya.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.submitBtn}
                    >
                      {t("pt.continueWa")}
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setSuccess(false);
                        setFormData(EMPTY_FORM);
                      }}
                      className={styles.resetBtn}
                    >
                      {t("pt.another")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
