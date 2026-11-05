import { describe, expect, it } from "vitest"
import { BRAND_ICONS, customFavicon, siteIcons } from "./site-icons"

describe("siteIcons", () => {
  it("tanpa favicon CMS: set brand lengkap (SVG, PNG 32/16, ICO, ikon iPhone)", () => {
    for (const cms of [undefined, "", "  ", "/favicon.ico"]) {
      const icons = siteIcons(cms) as { icon: { url: string; sizes?: string }[]; shortcut: string; apple: { url: string } }
      expect(icons.icon.map((i) => i.url)).toEqual([BRAND_ICONS.svg, BRAND_ICONS.png32, BRAND_ICONS.png16])
      expect(icons.icon[1].sizes).toBe("32x32")
      expect(icons.shortcut).toBe(BRAND_ICONS.ico)
      expect(icons.apple.url).toBe(BRAND_ICONS.apple)
    }
  })

  it("favicon CMS tetap diutamakan; ICO tidak dipakai sebagai ikon iPhone", () => {
    expect(siteIcons("/uploads/fav.ico")).toEqual({ icon: "/uploads/fav.ico", shortcut: "/uploads/fav.ico", apple: BRAND_ICONS.apple })
    expect((siteIcons("/uploads/fav.png") as { apple: string }).apple).toBe("/uploads/fav.png")
  })

  it("customFavicon mengabaikan nilai kosong dan bawaan", () => {
    expect(customFavicon("/favicon.ico")).toBeNull()
    expect(customFavicon(42)).toBeNull()
    expect(customFavicon(" /uploads/a.ico ")).toBe("/uploads/a.ico")
  })
})
