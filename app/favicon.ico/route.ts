import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/get-settings";

// /favicon.ico dilayani route ini (bukan file statis) supaya tab non-HTML —
// terutama tab "Lihat PDF" (/api/invoice/pdf/[token], /api/itinerary/pdf/...)
// yang tak punya <link rel=icon> — ikut memakai favicon brand dari CMS, bukan
// ikon default proyek. getSiteSettings ber-cache (tag 'settings'), jadi ikut
// tersegarkan saat favicon diganti di CMS tanpa memukul DB tiap permintaan.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const s = await getSiteSettings();
  const fav = typeof s.site_favicon === "string" ? s.site_favicon.trim() : "";
  // Fallback aset brand (bukan ikon default lama) bila favicon CMS belum diset.
  const target = fav && (fav.startsWith("/") || /^https?:\/\//i.test(fav)) ? fav : "/agendain.jpeg";
  return NextResponse.redirect(new URL(target, req.url));
}
