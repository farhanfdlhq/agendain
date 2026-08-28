"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import FadeIn from "@/components/Motion/FadeIn";
import { parseGoldText } from "@/lib/utils/textFormatting";
import styles from "./PrivateTripForm.module.css";

export default function PrivateTripForm({ privatetripSettings }: { privatetripSettings?: any }) {
  const { t, locale } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("6281234567890");

  const gs = (key: string, fallbackText: string) => {
    const dataKey = locale === 'en' ? `${key}_en` : key;
    if (privatetripSettings?.[dataKey] && privatetripSettings[dataKey].trim() !== '') {
      return privatetripSettings[dataKey];
    }
    if (privatetripSettings?.[key] && privatetripSettings[key].trim() !== '') {
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

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    noWa: "",
    destinasi: "",
    tanggal: "",
    pax: 2,
    budget: "< 20jt",
    catatan: "",
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/private-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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

  return (
    <section className={styles.section} id="form-booking">
      <div className={styles.container}>
        <FadeIn direction="up" delay={0.2} className={styles.formContainer}>
          <div className={styles.header}>
            <h2 className={styles.title}>{parseGoldText(gs('formTitle', t("pt.formTitle")), styles, privatetripSettings?.formTitleWeight)}</h2>
            <p className={styles.subtitle}>{gs('formSubtitle', t("pt.formDesc"))}</p>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.2}>
          <div className={styles.formCard}>
            {!success ? (
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.inputGroup}>
                  <label htmlFor="nama">{t("pt.name")}</label>
                  <input
                    type="text"
                    id="nama"
                    name="nama"
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
                    value={formData.email}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.inputRow}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="nowa">{t("pt.wa")}</label>
                    <input
                      type="tel"
                      id="nowa"
                      name="noWa"
                      value={formData.noWa}
                      onChange={handleChange}
                      className={styles.input}
                      required
                    />
                  </div>
                  <div className={styles.inputGroup}>
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
                </div>

                <div className={styles.inputRow}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="tanggal">{t("pt.date")}</label>
                    <input
                      type="month"
                      id="tanggal"
                      name="tanggal"
                      value={formData.tanggal}
                      onChange={handleChange}
                      className={styles.input}
                      required
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="pax">{t("pt.pax")}</label>
                    <input
                      type="number"
                      id="pax"
                      name="pax"
                      min="2"
                      value={formData.pax}
                      onChange={handleChange}
                      className={styles.input}
                      required
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="budget">{t("pt.budget")}</label>
                  <select
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className={styles.input}
                  >
                    <option value="< 20jt">&lt; Rp 20.000.000</option>
                    <option value="20jt-30jt">
                      Rp 20.000.000 - Rp 30.000.000
                    </option>
                    <option value="30jt-50jt">
                      Rp 30.000.000 - Rp 50.000.000
                    </option>
                    <option value="> 50jt">&gt; Rp 50.000.000</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="catatan">{t("pt.notes")}</label>
                  <textarea
                    id="catatan"
                    name="catatan"
                    value={formData.catatan}
                    onChange={handleChange}
                    className={styles.textarea}
                    rows={4}
                    placeholder={t("pt.notesPh")}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={loading}
                >
                  {loading ? t("pt.submitting") : t("pt.submit")}
                </button>
              </form>
            ) : (
              <div className={styles.successState}>
                <div className={styles.successIcon}>
                  <CheckCircle size={64} className={styles.successColor} />
                </div>
                <h3 className={styles.successTitle}>{t("pt.success")}</h3>
                <p className={styles.successDesc}>
                  Terima kasih <strong>{formData.nama}</strong>. Tim kami akan
                  segera menganalisa rute <strong>{formData.destinasi}</strong>{" "}
                  Anda dan menghubungi Anda secepatnya.
                </p>
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
                    onClick={() => {
                      setSuccess(false);
                      setFormData({
                        nama: "",
                        email: "",
                        noWa: "",
                        destinasi: "",
                        tanggal: "",
                        pax: 2,
                        budget: "< 20jt",
                        catatan: "",
                      });
                    }}
                    className={styles.resetBtn}
                  >
                    {t("pt.another")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
