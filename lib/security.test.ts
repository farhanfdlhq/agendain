import { describe, expect, it } from "vitest";
import {
  AdminUserSchema,
  checkCSRF,
  csrfBlocked,
  getClientIp,
  getClientIpFromHeaders,
  isAllowedRole,
  matchesFileSignature,
  OpenTripSchema,
  rateLimit,
  sanitizeHtml,
  sanitizeSettingsPayload,
  validateUploadedFile,
} from "./security";

function fileLike(name: string, type: string, size: number) {
  return { name, type, size } as File;
}

function reqWith(headers: Record<string, string>) {
  return new Request("http://localhost/api/x", { headers });
}

describe("security helpers", () => {
  it("allows only expected roles", () => {
    expect(isAllowedRole("super_admin", ["super_admin"])).toBe(true);
    expect(isAllowedRole("editor", ["super_admin", "admin"])).toBe(false);
    expect(isAllowedRole(undefined, ["admin"])).toBe(false);
  });

  it("sanitizes dangerous HTML while keeping simple formatting", () => {
    const input =
      '<h2 onclick="alert(1)">Hi</h2><p><strong>Safe</strong><script>alert(1)</script><a href="javascript:alert(1)">bad</a></p>';

    expect(sanitizeHtml(input)).toBe(
      "<h2>Hi</h2><p><strong>Safe</strong><a>bad</a></p>",
    );
  });

  it("validates strong admin passwords", () => {
    expect(
      AdminUserSchema.safeParse({
        nama: "Admin",
        email: "admin@example.com",
        password: "Weakpass1",
        role: "admin",
      }).success,
    ).toBe(false);

    expect(
      AdminUserSchema.safeParse({
        nama: "Admin",
        email: "admin@example.com",
        password: "StrongPass1!",
        role: "admin",
      }).success,
    ).toBe(true);
  });

  it("rejects invalid uploads and normalizes accepted extensions", () => {
    expect(validateUploadedFile(fileLike("avatar.svg", "image/svg+xml", 100))).toEqual({
      ok: false,
      error: "Format file tidak diizinkan.",
    });

    expect(validateUploadedFile(fileLike("avatar.jpg", "image/jpeg", 100))).toEqual({
      ok: true,
      extension: "jpg",
    });
  });

  it("escapes residual markup instead of leaking raw '<'", () => {
    // '<' yang diikuti non-huruf diperlakukan sebagai teks dan di-escape.
    expect(sanitizeHtml("5 < 3 is false")).toBe("5 &lt; 3 is false");
    // Tag di luar allowlist dibuang total, tidak bocor mentah.
    expect(sanitizeHtml('<img src=x onerror="alert(1)">')).toBe("");
    expect(sanitizeHtml("<p>ok</p><script>alert(1)</script>")).toBe("<p>ok</p>");
  });

  it("verifies file signatures (magic bytes), not just declared type", () => {
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0x00]);
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const pdf = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
    const fake = new Uint8Array([0x00, 0x01, 0x02, 0x03]);

    expect(matchesFileSignature(jpeg, "image/jpeg")).toBe(true);
    expect(matchesFileSignature(png, "image/png")).toBe(true);
    expect(matchesFileSignature(pdf, "application/pdf")).toBe(true);
    // File berbahaya yang mengklaim sebagai PDF harus ditolak.
    expect(matchesFileSignature(fake, "application/pdf")).toBe(false);
    expect(matchesFileSignature(jpeg, "image/png")).toBe(false);
  });

  it("accepts real .ico headers and rejects CUR / spoofed icons", () => {
    // ICONDIR valid: reserved 0,0 + type=1 (ICO) + count=1.
    const ico = new Uint8Array([0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x10, 0x10]);
    // CUR: type=2 harus ditolak.
    const cur = new Uint8Array([0x00, 0x00, 0x02, 0x00, 0x01, 0x00]);
    // count=0 (tidak ada gambar) harus ditolak.
    const zero = new Uint8Array([0x00, 0x00, 0x01, 0x00, 0x00, 0x00]);
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

    expect(matchesFileSignature(ico, "image/x-icon")).toBe(true);
    expect(matchesFileSignature(ico, "image/vnd.microsoft.icon")).toBe(true);
    expect(matchesFileSignature(ico, "image/ico")).toBe(true);
    // CUR dan count=0 bukan ICO yang sah.
    expect(matchesFileSignature(cur, "image/x-icon")).toBe(false);
    expect(matchesFileSignature(zero, "image/x-icon")).toBe(false);
    // PNG yang mengaku .ico ditolak; ICO yang mengaku PNG juga ditolak.
    expect(matchesFileSignature(png, "image/x-icon")).toBe(false);
    expect(matchesFileSignature(ico, "image/png")).toBe(false);
  });

  it("extracts client IP with Cloudflare precedence", () => {
    expect(
      getClientIp(reqWith({ "cf-connecting-ip": "9.9.9.9", "x-forwarded-for": "1.1.1.1" })),
    ).toBe("9.9.9.9");
    expect(getClientIp(reqWith({ "x-forwarded-for": "1.1.1.1, 2.2.2.2" }))).toBe("1.1.1.1");
    expect(getClientIp(reqWith({}))).toBe("127.0.0.1");
  });

  it("extracts client IP from a Headers object (auth context, no Request)", () => {
    expect(
      getClientIpFromHeaders(new Headers({ "cf-connecting-ip": "9.9.9.9", "x-forwarded-for": "1.1.1.1" })),
    ).toBe("9.9.9.9");
    expect(getClientIpFromHeaders(new Headers({ "x-forwarded-for": "1.1.1.1, 2.2.2.2" }))).toBe("1.1.1.1");
    expect(getClientIpFromHeaders(new Headers({ "x-real-ip": "3.3.3.3" }))).toBe("3.3.3.3");
    expect(getClientIpFromHeaders(new Headers())).toBe("127.0.0.1");
  });

  it("rejects cross-origin and header-less mutations in CSRF check", () => {
    expect(checkCSRF(reqWith({ host: "site.com", origin: "http://site.com" }))).toBe(true);
    expect(checkCSRF(reqWith({ host: "site.com", origin: "http://evil.com" }))).toBe(false);
    // Origin absen dulunya lolos begitu saja — sekarang butuh sinyal same-origin.
    expect(checkCSRF(reqWith({ host: "site.com" }))).toBe(false);
    expect(checkCSRF(reqWith({ host: "site.com", referer: "http://site.com/x" }))).toBe(true);
    expect(
      checkCSRF(reqWith({ host: "site.com", "sec-fetch-site": "same-origin" })),
    ).toBe(true);
    expect(
      checkCSRF(reqWith({ host: "site.com", "sec-fetch-site": "cross-site" })),
    ).toBe(false);
  });

  it("csrfBlocked: tolak browser lintas-origin, loloskan klien non-browser (Hermes)", () => {
    // Serangan browser lintas-origin → diblokir.
    expect(csrfBlocked(reqWith({ host: "site.com", origin: "http://evil.com" }))).toBe(true);
    expect(csrfBlocked(reqWith({ host: "site.com", "sec-fetch-site": "cross-site" }))).toBe(true);
    // Browser same-origin → lolos.
    expect(csrfBlocked(reqWith({ host: "site.com", origin: "http://site.com" }))).toBe(false);
    expect(csrfBlocked(reqWith({ host: "site.com", "sec-fetch-site": "same-origin" }))).toBe(false);
    // Klien server-to-server tanpa sinyal browser → lolos (bukan vektor CSRF).
    expect(csrfBlocked(reqWith({ host: "site.com" }))).toBe(false);
    expect(csrfBlocked(reqWith({}))).toBe(false);
  });

  it("bounds settings payloads and strips prototype pollution", () => {
    const ok = sanitizeSettingsPayload({ a: "1", nested: { b: [1, 2] } });
    expect(ok.ok).toBe(true);

    const proto = sanitizeSettingsPayload(
      JSON.parse('{"__proto__": {"admin": true}, "safe": "x"}'),
    );
    expect(proto.ok).toBe(true);
    if (proto.ok) {
      expect(Object.keys(proto.data as object)).toEqual(["safe"]);
    }

    expect(sanitizeSettingsPayload("not-an-object").ok).toBe(false);
    expect(sanitizeSettingsPayload([1, 2, 3]).ok).toBe(false);
    expect(sanitizeSettingsPayload({ x: "y" }, { maxBytes: 3 }).ok).toBe(false);
  });

  it("rate limits after the configured threshold", () => {
    const ip = "test-ip-unique-1";
    expect(rateLimit(ip, 2, 60000).success).toBe(true);
    expect(rateLimit(ip, 2, 60000).success).toBe(true);
    expect(rateLimit(ip, 2, 60000).success).toBe(false);
  });
});

