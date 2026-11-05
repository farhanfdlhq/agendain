import type { MetadataRoute } from "next";
import { BRAND_ICONS } from "@/lib/site-icons";

// Web App Manifest → Next menyajikannya di /manifest.webmanifest dan otomatis
// menambah <link rel="manifest">. Mengaktifkan "Add to Home Screen" (Android)
// & melengkapi identitas PWA. Ikon persegi dari set favicon brand (lib/site-icons).
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Agendain — Travel Agency Indonesia ke Eropa",
    short_name: "Agendain",
    description:
      "Open trip & private trip Eropa bersama Agendain. Tiket, hotel, itinerary — semua diurus.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#F5A623",
    icons: [
      { src: BRAND_ICONS.png192, sizes: "192x192", type: "image/png" },
      { src: BRAND_ICONS.png512, sizes: "512x512", type: "image/png" },
      { src: BRAND_ICONS.maskable512, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
