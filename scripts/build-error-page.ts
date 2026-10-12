/**
 * Tanam logo (`site_logo`) & favicon (`site_favicon`) dari Pengaturan ke
 * public/error-page.html — halaman yang disajikan nginx saat aplikasi mati.
 * Dijalankan oleh scripts/deploy.sh setelah build:
 *
 *   npx tsx scripts/build-error-page.ts
 *
 * Hanya MEMBACA DB. Gagal membaca DB/file → halaman tetap memakai logo bawaan
 * di repo (tidak menggagalkan deploy). deploy.sh me-reset file ini dari git
 * sebelum `git pull` agar pull tidak bentrok.
 */
import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { PrismaClient } from "@prisma/client"
import { MAX_BRAND_BYTES, injectBrand, mimeFromPath, publicRelativePath, toDataUri } from "../lib/error-page-brand"

const PUBLIC_DIR = path.join(process.cwd(), "public")
const PAGE = path.join(PUBLIC_DIR, "error-page.html")

async function asDataUri(setting: unknown, label: string): Promise<string | undefined> {
  const rel = publicRelativePath(setting)
  const mime = rel ? mimeFromPath(rel) : null
  if (!rel || !mime) {
    console.log(`   ${label}: dilewati (bukan file lokal yang dikenali: ${String(setting || "-")})`)
    return undefined
  }
  try {
    const bytes = await readFile(path.join(PUBLIC_DIR, rel))
    if (bytes.byteLength > MAX_BRAND_BYTES) {
      console.log(`   ${label}: dilewati (${Math.round(bytes.byteLength / 1024)} KB > ${MAX_BRAND_BYTES / 1024} KB)`)
      return undefined
    }
    console.log(`   ${label}: /${rel}`)
    return toDataUri(bytes, mime)
  } catch {
    console.log(`   ${label}: dilewati (file tidak ada: /${rel})`)
    return undefined
  }
}

async function main() {
  const prisma = new PrismaClient()
  try {
    const rows = await prisma.setting.findMany({ where: { key: { in: ["site_logo", "site_favicon"] } } })
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]))
    const logo = await asDataUri(map.site_logo, "logo")
    const favicon = await asDataUri(map.site_favicon, "favicon")
    const html = await readFile(PAGE, "utf8")
    await writeFile(PAGE, injectBrand(html, { logo, favicon }))
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.warn("   halaman error tetap memakai logo bawaan:", err instanceof Error ? err.message : err)
})
