import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { db, tx, state } = vi.hoisted(() => {
  const methods = () => ({
    setting: { findUnique: vi.fn(), upsert: vi.fn() },
    adminUser: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    openTrip: { findUnique: vi.fn(), findMany: vi.fn() },
    booking: { findUnique: vi.fn(), aggregate: vi.fn(), create: vi.fn(), update: vi.fn() },
    privateTripPackage: { deleteMany: vi.fn(), createMany: vi.fn() },
    $queryRaw: vi.fn(),
    $transaction: vi.fn(),
  });
  return { db: methods(), tx: methods(), state: { session: null as null | { user: { id: string; email: string; role: string } } } };
});
vi.mock("./prisma", () => ({ prisma: db }));
vi.mock("./auth", () => ({ authOptions: {} }));
vi.mock("next-auth/next", () => ({ getServerSession: async () => state.session }));
vi.mock("./audit", () => ({ logAudit: vi.fn() }));
vi.mock("./error-log", () => ({
  reportAuthDenied: vi.fn(), reportServerError: vi.fn(), markReported: vi.fn(), logErrorEvent: vi.fn(),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));

import { invalidateRolesCache } from "./rbac";
import { POST as createUser } from "../app/api/admin/users/route";
import { PUT as updateUser, DELETE as deleteUser } from "../app/api/admin/users/[id]/route";
import { POST as createBooking } from "../app/api/booking/route";
import { PATCH as updateBooking } from "../app/api/booking/[id]/route";
import { POST as savePrivateTrip } from "../app/api/settings/private-trip/route";
import { GET as getTrip } from "../app/api/open-trip/[slug]/route";
import { GET as listTrips } from "../app/api/open-trip/route";

const roles = [
  { id: "super_admin", name: "Super Admin", permissions: ["all"] },
  { id: "manager", name: "Manager", permissions: ["users_manage", "booking_edit", "cms_manage", "profile_manage", "rbac_settings_v2"] },
  { id: "viewer", name: "Viewer", permissions: ["profile_manage", "rbac_settings_v2"] },
  { id: "trip_editor", name: "Trip Editor", permissions: ["paket_view", "paket_edit", "rbac_settings_v2"] },
  { id: "all_custom", name: "All Custom", permissions: ["all"] },
];
const trip = { id: 9, slug: "test-trip", harga: 100, status: "published", tanggalKeberangkatan: new Date("2099-12-20"), kuota: 5, kursiTerisi: 0, destinasi: { nama: "Test" } };
const bookingInput = { nama: "Audit Test", email: "audit@example.invalid", noWa: "081234567890", openTripId: 9, tanggal: "2099-12-20", jumlahPax: 2 };
let requestNumber = 0;
function request(body: unknown, method = "POST") {
  return new Request("http://localhost/api/test", {
    method, headers: { host: "localhost", origin: "http://localhost", "x-forwarded-for": `192.0.2.${++requestNumber}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}
const context = (id = "7") => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  vi.resetAllMocks();
  invalidateRolesCache();
  state.session = { user: { id: "7", email: "audit@example.invalid", role: "manager" } };
  db.setting.findUnique.mockResolvedValue({ value: JSON.stringify(roles) });
  db.adminUser.findUnique.mockImplementation(async ({ where }) => where.id ? ({
    id: where.id, role: where.id === 1 ? "super_admin" : "manager",
  }) : null);
  db.adminUser.create.mockImplementation(async ({ data }) => ({ id: 8, ...data }));
  db.adminUser.update.mockImplementation(async ({ data }) => ({ id: 7, ...data }));
  db.$transaction.mockImplementation(async fn => fn(tx));
  tx.$queryRaw.mockResolvedValue([{ id: 9 }]);
  tx.openTrip.findUnique.mockResolvedValue({ ...trip });
  db.openTrip.findUnique.mockResolvedValue({ ...trip });
  db.openTrip.findMany.mockResolvedValue([]);
  tx.booking.aggregate.mockResolvedValue({ _sum: { jumlahPax: 0 } });
  tx.booking.create.mockImplementation(async ({ data }) => ({ id: 1, ...data }));
  tx.booking.findUnique.mockResolvedValue({ id: 7, openTripId: 9, status: "pending", jumlahPax: 2, openTrip: trip });
  tx.booking.update.mockImplementation(async ({ data }) => ({ id: 7, ...data }));
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe("batas kelola pengguna", () => {
  it.each(["super_admin", "all_custom", "trip_editor"])("tidak dapat memberikan role lebih kuat: %s", async role => {
    const body = { nama: "Audit User", email: "audit@example.invalid", password: "Synthetic-Password1!", role };
    expect((await createUser(request(body))).status).toBe(403);
    expect((await updateUser(request(body, "PUT"), context())).status).toBe(403);
    expect(db.adminUser.create).not.toHaveBeenCalled();
    expect(db.adminUser.update).not.toHaveBeenCalled();
  });
  it("tidak dapat mereset password Super Admin atau menghapus user lebih kuat", async () => {
    expect((await updateUser(request({ nama: "Admin", email: "admin@example.invalid", role: "super_admin", password: "Synthetic-Password1!" }, "PUT"), context("1"))).status).toBe(403);
    db.adminUser.findUnique.mockImplementation(async ({ where }) => ({ id: where.id, role: where.id === 8 ? "trip_editor" : "manager" }));
    expect((await deleteUser(request({}, "DELETE"), context("8"))).status).toBe(403);
    expect(db.adminUser.delete).not.toHaveBeenCalled();
  });
  it("masih boleh mengelola role yang lebih terbatas", async () => {
    expect((await createUser(request({ nama: "Viewer", email: "viewer@example.invalid", role: "viewer", password: "Synthetic-Password1!" }))).status).toBe(201);
  });
  it("Super Admin tetap boleh memberikan semua role terdaftar", async () => {
    state.session!.user.id = "1";
    expect((await createUser(request({ nama: "Admin", email: "new@example.invalid", role: "super_admin", password: "Synthetic-Password1!" }))).status).toBe(201);
  });
  it("Super Admin dapat memperbaiki akun dengan role yang sudah tidak terdaftar", async () => {
    state.session!.user.id = "1";
    db.adminUser.findUnique.mockImplementation(async ({ where }) => where.id ? ({
      id: where.id, role: where.id === 1 ? "super_admin" : "removed_role",
    }) : null);
    expect((await updateUser(request({ nama: "Viewer", email: "viewer@example.invalid", role: "viewer" }, "PUT"), context("8"))).status).toBe(200);
  });
  it.each(["", "NaN", "-1", "1.5"])("identitas sesi rusak ditolak: %s", async id => {
    state.session!.user.id = id;
    state.session!.user.role = "super_admin";
    expect((await createUser(request({}))).status).toBe(401);
  });
  it("DB gagal tidak memakai role JWT sebagai fallback izin", async () => {
    db.adminUser.findUnique.mockRejectedValue(new Error("DB unavailable"));
    expect((await createUser(request({}))).status).toBe(401);
  });
});

describe("booking diperiksa server", () => {
  it.each([
    ["draft", { status: "draft" }, {}, 404],
    ["archived", { status: "archived" }, {}, 404],
    ["penuh", { kursiTerisi: 5 }, {}, 409],
    ["lewat", { tanggalKeberangkatan: new Date("2000-01-01") }, {}, 409],
    ["tanggal berbeda", {}, { tanggal: "2099-12-21" }, 400],
    ["tanggal rusak", {}, { tanggal: "2026-02-30" }, 400],
  ])("menolak %s tanpa membuat booking", async (_, changes, payload, status) => {
    tx.openTrip.findUnique.mockResolvedValue({ ...trip, ...changes });
    expect((await createBooking(request({ ...bookingInput, ...payload }))).status).toBe(status);
    expect(tx.booking.create).not.toHaveBeenCalled();
  });
  it("menghitung kursi Lunas dan menghitung harga di server", async () => {
    tx.booking.aggregate.mockResolvedValue({ _sum: { jumlahPax: 4 } });
    expect((await createBooking(request(bookingInput))).status).toBe(409);
    const response = await createBooking(request({ ...bookingInput, jumlahPax: 1, total: 1 }));
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({ total: 100, status: "pending" });
    expect(tx.$queryRaw.mock.calls[0][0].join("")).toContain("FOR UPDATE");
    expect(db.booking.create).not.toHaveBeenCalled();
  });
  it("Lunas berhasil; perubahan ulang Lunas idempoten", async () => {
    expect((await updateBooking(request({ status: "paid" }, "PATCH"), context())).status).toBe(200);
    tx.booking.findUnique.mockResolvedValue({ id: 7, openTripId: 9, status: "paid", jumlahPax: 2, openTrip: { ...trip, kursiTerisi: 5 } });
    expect((await updateBooking(request({ status: "paid" }, "PATCH"), context())).status).toBe(200);
  });
  it("konfirmasi Lunas tidak boleh melebihi kuota", async () => {
    tx.booking.aggregate.mockResolvedValue({ _sum: { jumlahPax: 4 } });
    expect((await updateBooking(request({ status: "paid" }, "PATCH"), context())).status).toBe(409);
    expect(tx.booking.update).not.toHaveBeenCalled();
  });
});

describe("CMS Private Trip atomik", () => {
  it.each([{ packages: [null] }, { packages: [{ title: 12 }] }, { packages: [{ features: [{}] }] }, { packages: "invalid" }])("menolak paket rusak sebelum menulis data: %j", async ({ packages }) => {
    expect((await savePrivateTrip(request({ heroTitle: "Title", packages }))).status).toBe(400);
    expect(db.$transaction).not.toHaveBeenCalled();
    expect(tx.privateTripPackage.deleteMany).not.toHaveBeenCalled();
  });
  it("kegagalan insert membatalkan perubahan setting dan penghapusan paket", async () => {
    let committed = { title: "Old", packages: ["Old package"] };
    db.$transaction.mockImplementation(async fn => {
      const pending = structuredClone(committed);
      tx.setting.upsert.mockImplementation(async () => { pending.title = "New"; });
      tx.privateTripPackage.deleteMany.mockImplementation(async () => { pending.packages = []; });
      tx.privateTripPackage.createMany.mockRejectedValue(new Error("Insert failed"));
      const result = await fn(tx);
      committed = pending;
      return result;
    });
    expect((await savePrivateTrip(request({ heroTitle: "New", packages: [{ title: "New package" }] }))).status).toBe(500);
    expect(committed).toEqual({ title: "Old", packages: ["Old package"] });
    expect(tx.privateTripPackage.createMany).toHaveBeenCalled();
    expect(db.setting.upsert).not.toHaveBeenCalled();
    expect(db.privateTripPackage.deleteMany).not.toHaveBeenCalled();
  });
  it("merapikan fitur, mengizinkan hapus semua secara sengaja, dan menjaga paket bila field tidak dikirim", async () => {
    expect((await savePrivateTrip(request({ packages: [{ title: "Trip", chips: ["[Plane] Flight"], features: ["  Hotel ", "", " Guide "] }] }))).status).toBe(200);
    expect(tx.privateTripPackage.createMany).toHaveBeenCalledWith({ data: [expect.objectContaining({ features: ["Hotel", "Guide"] })] });
    vi.clearAllMocks();
    expect((await savePrivateTrip(request({ packages: [] }))).status).toBe(200);
    expect(tx.privateTripPackage.deleteMany).toHaveBeenCalledTimes(1);
    vi.clearAllMocks();
    expect((await savePrivateTrip(request({ heroTitle: "Only setting" }))).status).toBe(200);
    expect(tx.privateTripPackage.deleteMany).not.toHaveBeenCalled();
  });
});

describe("draft paket hanya untuk pratinjau berizin", () => {
  const url = new Request("http://localhost/api/open-trip/draft");
  const ctx = () => ({ params: Promise.resolve({ slug: "draft" }) });
  it.each([null, "manager"])("anonim/role tanpa izin tidak bisa membaca draft (%s)", async role => {
    if (!role) state.session = null;
    db.openTrip.findUnique.mockResolvedValue({ ...trip, status: "draft" });
    expect((await getTrip(url, ctx())).status).toBe(404);
    await listTrips(new Request("http://localhost/api/open-trip"));
    expect(db.openTrip.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { status: { in: ["published", "publish"] } },
    }));
  });
  it("editor paket dapat melihat draft; respons tidak boleh masuk cache publik", async () => {
    db.adminUser.findUnique.mockResolvedValue({ id: 7, role: "trip_editor" });
    db.openTrip.findUnique.mockResolvedValue({ ...trip, status: "draft" });
    const response = await getTrip(url, ctx());
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
  it.each(["published", "publish"])("paket %s tetap dapat dibaca publik", async status => {
    state.session = null;
    db.openTrip.findUnique.mockResolvedValue({ ...trip, status });
    expect((await getTrip(url, ctx())).status).toBe(200);
  });
});
