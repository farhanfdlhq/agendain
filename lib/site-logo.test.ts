import { describe, expect, it } from "vitest";
import { LOGO_BLUE, LOGO_WHITE, siteLogoOr } from "./site-logo";

describe("logo cadangan", () => {
  it("site_logo terisi → dipakai apa adanya", () => {
    expect(siteLogoOr("/uploads/logo.webp")).toBe("/uploads/logo.webp");
  });

  it("kosong, '/logo.png' (bawaan), atau bukan string → logo putih", () => {
    for (const v of [undefined, null, "", "  ", "/logo.png", 42]) {
      expect(siteLogoOr(v)).toBe(LOGO_WHITE);
    }
  });

  it("fallback bisa diganti versi biru (latar terang)", () => {
    expect(siteLogoOr("", LOGO_BLUE)).toBe(LOGO_BLUE);
  });

  it("URL ter-encode menunjuk file di public/", () => {
    expect(decodeURI(LOGO_WHITE)).toBe("/Logo ( White Version ).png");
    expect(decodeURI(LOGO_BLUE)).toBe("/Logo ( blue Version ).png");
  });
});
