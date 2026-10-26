// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"
import PublicDatePicker from "../components/PublicDatePicker/PublicDatePicker"
import { addDays } from "./date-picker"

afterEach(() => { cleanup(); vi.useRealTimers() })

describe("PublicDatePicker (form booking)", () => {
  it("memilih tanggal dan menampilkannya dalam format Indonesia", () => {
    const onChange = vi.fn()
    render(<PublicDatePicker id="tgl" name="tanggal" value="" onChange={onChange} />)
    fireEvent.click(screen.getByRole("button", { name: /Pilih tanggal/ }))
    const first = screen.getAllByRole("gridcell").find((c) => !c.hasAttribute("disabled"))!
    fireEvent.click(first)
    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/))
    expect(screen.queryByRole("grid")).not.toBeInTheDocument()
  })

  it("disablePast menonaktifkan tanggal sebelum hari ini", () => {
    render(<PublicDatePicker id="tgl" name="tanggal" value="" onChange={() => {}} disablePast />)
    fireEvent.click(screen.getByRole("button", { name: /Pilih tanggal/ }))
    const today = new Date()
    const label = (d: Date) => new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(d)
    expect(screen.getByRole("gridcell", { name: label(today) })).not.toBeDisabled()
    // Kemarin hanya tampil bila masih di grid bulan ini (selalu benar kecuali tanggal 1 di awal grid).
    const yesterday = screen.queryByRole("gridcell", { name: label(addDays(today, -1)) })
    if (yesterday) expect(yesterday).toBeDisabled()
  })

  it("Escape menutup panel; required diteruskan ke input form", () => {
    const { container } = render(<PublicDatePicker id="tgl" name="tanggal" value="" onChange={() => {}} required />)
    expect(container.querySelector('input[name="tanggal"]')).toBeRequired()
    fireEvent.click(screen.getByRole("button", { name: /Pilih tanggal/ }))
    expect(screen.getByRole("grid")).toBeInTheDocument()
    fireEvent.keyDown(document, { key: "Escape" })
    expect(screen.queryByRole("grid")).not.toBeInTheDocument()
  })
})
