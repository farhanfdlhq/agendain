import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Dialog bawaan browser memblokir thread, tidak bisa ditema, dan tampil
    // beda di tiap OS. Seluruh pemakaiannya sudah dipindah ke ConfirmProvider
    // (confirm/prompt) dan react-hot-toast (pesan); aturan ini yang menjaga
    // agar tidak pelan-pelan kembali lagi lewat fitur baru.
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-globals": [
        "error",
        { name: "alert", message: "Pakai toast dari react-hot-toast." },
        { name: "confirm", message: "Pakai useConfirm().confirm() dari components/Providers/ConfirmProvider." },
        { name: "prompt", message: "Pakai useConfirm().prompt() dari components/Providers/ConfirmProvider." },
      ],
      "no-restricted-properties": [
        "error",
        { object: "window", property: "alert", message: "Pakai toast dari react-hot-toast." },
        { object: "window", property: "confirm", message: "Pakai useConfirm().confirm() dari components/Providers/ConfirmProvider." },
        { object: "window", property: "prompt", message: "Pakai useConfirm().prompt() dari components/Providers/ConfirmProvider." },
      ],
    },
  },
  {
    // Panel admin & pemilih media menampilkan pratinjau URL gambar apa pun (unggahan,
    // tautan luar, SVG) di halaman yang tidak diindeks; ImageResponse (app/og) wajib
    // memakai <img>. Optimasi next/image tidak relevan di sini.
    files: ["app/admin/**/*.{ts,tsx}", "components/ui/media-picker*.tsx", "app/og/**/*.{ts,tsx}"],
    rules: { "@next/next/no-img-element": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".agents/**",
    ".superpowers/**",
    ".claude/**",
    ".worktrees/**",
  ]),
]);

export default eslintConfig;
