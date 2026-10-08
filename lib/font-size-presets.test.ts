import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { FONT_SIZE_PRESETS, FONT_SIZE_ROLES } from "./font-size-presets";

// Label peran di CMS harus sama dengan skala tipografi di app/tokens.css.
const tokens = readFileSync(join(process.cwd(), "app/tokens.css"), "utf8");
const rem = (v: string) => Math.round(parseFloat(v) * 16);
const tokenValue = (name: string) => tokens.match(new RegExp(`--${name}:\s*([^;]+);`))?.[1]?.trim() ?? "";
/** Ukuran desktop = batas atas clamp(), atau nilai rem langsung. */
const desktopPx = (name: string) => {
  const v = tokenValue(name);
  const clampMax = v.match(/clamp\([^,]+,[^,]+,\s*([\d.]+)rem\)/);
  return rem(clampMax ? clampMax[1] : v);
};

describe("preset Font Size CMS", () => {
  it("setiap label peran ada di daftar preset", () => {
    for (const px of Object.keys(FONT_SIZE_ROLES).map(Number)) {
      expect(FONT_SIZE_PRESETS).toContain(px);
    }
  });

  it("label sesuai token tipografi situs", () => {
    const byRole = Object.fromEntries(Object.entries(FONT_SIZE_ROLES).map(([px, role]) => [role, Number(px)]));
    expect(byRole["Hero"]).toBe(desktopPx("type-hero"));
    expect(byRole["Judul Section"]).toBe(desktopPx("type-section"));
    expect(byRole["Judul Kartu"]).toBe(desktopPx("type-card-title"));
    expect(byRole["Lead / Sub-judul"]).toBe(desktopPx("type-lead"));
    expect(byRole["Body"]).toBe(desktopPx("type-body"));
    expect(byRole["Caption"]).toBe(desktopPx("type-caption"));
  });
});
