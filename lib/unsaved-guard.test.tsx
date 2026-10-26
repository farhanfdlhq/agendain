// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render } from "@testing-library/react"
const state = vi.hoisted(() => ({ confirm: vi.fn(async () => false) }))
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock("@/components/Providers/ConfirmProvider", () => ({ useConfirm: () => ({ confirm: state.confirm }) }))
import { useUnsavedGuard } from "../hooks/use-unsaved-guard"

function Form({ dirty }: { dirty: boolean }) {
  useUnsavedGuard(dirty)
  return <input aria-label="isian" />
}
afterEach(() => { cleanup(); vi.clearAllMocks() })

it.each([
  ["F5", { key: "F5" }],
  ["Ctrl+R", { key: "r", ctrlKey: true }],
  ["Ctrl+Shift+R", { key: "R", ctrlKey: true, shiftKey: true }],
  ["Cmd+R", { key: "r", metaKey: true }],
])("refresh lewat %s ditahan dan memakai dialog in-app saat ada perubahan", (_, keys) => {
  render(<Form dirty />)
  const allowed = fireEvent.keyDown(window, keys)
  expect(allowed).toBe(false)
  expect(state.confirm).toHaveBeenCalledWith(expect.objectContaining({ title: "Perubahan belum disimpan" }))
})

it("tanpa perubahan atau tombol lain, refresh dan ketikan tidak dicegat", () => {
  render(<Form dirty={false} />)
  expect(fireEvent.keyDown(window, { key: "F5" })).toBe(true)
  cleanup()
  render(<Form dirty />)
  expect(fireEvent.keyDown(window, { key: "r" })).toBe(true)
  expect(fireEvent.keyDown(window, { key: "c", ctrlKey: true })).toBe(true)
  expect(state.confirm).not.toHaveBeenCalled()
})
