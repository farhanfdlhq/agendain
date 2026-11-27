import { beforeEach, describe, expect, it, vi } from "vitest";

const { db, compare } = vi.hoisted(() => ({
  db: { adminUser: { findUnique: vi.fn() } },
  compare: vi.fn(),
}));
vi.mock("./prisma", () => ({ prisma: db }));
vi.mock("./audit", () => ({ logAudit: vi.fn() }));
vi.mock("next/headers", () => ({ headers: async () => new Headers({ "x-forwarded-for": "192.0.2.50" }) }));
vi.mock("bcryptjs", () => ({ default: { compare }, compare }));

import { authOptions } from "./auth";
import { LOGIN_ERRORS } from "./auth-messages";

type Authorize = (c: Record<string, string>) => Promise<unknown>;
const authorize = (authOptions.providers[0] as unknown as { options: { authorize: Authorize } }).options.authorize;

describe("login: waktu respons tidak membocorkan email terdaftar", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    compare.mockResolvedValue(false);
  });

  it("email tidak terdaftar tetap menjalankan bcrypt dan memberi pesan yang sama", async () => {
    db.adminUser.findUnique.mockResolvedValue(null);
    await expect(authorize({ email: "tidak-ada@example.invalid", password: "x" })).rejects.toThrow(LOGIN_ERRORS.invalid);
    expect(compare).toHaveBeenCalledTimes(1);
  });

  it("email terdaftar dengan password salah: bcrypt sekali, pesan sama", async () => {
    db.adminUser.findUnique.mockResolvedValue({ id: 3, email: "ada@example.invalid", password: "$2b$10$synthetic", role: "admin" });
    await expect(authorize({ email: "ada@example.invalid", password: "x" })).rejects.toThrow(LOGIN_ERRORS.invalid);
    expect(compare).toHaveBeenCalledTimes(1);
  });
});
