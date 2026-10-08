import { describe, expect, it } from "vitest";
import { taglineToHtml, taglineToStars } from "./footer-settings";

describe("format sorotan tagline footer", () => {
  it("*teks* → <strong>", () => {
    expect(taglineToHtml("Mau Jalan? *Agendain aja!*")).toBe("Mau Jalan? <strong>Agendain aja!</strong>");
  });

  it("data lama <strong> tetap utuh di website", () => {
    expect(taglineToHtml("Mau Jalan? <strong>Agendain aja!</strong>")).toBe("Mau Jalan? <strong>Agendain aja!</strong>");
  });

  it("<strong>/<b> lama tampil sebagai *teks* di CMS", () => {
    expect(taglineToStars("Mau Jalan? <strong>Agendain aja!</strong>")).toBe("Mau Jalan? *Agendain aja!*");
    expect(taglineToStars("A <b>B</b> C")).toBe("A *B* C");
  });

  it("bolak-balik menghasilkan HTML yang sama", () => {
    const old = "Stop planning. <strong>Agendain Now!</strong>";
    expect(taglineToHtml(taglineToStars(old))).toBe(old);
  });
});
