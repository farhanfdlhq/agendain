import { describe, expect, it } from "vitest"
import { injectBrand, mimeFromPath, publicRelativePath, toDataUri } from "./error-page-brand"

const html = `<head><title>x</title>\n<!--site-favicon-->\n</head><img id="site-logo" src="data:image/png;base64,AAA" alt="a">`

describe("brand halaman error", () => {
  it("mengganti logo dan memasang favicon", () => {
    const out = injectBrand(html, { logo: "data:image/webp;base64,LOGO", favicon: "data:image/x-icon;base64,FAV" })
    expect(out).toContain('<img id="site-logo" src="data:image/webp;base64,LOGO" alt="a">')
    expect(out).toContain('<link rel="icon" id="site-favicon" href="data:image/x-icon;base64,FAV">')
    expect(out).not.toContain("<!--site-favicon-->")
  })

  it("idempoten: dijalankan dua kali tetap satu favicon", () => {
    const once = injectBrand(html, { favicon: "data:a" })
    const twice = injectBrand(once, { favicon: "data:b" })
    expect(twice.match(/rel="icon"/g)).toHaveLength(1)
    expect(twice).toContain('href="data:b"')
  })

  it("tanpa data brand → HTML tidak berubah", () => {
    expect(injectBrand(html, {})).toBe(html)
  })

  it("path setting → path di public/, menolak URL luar & traversal", () => {
    expect(publicRelativePath("/uploads/a.png")).toBe("uploads/a.png")
    expect(publicRelativePath("/Logo%20(%20White%20Version%20).png")).toBe("Logo ( White Version ).png")
    expect(publicRelativePath("https://cdn.x/a.png")).toBeNull()
    expect(publicRelativePath("//cdn.x/a.png")).toBeNull()
    expect(publicRelativePath("/uploads/../../.env")).toBeNull()
    expect(publicRelativePath("")).toBeNull()
    expect(publicRelativePath(null)).toBeNull()
  })

  it("mime dari ekstensi; tak dikenal → null", () => {
    expect(mimeFromPath("/uploads/x.ICO")).toBe("image/x-icon")
    expect(mimeFromPath("/a.webp?v=2")).toBe("image/webp")
    expect(mimeFromPath("/a.exe")).toBeNull()
    expect(toDataUri(new Uint8Array([1, 2, 3]), "image/png")).toBe("data:image/png;base64,AQID")
  })
})
