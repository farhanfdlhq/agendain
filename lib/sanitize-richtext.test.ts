import { describe, expect, it } from "vitest";
import { sanitizeRichText } from "./sanitize-richtext";

/**
 * Sanitizer rich text (DOMPurify + allowlist) untuk blog, kebijakan privasi,
 * tentang. Tes mengunci: (1) markup editor yang sah tetap lolos, (2) payload
 * XSS dibuang, (3) atribut `style` DIPERSEMPIT ke `text-align` saja — menutup
 * CSS injection (overlay/defacement) oleh editor konten.
 */
describe("sanitizeRichText", () => {
  it("meloloskan markup editor yang sah", () => {
    expect(sanitizeRichText("<p><strong>halo</strong> dunia</p>")).toBe(
      "<p><strong>halo</strong> dunia</p>",
    );
  });

  it("memaksa target/rel aman pada tautan", () => {
    const out = sanitizeRichText('<a href="/uploads/x.webp">x</a>');
    expect(out).toContain('target="_blank"');
    expect(out).toContain('rel="noopener noreferrer nofollow"');
  });

  it("mempertahankan text-align (satu-satunya style yang dipakai editor)", () => {
    expect(sanitizeRichText('<p style="text-align:center">x</p>')).toBe(
      '<p style="text-align:center">x</p>',
    );
    // text-align sah tetap dipertahankan walau ada CSS lain di sampingnya.
    expect(sanitizeRichText('<p style="text-align:right;position:fixed">x</p>')).toBe(
      '<p style="text-align:right">x</p>',
    );
  });

  const xss: [string, string][] = [
    ["script", "<script>alert(1)</script>"],
    ["img onerror", "<img src=x onerror=alert(1)>"],
    ["a javascript:", '<a href="javascript:alert(1)">x</a>'],
    ["a js uppercase", '<a href="jAvAsCrIpt:alert(1)">x</a>'],
    ["svg onload", "<svg onload=alert(1)>"],
    ["iframe js", '<iframe src="javascript:alert(1)"></iframe>'],
    ["mglyph mXSS", "<math><mtext><table><mglyph><style><img src=x onerror=alert(1)>"],
    ["form", '<form action="//evil"><button>x</button></form>'],
    ["details ontoggle", "<details open ontoggle=alert(1)>"],
    ["base", '<base href="//evil/">'],
    ["p onclick", '<p onclick="alert(1)">x</p>'],
  ];

  it.each(xss)("menetralkan payload: %s", (_label, payload) => {
    const out = sanitizeRichText(payload);
    // Periksa hanya tag hidup (`<...>`); teks ter-escape (`&lt;`) tidak berbahaya.
    const liveTags = out.match(/<[^>]*>/g) ?? [];
    expect(
      liveTags.some((t) => /^<\s*\/?\s*(script|svg|iframe|form|base|style|math)\b/i.test(t)),
    ).toBe(false);
    expect(liveTags.some((t) => /\son\w+\s*=/i.test(t))).toBe(false);
    expect(liveTags.some((t) => /(?:href|src)\s*=\s*["']?\s*javascript:/i.test(t))).toBe(false);
  });

  it("membuang CSS injection lewat atribut style", () => {
    const overlay = '<p style="position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:99999">x</p>';
    const out = sanitizeRichText(overlay);
    expect(out).not.toMatch(/position|z-index|width|height/i);
    expect(out).toBe("<p>x</p>");
  });
});
