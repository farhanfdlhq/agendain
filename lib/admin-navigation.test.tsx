// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

const state = vi.hoisted(() => ({
  path: "/admin", permissions: ["all"], fail: false,
  session: { user: { id: "7", name: "Audit User", role: "super_admin" } },
  router: { replace: vi.fn() },
}))
vi.mock("next-auth/react", () => ({ useSession: () => ({ data: state.session, status: "authenticated" }), signOut: vi.fn() }))
vi.mock("next/navigation", () => ({ usePathname: () => state.path, useRouter: () => state.router }))
vi.mock("@/components/ui/airplane-loader", () => ({ default: () => null }))

import AdminLayout from "../app/admin/layout"

beforeEach(() => {
  state.path = "/admin"
  state.permissions = ["all"]
  state.fail = false
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    if (url === "/api/settings") return Response.json({ site_name: "Agendain" })
    return state.fail ? new Response(null, { status: 503 }) : Response.json({ role: "custom", roleName: "Custom", permissions: state.permissions })
  }))
})
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks() })
async function setup() {
  render(<AdminLayout><p>Halaman yang dilindungi</p></AdminLayout>)
  await screen.findByRole("complementary", { name: "Sidebar admin" })
}
it("semua menu berizin tetap terjangkau saat sidebar diciutkan", async () => {
  await setup()
  expect(screen.queryByRole("link", { name: "Invoice" })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: "Ciutkan sidebar" }))
  expect(screen.getByRole("link", { name: "Invoice" })).toHaveAttribute("href", "/admin/invoice")
  expect(screen.getByRole("link", { name: "Pengaturan Sistem" })).toHaveAttribute("href", "/admin/settings")
  expect(screen.getByRole("link", { name: "Artikel Blog" })).toHaveAttribute("href", "/admin/blog")
})
it("grup menggunakan tombol dan tidak kehilangan fokus setelah dibuka", async () => {
  await setup()
  const button = screen.getByRole("button", { name: "DOKUMEN" })
  button.focus()
  fireEvent.click(button)
  expect(button).toHaveAttribute("aria-expanded", "true")
  expect(button).toHaveFocus()
  expect(screen.getByRole("link", { name: "Invoice" })).toBeInTheDocument()
})
it("tautan grup mengarah ke halaman pertama yang diizinkan", async () => {
  state.path = "/admin/settings/roles"
  state.permissions = ["roles_manage"]
  await setup()
  expect(screen.getByRole("link", { name: "Pengguna & Akses" })).toHaveAttribute("href", "/admin/settings/roles")
  expect(screen.queryByRole("link", { name: "Pengaturan Sistem" })).not.toBeInTheDocument()
  expect(screen.queryByRole("navigation", { name: "Pengguna & Akses" })).not.toBeInTheDocument()
})
it("kedua tautan bagian tampil saat kedua izin pesanan tersedia", async () => {
  state.path = "/admin/booking"
  state.permissions = ["booking_view", "inquiry_view"]
  await setup()
  const nav = screen.getByRole("navigation", { name: "Pesanan" })
  expect(within(nav).getByRole("link", { name: "Booking Open Trip" })).toHaveAttribute("aria-current", "page")
  expect(within(nav).getByRole("link", { name: "Permintaan Private Trip" })).toHaveAttribute("href", "/admin/inquiries")
})
it.each(["/admin/blog/baru", "/admin/blog/contoh/edit"])("izin baca tidak membuka form tulis %s", async path => {
  state.path = path
  state.permissions = ["blog_view"]
  await setup()
  expect(screen.getByText("Akses ditolak")).toBeInTheDocument()
  expect(screen.queryByText("Halaman yang dilindungi")).not.toBeInTheDocument()
})
it("gagal memuat izin tidak memakai role Super Admin dari sesi dan dapat dicoba lagi", async () => {
  state.fail = true
  render(<AdminLayout><p>Halaman yang dilindungi</p></AdminLayout>)
  expect(await screen.findByRole("alert")).toHaveTextContent("Hak akses belum bisa dimuat")
  expect(screen.queryByText("Halaman yang dilindungi")).not.toBeInTheDocument()
  state.fail = false
  fireEvent.click(screen.getByRole("button", { name: "Coba lagi" }))
  expect(await screen.findByText("Halaman yang dilindungi")).toBeInTheDocument()
})
it("drawer HP menutup ketika menu halaman aktif dipilih", async () => {
  await setup()
  fireEvent.click(screen.getByRole("button", { name: "Buka Menu" }))
  const dialog = await screen.findByRole("dialog")
  fireEvent.click(within(dialog).getByRole("link", { name: "Ringkasan" }))
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
})
