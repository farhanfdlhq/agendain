import { describe, expect, it } from "vitest"
import { extensionForType, safeUploadName } from "./upload-name"

describe("safeUploadName", () => {
  it("ekstensi mengikuti tipe terverifikasi, bukan nama asli", () => {
    expect(safeUploadName("shell.php", "application/pdf")).toBe("shell.pdf")
    expect(safeUploadName("logo.php", "image/png")).toBe("logo.png")
    expect(safeUploadName("x.html", "image/jpeg")).toBe("x.jpg")
    expect(safeUploadName("cv.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")).toBe("cv.docx")
  })

  it("tanpa ekstensi ganda", () => {
    expect(safeUploadName("shell.php.pdf", "application/pdf")).toBe("shell-php.pdf")
    expect(safeUploadName("a.b.c.jpg", "image/webp")).toBe("a-b-c.webp")
  })

  it("membersihkan karakter aneh & nama kosong", () => {
    expect(safeUploadName("Foto Liburan (1).JPG", "image/jpeg")).toBe("FotoLiburan1.jpg")
    expect(safeUploadName(".htaccess", "application/pdf")).toBe("htaccess.pdf")
    expect(safeUploadName("我的.png", "image/png")).toBe("file.png")
  })

  it("menolak tipe yang tak dikenal", () => {
    expect(() => safeUploadName("x.svg", "image/svg+xml")).toThrow()
    expect(extensionForType("text/html")).toBeNull()
  })
})
