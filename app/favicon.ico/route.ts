import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/get-settings";
import { BRAND_ICONS, customFavicon } from "@/lib/site-icons";

// /favicon.ico dilayani route ini (bukan file statis) supaya tab non-HTML —
// terutama tab "Lihat PDF" (/api/invoice/pdf/[token], /api/itinerary/pdf/...)
// yang tak punya <link rel=icon> — ikut memakai favicon brand dari CMS, bukan
// ikon default proyek. getSiteSettings ber-cache (tag 'settings'), jadi ikut
// tersegarkan saat favicon diganti di CMS tanpa memukul DB tiap permintaan.
export const dynamic = "force-dynamic";

export async function GET() {
  const s = await getSiteSettings();
  const fav = customFavicon(s.site_favicon) ?? "";
  // Fallback favicon brand (public/icons) bila favicon CMS belum diset.
  const target = fav && (fav.startsWith("/") || /^https?:\/\//i.test(fav)) ? fav : BRAND_ICONS.ico;
  // Location RELATIF, bukan `new URL(target, req.url)`: di balik nginx req.url
  // adalah alamat internal, sehingga redirect dulu mengarah ke
  // https://localhost:3005/... dan favicon rusak di production.
  return new NextResponse(null, { status: 307, headers: { Location: target } });
}
