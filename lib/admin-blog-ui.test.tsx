// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"
const state = vi.hoisted(() => ({ query: "", replace: vi.fn(), confirm: vi.fn(async () => true) }))
vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/blog", useSearchParams: () => new URLSearchParams(state.query),
  useRouter: () => ({ replace: state.replace }),
}))
vi.mock("@/components/Providers/ConfirmProvider", () => ({ useConfirm: () => ({ confirm: state.confirm }) }))
vi.mock("@/components/ui/airplane-loader", () => ({ default: () => null }))
import { AdminAccessContext } from "../components/admin/admin-access"
import { KATEGORI_BLOG, LabelEditDialog, LabelManagerDialog } from "../components/admin/label-manager"
import AdminBlogPage from "../app/admin/blog/page"

const category = { id: 1, nama: "Tips", namaEn: null, slug: "tips", _count: { posts: 2 } }
const post = { id: 1, title: "Draft Test", slug: "draft-test", thumbnail: "", status: "draft", publishedAt: null, createdAt: "2026-10-23", category }
const withAccess = (ui: React.ReactNode, permissions: string[]) =>
  <AdminAccessContext.Provider value={{ role: "custom", permissions }}>{ui}</AdminAccessContext.Provider>
beforeEach(() => {
  state.query = ""
  vi.stubGlobal("fetch", vi.fn(async (url: string) => Response.json(url.startsWith("/api/blog?") ? { posts: [post] } : [category])))
})
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks() })
it("daftar draft memakai URL preview dan menyembunyikan aksi tanpa izin", async () => {
  render(withAccess(<AdminBlogPage />, ["blog_view"]))
  expect(await screen.findByRole("link", { name: "Pratinjau Draft Test" })).toHaveAttribute("href", "/blog/draft-test?preview=true")
  expect(screen.queryByRole("link", { name: "Buat Artikel" })).not.toBeInTheDocument()
  expect(screen.queryByRole("link", { name: "Edit Draft Test" })).not.toBeInTheDocument()
  expect(screen.queryByRole("button", { name: "Hapus Draft Test" })).not.toBeInTheDocument()
})
it("pengelola kategori mengikuti perubahan query tanpa perlu mount ulang", async () => {
  const view = render(withAccess(<AdminBlogPage />, ["blog_view"]))
  await screen.findByText("Draft Test")
  state.query = "kelola=kategori"
  view.rerender(withAccess(<AdminBlogPage />, ["blog_view"]))
  expect(await screen.findByRole("dialog", { name: "Kelola Kategori" })).toBeInTheDocument()
  expect(screen.queryByRole("button", { name: "Tambah Kategori" })).not.toBeInTheDocument()
  expect(screen.queryByRole("button", { name: "Edit Tips" })).not.toBeInTheDocument()
})
it("kategori yang gagal dimuat menawarkan retry, bukan empty state palsu", async () => {
  vi.mocked(fetch).mockRejectedValueOnce(new Error("offline"))
  render(withAccess(<LabelManagerDialog kind={KATEGORI_BLOG} open onOpenChange={() => {}} />, ["blog_view"]))
  expect(await screen.findByRole("alert")).toHaveTextContent("Gagal memuat")
  expect(screen.queryByText("Belum ada kategori.")).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: "Coba lagi" }))
  expect(await screen.findByText("Tips")).toBeInTheDocument()
})
it("kategori yang masih digunakan tidak menawarkan penghapusan", async () => {
  render(withAccess(<LabelManagerDialog kind={KATEGORI_BLOG} open onOpenChange={() => {}} />, ["blog_delete"]))
  expect(await screen.findByRole("button", { name: "Hapus Tips" })).toBeDisabled()
})
it("form kategori memvalidasi nama dan mengirim nilai yang sudah dirapikan", async () => {
  const saved = vi.fn()
  const close = vi.fn()
  vi.mocked(fetch).mockResolvedValue(Response.json(category))
  render(withAccess(<LabelEditDialog kind={KATEGORI_BLOG} open onOpenChange={close} onSaved={saved} />, ["blog_create"]))
  fireEvent.click(screen.getByRole("button", { name: "Simpan" }))
  expect(screen.getByRole("alert")).toHaveTextContent("wajib diisi")
  expect(fetch).not.toHaveBeenCalled()
  fireEvent.change(screen.getByLabelText("Nama (Indonesia)"), { target: { value: "  Tips  " } })
  fireEvent.click(screen.getByRole("button", { name: "Simpan" }))
  await waitFor(() => expect(saved).toHaveBeenCalledWith(category))
  expect(fetch).toHaveBeenCalledWith("/api/blog/categories", expect.objectContaining({ method: "POST", body: JSON.stringify({ nama: "Tips", namaEn: null }) }))
})
