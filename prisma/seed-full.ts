import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Update Data Dummy Paket Wisata menjadi Full Lengkap...')

  // Seed Super Admin, Manager & Editor (Segregation of Duties & Kredensial Aman)
  const initialPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Agendain!SuperSecure2026@'
  const hashedPassword = await bcrypt.hash(initialPassword, 10)
  
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

  // Akun Manager (Admin Trip)
  await prisma.adminUser.upsert({
    where: { email: 'manager@agendain.com' },
    update: { role: 'admin' },
    create: {
      email: 'manager@agendain.com',
      password: hashedPassword,
      nama: 'Trip Manager',
      role: 'admin'
    }
  })

  // Akun Content Editor
  await prisma.adminUser.upsert({
    where: { email: 'editor@agendain.com' },
    update: { role: 'editor' },
    create: {
      email: 'editor@agendain.com',
      password: hashedPassword,
      nama: 'Content Editor',
      role: 'editor'
    }
  })
  console.log('Segregation of duties users created (Manager & Editor).')

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

  // Destinasi Eropa Barat
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

  // Destinasi Skandinavia
  const destinasiSkandinavia = await prisma.destinasi.upsert({
    where: { slug: 'skandinavia' },
    update: {},
    create: {
      nama: 'Skandinavia',
      slug: 'skandinavia',
      negara: 'Norwegia, Swedia',
      deskripsi: 'Pesona salju dan fenomena alam di Eropa Utara.',
      foto: '/uploads/seed/aurora.png',
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
      foto: '/uploads/seed/turki.png',
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
      foto: [{ thumb: '/uploads/seed/paris.png', medium: '/uploads/seed/paris.png', full: '/uploads/seed/paris.png' }],
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
      foto: [{ thumb: '/uploads/seed/aurora.png', medium: '/uploads/seed/aurora.png', full: '/uploads/seed/aurora.png' }],
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
      foto: [{ thumb: '/uploads/seed/turki.png', medium: '/uploads/seed/turki.png', full: '/uploads/seed/turki.png' }],
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
    await prisma.openTrip.upsert({
      where: { slug: p.slug },
      update: {
        deskripsi: p.deskripsi,
        foto: p.foto,
        itinerary: p.itinerary,
        fasilitas: p.fasilitas,
        termasuk: p.termasuk,
        tidakTermasuk: p.tidakTermasuk,
        status: p.status,
        label: p.label
      },
      create: p
    })
  }

  console.log('Update Data Dummy Paket Wisata menjadi Full Lengkap BERHASIL!')

  // Seed Home CMS Settings (seluruh sub-judul & deskripsi font weight: Medium / 500)
  const homeSettings = {
    // Hero
    heroTitle: 'Jangan Cuma Jadi Wacana, *Agendain* Aja!',
    heroTitle_en: 'Don\'t Just Dream It, *Agendain* It!',
    heroTitleWeight: '800',
    heroSubtitle: 'Dari tiket, hotel, sampai itinerary, semua udah kami siapkan. Kamu tinggal ajak teman dan siap berangkat.',
    heroSubtitle_en: 'From tickets, hotels, to itineraries, we have prepared everything. You just invite your friends and get ready to go.',
    heroSubtitleWeight: '500',
    heroBgImage: '/hero-coastal.webp',

    // Why Choose Us
    whyTitleMain: 'Masih Ragu?',
    whyTitleMain_en: 'Still Unsure?',
    whyTitleMainWeight: '800',
    whyTitleSub: 'Kenapa *Agendain* Travel Jadi Solusi Wacana Kamu',
    whyTitleSub_en: 'Why *Agendain* Travel is Your Best Solution',
    whyTitleSubWeight: '800',
    whyItems: [
      { number: '#1', image: '/why-hotel.webp', title: 'All-in-One!', desc: 'Ga usah ribet ngurus sana-sini. Di Agendain, dari tiket pesawat, hotel, sampai itinerary harian semua udah kami siapin. Kamu tinggal bawa koper dan ajak teman — semuanya sudah beres!', titleWeight: '800', descWeight: '500' },
      { number: '#2', image: '/placeholder.webp', title: 'Harga Terbaik', desc: 'Kami bekerja langsung dengan partner lokal di Eropa, jadi harga yang kamu dapat itu harga terbaik, transparan, tanpa biaya tersembunyi. Worth it banget buat pengalaman yang kamu dapat!', titleWeight: '800', descWeight: '500' },
      { number: '#3', image: '/why-support.webp', title: 'Dukungan 24/7', desc: 'Tim Agendain selalu stand by 24 jam selama perjalanan kamu. Mulai dari pertanyaan soal hotel, transportasi, atau darurat — kamu ga bakal sendirian. Kami ada di setiap langkah!', titleWeight: '800', descWeight: '500' },
      { number: '#4', image: '/why-camera.webp', title: 'Dokumentasi Pro', desc: 'Setiap momen berharga akan diabadikan secara sinematik oleh tim dokumentasi profesional kami. Pulang liburan bawa foto & video keren tanpa repot mikirin angle!', titleWeight: '800', descWeight: '500' },
    ],
    whyItems_en: [
      { number: '#1', image: '/why-hotel.webp', title: 'All-in-One!', desc: 'No need to stress over the details. At Agendain, from flights, hotels, to daily itineraries, we have everything sorted. Just pack your bags and bring your friends — it\'s all set!', titleWeight: '800', descWeight: '500' },
      { number: '#2', image: '/placeholder.webp', title: 'Best Price Guarantee', desc: 'We work directly with local partners in Europe, so the price you get is the best, transparent, and with no hidden fees. Definitely worth the experience you receive!', titleWeight: '800', descWeight: '500' },
      { number: '#3', image: '/why-support.webp', title: '24/7 Support', desc: 'The Agendain team is always on standby 24 hours during your trip. From questions about hotels, transport, or emergencies — you will never be alone. We are with you every step of the way!', titleWeight: '800', descWeight: '500' },
      { number: '#4', image: '/why-camera.webp', title: 'Pro Documentation', desc: 'Every precious moment will be captured cinematically by our professional documentation team. Go home with awesome photos & videos without worrying about the angle!', titleWeight: '800', descWeight: '500' },
    ],

    // Destinations
    destEyebrow: 'Eksplor Bersama Agendain',
    destEyebrow_en: 'Explore With Agendain',
    destEyebrowWeight: '500',
    destTitle: '*Destinasi* Favorit',
    destTitle_en: 'Favorite *Destinations*',
    destTitleWeight: '800',

    // Testimonial
    testiBadge: 'Sudut Pandang',
    testiBadge_en: 'Perspective',
    testiBadgeWeight: '500',
    testiTitle: '"Satu Hari di *Italia* , dan Gue Langsung Jatuh Cinta!"',
    testiTitle_en: '"One Day in *Italy* , and I Immediately Fell in Love!"',
    testiTitleWeight: '800',
    galleryImg1: '/gallery-amalfi.webp', galleryImg2: '/dest-swiss.webp', galleryImg3: '/gallery-colosseum.webp', galleryImg4: '/dest-france.webp', galleryImg5: '/dest-italy.webp',

    // Accordion
    accTitle: 'Lihat, Hirup, & *Simpan* Memori',
    accTitle_en: 'See, Breathe, & *Keep* Memories',
    accTitleWeight: '800',
    accSubtitle: 'Sudut Terbaik Eropa',
    accSubtitle_en: 'The Best Corners of Europe',
    accSubtitleWeight: '500',
    accImage: '/accordion-street.webp',
    accItems: [
      { title: 'Tidur Nyenyak Berlatar Sudut Kota yang Estetik', body: 'Kami pilihkan hotel-hotel terbaik di lokasi strategis, dekat dengan spot wisata utama. Bangun pagi dengan pemandangan kota Eropa yang estetik langsung dari jendela kamar kamu.' },
      { title: 'Eksplorasi Bebas Kaku Tanpa Rasa Pusing', body: 'Itinerary kami dirancang fleksibel — ada waktu guided tour, ada waktu free time. Jadi kamu bisa eksplor sendiri tanpa khawatir nyasar atau ketinggalan.' },
      { title: 'Berburu Kuliner Ikonik Langsung dari Tempat Asalnya', body: 'Dari pizza Napoli asli, gelato di Roma, sampai croissant hangat di Paris — kami pastikan kamu ngerasain kuliner legendaris langsung di tempat aslinya.' },
      { title: 'Bawa Pulang Foto Estetik Tanpa Repot Mikirin Angle', body: 'Tim dokumentasi profesional kami ikut di setiap perjalanan. Hasil foto dan video-nya cinematic-grade, bukan sekadar snapshots biasa.' },
    ],
    accItems_en: [
      { title: 'Sleep Soundly with an Aesthetic City View', body: 'We select the best hotels in strategic locations, close to major tourist spots. Wake up to an aesthetic European city view right from your window.' },
      { title: 'Explore Freely Without the Stress', body: 'Our itineraries are designed to be flexible — there are guided tours and free time. So you can explore on your own without worrying about getting lost or left behind.' },
      { title: 'Hunt Iconic Culinary Delights from Their Origins', body: 'From authentic Napoli pizza, gelato in Rome, to warm croissants in Paris — we make sure you taste legendary cuisine right where it comes from.' },
      { title: 'Take Home Aesthetic Photos Without the Hassle', body: 'Our professional documentation team joins every trip. The photos and videos are cinematic-grade, not just ordinary snapshots.' },
    ],

    // Social Proof
    socialName: 'El Rumi & Syifa',
    socialName_en: 'El Rumi & Syifa',
    socialTitle: 'Dari *Artis* Sampai Netizen, Semua Udah Gak *Wacana* Lagi!',
    socialTitle_en: 'From *Celebrities* to Netizens, None of It is Just a *Dream* Anymore!',
    socialTitleWeight: '800',
    socialQuote: 'Biasanya kalau ngerencanain trip tuh paling pusing nyamain jadwal dan ngurusin printilannya.',
    socialQuote_en: 'Usually when planning a trip, synchronizing schedules and sorting out details is the biggest headache.',
    socialSubtitle: 'Intip cerita seru El Rumi, Syifa, dan ratusan traveler lainnya yang udah berhasil nge-realisasiin liburan impian mereka bareng Agendain.',
    socialSubtitle_en: 'Sneak a peek at the exciting stories of El Rumi, Syifa, and hundreds of other travelers who have successfully realized their dream vacation with Agendain.',
    socialSubtitleWeight: '500',
    socialImage: '/el-rumi-syifa.webp',
    socialBgImg: '/dest-italy.webp',
    testiItems: [
      { name: 'Netizen 1', text: '"Pengalaman pertama ke Eropa dan semuanya beyond expectations. Dari hotel, makanan, sampai guide-nya — semuanya top. Ga nyesel pilih Agendain!"', photo: '/el-rumi-syifa.webp' },
      { name: 'Netizen 2', text: '"Trip ke Italia bareng Agendain itu magical banget. Itinerary-nya detail, hotelnya strategis, dan yang paling berkesan dokumentasi-nya keren abis!"', photo: '/dest-france.webp' },
      { name: 'Netizen 3', text: '"Awalnya ragu karena pertama kali pakai travel agent, tapi Agendain beneran all-in. Harga transparan, support 24 jam, dan hasilnya beyond!"', photo: '/dest-swiss.webp' },
    ],
    testiItems_en: [
      { name: 'Netizen 1', text: '"First trip to Europe and everything was beyond expectations. From hotel, food, to guide — top notch. No regrets choosing Agendain!"', photo: '/el-rumi-syifa.webp' },
      { name: 'Netizen 2', text: '"Our Italy trip with Agendain was magical. Detailed itinerary, strategic hotel, and pro documentation!"', photo: '/dest-france.webp' },
      { name: 'Netizen 3', text: '"Initially hesitant as a first time travel agent user, but Agendain is truly all-in. Transparent price, 24/7 support!"', photo: '/dest-swiss.webp' },
    ],

    // FAQ
    faqTitle: 'Masih *Ragu?*',
    faqTitle_en: 'Still *Unsure?*',
    faqTitleWeight: '800',
    faqSubtitle: 'FAQ',
    faqSubtitle_en: 'FAQ',
    faqSubtitleWeight: '500',
    faqItems: [
      { q: 'Bagaimana cara mendaftar dan booking trip di Agendain?', a: 'Kamu bisa langsung hubungi kami via WhatsApp atau isi form booking di website. Tim kami akan bantu proses selanjutnya dari konsultasi sampai pembayaran.' },
      { q: 'Apa bedanya layanan Open Trip dan Private Trip?', a: 'Open Trip adalah trip gabungan dengan peserta lain di tanggal yang sudah ditentukan. Private Trip adalah trip khusus untuk grup kamu sendiri dengan tanggal dan itinerary yang bisa disesuaikan.' },
      { q: 'Apakah harga open trip yang tertera sudah termasuk tiket pesawat?', a: 'Tergantung paket yang dipilih. Beberapa paket sudah termasuk tiket pesawat PP, dan beberapa lainnya belum. Detail lengkap tertera di setiap halaman openTrip.' },
      { q: 'Bagaimana sistem pembayarannya? Apakah bisa dicicil?', a: 'Ya, kami menyediakan sistem pembayaran bertahap (cicilan tanpa bunga). DP minimal 30% dan sisanya bisa dilunasi sebelum keberangkatan sesuai jadwal yang disepakati.' },
      { q: 'Apakah aman untuk solo traveler yang ingin berangkat sendirian?', a: 'Tentu! Banyak peserta kami yang berangkat solo dan justru menemukan teman baru. Tim guide kami selalu memastikan semua peserta nyaman dan aman selama perjalanan.' },
    ],
    faqItems_en: [
      { q: 'How do I register and book a trip at Agendain?', a: 'You can contact us directly via WhatsApp or fill out the booking form on the website. Our team will assist with the next steps from consultation to payment.' },
      { q: 'What is the difference between Open Trip and Private Trip services?', a: 'Open Trip is a joint trip with other participants on set dates. Private Trip is a dedicated trip for your own group with customizable dates and itineraries.' },
      { q: 'Does the package price include flight tickets?', a: 'It depends on the package selected. Some packages include return flights, and some do not. Full details are listed on each package page.' },
      { q: 'How does the payment system work? Can it be paid in installments?', a: 'Yes, we offer a phased payment system (interest-free installments). A minimum deposit of 30% is required, and the rest can be paid off before departure according to the agreed schedule.' },
      { q: 'Is it safe for a solo traveler to go alone?', a: 'Absolutely! Many of our participants travel solo and actually make new friends. Our guide team always ensures everyone is comfortable and safe throughout the journey.' },
    ],

    sectionOrder: 'hero,why,destinations,testimonial,accordion,socialproof,faq',
  }

  await prisma.setting.upsert({
    where: { key: 'home_settings' },
    update: { value: JSON.stringify(homeSettings) },
    create: { key: 'home_settings', value: JSON.stringify(homeSettings) },
  })
  console.log('Home CMS Settings seeded (all subtitles/descriptions font-weight: Medium 500).')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
