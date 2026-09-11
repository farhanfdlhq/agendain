/**
 * Seeder CONTOH: Itinerary + Invoice "Pak Wenny — Europe Trip".
 *
 * Sumber: dokumen dari divisi lain (Itinerary 8 hari + Budget Estimate "Ground
 * Service Costing", 10 pax, 26 Nov - 3 Des 2026). Dipakai untuk mendemokan
 * dukungan field baru: itinerary (aktivitas, transport, kota) & invoice
 * (kategori, durasi, notes). Idempotent — pakai token/nomor tetap + upsert,
 * jadi aman dijalankan ulang.
 *
 * Jalankan:  npx tsx prisma/seed-pak-wenny.ts
 */
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// Token tetap (data contoh) supaya upsert idempotent. Bukan rahasia produksi —
// admin bisa regen tautan bila perlu.
const ITIN_TOKEN = "sample-pakwenny-itinerary-eu2026";
const INV_TOKEN = "sample-pakwenny-invoice-eu2026";
const INV_NOMOR = "INV/2026/11/PW-SAMPLE";

const t = (hhmm: string) => hhmm; // "HH:MM"

// ---------- ITINERARY 8 HARI ----------
const hari = [
  {
    tanggal: "2026-11-26",
    items: [
      { mulai: t("08:00"), selesai: t("09:00"), aktivitas: "Breakfast at Hotel", lokasi: "Hotel", transport: "", kota: "Madrid (Spain)", catatan: "" },
      { mulai: t("09:00"), selesai: "", aktivitas: "Checkout & Transfer to Barcelona", lokasi: "Madrid Puerta de Atocha - Barcelona Sants", transport: "Train", kota: "Madrid - Barcelona (Spain)", catatan: "2,5 - 3 jam perjalanan" },
      { mulai: t("09:30"), selesai: t("12:30"), aktivitas: "Arrival Barcelona, Transfer to Hotel & Check-In", lokasi: "Barcelona Sants, Hotel", transport: "Train", kota: "Barcelona (Spain)", catatan: "" },
      { mulai: t("12:30"), selesai: t("13:30"), aktivitas: "Lunch", lokasi: "Restaurant", transport: "Public Transport/Taxi", kota: "Barcelona (Spain)", catatan: "" },
      { mulai: t("14:30"), selesai: t("18:00"), aktivitas: "Explore Barcelona", lokasi: "Arc de Triomf, Park Guell", transport: "Public Transport/Taxi", kota: "Barcelona (Spain)", catatan: "" },
      { mulai: t("18:00"), selesai: t("19:00"), aktivitas: "Dinner (Try Tapas)", lokasi: "Restaurant", transport: "Public Transport/Taxi", kota: "Barcelona (Spain)", catatan: "" },
      { mulai: t("19:00"), selesai: t("19:30"), aktivitas: "Back to Hotel and Rest", lokasi: "Hotel", transport: "Public Transport/Taxi", kota: "Barcelona (Spain)", catatan: "" },
    ],
  },
  {
    tanggal: "2026-11-27",
    items: [
      { mulai: t("08:30"), selesai: t("09:00"), aktivitas: "Breakfast at Hotel", lokasi: "Hotel", transport: "", kota: "Barcelona (Spain)", catatan: "" },
      { mulai: t("09:00"), selesai: t("12:30"), aktivitas: "Explore Barcelona", lokasi: "La Sagrada Familia, Gothic Quarter, Barcelona Cathedral, Camp Nou (optional)", transport: "Public Transport/Taxi", kota: "Barcelona (Spain)", catatan: "" },
      { mulai: t("12:30"), selesai: t("14:00"), aktivitas: "Lunch", lokasi: "Restaurant", transport: "Public Transport/Taxi", kota: "Barcelona (Spain)", catatan: "" },
      { mulai: t("14:00"), selesai: t("18:00"), aktivitas: "Explore & Shopping", lokasi: "Barceloneta, Park Ciutadella, La Rambla", transport: "Public Transport/Taxi", kota: "Barcelona (Spain)", catatan: "" },
      { mulai: t("18:00"), selesai: t("19:00"), aktivitas: "Dinner", lokasi: "Restaurant", transport: "Public Transport/Taxi", kota: "Barcelona (Spain)", catatan: "" },
      { mulai: t("19:00"), selesai: t("19:30"), aktivitas: "Back to Hotel and Rest", lokasi: "Hotel", transport: "Public Transport/Taxi", kota: "Barcelona (Spain)", catatan: "" },
    ],
  },
  {
    tanggal: "2026-11-28",
    items: [
      { mulai: t("07:30"), selesai: t("08:00"), aktivitas: "Breakfast at Hotel", lokasi: "Hotel", transport: "", kota: "Barcelona (Spain)", catatan: "" },
      { mulai: t("08:00"), selesai: t("09:00"), aktivitas: "Checkout & Transfer to Airport", lokasi: "Hotel - Barcelona Airport", transport: "Public Transport/Taxi", kota: "Barcelona (Spain)", catatan: "" },
      { mulai: t("09:00"), selesai: t("12:00"), aktivitas: "Check-in Baggage & Flight to Cologne", lokasi: "BCN - CGN", transport: "Flight", kota: "Barcelona (Spain) - Cologne (Germany)", catatan: "Include cabin 10kg & checked 20kg" },
      { mulai: t("12:00"), selesai: t("14:00"), aktivitas: "Arrival Cologne, Transfer to Hotel & Check-In", lokasi: "Coln Airport, Hotel", transport: "Private Vehicle", kota: "Cologne (Germany)", catatan: "" },
      { mulai: t("14:00"), selesai: t("15:00"), aktivitas: "Lunch", lokasi: "Restaurant", transport: "Private Vehicle", kota: "Cologne (Germany)", catatan: "" },
      { mulai: t("15:00"), selesai: t("18:00"), aktivitas: "Free Time - Leisure Walk Rhine Riverside", lokasi: "Rhine Riverside", transport: "", kota: "Cologne (Germany)", catatan: "" },
      { mulai: t("18:00"), selesai: t("19:00"), aktivitas: "Dinner", lokasi: "Restaurant", transport: "", kota: "Cologne (Germany)", catatan: "" },
      { mulai: t("19:00"), selesai: t("19:30"), aktivitas: "Back to Hotel and Rest", lokasi: "Hotel", transport: "Private Vehicle", kota: "Cologne (Germany)", catatan: "" },
    ],
  },
  {
    tanggal: "2026-11-29",
    items: [
      { mulai: t("08:30"), selesai: t("09:00"), aktivitas: "Breakfast at Hotel", lokasi: "Hotel", transport: "", kota: "Cologne (Germany)", catatan: "" },
      { mulai: t("09:00"), selesai: t("12:00"), aktivitas: "Checkout, Explore Cologne & Shopping", lokasi: "Cologne Cathedral / Kolner Dom, Hohenzollern Bridge, Altstadt Old Town", transport: "Private Vehicle", kota: "Cologne (Germany)", catatan: "" },
      { mulai: t("12:00"), selesai: t("13:30"), aktivitas: "Lunch", lokasi: "Restaurant", transport: "Private Vehicle", kota: "Cologne (Germany)", catatan: "" },
      { mulai: t("13:30"), selesai: t("16:30"), aktivitas: "Transfer to Frankfurt", lokasi: "Rhine River Cruise (optional)", transport: "Private Vehicle", kota: "Cologne - Frankfurt (Germany)", catatan: "" },
      { mulai: t("16:30"), selesai: t("18:00"), aktivitas: "Explore Frankfurt", lokasi: "Schildergasse (Shopping Street)", transport: "Private Vehicle", kota: "Frankfurt (Germany)", catatan: "" },
      { mulai: t("18:00"), selesai: t("19:00"), aktivitas: "Dinner", lokasi: "Restaurant", transport: "Private Vehicle", kota: "Frankfurt (Germany)", catatan: "" },
      { mulai: t("19:00"), selesai: t("19:30"), aktivitas: "Back to Hotel and Rest", lokasi: "Hotel", transport: "Private Vehicle", kota: "Frankfurt (Germany)", catatan: "" },
    ],
  },
  {
    tanggal: "2026-11-30",
    items: [
      { mulai: t("09:00"), selesai: t("09:30"), aktivitas: "Breakfast & Checkout Hotel", lokasi: "Hotel", transport: "", kota: "Cologne (Germany)", catatan: "" },
      { mulai: t("09:30"), selesai: t("12:00"), aktivitas: "Free Time", lokasi: "", transport: "Private Vehicle", kota: "Cologne (Germany)", catatan: "" },
      { mulai: t("12:00"), selesai: t("13:00"), aktivitas: "Transfer to Airport & Lunch", lokasi: "Airport", transport: "Private Vehicle", kota: "Cologne (Germany)", catatan: "" },
      { mulai: t("15:00"), selesai: t("18:00"), aktivitas: "Check-in Baggage & Flight to Rome", lokasi: "CGN - FCO", transport: "Flight", kota: "Cologne (Germany) - Rome (Italy)", catatan: "" },
      { mulai: t("18:00"), selesai: t("19:00"), aktivitas: "Arrival Rome, Transfer to Hotel & Check-In", lokasi: "Rome Airport, Hotel", transport: "Private Vehicle", kota: "Rome (Italy)", catatan: "" },
      { mulai: t("19:00"), selesai: t("20:00"), aktivitas: "Dinner", lokasi: "Restaurant", transport: "Private Vehicle", kota: "Rome (Italy)", catatan: "" },
      { mulai: t("20:00"), selesai: t("20:30"), aktivitas: "Back to Hotel and Rest", lokasi: "Hotel", transport: "Private Vehicle", kota: "Rome (Italy)", catatan: "" },
    ],
  },
  {
    tanggal: "2026-12-01",
    items: [
      { mulai: t("07:30"), selesai: t("08:00"), aktivitas: "Breakfast at Hotel", lokasi: "Hotel", transport: "", kota: "Rome (Italy)", catatan: "" },
      { mulai: t("08:00"), selesai: t("10:00"), aktivitas: "Head to Florence", lokasi: "Roma Termini - Firenze SMN", transport: "Train", kota: "Rome - Florence (Italy)", catatan: "" },
      { mulai: t("10:00"), selesai: t("11:00"), aktivitas: "Explore Florence", lokasi: "Duomo di Firenze", transport: "", kota: "Florence (Italy)", catatan: "By walk" },
      { mulai: t("11:00"), selesai: t("12:30"), aktivitas: "Lunch & Head to Pisa", lokasi: "Restaurant; Firenze SMN - Pisa Centrale", transport: "Train", kota: "Florence - Pisa (Italy)", catatan: "" },
      { mulai: t("12:30"), selesai: t("13:30"), aktivitas: "Explore Pisa", lokasi: "Leaning Tower of Pisa", transport: "", kota: "Pisa (Italy)", catatan: "" },
      { mulai: t("15:00"), selesai: t("18:00"), aktivitas: "Back to Rome", lokasi: "Pisa Centrale - Roma Termini", transport: "Train", kota: "Pisa - Rome (Italy)", catatan: "" },
      { mulai: t("18:00"), selesai: t("19:00"), aktivitas: "Dinner", lokasi: "Restaurant", transport: "Public Transport/Taxi", kota: "Rome (Italy)", catatan: "" },
      { mulai: t("19:00"), selesai: t("19:30"), aktivitas: "Back to Hotel and Rest", lokasi: "Hotel", transport: "Public Transport/Taxi", kota: "Rome (Italy)", catatan: "" },
    ],
  },
  {
    tanggal: "2026-12-02",
    items: [
      { mulai: t("08:30"), selesai: t("09:00"), aktivitas: "Breakfast at Hotel", lokasi: "Hotel", transport: "", kota: "Rome (Italy)", catatan: "" },
      { mulai: t("09:00"), selesai: t("12:00"), aktivitas: "Explore Rome", lokasi: "Colosseum, Roman Forum", transport: "Public Transport/Taxi", kota: "Rome (Italy)", catatan: "" },
      { mulai: t("12:00"), selesai: t("13:30"), aktivitas: "Lunch", lokasi: "Restaurant", transport: "Public Transport/Taxi", kota: "Rome (Italy)", catatan: "By walk" },
      { mulai: t("13:30"), selesai: t("18:00"), aktivitas: "Explore Rome & Shopping", lokasi: "Vatican City, Trevi Fountain, Pantheon, Spanish Steps", transport: "Public Transport/Taxi", kota: "Rome (Italy)", catatan: "" },
      { mulai: t("18:00"), selesai: t("19:00"), aktivitas: "Dinner", lokasi: "Restaurant", transport: "Public Transport/Taxi", kota: "Rome (Italy)", catatan: "" },
      { mulai: t("19:00"), selesai: t("19:30"), aktivitas: "Back to Hotel and Rest", lokasi: "Hotel", transport: "Public Transport/Taxi", kota: "Rome (Italy)", catatan: "" },
    ],
  },
  {
    tanggal: "2026-12-03",
    items: [
      { mulai: t("07:30"), selesai: t("08:00"), aktivitas: "Breakfast at Hotel", lokasi: "Hotel", transport: "", kota: "Rome (Italy)", catatan: "" },
      { mulai: t("08:00"), selesai: "", aktivitas: "Checkout Hotel & Transfer to FCO Airport", lokasi: "Hotel - FCO Airport", transport: "Private Vehicle", kota: "Rome (Italy)", catatan: "Sprinter or 2 Minivan" },
      { mulai: t("08:00"), selesai: t("09:00"), aktivitas: "Transfer to Airport", lokasi: "Sprinter or 2 Minivan", transport: "Private Vehicle", kota: "Rome (Italy)", catatan: "" },
      { mulai: t("09:00"), selesai: "", aktivitas: "Return to Jakarta", lokasi: "FCO - CGK", transport: "Flight", kota: "Rome (Italy)", catatan: "" },
    ],
  },
];

