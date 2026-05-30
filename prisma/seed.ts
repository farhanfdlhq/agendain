import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@agendain.com' },
    update: {},
    create: {
      email: 'admin@agendain.com',
      nama: 'Super Admin',
      password: hashedPassword,
    },
  })
  
  console.log({ admin })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
