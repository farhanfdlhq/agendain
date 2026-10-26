// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"
import { monthGrid, parseIsoDate, toIsoDate, isOutOfRange } from "./date-picker"
import { DatePicker } from "../components/ui/date-picker"

afterEach(cleanup)

describe("logika kalender", () => {
  it("parse/format YYYY-MM-DD tanpa geser zona waktu", () => {
    expect(toIsoDate(parseIsoDate("2026-10-26")!)).toBe("2026-10-26")
    expect(parseIsoDate("2026-02-30")).toBeNull()
    expect(parseIsoDate("26/10/2026")).toBeNull()
    expect(parseIsoDate("")).toBeNull()
  })

  it("grid 6 minggu dimulai Senin", () => {
    const grid = monthGrid(new Date(2026, 10, 1)) // November 2026, tgl 1 = Minggu
    expect(grid).toHaveLength(42)
    expect(toIsoDate(grid[0])).toBe("2026-10-26") // Senin sebelum 1 Nov
    expect(grid[0].getDay()).toBe(1)
  })

  it("batas min/max", () => {
    expect(isOutOfRange("2026-10-25", "2026-10-26")).toBe(true)
    expect(isOutOfRange("2026-10-26", "2026-10-26")).toBe(false)
    expect(isOutOfRange("2026-11-01", undefined, "2026-10-31")).toBe(true)
  })
})

describe("DatePicker", () => {
  it("menampilkan tanggal Indonesia dan memilih tanggal dari kalender", () => {
    const onChange = vi.fn()
    render(<DatePicker id="tgl" value="2026-10-26" onChange={onChange} />)
    const trigger = screen.getByRole("button", { name: /26 Okt 2026/ })
    fireEvent.click(trigger)
    expect(screen.getByText(/oktober 2026/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole("gridcell", { name: /Jumat, 30 Oktober 2026/ }))
    expect(onChange).toHaveBeenCalledWith("2026-10-30")
  })

  it("tanggal sebelum min tidak bisa dipilih", () => {
    render(<DatePicker value="2026-11-05" min="2026-11-02" onChange={() => {}} />)
    fireEvent.click(screen.getByRole("button", { name: /5 Nov 2026/ }))
    expect(screen.getByRole("gridcell", { name: /, 1 November 2026$/ })).toBeDisabled()
    expect(screen.getByRole("gridcell", { name: /, 2 November 2026$/ })).not.toBeDisabled()
  })

  it("panah kanan memindah fokus ke hari berikutnya, PageDown ke bulan berikutnya", () => {
    render(<DatePicker value="2026-10-31" onChange={() => {}} />)
    fireEvent.click(screen.getByRole("button", { name: /31 Okt 2026/ }))
    const cell = screen.getByRole("gridcell", { name: /31 Oktober 2026/ })
    fireEvent.keyDown(cell, { key: "ArrowRight" })
    expect(screen.getByRole("gridcell", { name: /, 1 November 2026$/ })).toHaveAttribute("tabindex", "0")
    fireEvent.keyDown(screen.getByRole("gridcell", { name: /, 1 November 2026$/ }), { key: "PageDown" })
    expect(screen.getByText(/desember 2026/i)).toBeInTheDocument()
  })

  it("tombol Hapus hanya untuk field opsional yang sudah terisi", () => {
    const onChange = vi.fn()
    const { rerender } = render(<DatePicker value="2026-10-26" onChange={onChange} />)
    fireEvent.click(screen.getByRole("button", { name: /26 Okt 2026/ }))
    fireEvent.click(screen.getByRole("button", { name: "Hapus" }))
    expect(onChange).toHaveBeenCalledWith("")
    rerender(<DatePicker value="2026-10-26" onChange={onChange} required />)
    fireEvent.click(screen.getByRole("button", { name: /26 Okt 2026/ }))
    expect(screen.queryByRole("button", { name: "Hapus" })).not.toBeInTheDocument()
  })
})
