import { describe, expect, it } from "vitest"
import { PasswordSchema } from "./security"
import { isPasswordValid } from "../components/PasswordValidator/PasswordValidator"

// Checklist di form admin dan PasswordSchema di server harus sepakat: dulu layar
// menulis minimal 8 karakter sementara server menolak di bawah 12, sehingga
// semua centang hijau tetapi simpan gagal dengan "Validasi gagal". Kini
// keduanya minimal 8, dan simbol apa pun (termasuk titik) diterima.
describe("aturan password layar = server", () => {
  it.each([
    "Abc12#x",              // 7 karakter: terlalu pendek
    "Abcdef1.",             // 8 karakter dengan titik sebagai simbol
    "Abcdefgh123#",         // 12 karakter, lengkap
    "abcdefgh123#",         // tanpa huruf besar
    "ABCDEFGH123#",         // tanpa huruf kecil
    "Abcdefghijk#",         // tanpa angka
    "Abcdefgh1234",         // tanpa simbol
    "Abcdefgh123.",         // simbol di luar ! @ # $ % ^ & *
    "Abcdefgh 123",         // spasi dihitung simbol oleh server
  ])("%s", (password) => {
    if (password === "Abcdef1.") expect(PasswordSchema.safeParse(password).success).toBe(true)
    if (password === "Abc12#x") expect(PasswordSchema.safeParse(password).success).toBe(false)
    expect(isPasswordValid(password)).toBe(PasswordSchema.safeParse(password).success)
  })
})
