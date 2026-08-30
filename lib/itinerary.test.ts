import { describe, expect, it } from "vitest";
import { buildItineraryView, formatDurasiPanjang, formatMenit, hitungDurasi } from "./itinerary";

describe("hitungDurasi", () => {
  it("menghitung selisih jam mulai-selesai dalam menit", () => {
    expect(hitungDurasi("20:30", "21:30")).toBe(60);
    expect(hitungDurasi("09:00", "11:30")).toBe(150);
  });

  it("null bila jam tak lengkap atau tak valid", () => {
    expect(hitungDurasi("09:00", "")).toBeNull();
    expect(hitungDurasi("", "10:00")).toBeNull();
    expect(hitungDurasi("25:00", "26:00")).toBeNull();
    expect(hitungDurasi("9am", "10am")).toBeNull();
  });

  it("selesai < mulai dianggap melewati tengah malam", () => {
    expect(hitungDurasi("23:00", "01:00")).toBe(120);
  });
});

describe("formatMenit & formatDurasiPanjang", () => {
  it("format per aktivitas & total bilingual", () => {
    expect(formatMenit(60, "id")).toBe("60 Menit");
    expect(formatMenit(60, "en")).toBe("60 Mins");
    expect(formatDurasiPanjang(150, "id")).toBe("2 Jam 30 Menit");
    expect(formatDurasiPanjang(60, "en")).toBe("1 Hours 0 Mins");
  });
});

const dasar = {
  bahasa: "id",
  judul: "Itinerary Keluarga Jhonson",
  klienNama: "Jhonson",
  klienNegara: "Indonesia",
  klienTelepon: "85100706989",
  klienEmail: "jhonson@contoh.com",
  tanggalDok: new Date(2025, 8, 18),
  hari: [
    {
      tanggal: "2025-12-18",
      items: [{ mulai: "20:30", selesai: "21:30", lokasi: "Paris, Drop to hotel", catatan: "transfer" }],
    },
    {
      tanggal: "2025-12-19",
      items: [
        { mulai: "09:00", selesai: "11:30", lokasi: "Paris, le petit palais" },
        { mulai: "11:30", selesai: "13:00", lokasi: "Paris, Lunch" },
      ],
    },
  ],
  catatan: "Selamat menikmati.",
};

describe("buildItineraryView", () => {
  it("melabeli hari dengan nomor + tanggal, dan memformat jam/durasi", () => {
    const v = buildItineraryView({ itinerary: dasar });
    expect(v.hari).toHaveLength(2);
    expect(v.hari[0].label).toBe("Hari 1, 18 Desember 2025");
    expect(v.hari[0].items[0].jamFmt).toBe("20:30 - 21:30");
    expect(v.hari[0].items[0].durasiFmt).toBe("(60 Menit)");
    expect(v.hari[0].totalFmt).toBe("1 Jam 0 Menit");
  });

  it("menjumlahkan durasi seluruh aktivitas per hari", () => {
    const v = buildItineraryView({ itinerary: dasar });
    // 150 + 90 = 240 menit
    expect(v.hari[1].totalMenit).toBe(240);
    expect(v.hari[1].totalFmt).toBe("4 Jam 0 Menit");
  });

  it("memakai label Inggris saat bahasa en", () => {
    const v = buildItineraryView({ itinerary: { ...dasar, bahasa: "en" } });
    expect(v.label.madeFor).toBe("Made For");
    expect(v.hari[0].label).toBe("Day 1, 18 December 2025");
    expect(v.hari[0].items[0].durasiFmt).toBe("(60 Mins)");
  });

  it("aktivitas tanpa jam lengkap tidak ikut total & durasiFmt kosong", () => {
    const v = buildItineraryView({
      itinerary: { ...dasar, hari: [{ tanggal: "", items: [{ lokasi: "Bebas", mulai: "", selesai: "" }] }] },
    });
    expect(v.hari[0].items[0].durasiFmt).toBe("");
    expect(v.hari[0].totalMenit).toBe(0);
    expect(v.hari[0].label).toBe("Hari 1"); // tanpa tanggal → tanpa koma tanggal
  });

  it("kop dipakai bersama dari invoice_settings; madeFor dari data klien", () => {
    const v = buildItineraryView({
      itinerary: dasar,
      settings: { namaLegal: "PT Agendain Wisata", logo: "/uploads/inv.png", website: "agendain.com" },
    });
    expect(v.kop.nama).toBe("PT Agendain Wisata");
    expect(v.kop.logo).toBe("/uploads/inv.png");
    expect(v.kop.websiteHref).toBe("https://agendain.com");
    expect(v.madeFor.nama).toBe("Jhonson");
    expect(v.madeFor.negara).toBe("Indonesia");
  });
});
