import { describe, expect, it } from "vitest";
import { adminPreviewUrl } from "./admin-preview-url";

describe("adminPreviewUrl", () => {
  it("halaman CMS → halaman publiknya", () => {
    expect(adminPreviewUrl("/admin/cms/home")).toBe("/");
    expect(adminPreviewUrl("/admin/cms/about")).toBe("/tentang");
    expect(adminPreviewUrl("/admin/cms/blog")).toBe("/blog");
    expect(adminPreviewUrl("/admin/cms/open-trip")).toBe("/open-trip");
    expect(adminPreviewUrl("/admin/cms/private-trip")).toBe("/private-trip");
    expect(adminPreviewUrl("/admin/cms/privacy")).toBe("/privacy-policy");
    expect(adminPreviewUrl("/admin/cms/footer")).toBe("/");
  });

  it("edit paket / artikel → halaman detail", () => {
    expect(adminPreviewUrl("/admin/open-trip/edit/halal-tour-turki")).toBe("/open-trip/halal-tour-turki");
    expect(adminPreviewUrl("/admin/blog/gelato-roma/edit")).toBe("/blog/gelato-roma");
  });

  it("daftar & halaman lain di modul yang sama → daftar publik", () => {
    expect(adminPreviewUrl("/admin/open-trip")).toBe("/open-trip");
    expect(adminPreviewUrl("/admin/open-trip/baru")).toBe("/open-trip");
    expect(adminPreviewUrl("/admin/blog/kategori")).toBe("/blog");
  });

  it("tanpa padanan → beranda", () => {
    expect(adminPreviewUrl("/admin")).toBe("/");
    expect(adminPreviewUrl("/admin/settings/audit-log")).toBe("/");
    expect(adminPreviewUrl("/admin/cms/about/")).toBe("/tentang");
    expect(adminPreviewUrl(null)).toBe("/");
  });
});
