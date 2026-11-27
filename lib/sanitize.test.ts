import { describe, expect, it } from "vitest";
import { sanitizeHtml } from "./sanitize";

/**
 * Sanitizer tagline footer (regex murni, sengaja tanpa DOMPurify agar tak
 * menambah bundle client — lihat components/Footer/Footer.tsx). Tes ini
 * MENGUNCI cakupan anti-XSS-nya: bila ada yang mengubah regex dan sebuah
 * payload mulai lolos, tes gagal sebelum sampai produksi.
 */
describe("sanitizeHtml (footer tagline)", () => {
  it("meloloskan tag allowlist yang sah", () => {
    expect(sanitizeHtml("Mau Jalan? <strong>Agendain aja!</strong>")).toBe(
      "Mau Jalan? <strong>Agendain aja!</strong>",
    );
    expect(sanitizeHtml("<em>halo</em>")).toBe("<em>halo</em>");
  });

  it("menautkan <a> dengan protokol aman + rel", () => {
    expect(sanitizeHtml('<a href="https://ok.com">x</a>')).toBe(
      '<a href="https://ok.com" rel="noopener noreferrer">x</a>',
    );
  });

  const xss: [string, string][] = [
    ["script", "<script>alert(1)</script>"],
    ["img onerror", "<img src=x onerror=alert(1)>"],
    ["a javascript:", '<a href="javascript:alert(1)">x</a>'],
    ["a js + tab", '<a href="java\tscript:alert(1)">x</a>'],
    ["a js tanpa kutip", "<a href=javascript:alert(1)>x</a>"],
    ["svg onload", "<svg/onload=alert(1)>"],
    ["on* di tag sah", '<a href="https://ok.com" onclick="alert(1)">x</a>'],
    ["mXSS nested", "<scr<script>ipt>alert(1)</script>"],
    ["p onmouseover", "<p onmouseover=alert(1)>x</p>"],
    ["iframe", "<iframe src=//evil></iframe>"],
    ["img menggantung", "<img src=x onerror=alert(1)//"],
    ["vbscript", '<a href="vbscript:msgbox(1)">x</a>'],
    ["data html", '<a href="data:text/html,<script>alert(1)</script>">x</a>'],
  ];

  it.each(xss)("menetralkan payload: %s", (_label, payload) => {
    const out = sanitizeHtml(payload);
    // Payload hanya berbahaya bila tersisa sebagai MARKUP aktif. Setelah escape,
    // `<` menjadi `&lt;` → cuma teks. Jadi kita periksa HANYA tag hidup (`<...>`):
    // tak boleh ada tag berbahaya, event handler, atau skema eksekusi.
    const liveTags = out.match(/<[^>]*>/g) ?? [];
    expect(
      liveTags.some((t) => /^<\s*\/?\s*(script|svg|iframe|img|object|embed|style|math|form|base)\b/i.test(t)),
    ).toBe(false);
    expect(liveTags.some((t) => /\son\w+\s*=/i.test(t))).toBe(false);
    expect(liveTags.some((t) => /(?:href|src)\s*=\s*["']?\s*(?:javascript|vbscript|data):/i.test(t))).toBe(false);
  });
});
