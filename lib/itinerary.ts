/**
 * Perhitungan & penyajian dokumen ITINERARY per-klien — MURNI, tanpa I/O.
 *
 * Sejajar `lib/invoice.ts`: dipakai bersama route API, halaman HTML publik, dan
 * renderer PDF. Kop dokumen memakai `buildDocumentKop` yang sama dengan invoice
 * (identitas perusahaan dari `invoice_settings`), jadi nol duplikasi.
 *
 * Yang khas itinerary: durasi tiap aktivitas (jam mulai–selesai) dan total
 * durasi per hari.
 */
import { buildDocumentKop } from "./invoice";

const LABEL = {
  id: {
    itinerary: "ITINERARY", madeFor: "Dibuat Untuk", tanggal: "Tanggal",
    waktu: "Waktu", lokasi: "Lokasi", gambar: "Gambar", hari: "Hari",
    totalDurasi: "Total Durasi", catatan: "Catatan",
  },
  en: {
    itinerary: "ITINERARY", madeFor: "Made For", tanggal: "Date",
    waktu: "Time", lokasi: "Location", gambar: "Image", hari: "Day",
    totalDurasi: "Total Duration", catatan: "Notes",
  },
} as const;

const teks = (v: unknown): string => (v === null || v === undefined ? "" : String(v));

const menitDari = (hhmm: unknown): number | null => {
  if (typeof hhmm !== "string") return null;
  const m = hhmm.trim().match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};

/**
 * Durasi satu aktivitas dalam menit; `null` bila jam mulai/selesai tak lengkap
 * atau tak valid (baris seperti itu tidak ikut total). Selesai lebih kecil dari
 * mulai dianggap melewati tengah malam (+24 jam).
 */
export function hitungDurasi(mulai: unknown, selesai: unknown): number | null {
  const a = menitDari(mulai);
  const b = menitDari(selesai);
  if (a === null || b === null) return null;
  const d = b - a;
  return d >= 0 ? d : d + 1440;
}

export function formatMenit(menit: number, bahasa: string): string {
  return `${menit} ${bahasa === "en" ? "Mins" : "Menit"}`;
}

export function formatDurasiPanjang(menit: number, bahasa: string): string {
  const jam = Math.floor(menit / 60);
  const sisa = menit % 60;
  return bahasa === "en" ? `${jam} Hours ${sisa} Mins` : `${jam} Jam ${sisa} Menit`;
}

const formatTanggal = (d: Date | string | null | undefined, bahasa: string): string => {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(bahasa === "en" ? "en-GB" : "id-ID", {
    day: "numeric", month: "long", year: "numeric",
  }).format(date);
};

const jamRange = (mulai: unknown, selesai: unknown): string => {
  const a = teks(mulai).trim();
  const b = teks(selesai).trim();
  if (a && b) return `${a} - ${b}`;
  return a || b || "";
};

type ItineraryInput = {
  bahasa?: string;
  judul: string;
  klienNama: string;
  klienNegara?: string | null;
  klienTelepon?: string | null;
  klienEmail?: string | null;
  tanggalDok: Date | string;
  hari: unknown;
  catatan?: string | null;
};

/** Objek siap-render; semua nilai sudah diformat (jam, durasi, tanggal). */
export function buildItineraryView({
  itinerary, settings, siteSettings,
}: {
  itinerary: ItineraryInput;
  settings?: Record<string, unknown>;
  siteSettings?: Record<string, unknown>;
}) {
  const bahasa = itinerary.bahasa === "en" ? "en" : "id";
  const label = LABEL[bahasa];
  const kop = buildDocumentKop(settings, siteSettings);
  const hariArr = Array.isArray(itinerary.hari) ? itinerary.hari : [];

  const hari = hariArr.map((h: unknown, idx: number) => {
    const hh = (h ?? {}) as { tanggal?: unknown; items?: unknown };
    const items = Array.isArray(hh.items) ? hh.items : [];
    let totalMenit = 0;
    const rows = items.map((it: unknown, i: number) => {
      const item = (it ?? {}) as Record<string, unknown>;
      const durasi = hitungDurasi(item.mulai, item.selesai);
      if (durasi !== null) totalMenit += durasi;
      return {
        no: i + 1,
        jamFmt: jamRange(item.mulai, item.selesai),
        durasiFmt: durasi !== null ? `(${formatMenit(durasi, bahasa)})` : "",
        lokasi: teks(item.lokasi),
        catatan: teks(item.catatan),
        gambar: teks(item.gambar),
      };
    });
    const tanggalFmt = formatTanggal(hh.tanggal as string, bahasa);
    return {
      label: `${label.hari} ${idx + 1}${tanggalFmt ? `, ${tanggalFmt}` : ""}`,
      totalFmt: formatDurasiPanjang(totalMenit, bahasa),
      totalMenit,
      items: rows,
    };
  });

  return {
    bahasa,
    label,
    kop,
    madeFor: {
      nama: itinerary.klienNama,
      negara: teks(itinerary.klienNegara),
      telepon: teks(itinerary.klienTelepon),
      email: teks(itinerary.klienEmail),
    },
    meta: {
      judul: itinerary.judul,
      tanggalFmt: formatTanggal(itinerary.tanggalDok, bahasa),
    },
    hari,
    catatan: teks(itinerary.catatan),
  };
}

export type ItineraryView = ReturnType<typeof buildItineraryView>;
