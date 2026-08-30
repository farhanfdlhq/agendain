/**
 * Perhitungan & penyajian invoice — MURNI, tanpa Prisma/React.
 *
 * Modul ini sengaja bebas I/O supaya bisa diuji langsung dan dipakai bersama
 * oleh tiga tempat: route API (menghitung angka otoritatif sebelum menyimpan),
 * halaman HTML publik, dan renderer PDF. Satu sumber format berarti mustahil
 * halaman menulis "Rp 12.500.000" sementara PDF menulis "12500000".
 */
import { formatEUR, formatIDR } from "./currency";

export type MataUang = "IDR" | "EUR";
export type InvoiceItem = { deskripsi: string; qty: number; harga: number };

/** Kolom uang di DB adalah Decimal(15,2), jadi semua hasil dibulatkan ke 2 desimal. */
const bulatkan = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Angka otoritatif invoice. SELALU dihitung ulang di server dari `items` —
 * jangan pernah percaya subtotal/total yang dikirim klien.
 */
export function hitungInvoice(items: InvoiceItem[], pajakPersen: number = 0) {
  const subtotal = bulatkan(
    (items ?? []).reduce((jml, it) => jml + Number(it?.qty || 0) * Number(it?.harga || 0), 0),
  );
  const pajakNominal = bulatkan((subtotal * Number(pajakPersen || 0)) / 100);
  return { subtotal, pajakNominal, total: bulatkan(subtotal + pajakNominal) };
}

export function formatUang(nilai: number, mataUang: MataUang): string {
  return mataUang === "EUR" ? formatEUR(nilai) : formatIDR(nilai);
}

/** `INV/2026/08/0001` — urutan direset tiap bulan oleh pemanggilnya. */
export function formatNomorInvoice(prefix: string, tanggal: Date, urutan: number): string {
  const p = (prefix || "").trim() || "INV";
  const bulan = String(tanggal.getMonth() + 1).padStart(2, "0");
  return `${p}/${tanggal.getFullYear()}/${bulan}/${String(urutan).padStart(4, "0")}`;
}

const LABEL = {
  id: {
    invoice: "INVOICE", ditagihkanKepada: "Ditagihkan Kepada", nomor: "Nomor",
    tanggal: "Tanggal", jatuhTempo: "Jatuh Tempo", deskripsi: "Deskripsi",
    qty: "Qty", harga: "Harga Satuan", jumlah: "Jumlah", subtotal: "Subtotal",
    total: "Total", rekening: "Transfer ke", catatan: "Catatan",
    jatuhTempoTerlewat: "JATUH TEMPO", lunas: "LUNAS", atasNama: "a.n.",
  },
  en: {
    invoice: "INVOICE", ditagihkanKepada: "Billed To", nomor: "Number",
    tanggal: "Date", jatuhTempo: "Due Date", deskripsi: "Description",
    qty: "Qty", harga: "Unit Price", jumlah: "Amount", subtotal: "Subtotal",
    total: "Total", rekening: "Transfer to", catatan: "Notes",
    jatuhTempoTerlewat: "OVERDUE", lunas: "PAID", atasNama: "a/n",
  },
} as const;

const formatTanggal = (d: Date | null | undefined, bahasa: string): string =>
  d
    ? new Intl.DateTimeFormat(bahasa === "en" ? "en-GB" : "id-ID", {
        day: "numeric", month: "long", year: "numeric",
      }).format(new Date(d))
    : "—";

/** Bandingkan per-tanggal (bukan per-jam): hari-H belum dianggap terlambat. */
const awalHari = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/**
 * Pengaturan datang dari `JSON.parse` sehingga bentuknya tidak dijamin. Semua
 * pembacaannya lewat sini: nilai apa pun (angka, null, objek nyasar) menjadi
 * string yang aman dirender, tanpa perlu melonggarkan tipe ke `any`.
 */
const teks = (v: unknown): string => (v === null || v === undefined ? "" : String(v));

/**
 * URL untuk href: sudah ber-skema http(s) diloloskan; tanpa skema diberi
 * https://; skema lain (mis. javascript:) ditolak jadi "" agar aman dirender.
 */
const httpUrl = (u: string): string => {
  const t = u.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  if (/^[a-z][a-z0-9+.-]*:/i.test(t)) return "";
  return `https://${t}`;
};

type InvoiceInput = {
  nomor: string; bahasa: string; mataUang: string;
  klienNama: string; klienEmail?: string | null; klienTelepon?: string | null; klienAlamat?: string | null;
  judul?: string | null; tanggal: Date | string; jatuhTempo?: Date | string | null;
  items: unknown; subtotal: unknown; pajakLabel?: string | null; pajakPersen: unknown;
  pajakNominal: unknown; total: unknown; kurs?: unknown; totalPadanan?: unknown;
  catatan?: string | null; status: string;
};

type AkunInput = {
  label: string; bank: string; atasNama?: string | null;
  nomor?: string | null; bicSwift?: string | null; iban?: string | null;
} | null | undefined;

/**
 * Bentuk siap-render. Semua nilai SUDAH diformat — konsumen tinggal menaruh
 * string ke dalam elemen, tanpa menghitung atau memformat apa pun lagi.
 */
