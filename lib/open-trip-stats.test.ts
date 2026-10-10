import { describe, expect, it } from "vitest";
import { openTripStatFormDefaults, resolveOpenTripStats } from "./open-trip-stats";

describe("statistik Open Trip", () => {
  it("belum pernah disimpan → nilai lama yang dulu di-hardcode", () => {
    expect(resolveOpenTripStats({}, false)).toEqual([
      { value: 2, suffix: "+", label: "Tahun Pengalaman" },
      { value: 63, suffix: "+", label: "Destinasi Unik" },
      { value: 32, suffix: "K+", label: "Traveler Senang" },
      { value: 94, suffix: "%", label: "Tingkat Kepuasan" },
    ]);
    expect(resolveOpenTripStats(undefined, true)[1].label).toBe("Unique Destinations");
  });

  it("nilai CMS dipakai, label per bahasa", () => {
    const s = { stat2Value: "70", stat2Suffix: "+", stat2Label: "Kota", stat2Label_en: "Cities" };
    expect(resolveOpenTripStats(s, false)[1]).toEqual({ value: 70, suffix: "+", label: "Kota" });
    expect(resolveOpenTripStats(s, true)[1]).toEqual({ value: 70, suffix: "+", label: "Cities" });
  });

  it("angka kosong/tidak valid → bawaan; akhiran kosong tetap kosong", () => {
    const s = { stat1Value: "", stat3Value: "abc", stat4Value: "-5", stat4Suffix: "" };
    const r = resolveOpenTripStats(s, false);
    expect(r[0].value).toBe(2);
    expect(r[2].value).toBe(32);
    expect(r[3]).toEqual({ value: 94, suffix: "", label: "Tingkat Kepuasan" });
  });

  it("label EN kosong → bawaan EN, bukan label Indonesia", () => {
    expect(resolveOpenTripStats({ stat2Label: "Kota" }, true)[1].label).toBe("Unique Destinations");
  });

  it("isi awal form CMS = bawaan, bolak-balik konsisten", () => {
    const form = openTripStatFormDefaults();
    expect(form.stat3Suffix).toBe("K+");
    expect(resolveOpenTripStats(form, false)).toEqual(resolveOpenTripStats({}, false));
    expect(resolveOpenTripStats(form, true)).toEqual(resolveOpenTripStats({}, true));
  });
});
