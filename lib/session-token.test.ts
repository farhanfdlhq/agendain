import { beforeEach, describe, expect, it, vi } from "vitest";
import { encode } from "next-auth/jwt";

const db = vi.hoisted(() => ({ findUnique: vi.fn() }));
vi.mock("./prisma", () => ({ prisma: { adminUser: db } }));
vi.mock("@/lib/audit", () => ({ logAudit: vi.fn() }));

import { decodeSessionToken, passwordVersion } from "./session-token";
import { authOptions } from "./auth";

const secret = "synthetic-test-secret-never-used-in-production";
const user = { password: "synthetic-bcrypt-hash", email: "new@example.invalid", nama: "New name", role: "editor", avatar: null };
const issue = (version?: string) => encode({
  secret, token: { id: "7", role: "admin", email: "old@example.invalid", passwordVersion: version },
});

beforeEach(() => {
  db.findUnique.mockReset().mockResolvedValue(user);
});

describe("pencabutan sesi password", () => {
  it("decoder terpasang di NextAuth dan memperbarui identitas dari DB", async () => {
    const token = await issue(passwordVersion(user.password));
    expect(await authOptions.jwt!.decode!({ token, secret })).toMatchObject({
      id: "7", email: user.email, name: user.nama, role: user.role,
    });
  });

  it("JWT yang sama ditolak setelah hash password berubah", async () => {
    const token = await issue(passwordVersion(user.password));
    expect(await decodeSessionToken({ token, secret })).not.toBeNull();
    db.findUnique.mockResolvedValue({ ...user, password: "replacement-bcrypt-hash" });
    expect(await decodeSessionToken({ token, secret })).toBeNull();
  });

  it("akun terhapus dan token sebelum perbaikan harus login ulang", async () => {
    expect(await decodeSessionToken({ token: await issue(), secret })).toBeNull();
    db.findUnique.mockResolvedValue(null);
    expect(await decodeSessionToken({ token: await issue(passwordVersion(user.password)), secret })).toBeNull();
  });

  it("kegagalan DB tidak meloloskan token", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    db.findUnique.mockRejectedValue(new Error("DB unavailable"));
    expect(await decodeSessionToken({ token: await issue(passwordVersion(user.password)), secret })).toBeNull();
    log.mockRestore();
  });

  it("update sesi dari browser tidak boleh mengganti penanda password", async () => {
    const token = { id: "7", role: "editor", passwordVersion: "server-issued" };
    const result = await authOptions.callbacks!.jwt!({
      token, trigger: "update", session: { passwordVersion: "forged" },
    } as never);
    expect(result.passwordVersion).toBe("server-issued");
  });
});