// ---------- INVOICE (dari Budget Estimate, per pax EUR x 10) ----------
const PAX = 10;
type Baris = { deskripsi: string; harga: number; kategori: string; durasi?: string; notes?: string };
const barisBudget: Baris[] = [
  // Ground Service (per pax) — total 748.25
  { kategori: "Ground Service", deskripsi: "Train Ticket: Madrid - Barcelona", harga: 57.25, durasi: "2,5 - 3 Jam" },
  { kategori: "Ground Service", deskripsi: "Public Transport 2 Hari (Barcelona)", harga: 18.70, notes: "Include Airport Transfer by Metro" },
  { kategori: "Ground Service", deskripsi: "Airport Transfer to Barcelona Airport", harga: 15.00 },
  { kategori: "Ground Service", deskripsi: "Airplane Ticket: Barcelona - Cologne", harga: 136.90, durasi: "2,5 Jam", notes: "Include cabin 10kg & checked 20kg" },
  { kategori: "Ground Service", deskripsi: "Airport Transfer: Coln Airport - Hotel", harga: 15.00 },
  { kategori: "Ground Service", deskripsi: "City Tour Coln", harga: 70.00 },
  { kategori: "Ground Service", deskripsi: "Train Ticket: Coln - Frankfurt", harga: 19.00, durasi: "1 Jam" },
  { kategori: "Ground Service", deskripsi: "City Tour Frankfurt", harga: 70.00 },
  { kategori: "Ground Service", deskripsi: "Airport Transfer: Hotel - Airport Frankfurt", harga: 15.00 },
  { kategori: "Ground Service", deskripsi: "Airplane Ticket: Frankfurt - Rome", harga: 170.90, durasi: "2 Jam", notes: "Include 23kg checked baggage" },
  { kategori: "Ground Service", deskripsi: "Airport Transfer Sprinter (Rome)", harga: 15.00, notes: "Asumsi 1 Sprinter / 2 Minivan (150 EUR)" },
  { kategori: "Ground Service", deskripsi: "Public Transport 3 Hari (Rome)", harga: 23.50 },
  { kategori: "Ground Service", deskripsi: "Train Ticket: Rome - Florence", harga: 40.00, durasi: "1,5 Jam" },
  { kategori: "Ground Service", deskripsi: "Train Ticket: Florence - Pisa", harga: 12.00, durasi: "1 Jam" },
  { kategori: "Ground Service", deskripsi: "Train Ticket: Pisa - Rome", harga: 55.00, durasi: "3 Jam" },
  { kategori: "Ground Service", deskripsi: "Airport Transfer Sprinter / 2 Minivan", harga: 15.00, durasi: "45 Menit" },
  // Tiket Wisata (per pax) — total 100.00
  { kategori: "Tiket Wisata", deskripsi: "La Sagrada Familia", harga: 26.00 },
  { kategori: "Tiket Wisata", deskripsi: "Camp Nou", harga: 28.00 },
  { kategori: "Tiket Wisata", deskripsi: "Coln Cathedral", harga: 12.00 },
  { kategori: "Tiket Wisata", deskripsi: "Colosseum", harga: 18.00 },
  { kategori: "Tiket Wisata", deskripsi: "Trevi Fountain", harga: 2.00 },
  { kategori: "Tiket Wisata", deskripsi: "Vatican City (Reservation)", harga: 7.00 },
  { kategori: "Tiket Wisata", deskripsi: "Pantheon", harga: 7.00 },
];

