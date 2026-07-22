import PrivateTripHero from "@/components/PrivateTripHero/PrivateTripHero";
import PrivateTripWhy from "@/components/PrivateTripWhy/PrivateTripWhy";
import PrivateTripPricing from "@/components/PrivateTripPricing/PrivateTripPricing";
import PrivateTripWorkflow from "@/components/PrivateTripWorkflow/PrivateTripWorkflow";
import PrivateTripForm from "@/components/PrivateTripForm/PrivateTripForm";
import CallToActionBanner from "@/components/CallToActionBanner/CallToActionBanner";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Private Trip Eropa Eksklusif | Agendain",
  description:
    "Rencanakan perjalanan Private Trip Eropa Anda secara khusus dengan Agendain. Itinerary fleksibel, guide berpengalaman, dan privasi penuh.",
};

export default async function PrivateTripPage() {
  const packages = await prisma.privateTripPackage.findMany();

  return (
    <main>
      <PrivateTripHero />
      <PrivateTripWhy />
      <PrivateTripPricing packages={packages} />
      <PrivateTripWorkflow />
      <PrivateTripForm />

      <div style={{ height: "40px" }} />

      <CallToActionBanner
        label="Mau Berangkat?"
        titleLine1="Booking Sekarang"
        titleLine2="Mulai Dari"
        titleHighlight="500rb"
        titleLine3="Aja!"
        description="Gak perlu bingung, gak perlu ribet. Tim Agendain siap bantuin dari pemilihan paket, pengurusan visa, sampai kamu mendarat dengan selamat di Eropa."
        primaryBtnText="Chat Whatsapp Sekarang"
        secondaryBtnText="Lihat Jadwal Trip"
        secondaryBtnLink="#jadwal"
      />
    </main>
  );
}
