import { describe, expect, it } from "vitest";
import { buildInvoiceView, formatNomorInvoice, hitungInvoice } from "./invoice";

describe("hitungInvoice", () => {
  it("menjumlahkan qty x harga tiap baris", () => {
    const r = hitungInvoice([
      { deskripsi: "Paket Eropa Barat", qty: 2, harga: 25_000_000 },
      { deskripsi: "Asuransi", qty: 2, harga: 500_000 },
    ], 0);
    expect(r.subtotal).toBe(51_000_000);
    expect(r.pajakNominal).toBe(0);
    expect(r.total).toBe(51_000_000);
  });

  it("menghitung pajak dari subtotal", () => {
    const r = hitungInvoice([{ deskripsi: "Jasa", qty: 1, harga: 10_000_000 }], 11);
    expect(r.subtotal).toBe(10_000_000);
    expect(r.pajakNominal).toBe(1_100_000);
    expect(r.total).toBe(11_100_000);
  });

  it("pajak 0 tidak menambah apa pun", () => {
    const r = hitungInvoice([{ deskripsi: "Jasa", qty: 3, harga: 100 }], 0);
    expect(r).toEqual({ subtotal: 300, pajakNominal: 0, total: 300 });
  });

  it("membulatkan ke 2 desimal (batas kolom Decimal(15,2))", () => {
    const r = hitungInvoice([{ deskripsi: "x", qty: 3, harga: 0.335 }], 0);
    expect(r.subtotal).toBe(1.01);
  });

  it("daftar kosong menghasilkan nol, bukan NaN", () => {
    expect(hitungInvoice([], 11)).toEqual({ subtotal: 0, pajakNominal: 0, total: 0 });
  });
});

describe("formatNomorInvoice", () => {
  it("memakai prefix, tahun, bulan 2 digit, dan urutan 4 digit", () => {
    expect(formatNomorInvoice("INV", new Date(2026, 7, 30), 1)).toBe("INV/2026/08/0001");
    expect(formatNomorInvoice("INV", new Date(2026, 11, 1), 137)).toBe("INV/2026/12/0137");
  });

  it("jatuh ke INV bila prefix kosong", () => {
    expect(formatNomorInvoice("", new Date(2026, 0, 5), 2)).toBe("INV/2026/01/0002");
  });
});

const invoiceDasar = {
  nomor: "INV/2026/08/0001",
  bahasa: "id",
  mataUang: "IDR",
  klienNama: "Budi Santoso",
  klienEmail: "budi@contoh.com",
  klienTelepon: "08123456789",
  klienAlamat: "Jakarta",
  judul: "Paket Eropa Barat 10 Hari",
  tanggal: new Date(2026, 7, 30),
  jatuhTempo: new Date(2026, 8, 6),
  items: [{ deskripsi: "Paket Eropa Barat", qty: 2, harga: 25_000_000 }],
  subtotal: 50_000_000,
  pajakLabel: "PPN 11%",
  pajakPersen: 11,
  pajakNominal: 5_500_000,
  total: 55_500_000,
  kurs: 17_000,
  totalPadanan: 3264.71,
  catatan: "Terima kasih.",
  status: "terkirim",
};

describe("buildInvoiceView", () => {
  it("menomori baris dan memformat angka sesuai mata uang", () => {
    const v = buildInvoiceView({ invoice: invoiceDasar, sekarang: new Date(2026, 7, 31) });
    expect(v.baris).toHaveLength(1);
    expect(v.baris[0].no).toBe(1);
    expect(v.baris[0].jumlahFmt).toContain("50.000.000");
    expect(v.ringkasan.totalFmt).toContain("55.500.000");
  });

  it("menyembunyikan baris pajak bila persennya 0", () => {
    const v = buildInvoiceView({
      invoice: { ...invoiceDasar, pajakPersen: 0, pajakNominal: 0, total: 50_000_000 },
      sekarang: new Date(2026, 7, 31),
    });
    expect(v.ringkasan.adaPajak).toBe(false);
  });

  it("menandai jatuh tempo hanya bila terkirim dan tanggalnya lewat", () => {
    const lewat = buildInvoiceView({ invoice: invoiceDasar, sekarang: new Date(2026, 8, 20) });
    expect(lewat.meta.jatuhTempoTerlewat).toBe(true);

    const belum = buildInvoiceView({ invoice: invoiceDasar, sekarang: new Date(2026, 8, 1) });
    expect(belum.meta.jatuhTempoTerlewat).toBe(false);

    const lunas = buildInvoiceView({
      invoice: { ...invoiceDasar, status: "lunas" },
      sekarang: new Date(2026, 8, 20),
    });
    expect(lunas.meta.jatuhTempoTerlewat).toBe(false);
  });

  it("memakai label Inggris saat bahasa en", () => {
    const v = buildInvoiceView({
      invoice: { ...invoiceDasar, bahasa: "en" },
      sekarang: new Date(2026, 7, 31),
    });
    expect(v.label.ditagihkanKepada).toBe("Billed To");
    expect(v.label.jatuhTempo).toBe("Due Date");
  });

  it("menampilkan padanan mata uang hanya bila kurs tersedia dan diizinkan", () => {
    const dengan = buildInvoiceView({
      invoice: invoiceDasar,
      settings: { tampilkanPadanan: true },
      sekarang: new Date(2026, 7, 31),
    });
    expect(dengan.ringkasan.padananFmt).toContain("3.264,71");

    const tanpa = buildInvoiceView({
      invoice: invoiceDasar,
      settings: { tampilkanPadanan: false },
      sekarang: new Date(2026, 7, 31),
    });
    expect(tanpa.ringkasan.padananFmt).toBeNull();

    const tanpaKurs = buildInvoiceView({
      invoice: { ...invoiceDasar, kurs: null, totalPadanan: null },
      settings: { tampilkanPadanan: true },
      sekarang: new Date(2026, 7, 31),
    });
    expect(tanpaKurs.ringkasan.padananFmt).toBeNull();
  });

  it("mengambil kop dari pengaturan invoice, jatuh ke pengaturan situs bila kosong", () => {
    const v = buildInvoiceView({
      invoice: invoiceDasar,
      settings: { namaLegal: "PT Agendain Wisata", logo: "/uploads/inv.png" },
      siteSettings: { site_name: "Agendain", site_logo: "/uploads/situs.png" },
      sekarang: new Date(2026, 7, 31),
    });
    expect(v.kop.nama).toBe("PT Agendain Wisata");
    expect(v.kop.logo).toBe("/uploads/inv.png");

    const fallback = buildInvoiceView({
      invoice: invoiceDasar,
      settings: {},
      siteSettings: { site_name: "Agendain", site_logo: "/uploads/situs.png" },
      sekarang: new Date(2026, 7, 31),
    });
    expect(fallback.kop.nama).toBe("Agendain");
    // Logo TIDAK jatuh ke logo situs: versi putih akan tak terlihat di kertas.
    expect(fallback.kop.logo).toBe("");
  });

  it("menyertakan rekening tujuan bila akun dilampirkan", () => {
    const v = buildInvoiceView({
      invoice: invoiceDasar,
      akun: { label: "BCA IDR", bank: "BCA", atasNama: "Agendain", nomor: "1234567890", bicSwift: null, iban: null },
      sekarang: new Date(2026, 7, 31),
    });
    expect(v.rekening?.bank).toBe("BCA");
    expect(v.rekening?.nomor).toBe("1234567890");

    const tanpa = buildInvoiceView({ invoice: invoiceDasar, sekarang: new Date(2026, 7, 31) });
    expect(tanpa.rekening).toBeNull();
  });
});
