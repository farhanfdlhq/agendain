import { describe, expect, it } from "vitest";
import { pageList } from "./Pagination";

describe("pageList", () => {
  it("menampilkan semua halaman bila ≤ 5", () => {
    expect(pageList(1, 2)).toEqual([1, 2]);
    expect(pageList(3, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("memakai elipsis di sekitar halaman aktif", () => {
    expect(pageList(1, 10)).toEqual([1, 2, "gap", 10]);
    expect(pageList(5, 10)).toEqual([1, "gap", 4, 5, 6, "gap", 10]);
    expect(pageList(10, 10)).toEqual([1, "gap", 9, 10]);
  });

  it("tanpa elipsis bila halaman berdampingan", () => {
    expect(pageList(3, 6)).toEqual([1, 2, 3, 4, "gap", 6]);
  });
});
