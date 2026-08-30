import { describe, expect, it } from "vitest";
import { formatMoneyInput, parseMoneyInput } from "./currency";

describe("formatMoneyInput", () => {
  it("menyisipkan titik ribuan gaya id-ID", () => {
    expect(formatMoneyInput("15000000")).toBe("15.000.000");
    expect(formatMoneyInput(1000000)).toBe("1.000.000");
    expect(formatMoneyInput("0")).toBe("0");
  });

  it("string kosong tetap kosong (bukan '0')", () => {
    expect(formatMoneyInput("")).toBe("");
  });

  it("mempertahankan bagian desimal & koma yang baru diketik", () => {
    expect(formatMoneyInput("2500.5")).toBe("2.500,5");
    expect(formatMoneyInput("2500.")).toBe("2.500,");
  });
});

describe("parseMoneyInput", () => {
  it("membuang titik ribuan, koma → titik desimal", () => {
    expect(parseMoneyInput("15.000.000")).toBe("15000000");
    expect(parseMoneyInput("2.500,5")).toBe("2500.5");
  });

  it("mengabaikan karakter non-angka", () => {
    expect(parseMoneyInput("Rp 1.250x")).toBe("1250");
  });

  it("round-trip: parse(format(x)) === x untuk nilai bulat", () => {
    for (const v of ["15000000", "999", "0", "1234567"]) {
      expect(parseMoneyInput(formatMoneyInput(v))).toBe(v);
    }
  });
});
