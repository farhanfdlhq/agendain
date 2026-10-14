import { describe, expect, it } from "vitest"
import {
  BLOG_GRID_SIZE,
  blogListHref,
  blogPageCount,
  blogPageWindow,
  hasFeatured,
  parseBlogQuery,
  readMinutes,
} from "./blog-list"

describe("parseBlogQuery", () => {
  it("default ke halaman 1 tanpa filter", () => {
    expect(parseBlogQuery({})).toEqual({ page: 1, kategori: null, q: "" })
  })

  it("mengabaikan page tidak valid", () => {
    expect(parseBlogQuery({ page: "abc" }).page).toBe(1)
    expect(parseBlogQuery({ page: "0" }).page).toBe(1)
    expect(parseBlogQuery({ page: "-3" }).page).toBe(1)
    expect(parseBlogQuery({ page: "3" }).page).toBe(3)
  })

  it("menerima parameter lama ?category=", () => {
    expect(parseBlogQuery({ category: "tips" }).kategori).toBe("tips")
  })

  it("merapikan q & kategori, memakai nilai pertama bila berulang", () => {
    expect(parseBlogQuery({ q: "  paris ", kategori: ["tips", "kuliner"] })).toEqual({
      page: 1,
      kategori: "tips",
      q: "paris",
    })
  })
})

describe("halaman & jendela data", () => {
  it("12 artikel dengan Artikel Terbaru = 2 halaman (1+9, lalu 2)", () => {
    expect(blogPageCount(12, true)).toBe(2)
    expect(blogPageWindow(1, true)).toEqual({ skip: 0, take: BLOG_GRID_SIZE + 1 })
    expect(blogPageWindow(2, true)).toEqual({ skip: 10, take: BLOG_GRID_SIZE })
  })

  it("tanpa Artikel Terbaru: grid penuh tiap halaman", () => {
    expect(blogPageCount(9, false)).toBe(1)
    expect(blogPageCount(10, false)).toBe(2)
    expect(blogPageWindow(2, false)).toEqual({ skip: 9, take: 9 })
  })

  it("tetap 1 halaman bila kosong / hanya Artikel Terbaru", () => {
    expect(blogPageCount(0, true)).toBe(1)
    expect(blogPageCount(1, true)).toBe(1)
    expect(blogPageCount(10, true)).toBe(1)
    expect(blogPageCount(11, true)).toBe(2)
  })

  it("Artikel Terbaru hanya tanpa filter & pencarian", () => {
    expect(hasFeatured({ kategori: null, q: "" })).toBe(true)
    expect(hasFeatured({ kategori: "tips", q: "" })).toBe(false)
    expect(hasFeatured({ kategori: null, q: "roma" })).toBe(false)
  })
})

describe("blogListHref", () => {
  it("membuang parameter kosong & page=1", () => {
    expect(blogListHref({ page: 1 })).toBe("/blog#artikel")
    expect(blogListHref({ page: 1 }, false)).toBe("/blog")
  })

  it("menyusun kategori, q, page", () => {
    expect(blogListHref({ kategori: "tips", q: "musim dingin", page: 2 })).toBe(
      "/blog?kategori=tips&q=musim+dingin&page=2#artikel",
    )
  })
})

describe("readMinutes", () => {
  it("minimal 1 menit, 200 kata per menit", () => {
    expect(readMinutes("")).toBe(1)
    expect(readMinutes("<p>halo</p>")).toBe(1)
    expect(readMinutes(`<p>${"kata ".repeat(401)}</p>`)).toBe(3)
  })
})
