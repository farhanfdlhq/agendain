/**
 * Ganti eyebrow section "Kenapa Agendain" (home_settings.whyTitleMain) agar tak
 * lagi memakai teks "Masih Ragu?" yang DOBEL dengan eyebrow FAQ. Non-destruktif:
 * hanya menimpa 2 field di home_settings, sisanya utuh. Idempotent — aman diulang.
 *
 *   npx tsx prisma/update-why-eyebrow.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const row = await prisma.setting.findUnique({ where: { key: "home_settings" } });
  if (!row) {
    console.log("(lewati) home_settings belum ada");
    return;
  }
  let obj: Record<string, unknown> = {};
  try {
    obj = JSON.parse(row.value);
  } catch {
    console.log("(lewati) home_settings bukan JSON valid");
    return;
  }

  obj.whyTitleMain = "Bikin Wacana Jadi Nyata";
  obj.whyTitleMain_en = "Turn Plans Into Trips";

  await prisma.setting.update({
    where: { key: "home_settings" },
    data: { value: JSON.stringify(obj) },
  });

  console.log(`whyTitleMain diperbarui → "${obj.whyTitleMain}" / "${obj.whyTitleMain_en}"`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
