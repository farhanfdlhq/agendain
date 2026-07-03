import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.$executeRaw`DELETE FROM Setting WHERE \`key\` = 'roles_config'`
  console.log("Roles config cleared")
}

main().catch(console.error).finally(() => prisma.$disconnect())
