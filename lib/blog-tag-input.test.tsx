// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }))
vi.mock("@/components/Providers/ConfirmProvider", () => ({ useConfirm: () => ({ confirm: vi.fn(async () => true) }) }))
vi.mock("@/components/ui/airplane-loader", () => ({ default: () => null }))
vi.mock("@/components/ui/tiptap-editor", () => ({ TiptapEditor: () => null }))
vi.mock("@/components/ui/media-picker", () => ({ MediaPicker: () => null }))

import BlogEditorForm from "../app/admin/blog/BlogEditorForm"

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(async () => Response.json([])))
})
afterEach(() => { cleanup(); vi.unstubAllGlobals() })

// Dulu "+ Tambah" hanya <span> hiasan (pointer-events-none) — diklik tak terjadi apa-apa.
it("tombol + Tambah menambahkan tag dan nonaktif saat kolom kosong", () => {
  render(<BlogEditorForm mode="create" />)
  const input = screen.getByPlaceholderText("Ketik tag...")
  const tambah = screen.getByRole("button", { name: "+ Tambah" })
  expect(tambah).toBeDisabled()

  fireEvent.change(input, { target: { value: "  Roma " } })
  expect(tambah).toBeEnabled()
  fireEvent.click(tambah)

  expect(screen.getByRole("button", { name: "Hapus tag roma" })).toBeInTheDocument()
  expect(input).toHaveValue("")
  expect(tambah).toBeDisabled()
})