export function buildInvoiceView({
  invoice, akun, settings, siteSettings, sekarang,
}: {
  invoice: InvoiceInput;
  akun?: AkunInput;
  settings?: Record<string, unknown>;
  siteSettings?: Record<string, unknown>;
  sekarang?: Date;
}) {
  const s = settings ?? {};
  const site = siteSettings ?? {};
  const bahasa = invoice.bahasa === "en" ? "en" : "id";
  const label = LABEL[bahasa];
  const mataUang: MataUang = invoice.mataUang === "EUR" ? "EUR" : "IDR";
  const now = sekarang ?? new Date();

  const items: InvoiceItem[] = Array.isArray(invoice.items) ? (invoice.items as InvoiceItem[]) : [];
  const pajakPersen = Number(invoice.pajakPersen || 0);
  const jatuhTempo = invoice.jatuhTempo ? new Date(invoice.jatuhTempo) : null;

  // Hanya invoice yang sudah dikirim yang bisa "jatuh tempo": draft belum
  // ditagihkan, sedangkan lunas & batal sudah selesai urusannya.
  const jatuhTempoTerlewat =
    invoice.status === "terkirim" && !!jatuhTempo && awalHari(jatuhTempo) < awalHari(now);

  const kurs = Number(invoice.kurs || 0);
  const totalPadanan = Number(invoice.totalPadanan || 0);
  const bolehPadanan = s.tampilkanPadanan !== false;
  const mataUangPadanan: MataUang = mataUang === "IDR" ? "EUR" : "IDR";

  return {
    label,
    bahasa,
    mataUang,
    kop: {
      nama: teks(s.namaLegal).trim() || teks(site.site_name).trim() || "Invoice",
      alamat: teks(s.alamat),
      telepon: teks(s.telepon),
      email: teks(s.email),
      website: teks(s.website),
      npwp: teks(s.npwp),
      // SENGAJA tidak jatuh ke `site_logo`. Logo situs di proyek ini adalah
      // versi PUTIH (dipakai footer & navbar berlatar navy); dipasang di
      // dokumen berlatar kertas putih ia jadi gambar tak kasatmata yang tetap
      // memakan ruang. Bila logo invoice belum diatur, nama perusahaan tampil
      // sebagai teks — selalu terbaca.
      logo: teks(s.logo),
      // href kontak untuk halaman HTML (di PDF tetap teks biasa).
      websiteHref: httpUrl(teks(s.website)),
      emailHref: teks(s.email) ? `mailto:${teks(s.email)}` : "",
      teleponHref: teks(s.telepon) ? `tel:${teks(s.telepon).replace(/[^\d+]/g, "")}` : "",
    },
    klien: {
      nama: invoice.klienNama,
      email: invoice.klienEmail || "",
      telepon: invoice.klienTelepon || "",
      alamat: invoice.klienAlamat || "",
    },
    meta: {
      nomor: invoice.nomor,
      judul: invoice.judul || "",
      status: invoice.status,
      tanggalFmt: formatTanggal(new Date(invoice.tanggal), bahasa),
      jatuhTempoFmt: formatTanggal(jatuhTempo, bahasa),
      adaJatuhTempo: !!jatuhTempo,
      jatuhTempoTerlewat,
      lunas: invoice.status === "lunas",
    },
    baris: items.map((it, i) => ({
      no: i + 1,
      deskripsi: it.deskripsi,
      qty: Number(it.qty || 0),
      hargaFmt: formatUang(Number(it.harga || 0), mataUang),
      jumlahFmt: formatUang(bulatkan(Number(it.qty || 0) * Number(it.harga || 0)), mataUang),
    })),
    ringkasan: {
      subtotalFmt: formatUang(Number(invoice.subtotal || 0), mataUang),
      adaPajak: pajakPersen > 0,
      pajakLabel:
        (invoice.pajakLabel || "").trim() ||
        `${bahasa === "en" ? "Tax" : "Pajak"} ${pajakPersen}%`,
      pajakFmt: formatUang(Number(invoice.pajakNominal || 0), mataUang),
      totalFmt: formatUang(Number(invoice.total || 0), mataUang),
      // Padanan hanya tampil bila kursnya benar-benar dibekukan saat terbit —
      // tanpa itu angkanya akan berubah-ubah tiap dokumen dibuka.
      padananFmt:
        bolehPadanan && kurs > 0 && totalPadanan > 0
          ? formatUang(totalPadanan, mataUangPadanan)
          : null,
      kursFmt: kurs > 0 ? `1 EUR = ${formatIDR(kurs)}` : null,
    },
    rekening: akun
      ? {
          label: akun.label,
          bank: akun.bank,
          atasNama: akun.atasNama || "",
          nomor: akun.nomor || "",
          bicSwift: akun.bicSwift || "",
          iban: akun.iban || "",
        }
      : null,
    catatan: invoice.catatan || teks(s.catatanDefault),
    tandaTangan: {
      gambar: teks(s.tandaTangan),
      nama: teks(s.penandaTanganNama),
      jabatan: teks(s.penandaTanganJabatan),
    },
  };
}

export type InvoiceView = ReturnType<typeof buildInvoiceView>;