const invoiceItems = barisBudget.map((b) => ({
  deskripsi: b.deskripsi,
  qty: PAX,
  harga: b.harga,
  kategori: b.kategori,
  durasi: b.durasi ?? "",
  notes: b.notes ?? "",
}));

const bulat2 = (n: number) => Math.round(n * 100) / 100;
const subtotal = bulat2(invoiceItems.reduce((s, it) => s + it.qty * it.harga, 0)); // 8482.50
const KURS = 17500; // EUR -> IDR (contoh)

async function main() {
  console.log("Seeding contoh Pak Wenny (itinerary + invoice)...");

  await prisma.itinerary.upsert({
    where: { token: ITIN_TOKEN },
    update: {
      judul: "Europe Trip - Pak Wenny",
      klienNama: "Pak Wenny",
      klienNegara: "Indonesia",
      tanggalDok: new Date("2026-11-26"),
      hari: hari as unknown as Prisma.InputJsonValue,
      catatan: "Rute: Madrid - Barcelona - Cologne - Frankfurt - Rome - Firenze - Pisa - Rome. 10 pax, 26 Nov - 3 Des 2026.",
      status: "published",
    },
    create: {
      token: ITIN_TOKEN,
      bahasa: "id",
      judul: "Europe Trip - Pak Wenny",
      klienNama: "Pak Wenny",
      klienNegara: "Indonesia",
      tanggalDok: new Date("2026-11-26"),
      hari: hari as unknown as Prisma.InputJsonValue,
      catatan: "Rute: Madrid - Barcelona - Cologne - Frankfurt - Rome - Firenze - Pisa - Rome. 10 pax, 26 Nov - 3 Des 2026.",
      status: "published",
    },
  });
  console.log(`  Itinerary OK (${hari.length} hari) -> /itinerary/${ITIN_TOKEN}`);

  await prisma.invoice.upsert({
    where: { token: INV_TOKEN },
    update: {
      nomor: INV_NOMOR,
      mataUang: "EUR",
      klienNama: "Pak Wenny",
      judul: "Ground Service Costing - Europe Trip (10 pax)",
      tanggal: new Date("2026-11-20"),
      items: invoiceItems as unknown as Prisma.InputJsonValue,
      subtotal: new Prisma.Decimal(subtotal),
      pajakPersen: new Prisma.Decimal(0),
      pajakNominal: new Prisma.Decimal(0),
      total: new Prisma.Decimal(subtotal),
      kurs: new Prisma.Decimal(KURS),
      totalPadanan: new Prisma.Decimal(bulat2(subtotal * KURS)),
      catatan: "Estimasi ground service + tiket wisata, EUR per pax x 10. Harga dapat berubah sesuai ketersediaan.",
      status: "terkirim",
    },
    create: {
      nomor: INV_NOMOR,
      token: INV_TOKEN,
      bahasa: "id",
      mataUang: "EUR",
      klienNama: "Pak Wenny",
      judul: "Ground Service Costing - Europe Trip (10 pax)",
      tanggal: new Date("2026-11-20"),
      items: invoiceItems as unknown as Prisma.InputJsonValue,
      subtotal: new Prisma.Decimal(subtotal),
      pajakPersen: new Prisma.Decimal(0),
      pajakNominal: new Prisma.Decimal(0),
      total: new Prisma.Decimal(subtotal),
      kurs: new Prisma.Decimal(KURS),
      totalPadanan: new Prisma.Decimal(bulat2(subtotal * KURS)),
      catatan: "Estimasi ground service + tiket wisata, EUR per pax x 10. Harga dapat berubah sesuai ketersediaan.",
      status: "terkirim",
    },
  });
  console.log(`  Invoice OK (${invoiceItems.length} baris, subtotal EUR ${subtotal}) -> /invoice/${INV_TOKEN}`);
  console.log("Selesai.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
