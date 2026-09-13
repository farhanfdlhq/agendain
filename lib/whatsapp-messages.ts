/**
 * Pesan WhatsApp otomatis per konteks tombol/CTA.
 *
 * Tujuan: begitu user klik sebuah CTA, teks WhatsApp sudah terisi sesuai
 * konteks tombolnya (mis. judul paket private trip + checklist detail), jadi
 * user tinggal menekan "kirim". Semua copy dikumpulkan di sini agar konsisten
 * dan mudah disunting, dwibahasa ID/EN.
 *
 * Pakai bareng `generateWhatsAppLink(number, message)` di `lib/utils`.
 */

/** CTA umum Private Trip (hero, "kenapa Agendain", banner CTA). */
export function waPrivateTripGeneral(isEn: boolean): string {
  return isEn
    ? `Hi Agendain! I'd like to plan a Private Trip to Europe. Could you help me put it together?

• Planned dates:
• Number of travelers:
• Dream destinations:

Thank you!`
    : `Halo Agendain! Aku mau konsultasi Private Trip ke Eropa. Boleh dibantu susun rencananya?

• Rencana tanggal:
• Jumlah peserta:
• Destinasi impian:

Makasih!`
}

/**
 * CTA kartu paket Private Trip. Judul paket ikut terisi otomatis, plus
 * checklist detail yang biasa ditanyakan sehingga user tinggal melengkapi.
 */
export function waPrivateTripPackage(
  isEn: boolean,
  title: string,
  location?: string,
): string {
  const cleanTitle = (title || "").trim()
  const place = (location || "").trim()
  const tag = place ? ` (${place})` : ""

  return isEn
    ? `Hi Agendain! I'm interested in the "${cleanTitle}" Private Trip package${tag}. Could you share the full details?

• Planned departure date:
• Number of travelers:
• Cities/countries to visit:
• Activities I'd love to do:

Thank you!`
    : `Halo Agendain! Aku tertarik sama paket Private Trip "${cleanTitle}"${tag}. Boleh minta info lengkapnya?

• Rencana tanggal berangkat:
• Jumlah peserta:
• Kota/negara tujuan:
• Aktivitas yang diincar:

Makasih!`
}

/** CTA umum halaman Open Trip (banner CTA daftar open trip). */
export function waOpenTripGeneral(isEn: boolean): string {
  return isEn
    ? `Hi Agendain! I'm interested in joining a Europe Open Trip. Could you share the upcoming schedules and packages that still have seats?`
    : `Halo Agendain! Aku tertarik ikut Open Trip Eropa. Boleh info jadwal terdekat dan paket yang kursinya masih tersedia?`
}

/** Tombol WhatsApp mengambang — pesan menyesuaikan halaman aktif. */
export function waFloating(isEn: boolean, pathname?: string): string {
  const path = pathname || ""
  if (path.startsWith("/private-trip")) return waPrivateTripGeneral(isEn)
  if (path.startsWith("/open-trip")) return waOpenTripGeneral(isEn)
  return isEn
    ? `Hi Agendain! I'd like to ask about your Europe travel packages.`
    : `Halo Agendain! Aku mau tanya-tanya soal paket wisata Eropa.`
}
