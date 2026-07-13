import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Update Data Dummy Paket Wisata menjadi Full Lengkap...')

  // Destinasi Eropa Barat
  const destinasiEropaBarat = await prisma.destinasi.upsert({
    where: { slug: 'eropa-barat' },
    update: {},
    create: {
      nama: 'Eropa Barat',
      slug: 'eropa-barat',
      negara: 'Prancis, Swiss, Italia',
      deskripsi: 'Kumpulan negara eksotis di Eropa Barat.',
      foto: '/placeholder.webp',
    }
  })

  // Destinasi Skandinavia
  const destinasiSkandinavia = await prisma.destinasi.upsert({
    where: { slug: 'skandinavia' },
    update: {},
    create: {
      nama: 'Skandinavia',
      slug: 'skandinavia',
      negara: 'Norwegia, Swedia',
      deskripsi: 'Pesona salju dan fenomena alam di Eropa Utara.',
      foto: '/placeholder.webp',
    }
  })

  // Destinasi Turki
  const destinasiTurki = await prisma.destinasi.upsert({
    where: { slug: 'turki' },
    update: {},
    create: {
      nama: 'Turki',
      slug: 'turki',
      negara: 'Turki',
      deskripsi: 'Negara lintas benua dengan kekayaan sejarah peradaban Islam.',
      foto: '/placeholder.webp',
    }
  })

  const paketData = [
    {
      nama: 'Eksplorasi Eropa Barat (Prancis, Swiss, Italia)',
      slug: 'eksplorasi-eropa-barat',
      deskripsi: 'Rasakan pesona romantis Paris dengan Menara Eiffel-nya, nikmati keajaiban alam bersalju di Mount Titlis, Swiss, dan susuri peradaban kuno yang masih hidup di Colosseum, Roma. Perjalanan 10 hari ini didesain khusus bagi Anda yang ingin menikmati highlights terbaik di Eropa Barat dengan kenyamanan maksimal dan pengalaman tak terlupakan.',
      harga: 28500000,
      durasi: 10,
      destinasiId: destinasiEropaBarat.id,
      foto: ['/placeholder.webp', '/placeholder.webp'],
      itinerary: [
        { hari: 1, judul: 'Keberangkatan Jakarta - Paris', deskripsi: 'Berkumpul di Bandara Internasional Soekarno Hatta 4 jam sebelum keberangkatan. Proses check-in dan imigrasi, kemudian penerbangan malam menuju Paris (CDG).' },
        { hari: 2, judul: 'Tiba di Paris & City Tour', deskripsi: 'Tiba di Paris pada pagi hari. Langsung memulai city tour mengunjungi ikon kota Paris: Menara Eiffel (Photo Stop di Trocadero), Arc de Triomphe, Champs-Élysées, dan menikmati suasana Sungai Seine dari Bateaux Mouches Cruise. Check-in hotel untuk beristirahat.' },
        { hari: 3, judul: 'Paris - Dijon - Lucerne', deskripsi: 'Setelah sarapan, perjalanan darat melintasi pemandangan pedesaan Prancis (Dijon) menuju Swiss. Tiba di kota Lucerne yang damai dengan danaunya yang jernih, mengunjungi Chapel Bridge dan Lion Monument.' },
        { hari: 4, judul: 'Lucerne - Mt. Titlis - Milan', deskripsi: 'Menuju Engelberg untuk menaiki Cable Car berputar (Rotair) menuju puncak Mount Titlis (3.020 mdpl) yang diselimuti salju abadi. Sore harinya melanjutkan perjalanan darat menyeberang ke Italia menuju pusat mode dunia, Milan.' },
        { hari: 5, judul: 'Milan - Venice', deskripsi: 'Pagi hari mengunjungi Duomo di Milano, katedral gotik terbesar di dunia, dan Galleria Vittorio Emanuele II. Perjalanan dilanjutkan menuju kota di atas air yang super romantis, Venice (Venezia).' },
        { hari: 6, judul: 'Venice Island Tour - Pisa', deskripsi: 'Menuju Venice Island dengan Water Taxi. Berkeliling melewati St. Mark Square, Bridge of Sighs, Doge’s Palace. Anda dapat mencoba menaiki Gondola (Optional). Sore hari menuju Pisa untuk bermalam.' },
        { hari: 7, judul: 'Pisa - Rome', deskripsi: 'Mengunjungi kompleks Menara Miring Pisa (Leaning Tower of Pisa) yang ikonik untuk berfoto. Siang harinya melanjutkan perjalanan menuju ibu kota Italia, Rome.' },
        { hari: 8, judul: 'Rome City Tour & Vatican', deskripsi: 'City tour mengunjungi negara terkecil di dunia, Vatican City (St. Peter Basilica). Dilanjutkan melewati Colosseum (amfiteater Romawi Kuno), Roman Forum, dan melempar koin di Trevi Fountain.' },
        { hari: 9, judul: 'Rome - Jakarta (Kepulangan)', deskripsi: 'Acara bebas di pagi hari untuk berbelanja oleh-oleh atau sekadar ngopi santai di cafe lokal. Siang hari diantar ke bandara (FCO) untuk penerbangan kembali ke tanah air.' },
        { hari: 10, judul: 'Tiba di Jakarta', deskripsi: 'Tiba kembali di Bandara Soekarno Hatta membawa kenangan manis dari Eropa Barat bersama Agendain. Tour selesai.' }
      ],
      fasilitas: [
        'Hotel Bintang 4 di lokasi strategis', 
        'Bus Pariwisata Eksekutif ber-AC + Wi-Fi', 
        'Tour Leader tersertifikasi BNSP dari Jakarta', 
        'Lokal Guide Berlisensi Resmi berbahasa Indonesia/Inggris', 
        'Dokumentasi Foto & Video Premium (Mirrorless/Drone)',
        'Souvenir Eksklusif Travel Kit Agendain'
      ],
      termasuk: [
        'Tiket Pesawat Internasional PP (Qatar Airways / Emirates)', 
        'Akomodasi Hotel 9 Malam (Twin/Double Share)', 
        'Makan Pagi dan Malam sesuai itinerary', 
        'Semua tiket masuk objek wisata (Mt. Titlis Cable Car, Bateaux Mouches)', 
        'Bagasi 30kg + Cabin 7kg',
        'Air Mineral 1 botol/hari/peserta',
        'Airport Handling di Soekarno Hatta'
      ],
      tidakTermasuk: [
        'Biaya Pembuatan Visa Schengen (Bisa dibantu tim Agendain)', 
        'Tipping untuk Tour Leader, Guide & Driver (EUR 70/pax dibayar saat pelunasan)', 
        'Makan Siang (Bebas memilih kuliner lokal)', 
        'Asuransi Perjalanan (Wajib untuk Visa)',
        'Pengeluaran Pribadi (Laundry, Minibar, Belanja)',
        'Biaya Kelebihan Bagasi'
      ],
      status: 'publish',
      label: 'Best Seller'
    },
    {
      nama: 'Keajaiban Skandinavia & Aurora Borealis',
      slug: 'skandinavia-aurora',
      deskripsi: 'Liburan musim dingin yang spektakuler ke ujung utara Eropa. Berburu fenomena Northern Lights (Aurora Borealis) yang magis di langit Tromsø, Norwegia, serta merasakan budaya Nordik yang kaya di kota Oslo dan Stockholm.',
      harga: 35000000,
      durasi: 8,
      destinasiId: destinasiSkandinavia.id,
      foto: ['/placeholder.webp'],
      itinerary: [
        { hari: 1, judul: 'Jakarta - Oslo', deskripsi: 'Keberangkatan dari Jakarta dengan penerbangan transit menuju Oslo, ibu kota Norwegia.' },
        { hari: 2, judul: 'Oslo City Tour', deskripsi: 'Tiba di Oslo. Kunjungan ke Vigeland Sculpture Park, taman patung terbesar di dunia oleh satu seniman, dan berfoto di Oslo Opera House.' },
        { hari: 3, judul: 'Oslo - Tromsø (Kutub Utara)', deskripsi: 'Penerbangan domestik menuju Tromsø, kota cantik di atas Lingkar Arktik. Sore hari bersiap untuk memulai tur Northern Lights Hunt pertama Anda menembus malam kutub.' },
        { hari: 4, judul: 'Tromsø (Husky Sledding)', deskripsi: 'Menikmati aktivitas ikonik musim dingin: Husky Dog Sledding di padang salju luas, dan mengunjungi peternakan Rusa Kutub (Reindeer). Malam harinya kembali berburu Aurora jika cuaca mendukung.' },
        { hari: 5, judul: 'Tromsø Fjord Cruise', deskripsi: 'Menikmati pemandangan pegunungan bersalju dan fjord Norwegia yang luar biasa dari atas kapal (Fjord Cruise/Whale Watching). Malam harinya acara bebas.' },
        { hari: 6, judul: 'Tromsø - Stockholm', deskripsi: 'Penerbangan menuju Stockholm, ibu kota Swedia yang dijuluki Beauty on Water. Check-in hotel.' },
        { hari: 7, judul: 'Stockholm City Tour', deskripsi: 'Berkeliling di Gamla Stan (Kota Tua) dengan jalan-jalan batu bulat yang estetik, Royal Palace, dan Vasa Museum yang menyimpan kapal perang utuh dari abad ke-17.' },
        { hari: 8, judul: 'Stockholm - Jakarta', deskripsi: 'Perjalanan menuju Bandara Arlanda untuk penerbangan pulang ke Indonesia.' }
      ],
      fasilitas: [
        'Hotel Bintang 4', 
        'Transportasi Musim Dingin (Bus berpenghangat)', 
        'Peminjaman Thermal Suit (Pakaian Tahan Dingin Khusus)',
        'Tour Leader Expert Musim Dingin',
        'Fotografer Aurora Profesional'
      ],
      termasuk: [
        'Tiket Pesawat PP Internasional & Penerbangan Domestik', 
        'Akomodasi Hotel 7 Malam (Twin Share)', 
        'Sarapan Pagi dan 5x Makan Malam', 
        'Tour Berburu Aurora (Termasuk transport, api unggun & snack hangat)',
        'Aktivitas Husky Sledding'
      ],
      tidakTermasuk: [
        'Visa Schengen', 
        'Asuransi Perjalanan Khusus Winter Sports', 
        'Tipping Guide/Driver (EUR 60)', 
        'Makan Siang'
      ],
      status: 'publish',
      label: 'Limited Seat'
    },
    {
      nama: 'Halal Tour Turki & Sensasi Balon Udara',
      slug: 'halal-tour-turki-cappadocia',
      deskripsi: 'Menyatukan keindahan benua Asia dan Eropa, Turki menjanjikan lanskap yang tiada duanya. Paket 7 hari ini dirancang ramah muslim, mencakup situs sejarah Islam di Istanbul dan pengalaman paling dinanti: Terbang melintasi lembah bebatuan Cappadocia dari atas Balon Udara.',
      harga: 18900000,
      durasi: 7,
      destinasiId: destinasiTurki.id,
      foto: ['/placeholder.webp'],
      itinerary: [
        { hari: 1, judul: 'Jakarta - Istanbul', deskripsi: 'Berkumpul di Bandara Soekarno Hatta untuk penerbangan direct/transit menuju Istanbul. Setibanya di Istanbul, Anda akan dijemput oleh Guide Lokal kami.' },
        { hari: 2, judul: 'Istanbul Historical Tour', deskripsi: 'Memulai hari dengan mengunjungi situs warisan dunia UNESCO: Blue Mosque (Masjid Sultan Ahmed) yang megah, Hagia Sophia (Kini berfungsi kembali sebagai masjid), dan Topkapi Palace (Istana Kesultanan Utsmaniyah).' },
        { hari: 3, judul: 'Istanbul - Bursa - Kusadasi', deskripsi: 'Menyeberangi Laut Marmara menuju Bursa, mantan ibu kota Kesultanan Utsmaniyah. Mengunjungi Grand Mosque dan berbelanja di Silk Market, sebelum melanjutkan ke Kusadasi.' },
        { hari: 4, judul: 'Kusadasi - Pamukkale', deskripsi: 'Pagi hari mengunjungi reruntuhan kota kuno Ephesus. Kemudian menuju Pamukkale untuk melihat Cotton Castle, teras-teras travertine putih yang terbentuk secara alami berisi air panas mineral.' },
        { hari: 5, judul: 'Pamukkale - Konya - Cappadocia', deskripsi: 'Perjalanan menuju Konya mengunjungi Mevlana Museum (asal usul tarian Sufi yang berputar). Melanjutkan perjalanan melintasi jalur kuno Silk Road menuju Cappadocia.' },
        { hari: 6, judul: 'Cappadocia Tour (Hot Air Balloon)', deskripsi: 'Dini hari Anda akan dijemput untuk menaiki Balon Udara (Termasuk di Paket), melihat sunrise dari udara di atas formasi batu cerobong peri. Siang harinya mengunjungi Goreme Open Air Museum, Underground City, dan pusat kerajinan karpet.' },
        { hari: 7, judul: 'Cappadocia - Ankara - Jakarta', deskripsi: 'Menuju ibu kota Ankara mengunjungi Mausoleum Ataturk (Anitkabir). Diantar ke Bandara untuk penerbangan kembali ke Jakarta.' }
      ],
      fasilitas: [
        'Akomodasi Hotel Bintang 4 & Bintang 5 di kota tertentu', 
        'Bus Pariwisata VIP AC & Wi-Fi', 
        'Tour Guide Lokal Berlisensi (Fasih Berbahasa Indonesia)', 
        'Semua makanan disajikan HALAL (Sertifikasi)'
      ],
      termasuk: [
        'Tiket Pesawat PP (Turkish Airlines / setaraf)', 
        'Akomodasi', 
        'Makan 3x Sehari (Full Board) + Air Mineral 2 botol/hari', 
        'Tiket Wisata Hot Air Balloon Cappadocia (Basic Flight)',
        'Bosphorus Cruise di Istanbul'
      ],
      tidakTermasuk: [
        'Tipping untuk Guide & Driver (USD 50/pax)', 
        'Pengeluaran Pribadi',
        'Asuransi Perjalanan',
        'Optional Tour lainnya (Jeep Safari)'
      ],
      status: 'publish',
      label: 'Promo Spesial'
    }
  ]

  for (const p of paketData) {
    await prisma.paket.upsert({
      where: { slug: p.slug },
      update: {
        deskripsi: p.deskripsi,
        itinerary: p.itinerary,
        fasilitas: p.fasilitas,
        termasuk: p.termasuk,
        tidakTermasuk: p.tidakTermasuk
      },
      create: p
    })
  }

  console.log('Update Data Dummy Paket Wisata menjadi Full Lengkap BERHASIL!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
