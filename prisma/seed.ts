import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Destinasi & Paket Wisata...')

  // Seed Super Admin
  const hashedPassword = await bcrypt.hash('password', 10)
  await prisma.adminUser.upsert({
    where: { email: 'admin@agendain.com' },
    update: {
      password: hashedPassword,
      role: 'super_admin'
    },
    create: {
      email: 'admin@agendain.com',
      password: hashedPassword,
      nama: 'Super Admin',
      role: 'super_admin'
    }
  })
  console.log('Super Admin user created: admin@agendain.com')

  // Default Settings
  await prisma.setting.upsert({
    where: { key: 'contact_whatsapp' },
    update: {},
    create: { key: 'contact_whatsapp', value: '+62 819-9526-4565' }
  })
  
  await prisma.setting.upsert({
    where: { key: 'site_logo' },
    update: {},
    create: { key: 'site_logo', value: '/uploads/Logo ( White Version ).png' }
  })
  console.log('Default settings created.')

  const destinasiEropaBarat = await prisma.destinasi.upsert({
    where: { slug: 'eropa-barat' },
    update: {},
    create: {
      nama: 'Eropa Barat',
      slug: 'eropa-barat',
      negara: 'Prancis, Swiss, Italia',
      deskripsi: 'Kumpulan negara eksotis di Eropa Barat.',
      foto: '/uploads/seed/paris.png',
    }
  })

  const destinasiSkandinavia = await prisma.destinasi.upsert({
    where: { slug: 'skandinavia' },
    update: {},
    create: {
      nama: 'Skandinavia',
      slug: 'skandinavia',
      negara: 'Norwegia, Swedia',
      deskripsi: 'Pesona salju dan fenomena alam di Eropa Utara.',
      foto: '/uploads/seed/swiss.png',
    }
  })

  const destinasiTurki = await prisma.destinasi.upsert({
    where: { slug: 'turki' },
    update: {},
    create: {
      nama: 'Turki',
      slug: 'turki',
      negara: 'Turki',
      deskripsi: 'Negara lintas benua dengan kekayaan sejarah peradaban Islam.',
      foto: '/uploads/seed/italy.png',
    }
  })

  const paketData = [
    {
      nama: 'Eksplorasi Eropa Barat (Prancis, Swiss, Italia)',
      slug: 'eksplorasi-eropa-barat',
      deskripsi: 'Perjalanan 10 hari melintasi 3 negara paling memukau di Eropa. Nikmati keindahan Menara Eiffel, pemandangan salju abadi di Mount Titlis Swiss, hingga sejarah panjang Colosseum di Roma.',
      harga: 28500000,
      durasi: 10,
      destinasiId: destinasiEropaBarat.id,
      foto: [{ thumb: '/uploads/seed/paris.png', medium: '/uploads/seed/paris.png', full: '/uploads/seed/paris.png' }],
      itinerary: [
        { hari: 1, judul: 'Keberangkatan Jakarta - Paris', deskripsi: 'Penerbangan dari Bandara Soekarno Hatta menuju CDG Paris.' },
        { hari: 2, judul: 'Paris City Tour', deskripsi: 'Mengunjungi Menara Eiffel, Louvre Museum, dan Arc de Triomphe.' },
        { hari: 3, judul: 'Perjalanan ke Swiss', deskripsi: 'Menggunakan kereta cepat menuju Lucerne, Swiss.' }
      ],
      fasilitas: ['Hotel Bintang 4', 'Bus Pariwisata VIP', 'Tour Leader Berbahasa Indonesia', 'Dokumentasi'],
      termasuk: ['Tiket Pesawat PP', 'Akomodasi 9 Malam', 'Sarapan', 'Tiket Masuk Wisata'],
      tidakTermasuk: ['Visa Schengen', 'Asuransi Perjalanan', 'Pengeluaran Pribadi'],
      status: 'publish',
      label: 'Best Seller'
    },
    {
      nama: 'Keajaiban Skandinavia & Aurora Borealis',
      slug: 'skandinavia-aurora',
      deskripsi: 'Rasakan pengalaman magis melihat langsung Northern Lights (Aurora Borealis) di Tromsø, Norwegia, serta menikmati keindahan kota Stockholm dan pesona desa-desa Nordik.',
      harga: 35000000,
      durasi: 8,
      destinasiId: destinasiSkandinavia.id,
      foto: [{ thumb: '/uploads/seed/swiss.png', medium: '/uploads/seed/swiss.png', full: '/uploads/seed/swiss.png' }],
      itinerary: [
        { hari: 1, judul: 'Jakarta - Oslo', deskripsi: 'Penerbangan menuju Oslo, Norwegia.' },
        { hari: 2, judul: 'Berburu Aurora', deskripsi: 'Perjalanan malam hari menuju spot Aurora terbaik di Tromsø.' }
      ],
      fasilitas: ['Hotel Bintang 4', 'Transportasi Musim Dingin', 'Peralatan Musim Dingin'],
      termasuk: ['Tiket Pesawat PP', 'Akomodasi', 'Sarapan & Makan Malam'],
      tidakTermasuk: ['Visa Schengen', 'Tipping Guide'],
      status: 'publish',
      label: 'Limited Seat'
    },
    {
      nama: 'Halal Tour Turki & Sensasi Balon Udara',
      slug: 'halal-tour-turki-cappadocia',
      deskripsi: 'Jelajahi jejak sejarah peradaban Islam di Istanbul, kunjungi Blue Mosque, hingga menikmati pengalaman tak terlupakan terbang dengan Balon Udara di atas lembah eksotis Cappadocia.',
      harga: 18900000,
      durasi: 7,
      destinasiId: destinasiTurki.id,
      foto: [{ thumb: '/uploads/seed/italy.png', medium: '/uploads/seed/italy.png', full: '/uploads/seed/italy.png' }],
      itinerary: [
        { hari: 1, judul: 'Jakarta - Istanbul', deskripsi: 'Penerbangan menuju Istanbul.' },
        { hari: 2, judul: 'Istanbul Historical Tour', deskripsi: 'Kunjungan ke Blue Mosque, Hagia Sophia, Topkapi Palace.' },
        { hari: 3, judul: 'Cappadocia Hot Air Balloon', deskripsi: 'Penerbangan pagi hari menggunakan balon udara di Cappadocia.' }
      ],
      fasilitas: ['Hotel Bintang 4 & 5', 'Bus VIP AC', 'Meals Full Board (Halal)', 'Tour Guide Lokal (Berbahasa Indonesia)'],
      termasuk: ['Tiket Pesawat PP (Turkish Airlines)', 'Akomodasi', 'Balon Udara Cappadocia (Basic)', 'Air Mineral 2 Botol/Hari'],
      tidakTermasuk: ['Tipping Guide/Driver', 'Pengeluaran Pribadi'],
      status: 'publish',
      label: 'Promo Spesial'
    }
  ]

  for (const p of paketData) {
    await prisma.openTrip.upsert({
      where: { slug: p.slug },
      update: {},
      create: p
    })
  }

  console.log('Dummy Paket Wisata berhasil ditambahkan!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
