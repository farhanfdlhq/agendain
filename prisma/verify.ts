import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const pakets = await prisma.paket.findMany()
  console.log(`Berhasil menemukan ${pakets.length} paket di database:`)
  pakets.forEach((p, index) => {
    console.log(`${index + 1}. ${p.nama} (Rp ${p.harga.toString()})`)
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
