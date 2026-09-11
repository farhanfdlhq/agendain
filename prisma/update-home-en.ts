/**
 * Update TERARAH konten Inggris halaman Home (+ footer) sesuai
 * "Agendain Website English Script.md". Non-destruktif: hanya menimpa field
 * `*_en` yang relevan di `home_settings` & `footer_settings`, sisanya utuh.
 *
 * Konten Home CMS-driven: `gs()` mengutamakan nilai DB di atas i18n, jadi
 * mengubah i18n saja tak cukup bila field `*_en` sudah terisi. Script ini yang
 * benar-benar menerapkannya. Idempotent — aman dijalankan ulang, termasuk di
 * production:  npx tsx prisma/update-home-en.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// EN why-cards (judul + deskripsi) sesuai script, dipetakan ke item ID lewat kata kunci.
const WHY_EN: { match: RegExp; title: string; desc: string }[] = [
  { match: /all.?in.?one/i, title: "All-in-One!", desc: "Skip the hassle. With Agendain, your flights, hotels, and daily itineraries are all sorted. Just pack your bags, grab your friends, and you're good to go!" },
  { match: /harga|price|terbaik/i, title: "Best Price Guarantee", desc: "By teaming up directly with locals in Europe, we guarantee the best, fully transparent prices with no hidden fees. It's absolutely worth every penny for the adventure you'll have!" },
  { match: /dukungan|support|24/i, title: "24/7 Support", desc: "Think of the Agendain team as your 24/7 travel buddy. Whether you need help with transport, hotel details, or run into an emergency, we've got your back. You'll never travel alone!" },
  { match: /dokumentasi|documentation|foto/i, title: "Pro Documentation", desc: "Leave the documentation to our pros. We'll capture your trip in a cinematic way, ensuring you go home with great photos and videos without ever worrying about getting the right angle." },
];

const HOME_EN: Record<string, string> = {
  heroTitle_en: "Turn your plans into action. *Agendain* now!",
  heroSubtitle_en: "Tickets, hotels, itineraries, we've got it all covered! Just grab your friends and pack your bags!",
  accTitle_en: "Witness, Experience, & *Keep* the Memories",
  accSubtitle_en: "Europe's Finest Corners",
  socialSubtitle_en: "Take a peek at the amazing adventures of El Rumi, Syifa, and hundreds of others who turned their dream vacations into reality with Agendain.",
};

async function updateSetting(key: string, mutate: (o: Record<string, unknown>) => void) {
  const row = await prisma.setting.findUnique({ where: { key } });
  if (!row) { console.log(`  (lewati) setting '${key}' belum ada`); return; }
  let obj: Record<string, unknown> = {};
  try { obj = JSON.parse(row.value); } catch { console.log(`  (lewati) '${key}' bukan JSON valid`); return; }
  mutate(obj);
  await prisma.setting.update({ where: { key }, data: { value: JSON.stringify(obj) } });
  console.log(`  '${key}' diperbarui`);
}

async function main() {
  console.log("Menerapkan konten Inggris Home + footer...");

  await updateSetting("home_settings", (o) => {
    Object.assign(o, HOME_EN);
    // whyItems_en: array paralel {title, desc} selaras urutan whyItems (ID).
    const why = o.whyItems;
    if (Array.isArray(why)) {
      o.whyItems_en = why.map((item: Record<string, unknown>) => {
        const idTitle = String(item?.title ?? "");
        const en = WHY_EN.find((w) => w.match.test(idTitle));
        return en ? { title: en.title, desc: en.desc } : { title: idTitle, desc: String(item?.desc ?? "") };
      });
    }
  });

  await updateSetting("footer_settings", (o) => {
    o.tagline_en = "Stop planning, start packing. <strong>Agendain Now!</strong>";
  });

  console.log("Selesai. (i18n en.ts juga sudah diperbarui sebagai fallback.)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
