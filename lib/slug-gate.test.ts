import { describe, expect, it } from "vitest"
import { parseSlugPath, slugIsServable } from "./slug-gate"

describe("parseSlugPath", () => {
  it("mengenali detail artikel & Open Trip", () => {
    expect(parseSlugPath("/blog/tips-visa")).toEqual({ kind: "blog", slug: "tips-visa" })
    expect(parseSlugPath("/open-trip/swiss-10h/")).toEqual({ kind: "open-trip", slug: "swiss-10h" })
    expect(parseSlugPath("/blog/caf%C3%A9")).toEqual({ kind: "blog", slug: "café" })
  })
  it("path lain diabaikan", () => {
    expect(parseSlugPath("/blog")).toBeNull()
    expect(parseSlugPath("/blog/a/b")).toBeNull()
    expect(parseSlugPath("/tentang")).toBeNull()
    expect(parseSlugPath("/blog/%E0%A4%A")).toBeNull()
  })
})

describe("slugIsServable", () => {
  it("slug tidak ada = 404", () => {
    expect(slugIsServable("blog", null, true)).toBe(false)
    expect(slugIsServable("open-trip", null, true)).toBe(false)
  })
  it("artikel: hanya yang terbit", () => {
    expect(slugIsServable("blog", "published", false)).toBe(true)
    expect(slugIsServable("blog", "draft", true)).toBe(false)
  })
  it("Open Trip: terbit, atau draf untuk admin yang login", () => {
    expect(slugIsServable("open-trip", "published", false)).toBe(true)
    expect(slugIsServable("open-trip", "publish", false)).toBe(true)
    expect(slugIsServable("open-trip", "draft", false)).toBe(false)
    expect(slugIsServable("open-trip", "draft", true)).toBe(true)
  })
})
