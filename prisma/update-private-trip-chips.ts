/**
 * Bikin chip kartu Private Trip berbeda per kelas (Value/Balance/Premium) supaya
 * tak lagi seragam "Durasi Fleksibel / Semua Ukuran / Jadwal Bebas" di semua kartu
 * (nilai info rendah). Chip baru mencerminkan pembeda tiap kelas + ikon relevan.
 *
 * Non-destruktif: hanya menimpa kolom `chips` paket yang subtitle-nya mengandung
 * value/balance/premium. Idempotent — aman diulang.
 *
 *   npx tsx prisma/update-private-trip-chips.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CHIPS: Record<string, string[]> = {
  value: ["[Bed] Hotel Bintang 2/3", "[Compass] Transport Lokal", "[Check] Paling Hemat"],
  balance: ["[Bed] Hotel Bintang 3", "[Car] 1x Private Car", "[Star] Best Value"],
  premium: ["[Bed] Hotel Bintang 4", "[Car] 3-4x Private Car", "[Shield] Luggage Service"],
};

function tierOf(subtitle: string): keyof typeof CHIPS | null {
  const s = (subtitle || "").toLowerCase();
  if (s.includes("value")) return "value";
  if (s.includes("balance")) return "balance";
  if (s.includes("premium")) return "premium";
  return null;
}

async function main() {
  const rows = await prisma.privateTripPackage.findMany({
    select: { id: true, subtitle: true },
  });
  let updated = 0;
  for (const r of rows) {
    const tier = tierOf(r.subtitle || "");
    if (!tier) {
      console.log(`(lewati) id ${r.id} — subtitle "${r.subtitle}" tak cocok value/balance/premium`);
      continue;
    }
    await prisma.privateTripPackage.update({
      where: { id: r.id },
      data: { chips: CHIPS[tier] },
    });
    updated++;
    console.log(`id ${r.id} (${tier}) → ${JSON.stringify(CHIPS[tier])}`);
  }
  console.log(`Selesai. ${updated}/${rows.length} paket diperbarui.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
