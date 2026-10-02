import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { APP_VERSION, CHANGELOG } from "./changelog";

// Pagar untuk entri rilis baru: format, urutan, dan sinkron dengan package.json.
const SEMVER = /^\d+\.\d+\.\d+$/;
const toTuple = (v: string) => v.split(".").map(Number);
const isNewer = (a: string, b: string) => {
  const [x, y] = [toTuple(a), toTuple(b)];
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i];
  return false;
};

describe("changelog", () => {
  it("setiap entri punya versi semver, tanggal valid, dan minimal satu poin", () => {
    for (const e of CHANGELOG) {
      expect(e.version).toMatch(SEMVER);
      expect(e.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(new Date(e.date).getTime())).toBe(false);
      expect(e.title.trim()).not.toBe("");
      const total = (e.added?.length ?? 0) + (e.improved?.length ?? 0) + (e.fixed?.length ?? 0);
      expect(total).toBeGreaterThan(0);
    }
  });

  it("terbaru di atas: versi naik ketat dan tanggal tidak mundur", () => {
    for (let i = 0; i < CHANGELOG.length - 1; i++) {
      const [newer, older] = [CHANGELOG[i], CHANGELOG[i + 1]];
      expect(isNewer(newer.version, older.version), `${newer.version} harus > ${older.version}`).toBe(true);
      expect(newer.date >= older.date, `${newer.version} bertanggal sebelum ${older.version}`).toBe(true);
    }
  });

  it("versi package.json sama dengan rilis terbaru", () => {
    const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"));
    expect(pkg.version).toBe(APP_VERSION);
  });
});
