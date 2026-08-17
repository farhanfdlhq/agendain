import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Destinasi & Paket Wisata...");

  // Seed Super Admin, Manager & Editor (Segregation of Duties & Kredensial Aman)
  const initialPassword = process.env.ADMIN_INITIAL_PASSWORD;
  if (!initialPassword) {
    throw new Error("ADMIN_INITIAL_PASSWORD wajib di-set sebelum menjalankan seed.");
  }
  const hashedPassword = await bcrypt.hash(initialPassword, 10);

  await prisma.adminUser.upsert({
    where: { email: "admin@agendain.com" },
    update: {
      password: hashedPassword,
      role: "super_admin",
    },
    create: {
      email: "admin@agendain.com",
      password: hashedPassword,
      nama: "Super Admin",
      role: "super_admin",
    },
  });
  console.log("Super Admin user updated/created: admin@agendain.com");
  // Akun Manager (Admin Trip)
  await prisma.adminUser.upsert({
    where: { email: "manager@agendain.com" },
    update: { role: "admin" },
    create: {
      email: "manager@agendain.com",
      password: hashedPassword,
      nama: "Trip Manager",
      role: "admin",
    },
  });

  // Akun Content Editor
  await prisma.adminUser.upsert({
    where: { email: "editor@agendain.com" },
    update: { role: "editor" },
    create: {
      email: "editor@agendain.com",
      password: hashedPassword,
      nama: "Content Editor",
      role: "editor",
    },
  });
  console.log("Segregation of duties users created (Manager & Editor).");

  // Default Settings
  await prisma.setting.upsert({
    where: { key: "contact_whatsapp" },
    update: {},
    create: { key: "contact_whatsapp", value: "+62 819-9526-4565" },
  });

  await prisma.setting.upsert({
    where: { key: "site_logo" },
    update: {},
    create: { key: "site_logo", value: "/uploads/Logo ( White Version ).png" },
  });
  console.log("Default settings created.");

  const destinasiEropaBarat = await prisma.destinasi.upsert({
    where: { slug: "eropa-barat" },
    update: {},
    create: {
      nama: "Eropa Barat",
      slug: "eropa-barat",
      negara: "Prancis, Swiss, Italia",
      deskripsi: "Kumpulan negara eksotis di Eropa Barat.",
      foto: "/uploads/seed/paris.png",
    },
  });

  const destinasiSkandinavia = await prisma.destinasi.upsert({
    where: { slug: "skandinavia" },
    update: {},
    create: {
      nama: "Skandinavia",
      slug: "skandinavia",
      negara: "Norwegia, Swedia",
      deskripsi: "Pesona salju dan fenomena alam di Eropa Utara.",
      foto: "/uploads/seed/swiss.png",
    },
  });

  const destinasiTurki = await prisma.destinasi.upsert({
    where: { slug: "turki" },
    update: {},
    create: {
      nama: "Turki",
      slug: "turki",
      negara: "Turki",
      deskripsi: "Negara lintas benua dengan kekayaan sejarah peradaban Islam.",
      foto: "/uploads/seed/italy.png",
    },
  });

  const paketData = [
    {
      nama: "Eksplorasi Eropa Barat (Prancis, Swiss, Italia)",
      slug: "eksplorasi-eropa-barat",
      deskripsi:
        "Perjalanan 10 hari melintasi 3 negara paling memukau di Eropa. Nikmati keindahan Menara Eiffel, pemandangan salju abadi di Mount Titlis Swiss, hingga sejarah panjang Colosseum di Roma.",
      harga: 28500000,
      durasi: 10,
      destinasiId: destinasiEropaBarat.id,
      foto: [
        {
          thumb: "/uploads/seed/paris.png",
          medium: "/uploads/seed/paris.png",
          full: "/uploads/seed/paris.png",
        },
      ],
      itinerary: [
        {
          hari: 1,
          judul: "Keberangkatan Jakarta - Paris",
          deskripsi:
            "Penerbangan dari Bandara Soekarno Hatta menuju CDG Paris.",
        },
        {
          hari: 2,
          judul: "Paris City Tour",
          deskripsi:
            "Mengunjungi Menara Eiffel, Louvre Museum, dan Arc de Triomphe.",
        },
        {
          hari: 3,
          judul: "Perjalanan ke Swiss",
          deskripsi: "Menggunakan kereta cepat menuju Lucerne, Swiss.",
        },
      ],
      fasilitas: [
        "Hotel Bintang 4",
        "Bus Pariwisata VIP",
        "Tour Leader Berbahasa Indonesia",
        "Dokumentasi",
      ],
      termasuk: [
        "Tiket Pesawat PP",
        "Akomodasi 9 Malam",
        "Sarapan",
        "Tiket Masuk Wisata",
      ],
      tidakTermasuk: [
        "Visa Schengen",
        "Asuransi Perjalanan",
        "Pengeluaran Pribadi",
      ],
      status: "publish",
      label: "Best Seller",
    },
    {
      nama: "Keajaiban Skandinavia & Aurora Borealis",
      slug: "skandinavia-aurora",
      deskripsi:
        "Rasakan pengalaman magis melihat langsung Northern Lights (Aurora Borealis) di Tromsø, Norwegia, serta menikmati keindahan kota Stockholm dan pesona desa-desa Nordik.",
      harga: 35000000,
      durasi: 8,
      destinasiId: destinasiSkandinavia.id,
      foto: [
        {
          thumb: "/uploads/seed/swiss.png",
          medium: "/uploads/seed/swiss.png",
          full: "/uploads/seed/swiss.png",
        },
      ],
      itinerary: [
        {
          hari: 1,
          judul: "Jakarta - Oslo",
          deskripsi: "Penerbangan menuju Oslo, Norwegia.",
        },
        {
          hari: 2,
          judul: "Berburu Aurora",
          deskripsi:
            "Perjalanan malam hari menuju spot Aurora terbaik di Tromsø.",
        },
      ],
      fasilitas: [
        "Hotel Bintang 4",
        "Transportasi Musim Dingin",
        "Peralatan Musim Dingin",
      ],
      termasuk: ["Tiket Pesawat PP", "Akomodasi", "Sarapan & Makan Malam"],
      tidakTermasuk: ["Visa Schengen", "Tipping Guide"],
      status: "publish",
      label: "Limited Seat",
    },
    {
      nama: "Halal Tour Turki & Sensasi Balon Udara",
      slug: "halal-tour-turki-cappadocia",
      deskripsi:
        "Jelajahi jejak sejarah peradaban Islam di Istanbul, kunjungi Blue Mosque, hingga menikmati pengalaman tak terlupakan terbang dengan Balon Udara di atas lembah eksotis Cappadocia.",
      harga: 18900000,
      durasi: 7,
      destinasiId: destinasiTurki.id,
      foto: [
        {
          thumb: "/uploads/seed/italy.png",
          medium: "/uploads/seed/italy.png",
          full: "/uploads/seed/italy.png",
        },
      ],
      itinerary: [
        {
          hari: 1,
          judul: "Jakarta - Istanbul",
          deskripsi: "Penerbangan menuju Istanbul.",
        },
        {
          hari: 2,
          judul: "Istanbul Historical Tour",
          deskripsi: "Kunjungan ke Blue Mosque, Hagia Sophia, Topkapi Palace.",
        },
        {
          hari: 3,
          judul: "Cappadocia Hot Air Balloon",
          deskripsi:
            "Penerbangan pagi hari menggunakan balon udara di Cappadocia.",
        },
      ],
      fasilitas: [
        "Hotel Bintang 4 & 5",
        "Bus VIP AC",
        "Meals Full Board (Halal)",
        "Tour Guide Lokal (Berbahasa Indonesia)",
      ],
      termasuk: [
        "Tiket Pesawat PP (Turkish Airlines)",
        "Akomodasi",
        "Balon Udara Cappadocia (Basic)",
        "Air Mineral 2 Botol/Hari",
      ],
      tidakTermasuk: ["Tipping Guide/Driver", "Pengeluaran Pribadi"],
      status: "publish",
      label: "Promo Spesial",
    },
  ];

  for (const p of paketData) {
    await prisma.openTrip.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }

  console.log("Dummy Paket Wisata berhasil ditambahkan!");

  // Private Trip Packages
  const privateTripPackages = [
    {
      title: "VALUE TRIP — Jelajahi Lebih Banyak, Bayar Lebih Hemat!",
      subtitle: "Italy - Value",
      image: "/gallery-colosseum.webp",
      locationTab: "Italy",
      chips: ["Durasi fleksibel", "Semua Ukuran Grup", "Jadwal Bebas"],
      features: [
        "Solusi terbaik buat kamu yang pengen keliling Eropa hemat tapi gak mau keganggu orang lain di open trip.",
        "Rasakan pengalaman otentik naik transportasi lokal, serasa jadi traveler sejati!",
        "Menginap nyaman di Hotel Bintang 2/3 atau Apartemen pilihan terbaik",
        "Bebas pilih sarapan (Tidak Termasuk)",
      ],
    },
    {
      title: "BALANCE TRIP — Nyaman, Seru, Tetap Worth It!",
      subtitle: "Italy - Balance",
      image: "/dest-italy.webp",
      locationTab: "Italy",
      chips: ["Durasi fleksibel", "Semua Ukuran Grup", "Jadwal Bebas"],
      features: [
        "Pilihan paling cerdas buat kamu yang mau liburan berkesan tanpa kompromi kenyamanan",
        "Nikmati istirahat berkualitas di Hotel Bintang 3 yang cozy",
        "Bebas pilih sarapan (Tidak Termasuk)",
        "Dilengkapi 1x Private Car — bebas macet, bebas ribet!",
      ],
    },
    {
      title: "PREMIUM TRIP — Liburan Mewah, Semua Sudah Beres!",
      subtitle: "Italy - Premium",
      image: "/dest-france.webp",
      locationTab: "Italy",
      chips: ["Durasi fleksibel", "Semua Ukuran Grup", "Jadwal Bebas"],
      features: [
        "Untuk kamu yang percaya bahwa liburan terbaik = tanpa drama dan tanpa ribet",
        "Tidur pulas di Hotel Bintang 4 pilihan eksklusif",
        "3-4x Private Car siap mengantar ke mana pun kamu mau",
        "Luggage Forwarding Service — kopermu duluan sampai, kamu tinggal santai!",
      ],
    },
  ];

  // Bersihkan data lama agar id tidak terus bertambah jika berulang
  await prisma.privateTripPackage.deleteMany({});

  for (const pt of privateTripPackages) {
    await prisma.privateTripPackage.create({
      data: pt,
    });
  }
  console.log("Dummy Private Trip Packages berhasil ditambahkan!");

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
  };

  await prisma.setting.upsert({
    where: { key: 'home_settings' },
    update: { value: JSON.stringify(homeSettings) },
    create: { key: 'home_settings', value: JSON.stringify(homeSettings) },
  });
  console.log("Home CMS Settings seeded (all subtitles/descriptions font-weight: Medium 500).");

  // Seed About Us CMS Settings
  const aboutSettings = {
    heroTitle: 'Apa itu *Agendain*?',
    heroTitle_en: 'What is *Agendain*?',
    heroTitleWeight: '800',
    heroSubtitle: 'Bagi kami, menjelajahi Eropa bukan sekadar berpindah dari satu destinasi ke destinasi lain, melainkan tentang mengumpulkan cerita baru yang membekas di hati. Agendain hadir untuk memastikan seluruh langkah perjalananmu berjalan mulus, aman, dan bebas dari drama printilan logistik yang membingungkan. Ruang blog ini kami dedikasikan sebagai panduan lokal, tempat berbagi cerita nyata, serta kurasi hidden gems terbaik langsung dari sudut-sudut tercantik Eropa. Yuk, persiapkan kopermu, resapi setiap keindahannya, dan mari agendakan petualangan sinematikmu bersama kami.',
    heroSubtitle_en: 'For us, exploring Europe is not just moving from one destination to another, but about collecting new stories that leave an impression on the heart. Agendain is here to ensure your entire journey runs smoothly, safely, and free from the drama of confusing logistical details. We dedicate this blog space as a local guide, a place to share real stories, and curate the best hidden gems directly from the most beautiful corners of Europe. Let\'s prepare your suitcase, absorb every beauty, and let\'s schedule your cinematic adventure with us.',
    heroSubtitleWeight: '500',
    heroImage: '/dest-swiss.webp',
    missionLabel: 'Misi kami',
    missionLabel_en: 'Our Mission',
    missionLabelWeight: '600',
    missionTitle: 'Mengubah rencana liburanmu jadi kenyataan tanpa drama!',
    missionTitle_en: 'Turning your vacation plans into reality without drama!',
    missionTitleWeight: '800',
    missionDesc: 'Di Agendain, fokus kami adalah memastikan momen liburanmu di Eropa 100% dinikmati tanpa perlu memusingkan logistik, jadwal kereta yang rumit, atau drama nyasar di negeri orang. Semua udah kami agendain dengan rapi!',
    missionDesc_en: 'At Agendain, our focus is to ensure your vacation moments in Europe are 100% enjoyed without worrying about logistics, complicated train schedules, or the drama of getting lost in a foreign land. We have scheduled everything neatly!',
    missionDescWeight: '500',
    guidePill: 'Dibalik Agendain',
    guidePill_en: 'Behind Agendain',
    guideTitle: 'Meet Our *Lead Guide*',
    guideTitle_en: 'Meet Our *Lead Guide*',
    guideTitleWeight: '800',
    guideDescP1: '"Eropa punya sejuta pesona yang sayang banget kalau cuma dilewatin gitu aja dari balik jendela bus wisata. Aku pengen kalian ngerasain Eropa layaknya local traveler — jalan kaki di gang kecil berbatu, ngopi di cafe hidden gem, dan ngobrol sama warga lokal."',
    guideDescP1_en: '"Europe has a million charms that are a pity if just passed by from behind the window of a tour bus. I want you to experience Europe like a local traveler — walking down small cobbled alleys, having coffee at hidden gem cafes, and chatting with locals."',
    guideDescP2: 'Kenalin, sosok di balik setiap rute anti-mainstream dan jadwal yang super efisien. Berbekal pengalaman bertahun-tahun wara-wiri di benua biru, ia siap bawa kamu ngerasain petualangan Eropa yang sesungguhnya.',
    guideDescP2_en: 'Meet the person behind every anti-mainstream route and super efficient schedule. Armed with years of experience wandering around the blue continent, they are ready to take you on a true European adventure.',
    guideDescWeight: '500',
    guideImage: '/why-camera.webp',
  };

  await prisma.setting.upsert({
    where: { key: 'about_settings' },
    update: { value: JSON.stringify(aboutSettings) },
    create: { key: 'about_settings', value: JSON.stringify(aboutSettings) },
  });
  console.log("About Us CMS Settings seeded.");

  // Seed Privacy Policy CMS Settings
  const privacySettings = {
    privacyContent: '<h2>Kebijakan Privasi</h2><p>Ini adalah kebijakan privasi bawaan (default) Agendain. Data Anda aman bersama kami.</p>',
    privacyContent_en: '<h2>Privacy Policy</h2><p>This is the default privacy policy of Agendain. Your data is safe with us.</p>'
  };

  await prisma.setting.upsert({
    where: { key: 'privacy_settings' },
    update: { value: JSON.stringify(privacySettings) },
    create: { key: 'privacy_settings', value: JSON.stringify(privacySettings) },
  });
  console.log("Privacy Policy CMS Settings seeded.");

  // Seed Open Trip CMS Settings
  const opentripSettings = {
    heroTitle: 'Eksplorasi Eropa *Lebih Seru* Bareng Teman Baru',
    heroTitle_en: 'Explore Europe *More Exciting* With New Friends',
    heroTitleWeight: '800',
    heroSubtitle: 'Gabung di Open Trip Agendain. Perjalanan terencana, budget terjangkau, dan pengalaman tak terlupakan.',
    heroSubtitle_en: 'Join the Agendain Open Trip. Planned journey, affordable budget, and unforgettable experience.',
    heroSubtitleWeight: '500',
    heroImage: '/hero-coastal.webp',
    packagesTitle: 'Pilih *Destinasi* Open Trip Kamu',
    packagesTitle_en: 'Choose Your Open Trip *Destination*',
    packagesTitleWeight: '800',
    packagesSubtitle: 'Beragam pilihan rute menarik yang dirancang khusus untuk memberikan pengalaman liburan terbaik di Eropa.',
    packagesSubtitle_en: 'Various exciting route options specially designed to provide the best holiday experience in Europe.',
    packagesSubtitleWeight: '500',
  };

  await prisma.setting.upsert({
    where: { key: 'opentrip_settings' },
    update: { value: JSON.stringify(opentripSettings) },
    create: { key: 'opentrip_settings', value: JSON.stringify(opentripSettings) },
  });
  console.log("Open Trip CMS Settings seeded.");

  // Seed Private Trip CMS Settings
  const privatetripSettings = {
    heroTitle: 'Eropa Eksklusif *Sesuai Cara* Kamu',
    heroTitle_en: 'Exclusive Europe *Your Way*',
    heroTitleWeight: '800',
    heroSubtitle: 'Rancang perjalanan impianmu ke Eropa dengan fleksibilitas penuh. Private trip kami memberikan kebebasan untuk liburan tanpa kompromi.',
    heroSubtitle_en: 'Design your dream trip to Europe with full flexibility. Our private trip gives you the freedom for an uncompromising vacation.',
    heroSubtitleWeight: '500',
    heroImage: '/hero-coastal.webp',
    packagesTitle: 'Pilihan *Private Trip* Kami',
    packagesTitle_en: 'Our *Private Trip* Options',
    packagesTitleWeight: '800',
    packagesSubtitle: 'Beragam kelas layanan yang disesuaikan dengan gaya liburan dan kenyamanan Anda bersama keluarga atau sahabat.',
    packagesSubtitle_en: 'Various service classes adapted to your vacation style and comfort with family or friends.',
    packagesSubtitleWeight: '500',
    ctaTitle: 'Siap *Agendain* Private Trip Kamu?',
    ctaTitle_en: 'Ready to *Agendain* Your Private Trip?',
    ctaTitleWeight: '800',
    ctaSubtitle: 'Mari diskusikan rencana perjalanan impianmu bersama tim kami yang berpengalaman.',
    ctaSubtitle_en: 'Let\'s discuss your dream itinerary with our experienced team.',
    ctaSubtitleWeight: '500',
    ctaBtnText: 'Hubungi Konsultan Kami',
    ctaBtnText_en: 'Contact Our Consultant',
  };

  await prisma.setting.upsert({
    where: { key: 'privatetrip_settings' },
    update: { value: JSON.stringify(privatetripSettings) },
    create: { key: 'privatetrip_settings', value: JSON.stringify(privatetripSettings) },
  });
  console.log("Private Trip CMS Settings seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
