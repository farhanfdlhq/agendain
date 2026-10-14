import { describe, expect, it } from "vitest"
import {
  READ_DEDUPE_MS,
  formatReadCount,
  isBotUserAgent,
  readRecently,
  shouldShowReadCount,
} from "./blog-reads"

describe("shouldShowReadCount", () => {
  it("publik baru tampil mulai 50", () => {
    expect(shouldShowReadCount(0)).toBe(false)
    expect(shouldShowReadCount(49)).toBe(false)
    expect(shouldShowReadCount(50)).toBe(true)
    expect(shouldShowReadCount(null)).toBe(false)
    expect(shouldShowReadCount(undefined)).toBe(false)
  })
})

describe("formatReadCount", () => {
  it("format angka & label per bahasa", () => {
    expect(formatReadCount(1240, "id")).toBe("1.240 kali dibaca")
    expect(formatReadCount(1240, "en")).toBe("1,240 reads")
  })
})

describe("isBotUserAgent", () => {
  it("browser biasa dihitung", () => {
    expect(
      isBotUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36"),
    ).toBe(false)
    expect(
      isBotUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1"),
    ).toBe(false)
  })

  it("crawler, preview tautan & klien otomatis diabaikan", () => {
    for (const ua of [
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "facebookexternalhit/1.1",
      "WhatsApp/2.23.20.0",
      "curl/8.4.0",
      "Mozilla/5.0 HeadlessChrome/120.0",
      "",
      null,
    ]) {
      expect(isBotUserAgent(ua)).toBe(true)
    }
  })
})

describe("readRecently", () => {
  const now = 1_800_000_000_000
  it("dalam 24 jam = sudah dihitung", () => {
    expect(readRecently(String(now - 1000), now)).toBe(true)
  })
  it("lewat 24 jam / kosong / rusak = boleh dihitung lagi", () => {
    expect(readRecently(String(now - READ_DEDUPE_MS - 1), now)).toBe(false)
    expect(readRecently(null, now)).toBe(false)
    expect(readRecently("abc", now)).toBe(false)
  })
})
