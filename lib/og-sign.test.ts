import { describe, expect, it } from "vitest";
import { signOg, verifyOg } from "./og-sign";
import { ogImage } from "./og";

describe("tanda tangan /og", () => {
  it("URL buatan situs lolos verifikasi", () => {
    const url = new URL(ogImage("/uploads/foto.webp", { title: "Paris *Romantis*", subtitle: "5 hari" }));
    const sp = url.searchParams;
    expect(verifyOg(sp.get("sig"), sp.get("src")!, sp.get("title") ?? "", sp.get("subtitle") ?? "")).toBe(true);
  });

  it("teks yang diubah atau tanpa tanda tangan ditolak", () => {
    const sig = signOg("/uploads/foto.webp", "Paris", "");
    expect(verifyOg(sig, "/uploads/foto.webp", "PROMO PALSU", "")).toBe(false);
    expect(verifyOg(sig, "/uploads/lain.webp", "Paris", "")).toBe(false);
    expect(verifyOg(null, "/uploads/foto.webp", "Paris", "")).toBe(false);
    expect(verifyOg("pendek", "/uploads/foto.webp", "Paris", "")).toBe(false);
  });

  it("judul panjang dipotong sama seperti endpoint sehingga tetap cocok", () => {
    const long = "A".repeat(150);
    const sp = new URL(ogImage("/uploads/foto.webp", { title: long })).searchParams;
    expect(sp.get("title")).toHaveLength(120);
    expect(verifyOg(sp.get("sig"), "/uploads/foto.webp", sp.get("title")!, "")).toBe(true);
  });

  it("subtitle diabaikan bila tanpa judul (sama dengan endpoint)", () => {
    const sp = new URL(ogImage("/uploads/foto.webp", { subtitle: "hanya subjudul" })).searchParams;
    expect(sp.get("subtitle")).toBeNull();
    expect(verifyOg(sp.get("sig"), "/uploads/foto.webp", "", "")).toBe(true);
  });
});
