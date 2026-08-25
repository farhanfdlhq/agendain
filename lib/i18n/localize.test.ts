import { describe, expect, it } from "vitest";
import {
  foldLegacyRepeaters,
  HOME_REPEATERS,
  localizeRepeater,
  localizeRows,
  pickLocalized,
} from "./localize";

const TEXT = HOME_REPEATERS.whyItems; // ['title', 'desc']

describe("localizeRows", () => {
  it("keeps Indonesian rows untouched", () => {
    const base = [{ image: "/a.webp", title: "Judul", desc: "Isi" }];
    expect(localizeRows(base, [], TEXT, "id")).toBe(base);
  });

  it("uses the row's own _en text and keeps non-text fields from the base row", () => {
    const base = [
      {
        image: "/BARU.webp",
        titleWeight: "800",
        title: "Judul",
        title_en: "Title",
        desc: "Isi",
        desc_en: "Body",
      },
    ];
    const [row] = localizeRows(base, [], TEXT, "en");
    expect(row.title).toBe("Title");
    expect(row.desc).toBe("Body");
    expect(row.image).toBe("/BARU.webp");
    expect(row.titleWeight).toBe("800");
  });

  // Bug yang dilaporkan user: ganti gambar di tab ID, versi Inggris tetap
  // memakai gambar lama karena array EN diambil utuh. Sekarang gambar HARUS
  // ikut dari baris basis walau array EN warisan masih memuat gambar lama.
  it("never takes an image from the legacy EN array", () => {
    const base = [{ image: "/BARU.webp", title: "Judul" }];
    const legacy = [{ image: "/LAMA.webp", title: "Title" }];
    const [row] = localizeRows(base, legacy, TEXT, "en");
    expect(row.image).toBe("/BARU.webp");
    expect(row.title).toBe("Title"); // teksnya tetap dipanen dari data lama
  });

  it("takes the row count from the base array, never from the EN array", () => {
    const base = [{ title: "Satu" }, { title: "Dua" }];
    const legacy = [{ title: "One" }, { title: "Two" }, { title: "Three" }];
    expect(localizeRows(base, legacy, TEXT, "en")).toHaveLength(2);
  });

  it("falls back to Indonesian when the English text is blank", () => {
    const base = [{ title: "Judul", title_en: "   ", desc: "Isi" }];
    const [row] = localizeRows(base, [], TEXT, "en");
    expect(row.title).toBe("Judul");
    expect(row.desc).toBe("Isi");
  });

  it("prefers the row's own _en over the legacy array", () => {
    const base = [{ title: "Judul", title_en: "New Title" }];
    const legacy = [{ title: "Old Title" }];
    expect(localizeRows(base, legacy, TEXT, "en")[0].title).toBe("New Title");
  });
});

describe("localizeRepeater", () => {
  it("returns null when there is no custom array, so callers keep their default", () => {
    expect(localizeRepeater({}, "whyItems", "en", TEXT)).toBeNull();
    expect(localizeRepeater(null, "whyItems", "en", TEXT)).toBeNull();
  });

  it("reads the legacy `${key}_en` array as a text source", () => {
    const settings = {
      whyItems: [{ image: "/a.webp", title: "Judul" }],
      whyItems_en: [{ image: "/b.webp", title: "Title" }],
    };
    const rows = localizeRepeater(settings, "whyItems", "en", TEXT)!;
    expect(rows[0].title).toBe("Title");
    expect(rows[0].image).toBe("/a.webp");
  });
});

describe("foldLegacyRepeaters", () => {
  it("folds legacy EN text into the base rows and drops the legacy array", () => {
    const data: any = {
      whyItems: [{ image: "/a.webp", title: "Judul", desc: "Isi" }],
      whyItems_en: [{ image: "/b.webp", title: "Title", desc: "Body" }],
    };
    foldLegacyRepeaters(data, { whyItems: TEXT });
    expect(data.whyItems_en).toBeUndefined();
    expect(data.whyItems[0]).toEqual({
      image: "/a.webp",
      title: "Judul",
      title_en: "Title",
      desc: "Isi",
      desc_en: "Body",
    });
  });

  it("promotes the EN array when only that one was ever filled", () => {
    const data: any = { whyItems_en: [{ image: "/b.webp", title: "Title" }] };
    foldLegacyRepeaters(data, { whyItems: TEXT });
    expect(data.whyItems_en).toBeUndefined();
    expect(data.whyItems).toEqual([
      { image: "/b.webp", title: "Title", title_en: "Title" },
    ]);
  });

  it("does not overwrite an already-migrated row", () => {
    const data: any = {
      whyItems: [{ title: "Judul", title_en: "Kept" }],
      whyItems_en: [{ title: "Stale" }],
    };
    foldLegacyRepeaters(data, { whyItems: TEXT });
    expect(data.whyItems[0].title_en).toBe("Kept");
  });

  it("is a no-op without a legacy array", () => {
    const data: any = { whyItems: [{ title: "Judul" }] };
    foldLegacyRepeaters(data, { whyItems: TEXT });
    expect(data).toEqual({ whyItems: [{ title: "Judul" }] });
  });
});

describe("pickLocalized", () => {
  it("reads the `En` suffixed column, falling back to Indonesian", () => {
    const row = { nama: "Paris Klasik", namaEn: "Classic Paris", deskripsi: "Isi" };
    expect(pickLocalized(row, "nama", "en")).toBe("Classic Paris");
    expect(pickLocalized(row, "nama", "id")).toBe("Paris Klasik");
    expect(pickLocalized(row, "deskripsi", "en")).toBe("Isi");
    expect(pickLocalized({ nama: "X", namaEn: null }, "nama", "en")).toBe("X");
  });
});
