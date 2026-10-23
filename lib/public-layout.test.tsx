import { expect, it, vi } from "vitest";
import { isValidElement, type ReactNode } from "react";

const rows = vi.hoisted(() => [
  { key: "site_name", value: "Agendain" },
  { key: "site_logo", value: "/uploads/logo.webp" },
  { key: "logo_height", value: "50" },
  { key: "whatsapp_number", value: "6281234" },
  { key: "footer_settings", value: '{"tagline":"Published footer"}' },
  { key: "invoice_settings", value: '{"signature":"SYNTHETIC"}' },
  { key: "roles_config", value: "[]" },
  { key: "private_api_token", value: "SYNTHETIC" },
  { key: "unrecognized_future_setting", value: "SYNTHETIC" },
]);
vi.mock("./prisma", () => ({ prisma: { setting: { findMany: async () => rows } } }));
vi.mock("next/cache", () => ({ unstable_cache: (fn: unknown) => fn }));
vi.mock("next/font/google", () => Object.fromEntries(
  ["Montserrat", "Inter", "Outfit", "Poppins", "Playfair_Display", "Plus_Jakarta_Sans", "Roboto", "DM_Sans", "Lora", "Cabin", "Gasoek_One"]
    .map(name => [name, () => ({ variable: name })]),
));
vi.mock("next/font/local", () => ({ default: () => ({ variable: "local-font" }) }));
vi.mock("@/lib/i18n/server", () => ({ getServerLocale: async () => "id" }));
vi.mock("@/components/FrontLayout/FrontLayout", () => ({ default: "public-layout-boundary" }));
vi.mock("@/components/Providers/Providers", () => ({ Providers: "providers" }));
vi.mock("@/components/ui/offline-detector", () => ({ default: "offline-detector" }));

import RootLayout from "../app/layout";

function settingsAtBoundary(node: ReactNode): Record<string, string> | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = settingsAtBoundary(child);
      if (found) return found;
    }
  } else if (isValidElement<{ settings?: Record<string, string>; children?: ReactNode }>(node)) {
    if (node.props.settings) return node.props.settings;
    return settingsAtBoundary(node.props.children);
  }
}

it("RootLayout hanya menserialisasi identitas publik dan footer CMS ke Client Component", async () => {
  const settings = settingsAtBoundary(await RootLayout({ children: null }));
  expect(settings).toEqual(Object.fromEntries(rows.slice(0, 5).map(r => [r.key, r.value])));
});
