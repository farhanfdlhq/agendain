import { describe, expect, it } from "vitest"
import { LOGIN_ERRORS, loginErrorMessage } from "./auth-messages"

describe("loginErrorMessage", () => {
  it("meneruskan pesan login yang dikenal", () => {
    for (const msg of Object.values(LOGIN_ERRORS)) expect(loginErrorMessage(msg)).toBe(msg)
  })

  it("menyembunyikan error mentah (mis. Prisma berisi path server)", () => {
    const raw = "Invalid `prisma.adminUser.findUnique()` invocation in C:\\app\\.next\\server\\chunk.js Can't reach database server at `localhost:3306`"
    expect(loginErrorMessage(raw)).toBe("Terjadi kesalahan. Silakan coba lagi.")
    expect(loginErrorMessage(undefined)).toBe("Terjadi kesalahan. Silakan coba lagi.")
  })
})
