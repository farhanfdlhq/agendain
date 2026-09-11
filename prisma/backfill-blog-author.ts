/**
 * Isi `author` untuk artikel blog LAMA yang belum punya penulis (author null/kosong)
 * dengan nama akun super admin. Idempotent — hanya menyentuh yang kosong.
 *   npx tsx prisma/backfill-blog-author.ts
 */
import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
  const admin =
    (await p.adminUser.findFirst({ where: { role: "super_admin" }, select: { nama: true } })) ??
    (await p.adminUser.findFirst({ select: { nama: true } }));
  const nama = admin?.nama || "Tim Agendain";
  const res = await p.blogPost.updateMany({
    where: { OR: [{ author: null }, { author: "" }] },
    data: { author: nama },
  });
  console.log(`Backfill author -> "${nama}" pada ${res.count} artikel tanpa penulis`);
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => p.$disconnect());
