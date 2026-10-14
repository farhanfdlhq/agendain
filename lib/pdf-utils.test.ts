import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { mkdirSync, rmSync } from "fs"
import path from "path"
import sharp from "sharp"
import { siapkanGambarPdf, sumberGambar } from "./pdf-utils"

// Berkas uji sementara di public/uploads (sumberGambar hanya melayani public/).
const dir = path.join(process.cwd(), "public", "uploads", "__pdf-test")
const webpUrl = "/uploads/__pdf-test/logo.webp"
const pngUrl = "/uploads/__pdf-test/logo.png"

beforeAll(async () => {
  mkdirSync(dir, { recursive: true })
  const img = sharp({ create: { width: 4, height: 4, channels: 4, background: "#054569" } })
  await img.clone().webp().toFile(path.join(dir, "logo.webp"))
  await img.clone().png().toFile(path.join(dir, "logo.png"))
})

afterAll(() => rmSync(dir, { recursive: true, force: true }))

describe("sumberGambar + siapkanGambarPdf", () => {
  it("PNG/JPG langsung dipakai sebagai path berkas", () => {
    expect(sumberGambar(pngUrl)).toBe(path.join(dir, "logo.png"))
  })

  it("WebP dilewati sebelum disiapkan, lalu tersedia sebagai PNG", async () => {
    expect(sumberGambar(webpUrl)).toBeNull()
    await siapkanGambarPdf([webpUrl, pngUrl, null, undefined])
    const src = sumberGambar(webpUrl)
    expect(src).toMatchObject({ format: "png" })
    const data = (src as { data: Buffer }).data
    expect(data.subarray(1, 4).toString()).toBe("PNG")
  })

  it("tetap menolak URL eksternal, traversal, & berkas tak ada", async () => {
    await siapkanGambarPdf(["https://169.254.169.254/x.webp", "/../../.env", "/uploads/tidak-ada.webp"])
    expect(sumberGambar("https://169.254.169.254/x.webp")).toBeNull()
    expect(sumberGambar("/../../.env")).toBeNull()
    expect(sumberGambar("/uploads/tidak-ada.webp")).toBeNull()
  })
})
