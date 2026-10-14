import { describe, expect, it } from "vitest"
import { visibleSettings } from "./settings-visibility"

const rows = [
  { key: "site_name", value: "Agendain" },
  { key: "whatsapp_number", value: "62811" },
  { key: "roles_config", value: "[]" },
  { key: "home_settings", value: "{}" },
  { key: "invoice_settings", value: "{}" },
  { key: "payment_info", value: "x" },
]

describe("visibleSettings", () => {
  it("publik hanya menerima allowlist (roles_config & CMS tertutup)", () => {
    expect(Object.keys(visibleSettings(rows, { authenticated: false, canSeeSensitive: false }))).toEqual([
      "site_name",
      "whatsapp_number",
    ])
  })

  it("admin tanpa settings_manage: semua kecuali key sensitif", () => {
    expect(Object.keys(visibleSettings(rows, { authenticated: true, canSeeSensitive: false }))).toEqual([
      "site_name",
      "whatsapp_number",
      "roles_config",
      "home_settings",
    ])
  })

  it("settings_manage: semua key", () => {
    expect(Object.keys(visibleSettings(rows, { authenticated: true, canSeeSensitive: true }))).toHaveLength(rows.length)
  })
})