describe("OpenTripSchema", () => {
  const base = {
    nama: "Halal Tour Turki",
    deskripsi: "Deskripsi paket.",
    harga: 18900000,
    durasi: 7,
    destinasiId: 3,
  };

  it("accepts the real stored shapes (foto object, akomodasi/penerbangan/itinerary)", () => {
    const r = OpenTripSchema.safeParse({
      ...base,
      foto: { medium: "/uploads/a.webp", thumb: "/uploads/a.webp", gallery: ["/uploads/a.webp"] },
      itinerary: [{ hari: 1, judul: "Tiba", deskripsi: "Mendarat" }],
      fasilitas: ["Hotel", "Bus"],
      akomodasi: [{ kota: "Istanbul", nama: "Grand Hotel" }, "Free text row"],
      penerbangan: [{ rute: "Jakarta → Istanbul", detail: "TK57", maskapai: "Turkish" }],
      tanggalKeberangkatan: "2026-11-15",
      kuota: 20,
      kursiTerisi: 14,
    });
    expect(r.success).toBe(true);
  });

  it("rejects javascript: URLs in foto (stored XSS vector)", () => {
    const r = OpenTripSchema.safeParse({
      ...base,
      foto: [{ full: "javascript:alert(1)" }],
    });
    expect(r.success).toBe(false);
  });

  it("rejects data: URLs in file dokumen", () => {
    const r = OpenTripSchema.safeParse({
      ...base,
      fileDokumen: [{ name: "x", url: "data:text/html,<script>alert(1)</script>" }],
    });
    expect(r.success).toBe(false);
  });

  it("strips prototype-pollution keys instead of storing them", () => {
    const r = OpenTripSchema.safeParse({
      ...base,
      itinerary: [{ hari: 1, judul: "ok", __proto__: { polluted: true } } as any],
    });
    expect(r.success).toBe(true);
    if (r.success) {
      const item = (r.data.itinerary as any[])[0];
      expect(Object.prototype.hasOwnProperty.call(item, "polluted")).toBe(false);
      expect(({} as any).polluted).toBeUndefined();
    }
  });

  it("caps oversized arrays (DoS guard)", () => {
    const huge = Array.from({ length: 5000 }, (_, i) => `item ${i}`);
    const r = OpenTripSchema.safeParse({ ...base, fasilitas: huge });
    expect(r.success).toBe(false);
  });

  it("rejects out-of-range numeric fields", () => {
    expect(OpenTripSchema.safeParse({ ...base, durasi: 9999 }).success).toBe(false);
    expect(OpenTripSchema.safeParse({ ...base, harga: -1 }).success).toBe(false);
  });
});
