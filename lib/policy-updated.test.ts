import { describe, expect, it } from "vitest"
import { formatPolicyMonth, keepPolicyDate, policyContentChanged, readPolicyDate, stampPolicyDate, withoutPolicyDate } from "./policy-updated"

const NOV = new Date("2026-11-13T03:00:00Z")
const ID_DOC = "<h2>Kebijakan Privasi Agendain</h2><p>Terakhir Diperbarui: <strong>Agustus 2026</strong></p><p>Isi.</p>"
const EN_DOC = "<h2>Agendain Privacy Policy</h2>\n<p>Last Updated: <strong>August 2026</strong></p>\n<p>Body.</p>"

describe("formatPolicyMonth", () => {
  it("bulan-tahun dalam bahasa dokumen", () => {
    expect(formatPolicyMonth(NOV, "id")).toBe("November 2026")
    expect(formatPolicyMonth(new Date("2026-08-05T03:00:00Z"), "id")).toBe("Agustus 2026")
    expect(formatPolicyMonth(new Date("2026-08-05T03:00:00Z"), "en")).toBe("August 2026")
  })
  it("memakai waktu Jakarta, bukan UTC", () => {
    // 30 Nov 18.00 UTC = 1 Des 01.00 WIB.
    expect(formatPolicyMonth(new Date("2026-11-30T18:00:00Z"), "id")).toBe("Desember 2026")
  })
})

describe("stampPolicyDate", () => {
  it("mengganti tanggal di baris yang sudah ada, sisanya utuh", () => {
    expect(stampPolicyDate(ID_DOC, NOV, "id")).toBe(ID_DOC.replace("Agustus 2026", "November 2026"))
    expect(stampPolicyDate(EN_DOC, NOV, "en")).toBe(EN_DOC.replace("August 2026", "November 2026"))
  })
  it("baris tanpa <strong> tetap dikenali", () => {
    expect(stampPolicyDate("<p>Terakhir diperbarui: Agustus 2026</p><p>Isi.</p>", NOV, "id")).toBe(
      "<p>Terakhir diperbarui: <strong>November 2026</strong></p><p>Isi.</p>",
    )
  })
  it("menyisipkan baris setelah judul pertama bila belum ada", () => {
    expect(stampPolicyDate("<h2>Judul</h2><p>Isi.</p>", NOV, "id")).toBe(
      "<h2>Judul</h2><p>Terakhir Diperbarui: <strong>November 2026</strong></p><p>Isi.</p>",
    )
    expect(stampPolicyDate("<p>Body.</p>", NOV, "en")).toBe("<p>Last Updated: <strong>November 2026</strong></p><p>Body.</p>")
  })
  it("dokumen kosong dibiarkan", () => {
    expect(stampPolicyDate("", NOV, "id")).toBe("")
    expect(stampPolicyDate(undefined, NOV, "en")).toBe("")
  })
  it("idempoten", () => {
    const once = stampPolicyDate(ID_DOC, NOV, "id")
    expect(stampPolicyDate(once, NOV, "id")).toBe(once)
  })
})

describe("policyContentChanged", () => {
  const stored = { privacyContent: ID_DOC, privacyContent_en: EN_DOC, heroImage: "/a.webp" }
  it("simpan ulang tanpa perubahan isi = tidak berubah", () => {
    expect(policyContentChanged(stored, { ...stored })).toBe(false)
  })
  it("hanya tanggal atau hero yang beda = tidak berubah", () => {
    expect(
      policyContentChanged(stored, {
        ...stored,
        heroImage: "/b.webp",
        privacyContent: ID_DOC.replace("Agustus 2026", "November 2026"),
      }),
    ).toBe(false)
  })
  it("isi ID atau EN berubah = berubah", () => {
    expect(policyContentChanged(stored, { ...stored, privacyContent: ID_DOC.replace("Isi.", "Isi baru.") })).toBe(true)
    expect(policyContentChanged(stored, { ...stored, privacyContent_en: EN_DOC.replace("Body.", "New body.") })).toBe(true)
  })
  it("belum ada data tersimpan + ada isi = berubah", () => {
    expect(policyContentChanged(null, { privacyContent: ID_DOC })).toBe(true)
    expect(policyContentChanged(null, { privacyContent: "" })).toBe(false)
  })
  it("withoutPolicyDate membuang tanggal saja", () => {
    expect(withoutPolicyDate(ID_DOC)).toBe(ID_DOC.replace("<strong>Agustus 2026</strong>", ""))
  })
})

describe("keepPolicyDate", () => {
  const storedNov = ID_DOC.replace("Agustus 2026", "November 2026")
  it("editor basi (tanggal lama) tidak memundurkan tanggal tersimpan", () => {
    expect(keepPolicyDate(ID_DOC, storedNov)).toBe(storedNov)
  })
  it("tanpa baris tanggal di salah satu sisi = apa adanya", () => {
    expect(keepPolicyDate("<p>Isi.</p>", storedNov)).toBe("<p>Isi.</p>")
    expect(keepPolicyDate(ID_DOC, "<p>Isi.</p>")).toBe(ID_DOC)
    expect(keepPolicyDate(undefined, storedNov)).toBe("")
  })
  it("readPolicyDate membaca teks tanggal", () => {
    expect(readPolicyDate(ID_DOC)).toBe("Agustus 2026")
    expect(readPolicyDate("<p>Isi.</p>")).toBeNull()
  })
})
