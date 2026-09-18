import type { MetadataRoute } from "next";

// Web App Manifest → Next menyajikannya di /manifest.webmanifest dan otomatis
// menambah <link rel="manifest">. Mengaktifkan "Add to Home Screen" (Android)
// & melengkapi identitas PWA. Ikon memakai logo yang sudah ada di /public.
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
    icons: [{ src: "/agendain.jpeg", sizes: "any", type: "image/jpeg" }],
  };
}
