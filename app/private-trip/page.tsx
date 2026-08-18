import PrivateTripHero from "@/components/PrivateTripHero/PrivateTripHero";
import PrivateTripWhy from "@/components/PrivateTripWhy/PrivateTripWhy";
import PrivateTripPricing from "@/components/PrivateTripPricing/PrivateTripPricing";
import PrivateTripWorkflow from "@/components/PrivateTripWorkflow/PrivateTripWorkflow";
import PrivateTripForm from "@/components/PrivateTripForm/PrivateTripForm";
import CallToActionBanner from "@/components/CallToActionBanner/CallToActionBanner";
import { prisma } from "@/lib/prisma";
import { parseGoldText } from "@/lib/utils/textFormatting";
import { getI18nSetting, getServerLocale } from "@/lib/i18n/server";
import styles from "./page.module.css";

export const metadata = {
  title: "Private Trip Eropa Eksklusif | Agendain",
  description:
    "Rencanakan perjalanan Private Trip Eropa Anda secara khusus dengan Agendain. Itinerary fleksibel, guide berpengalaman, dan privasi penuh.",
};

export const revalidate = 60;

export default async function PrivateTripPage() {
  const packages = await prisma.privateTripPackage.findMany();
  
  let privatetripSettings: any = {};
  try {
    const setting = await prisma.setting.findUnique({ where: { key: 'privatetrip_settings' } });
    if (setting) {
      privatetripSettings = JSON.parse(setting.value);
    }
  } catch (error) {
    console.error('Failed to fetch private trip settings', error);
  }

  const locale = await getServerLocale();
  const isEn = locale === 'en';

  const ctaLabel = await getI18nSetting(privatetripSettings, 'ctaLabel') || (isEn ? "Ready to Go?" : "Mau Berangkat?");
  const ctaTitle = await getI18nSetting(privatetripSettings, 'ctaTitle');
  const ctaTitleWeight = await getI18nSetting(privatetripSettings, 'ctaTitleWeight');
  const ctaSubtitle = await getI18nSetting(privatetripSettings, 'ctaSubtitle') || 
    (isEn ? "No need to be confused, no need to be complicated. The Agendain team is ready to help you from choosing packages, processing visas, until you land safely in Europe." 
          : "Gak perlu bingung, gak perlu ribet. Tim Agendain siap bantuin dari pemilihan paket, pengurusan visa, sampai kamu mendarat dengan selamat di Eropa.");
  const ctaBtnText = await getI18nSetting(privatetripSettings, 'ctaBtnText') || (isEn ? "Chat Whatsapp Now" : "Chat Whatsapp Sekarang");
  const secBtnText = isEn ? "View Trip Schedule" : "Lihat Jadwal Trip";

  return (
    <main>
      <PrivateTripHero privatetripSettings={privatetripSettings} />
      <PrivateTripWhy privatetripSettings={privatetripSettings} />
      <PrivateTripPricing packages={packages} privatetripSettings={privatetripSettings} />
      <PrivateTripWorkflow privatetripSettings={privatetripSettings} />
      <PrivateTripForm privatetripSettings={privatetripSettings} />

      <div style={{ height: "40px" }} />

      <CallToActionBanner
        label={ctaLabel}
        titleLine1={ctaTitle ? parseGoldText(ctaTitle, styles, ctaTitleWeight) : (isEn ? "Book Now" : "Booking Sekarang")}
        titleLine2={ctaTitle ? undefined : (isEn ? "Starting From" : "Mulai Dari")}
        titleHighlight={ctaTitle ? undefined : (isEn ? "500k" : "500rb")}
        titleLine3={ctaTitle ? undefined : (isEn ? "Only!" : "Aja!")}
        description={ctaSubtitle}
        primaryBtnText={ctaBtnText}
        secondaryBtnText={secBtnText}
        secondaryBtnLink="#jadwal"
      />
    </main>
  );
}
