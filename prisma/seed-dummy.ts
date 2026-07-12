/**
 * Seed data dummy massal untuk mengisi dashboard MIS Blusukan.
 *
 * Hanya MENAMBAH data yang menempel ke destinasi APPROVED yang sudah ada.
 * Tidak mengubah kolom destinasi asli, tidak menyentuh akun Pengelola/Admin.
 *
 *   npx tsx --env-file=.env prisma/seed-dummy.ts           -> dry run (ringkasan saja)
 *   npx tsx --env-file=.env prisma/seed-dummy.ts --apply   -> tulis ke database
 *
 * RNG di-seed tetap, jadi rencana pada dry run identik dengan yang di-insert.
 */
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import type { Kategori, RouteStatus, SignalStrength, CrowdLevel, ServiceType, KategoriUmkm, TransaksiStatus, TransaksiType, BookingStatus } from '../lib/generated/prisma/client'

// ---------------------------------------------------------------- RNG (seeded)

let rngState = 0x9e3779b9
function rand(): number {
  rngState |= 0
  rngState = (rngState + 0x6d2b79f5) | 0
  let t = Math.imul(rngState ^ (rngState >>> 15), 1 | rngState)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
function randInt(min: number, max: number) {
  return Math.floor(rand() * (max - min + 1)) + min
}
function pick<T>(arr: readonly T[]): T {
  return arr[randInt(0, arr.length - 1)]
}
function pickMany<T>(arr: readonly T[], n: number): T[] {
  const pool = [...arr]
  const out: T[] = []
  for (let i = 0; i < n && pool.length > 0; i++) out.push(...pool.splice(randInt(0, pool.length - 1), 1))
  return out
}
/** Pilih berdasarkan bobot: [[nilai, bobot], ...] */
function weighted<T>(entries: readonly (readonly [T, number])[]): T {
  const total = entries.reduce((s, [, w]) => s + w, 0)
  let r = rand() * total
  for (const [v, w] of entries) {
    r -= w
    if (r <= 0) return v
  }
  return entries[entries.length - 1][0]
}

// ---------------------------------------------------------------- Waktu

const NOW = Date.now()
const HARI = 24 * 60 * 60 * 1000

/**
 * 75% dalam 6 bulan terakhir (mengisi chart tren harian/mingguan/bulanan),
 * 25% tersebar 1-3 tahun ke belakang (mengisi toggle "Tahunan" di Dashboard Keuangan).
 */
function tanggalCampuran(): Date {
  const recent = rand() < 0.75
  const hariLalu = recent ? randInt(0, 182) : randInt(365, 1095)
  const jitterJam = randInt(6, 20) * 60 * 60 * 1000 + randInt(0, 59) * 60 * 1000
  const d = new Date(NOW - hariLalu * HARI)
  d.setHours(0, 0, 0, 0)
  return new Date(d.getTime() + jitterJam)
}
function tambahJam(d: Date, jam: number) {
  return new Date(d.getTime() + jam * 60 * 60 * 1000)
}

const KODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const kodeTerpakai = new Set<string>()
function generateKodeTransaksi(): string {
  for (;;) {
    let suffix = ''
    for (let i = 0; i < 6; i++) suffix += KODE_CHARS[Math.floor(rand() * KODE_CHARS.length)]
    const kode = `BLS-${suffix}`
    if (!kodeTerpakai.has(kode)) {
      kodeTerpakai.add(kode)
      return kode
    }
  }
}

// ---------------------------------------------------------------- Katalog dummy

const NAMA_DEPAN = ['Budi', 'Sri', 'Agus', 'Rina', 'Dwi', 'Eko', 'Wahyu', 'Siti', 'Bambang', 'Retno', 'Joko', 'Endang', 'Slamet', 'Nur', 'Tri', 'Yuni', 'Hendra', 'Lestari', 'Purnomo', 'Wati']
const NAMA_BELAKANG = ['Santoso', 'Wijaya', 'Nugroho', 'Setiawan', 'Kusuma', 'Hartono', 'Prasetyo', 'Rahayu', 'Widodo', 'Saputra', 'Utami', 'Suryani', 'Firmansyah', 'Handoko']

const NAMA_WISATAWAN = [
  'Andi Prasetyo', 'Dewi Anggraini', 'Rizky Ramadhan', 'Putri Maharani', 'Fajar Nugroho',
  'Ayu Lestari', 'Bagus Wicaksono', 'Nadia Safitri', 'Reza Firmansyah', 'Intan Permatasari',
]

type FasilitasTpl = { nama: string; harga: number; satuan: string; manfaat: string }
const FASILITAS_PER_KATEGORI: Record<Kategori, FasilitasTpl[]> = {
  PANTAI: [
    { nama: 'Sewa Ban Pelampung', harga: 10000, satuan: 'per jam', manfaat: 'Aman untuk berenang di area dangkal, tersedia ukuran anak dan dewasa.' },
    { nama: 'Sewa Payung Pantai', harga: 20000, satuan: 'per hari', manfaat: 'Berteduh dari terik matahari sambil menikmati suasana pantai.' },
    { nama: 'Sewa Tikar Piknik', harga: 15000, satuan: 'per hari', manfaat: 'Alas duduk lesehan untuk keluarga di tepi pantai.' },
    { nama: 'Sewa Kano', harga: 50000, satuan: 'per jam', manfaat: 'Menyusuri garis pantai dengan kano dua penumpang.' },
    { nama: 'Bilas dan Ganti Baju', harga: 5000, satuan: 'per orang', manfaat: 'Kamar bilas air tawar bersih setelah bermain air.' },
  ],
  AIR_TERJUN: [
    { nama: 'Sewa Pelampung', harga: 10000, satuan: 'per jam', manfaat: 'Wajib dipakai saat berenang di kolam bawah air terjun.' },
    { nama: 'Sewa Loker Barang', harga: 5000, satuan: 'per hari', manfaat: 'Menyimpan tas dan gawai agar tetap kering dan aman.' },
    { nama: 'Sewa Dry Bag', harga: 20000, satuan: 'per hari', manfaat: 'Tas kedap air untuk membawa kamera dan ponsel.' },
    { nama: 'Sewa Sandal Gunung', harga: 15000, satuan: 'per hari', manfaat: 'Anti selip di jalur batu yang basah dan licin.' },
    { nama: 'Bilas dan Ganti Baju', harga: 5000, satuan: 'per orang', manfaat: 'Kamar bilas air bersih setelah bermain air.' },
  ],
  GUNUNG: [
    { nama: 'Sewa Headlamp', harga: 15000, satuan: 'per hari', manfaat: 'Penerangan wajib untuk pendakian dini hari mengejar sunrise.' },
    { nama: 'Sewa Jaket Gunung', harga: 25000, satuan: 'per hari', manfaat: 'Menahan angin dan suhu dingin di puncak.' },
    { nama: 'Sewa Tenda Dome', harga: 75000, satuan: 'per hari', manfaat: 'Tenda kapasitas 2-3 orang untuk bermalam di area camping.' },
    { nama: 'Sewa Sleeping Bag', harga: 25000, satuan: 'per hari', manfaat: 'Tidur tetap hangat saat camping di ketinggian.' },
    { nama: 'Sewa Trekking Pole', harga: 20000, satuan: 'per hari', manfaat: 'Meringankan beban lutut di jalur menanjak dan turunan.' },
  ],
  BUKIT: [
    { nama: 'Sewa Tikar Piknik', harga: 15000, satuan: 'per hari', manfaat: 'Alas duduk santai sambil menikmati panorama bukit.' },
    { nama: 'Sewa Hammock', harga: 20000, satuan: 'per hari', manfaat: 'Bersantai di antara pohon pinus sambil menunggu senja.' },
    { nama: 'Sewa Kursi Lipat', harga: 10000, satuan: 'per hari', manfaat: 'Duduk nyaman di spot terbuka tanpa kotor.' },
    { nama: 'Sewa Tenda Dome', harga: 75000, satuan: 'per hari', manfaat: 'Bermalam di area camping ground bukit.' },
    { nama: 'Sewa Binokular', harga: 20000, satuan: 'per jam', manfaat: 'Mengamati lanskap dan gunung di kejauhan lebih jelas.' },
  ],
  TEBING: [
    { nama: 'Sewa Helm Panjat', harga: 15000, satuan: 'per hari', manfaat: 'Pelindung kepala wajib saat aktivitas panjat tebing.' },
    { nama: 'Sewa Harness', harga: 25000, satuan: 'per hari', manfaat: 'Sabuk pengaman standar untuk pemanjatan.' },
    { nama: 'Sewa Sepatu Panjat', harga: 30000, satuan: 'per hari', manfaat: 'Cengkeraman maksimal di permukaan tebing.' },
    { nama: 'Sewa Tikar Piknik', harga: 15000, satuan: 'per hari', manfaat: 'Alas duduk menunggu giliran memanjat.' },
    { nama: 'Sewa Matras Bouldering', harga: 40000, satuan: 'per hari', manfaat: 'Bantalan pendaratan untuk latihan bouldering.' },
  ],
}

const LOKASI_FASILITAS = ['Dekat pintu masuk', 'Area parkir utama', 'Pos jaga', 'Sebelah warung utama', 'Loket tiket', 'Gazebo tengah']

type MenuTpl = { name: string; price: number }
const WARUNG_KULINER: { name: string; menus: MenuTpl[] }[] = [
  { name: 'Warung Makan Bu Painem', menus: [{ name: 'Nasi Pecel', price: 12000 }, { name: 'Soto Ayam', price: 15000 }, { name: 'Es Teh Manis', price: 5000 }, { name: 'Gorengan (5 pcs)', price: 8000 }] },
  { name: 'Warung Sea Food Pak Wagiman', menus: [{ name: 'Ikan Bakar', price: 35000 }, { name: 'Cumi Goreng Tepung', price: 30000 }, { name: 'Nasi Putih', price: 5000 }, { name: 'Es Kelapa Muda', price: 12000 }] },
  { name: 'Warung Sego Kucing Mbah Marto', menus: [{ name: 'Nasi Kucing', price: 4000 }, { name: 'Sate Usus', price: 3000 }, { name: 'Wedang Jahe', price: 6000 }, { name: 'Tempe Mendoan', price: 7000 }] },
  { name: 'Kedai Kopi Sunrise', menus: [{ name: 'Kopi Tubruk', price: 8000 }, { name: 'Kopi Susu Gula Aren', price: 15000 }, { name: 'Indomie Rebus', price: 10000 }, { name: 'Pisang Goreng', price: 10000 }] },
  { name: 'Warung Bakso Pak Slamet', menus: [{ name: 'Bakso Campur', price: 15000 }, { name: 'Mie Ayam', price: 13000 }, { name: 'Es Jeruk', price: 6000 }] },
  { name: 'Warung Gudeg Bu Tarmi', menus: [{ name: 'Gudeg Komplit', price: 20000 }, { name: 'Ayam Opor', price: 18000 }, { name: 'Teh Poci', price: 7000 }] },
  { name: 'Angkringan Mas Wahyu', menus: [{ name: 'Nasi Kucing Teri', price: 4000 }, { name: 'Sate Telur Puyuh', price: 3500 }, { name: 'Susu Jahe', price: 7000 }, { name: 'Bakwan Jagung', price: 3000 }] },
  { name: 'Warung Lotek Bu Sri', menus: [{ name: 'Lotek Sayur', price: 13000 }, { name: 'Gado-Gado', price: 14000 }, { name: 'Es Dawet', price: 8000 }] },
]
const WARUNG_KERAJINAN: { name: string; menus: MenuTpl[] }[] = [
  { name: 'Kerajinan Bambu Pak Sukirman', menus: [{ name: 'Anyaman Tas Bambu', price: 45000 }, { name: 'Kipas Bambu Ukir', price: 20000 }, { name: 'Tempat Tisu Anyaman', price: 30000 }] },
  { name: 'Souvenir Kerang Mbak Yani', menus: [{ name: 'Gelang Kerang', price: 15000 }, { name: 'Gantungan Kunci Kerang', price: 10000 }, { name: 'Hiasan Dinding Kerang', price: 60000 }] },
  { name: 'Galeri Gerabah Kasongan Mini', menus: [{ name: 'Vas Bunga Gerabah', price: 55000 }, { name: 'Celengan Gerabah', price: 25000 }, { name: 'Pot Mini Set', price: 40000 }] },
  { name: 'Ukiran Kayu Pak Darmaji', menus: [{ name: 'Miniatur Wayang', price: 75000 }, { name: 'Talenan Ukir', price: 50000 }, { name: 'Gantungan Kunci Kayu', price: 12000 }] },
]
const WARUNG_FASHION: { name: string; menus: MenuTpl[] }[] = [
  { name: 'Batik Tulis Mbok Ginem', menus: [{ name: 'Kain Batik Tulis', price: 150000 }, { name: 'Kaos Batik Cap', price: 85000 }, { name: 'Selendang Batik', price: 60000 }] },
  { name: 'Kaos Oleh-Oleh Jogja', menus: [{ name: 'Kaos Sablon Destinasi', price: 65000 }, { name: 'Topi Rimba', price: 45000 }, { name: 'Buff Multifungsi', price: 25000 }] },
  { name: 'Sandal Kulit Mas Tono', menus: [{ name: 'Sandal Kulit Pria', price: 120000 }, { name: 'Sandal Kulit Wanita', price: 110000 }, { name: 'Dompet Kulit', price: 90000 }] },
]
const WARUNG_JASA: { name: string; menus: MenuTpl[] }[] = [
  { name: 'Jasa Foto Prewedding Lensa Jogja', menus: [{ name: 'Paket Foto 1 Jam', price: 250000 }, { name: 'Paket Foto Setengah Hari', price: 600000 }, { name: 'Cetak Foto 10R', price: 35000 }] },
  { name: 'Jasa Dokumentasi Drone Mas Rendi', menus: [{ name: 'Video Drone 3 Menit', price: 350000 }, { name: 'Foto Udara (10 frame)', price: 200000 }] },
  { name: 'Penitipan Motor dan Helm Pak Slamet', menus: [{ name: 'Penitipan Motor Harian', price: 10000 }, { name: 'Penitipan Helm', price: 5000 }] },
]

const LOKASI_WARUNG = ['Dekat pintu masuk', 'Area parkir', 'Sebelah loket tiket', 'Pinggir jalur utama', 'Depan gazebo', 'Sekitar spot foto']

const PROVIDER_OJEK = ['Ojek Wisata Pak Karno', 'Ojek Lokal Mas Tarno', 'Ojek Pangkalan Pak Marno', 'Ojek Wisata Mas Yanto']
const PROVIDER_JEEP = ['Jeep Adventure Merapi Lestari', 'Jeep Wisata Sumber Rejeki', 'Jeep Off-Road Kali Kuning', 'Jeep Tour Manunggal']
const PROVIDER_GUIDE = ['Guide Lokal Pak Sutrisno', 'Pemandu Wisata Karang Taruna', 'Guide Trekking Mas Bagus', 'Pemandu Lokal Bu Warsi']

const TITIK_JEMPUT = ['Terminal Wonosari', 'Pasar Desa', 'Pertigaan Jalan Utama', 'Basecamp Pendakian', 'Balai Desa']

const CATATAN_LAPORAN: Record<RouteStatus, string[]> = {
  MUDAH: ['Jalan aspal mulus sampai parkiran, mobil sedan aman lewat.', 'Akses jalan bagus, motor matic tidak masalah.', 'Rute mudah dilalui, petunjuk arah sudah jelas.'],
  SEDANG: ['Jalan cor beton, ada beberapa lubang kecil tapi masih nyaman.', 'Sebagian jalan sempit, hati-hati kalau berpapasan mobil.', 'Aspal agak bergelombang di 2 km terakhir.'],
  SULIT: ['Tanjakan curam menjelang parkiran, motor matic sebaiknya berboncengan ringan.', 'Jalan berbatu dan sempit, disarankan pakai motor bebek atau trail.', 'Beberapa titik berpasir, perlu hati-hati saat hujan.'],
  RUSAK: ['Jalan berlubang parah sepanjang 1 km sebelum lokasi, pelan-pelan saja.', 'Aspal terkelupas dan berbatu, mobil rendah tidak disarankan.', 'Jalan rusak akibat longsor kecil, sudah ada jalur alternatif.'],
  BELUM_ADA_DATA: ['Belum sempat mencatat kondisi jalan secara detail.'],
}
const CATATAN_SINYAL: Record<SignalStrength, string> = {
  KUAT: 'Sinyal 4G penuh, bisa live streaming.',
  SEDANG: 'Sinyal cukup untuk chat, video call kadang putus.',
  LEMAH: 'Sinyal timbul tenggelam, siapkan peta offline.',
}
const CATATAN_RAMAI: Record<CrowdLevel, string> = {
  SEPI: 'Pengunjung sepi, parkiran masih longgar.',
  SEDANG: 'Cukup ramai tapi masih nyaman untuk foto.',
  PADAT: 'Sangat ramai, parkiran penuh dan antre di spot foto.',
}

const KOMENTAR_POSITIF = [
  'Pemandangannya luar biasa, sangat worth it untuk dikunjungi!',
  'Tempatnya bersih dan pengelola ramah. Bakal ke sini lagi.',
  'Spot fotonya banyak, cocok buat yang suka hunting foto.',
  'Suasananya tenang, pas untuk melepas penat dari kota.',
  'Harga tiket murah tapi fasilitasnya lengkap. Rekomendasi!',
  'Sunset di sini juara, jangan sampai kelewatan.',
  'Anak-anak senang banget main di sini, aman dan luas.',
  'Warung di sekitar lokasi murah dan enak, pelayanannya cepat.',
]
const KOMENTAR_NETRAL = [
  'Tempatnya bagus tapi toilet perlu diperbaiki dan diperbanyak.',
  'Pemandangan oke, sayang parkirannya sempit saat akhir pekan.',
  'Lumayan, tapi jalan menuju lokasi cukup rusak dan bikin capek.',
  'Cukup menarik, hanya saja tidak ada petunjuk arah yang jelas.',
  'Biasa saja, agak ramai dan antre lama di spot foto.',
  'Bagus, tapi sampah masih terlihat di beberapa sudut.',
]
const KOMENTAR_NEGATIF = [
  'Pungutan liar di parkiran bikin tidak nyaman, tolong ditertibkan.',
  'Toilet kotor dan tidak ada air. Sangat mengecewakan.',
  'Akses jalan rusak parah dan tidak ada penerangan sama sekali.',
]

// ---------------------------------------------------------------- Rencana (in-memory)

type Rencana = Awaited<ReturnType<typeof susunRencana>>

async function susunRencana() {
  const destinasi = await prisma.destination.findMany({
    where: { status: 'APPROVED' },
    select: { id: true, name: true, kategori: true, kabupaten: true, htmResmi: true, htmAnak: true, submittedById: true, latitude: true, longitude: true },
    orderBy: { createdAt: 'asc' },
  })
  if (destinasi.length === 0) throw new Error('Tidak ada destinasi APPROVED. Batal.')

  const wisatawanLama = await prisma.user.findMany({ where: { role: 'WISATAWAN' }, select: { id: true, name: true } })

  // Akun wisatawan dummy: dibuat hanya jika emailnya belum ada.
  const emails = NAMA_WISATAWAN.map((_, i) => `wisatawan${i + 1}@blusukan.id`)
  const sudahAda = await prisma.user.findMany({ where: { email: { in: emails } }, select: { id: true, email: true, name: true } })
  const emailSudahAda = new Set(sudahAda.map((u) => u.email))
  const userBaru = NAMA_WISATAWAN.map((name, i) => ({ name, email: emails[i] })).filter((u) => !emailSudahAda.has(u.email))

  return { destinasi, wisatawanLama, sudahAda, userBaru }
}

async function main() {
  const apply = process.argv.includes('--apply')
  const { destinasi, wisatawanLama, sudahAda, userBaru } = await susunRencana()

  console.log(`Destinasi APPROVED target: ${destinasi.length}`)
  console.log(`Akun WISATAWAN eksisting: ${wisatawanLama.length} | akun dummy baru dibuat: ${userBaru.length}\n`)

  // ---- Buat akun wisatawan dummy lebih dulu (dibutuhkan sebagai FK).
  // Nomor telepon digenerate di luar cabang `apply` agar aliran RNG identik
  // antara dry run dan eksekusi — ringkasan dry run harus persis sama dengan hasil insert.
  const userDummy = sudahAda.map((u) => ({ id: u.id, name: u.name }))
  const userBaruLengkap = userBaru.map((u) => ({ ...u, phone: `08${randInt(11, 89)}${randInt(10000000, 99999999)}` }))
  if (apply && userBaruLengkap.length > 0) {
    const passwordHash = await bcrypt.hash('Wisatawan123', 12)
    for (const u of userBaruLengkap) {
      const created = await prisma.user.create({
        data: { name: u.name, email: u.email, passwordHash, role: 'WISATAWAN', phone: u.phone },
        select: { id: true, name: true },
      })
      userDummy.push(created)
    }
  }

  // Kolam user untuk transaksi/laporan/review: dummy + wisatawan eksisting.
  const kolamUser = apply
    ? [...userDummy, ...wisatawanLama.filter((w) => !userDummy.some((d) => d.id === w.id))]
    : [...userDummy, ...wisatawanLama]

  if (apply && kolamUser.length === 0) throw new Error('Kolam user wisatawan kosong. Batal.')

  const hitung = { user: userBaru.length, fasilitas: 0, warung: 0, menu: 0, service: 0, titikJemput: 0, transaksi: 0, transaksiItem: 0, laporan: 0, review: 0, booking: 0, notifikasi: 0 }

  for (const dest of destinasi) {
    const htm = Number(dest.htmResmi) || 10000
    const pengelolaId = dest.submittedById

    // ---------------------------------------------------------- 1. FASILITAS
    const fasilitasTpl = pickMany(FASILITAS_PER_KATEGORI[dest.kategori as Kategori], randInt(2, 3))
    const fasilitasDibuat: { id: string; nama: string; harga: number }[] = []
    for (const f of fasilitasTpl) {
      const data = {
        destinationId: dest.id,
        nama: f.nama,
        hargaSewa: f.harga,
        satuanWaktu: f.satuan,
        jumlahUnit: randInt(5, 30),
        lokasiDalamDestinasi: pick(LOKASI_FASILITAS),
        deskripsiManfaat: f.manfaat,
      }
      if (apply) {
        const created = await prisma.fasilitas.create({ data, select: { id: true } })
        fasilitasDibuat.push({ id: created.id, nama: f.nama, harga: f.harga })
      } else {
        fasilitasDibuat.push({ id: 'dry', nama: f.nama, harga: f.harga })
      }
      hitung.fasilitas++
    }

    // ---------------------------------------------------------- 2. UMKM
    const jumlahWarung = randInt(1, 2)
    const menuDibuat: { warungId: string; name: string; price: number }[] = []
    for (let i = 0; i < jumlahWarung; i++) {
      const kategoriUmkm = weighted<KategoriUmkm>([['KULINER', 60], ['KERAJINAN', 18], ['FASHION', 12], ['JASA', 10]])
      const sumber = kategoriUmkm === 'KULINER' ? WARUNG_KULINER : kategoriUmkm === 'KERAJINAN' ? WARUNG_KERAJINAN : kategoriUmkm === 'FASHION' ? WARUNG_FASHION : WARUNG_JASA
      const tpl = pick(sumber)
      const menus = pickMany(tpl.menus, Math.min(tpl.menus.length, randInt(2, 4)))
      const data = {
        destinationId: dest.id,
        name: tpl.name,
        location: pick(LOKASI_WARUNG),
        kategori: kategoriUmkm,
        namaPemilik: `${pick(NAMA_DEPAN)} ${pick(NAMA_BELAKANG)}`,
        bisaBooking: rand() < 0.75,
      }
      let warungId = 'dry'
      if (apply) {
        const created = await prisma.localWarung.create({ data, select: { id: true } })
        warungId = created.id
        await prisma.menuItem.createMany({ data: menus.map((m) => ({ warungId, name: m.name, price: m.price })) })
      }
      menuDibuat.push(...menus.map((m) => ({ warungId, name: m.name, price: m.price })))
      hitung.warung++
      hitung.menu += menus.length
    }

    // ---------------------------------------------------------- 3. TRANSPORT
    const jumlahService = randInt(1, 2)
    const serviceDibuat: { id: string; providerName: string; serviceType: ServiceType }[] = []
    const tipeTersedia = pickMany<ServiceType>(['OJEK', 'JEEP', 'GUIDE'], jumlahService)
    for (const serviceType of tipeTersedia) {
      const providerName = serviceType === 'OJEK' ? pick(PROVIDER_OJEK) : serviceType === 'JEEP' ? pick(PROVIDER_JEEP) : pick(PROVIDER_GUIDE)
      const baseRate = serviceType === 'OJEK' ? randInt(3, 8) * 5000 : serviceType === 'JEEP' ? randInt(7, 15) * 25000 : randInt(3, 10) * 25000
      const data = {
        destinationId: dest.id,
        providerName,
        serviceType,
        contactWa: `08${randInt(11, 89)}${randInt(10000000, 99999999)}`,
        baseRate,
        kapasitasPenumpang: serviceType === 'OJEK' ? 1 : serviceType === 'JEEP' ? randInt(4, 6) : randInt(5, 15),
        isValidated: true,
        validatedById: pengelolaId,
      }
      const titik = pickMany(TITIK_JEMPUT, randInt(1, 2)).map((t) => ({
        namaLokasi: t,
        hargaTambahan: randInt(0, 4) * 5000,
        estimasiWaktu: `${randInt(10, 45)} menit`,
      }))
      if (apply) {
        const created = await prisma.localService.create({ data, select: { id: true } })
        serviceDibuat.push({ id: created.id, providerName, serviceType })
        await prisma.titikJemput.createMany({ data: titik.map((t) => ({ ...t, serviceId: created.id })) })
      } else {
        serviceDibuat.push({ id: 'dry', providerName, serviceType })
      }
      hitung.titikJemput += titik.length
      hitung.service++
    }

    // ---------------------------------------------------------- 4. TRANSAKSI
    const jumlahTransaksi = randInt(3, 8)
    for (let i = 0; i < jumlahTransaksi; i++) {
      const user = pick(kolamUser)
      const type = weighted<TransaksiType>([['TIKET_MASUK', 55], ['FASILITAS', 20], ['UMKM', 25]])
      const createdAt = tanggalCampuran()
      const status = weighted<TransaksiStatus>([['SELESAI', 60], ['DIKONFIRMASI', 20], ['PENDING', 15], ['DIBATALKAN', 5]])

      let items: { namaItem: string; hargaSatuan: number; kuantitas: number; subtotal: number }[] = []
      if (type === 'TIKET_MASUK') {
        const qty = randInt(1, 5)
        items = [{ namaItem: `Tiket Masuk ${dest.name}`, hargaSatuan: htm, kuantitas: qty, subtotal: htm * qty }]
        const htmAnak = dest.htmAnak != null ? Number(dest.htmAnak) : null
        if (htmAnak && htmAnak > 0 && rand() < 0.35) {
          const qtyAnak = randInt(1, 3)
          items.push({ namaItem: 'Tiket Masuk Anak', hargaSatuan: htmAnak, kuantitas: qtyAnak, subtotal: htmAnak * qtyAnak })
        }
      } else if (type === 'FASILITAS' && fasilitasDibuat.length > 0) {
        for (const f of pickMany(fasilitasDibuat, randInt(1, Math.min(2, fasilitasDibuat.length)))) {
          const qty = randInt(1, 4)
          items.push({ namaItem: f.nama, hargaSatuan: f.harga, kuantitas: qty, subtotal: f.harga * qty })
        }
      } else if (menuDibuat.length > 0) {
        for (const m of pickMany(menuDibuat, randInt(1, Math.min(3, menuDibuat.length)))) {
          const qty = randInt(1, 4)
          items.push({ namaItem: m.name, hargaSatuan: m.price, kuantitas: qty, subtotal: m.price * qty })
        }
      }
      if (items.length === 0) {
        const qty = randInt(1, 4)
        items = [{ namaItem: `Tiket Masuk ${dest.name}`, hargaSatuan: htm, kuantitas: qty, subtotal: htm * qty }]
      }
      const totalHarga = items.reduce((s, it) => s + it.subtotal, 0)

      let dikonfirmasiAt: Date | null = null
      let selesaiAt: Date | null = null
      let dibatalkanAt: Date | null = null
      if (status === 'SELESAI') {
        dikonfirmasiAt = tambahJam(createdAt, randInt(2, 48))
        selesaiAt = tambahJam(dikonfirmasiAt, randInt(24, 120))
      } else if (status === 'DIKONFIRMASI') {
        dikonfirmasiAt = tambahJam(createdAt, randInt(2, 36))
      } else if (status === 'DIBATALKAN') {
        dibatalkanAt = tambahJam(createdAt, randInt(1, 24))
      }

      const kodeTransaksi = generateKodeTransaksi()
      const paymentMethod = weighted([['COD', 70], ['TRANSFER_MANUAL', 30]] as const)
      const jadwal = tambahJam(createdAt, randInt(24, 240))
      hitung.transaksi++
      hitung.transaksiItem += items.length

      let transaksiId = 'dry'
      if (apply) {
        const created = await prisma.transaksi.create({
          data: {
            userId: user.id,
            destinationId: dest.id,
            type,
            totalHarga,
            status,
            paymentMethod,
            jadwal,
            kodeTransaksi,
            createdAt,
            updatedAt: selesaiAt ?? dikonfirmasiAt ?? dibatalkanAt ?? createdAt,
            dikonfirmasiAt,
            selesaiAt,
            dibatalkanAt,
            items: { create: items },
          },
          select: { id: true },
        })
        transaksiId = created.id
      }

      // ---- Notifikasi (sample ~35%)
      const kategoriNotif = type === 'TIKET_MASUK' ? 'TIKET' : type === 'FASILITAS' ? 'FASILITAS' : 'UMKM'
      const notifPengelola = rand() < 0.35
      const notifPengelolaRead = rand() < 0.5
      if (notifPengelola) {
        // ke Pengelola: pesanan baru masuk
        const namaItemNotif = items[0].namaItem
        if (apply) {
          await prisma.notifikasi.create({
            data: {
              userId: pengelolaId,
              judul: 'Pesanan Baru Masuk',
              pesan: `${user.name} memesan ${namaItemNotif} di ${dest.name}. Kode: ${kodeTransaksi}`,
              link: `/pengelola/destinasi/${dest.id}`,
              kategori: kategoriNotif,
              isRead: notifPengelolaRead,
              createdAt,
            },
          })
        }
        hitung.notifikasi++
      }
      const notifWisatawanRead = rand() < 0.6
      if (status !== 'PENDING' && rand() < 0.35) {
        // ke Wisatawan: perubahan status
        const konten =
          status === 'DIKONFIRMASI'
            ? { judul: 'Pesanan Dikonfirmasi', pesan: `Pesanan ${kodeTransaksi} di ${dest.name} telah dikonfirmasi oleh pengelola.`, at: dikonfirmasiAt! }
            : status === 'SELESAI'
              ? { judul: 'Kunjungan Selesai', pesan: `Terima kasih telah berkunjung ke ${dest.name}!`, at: selesaiAt! }
              : { judul: 'Pesanan Ditolak', pesan: `Pesanan ${kodeTransaksi} di ${dest.name} ditolak oleh pengelola.`, at: dibatalkanAt! }
        if (apply) {
          await prisma.notifikasi.create({
            data: {
              userId: user.id,
              judul: konten.judul,
              pesan: konten.pesan,
              link: `/transaksi/${transaksiId}`,
              kategori: kategoriNotif,
              isRead: notifWisatawanRead,
              createdAt: konten.at,
            },
          })
        }
        hitung.notifikasi++
      }
    }

    // ---------------------------------------------------------- 5. LAPORAN
    const jumlahLaporan = randInt(2, 5)
    for (let i = 0; i < jumlahLaporan; i++) {
      const user = pick(kolamUser)
      const roadCondition = weighted<RouteStatus>([['MUDAH', 40], ['SEDANG', 30], ['SULIT', 18], ['RUSAK', 12]])
      const signalStrength = weighted<SignalStrength>([['KUAT', 45], ['SEDANG', 35], ['LEMAH', 20]])
      const crowdLevel = weighted<CrowdLevel>([['SEDANG', 45], ['SEPI', 30], ['PADAT', 25]])
      const createdAt = tanggalCampuran()
      const notes = `${pick(CATATAN_LAPORAN[roadCondition])} ${CATATAN_SINYAL[signalStrength]} ${CATATAN_RAMAI[crowdLevel]}`
      const laporan = {
        userId: user.id,
        destinationId: dest.id,
        roadCondition,
        signalStrength,
        crowdLevel,
        toiletLayak: rand() < 0.7,
        parkirLayak: rand() < 0.8,
        tempatIbadahLayak: rand() < 0.65,
        tempatDudukLayak: rand() < 0.6,
        penitipanBarangLayak: rand() < 0.4,
        reportedFee: rand() < 0.6 ? htm : null,
        latitude: dest.latitude + (rand() - 0.5) * 0.002,
        longitude: dest.longitude + (rand() - 0.5) * 0.002,
        isVerified: rand() < 0.4,
        upvoteCount: randInt(0, 25),
        notes,
        createdAt,
      }

      if (apply) await prisma.userReport.create({ data: laporan })
      hitung.laporan++
    }

    // ---------------------------------------------------------- 6. REVIEW (unique [userId, destinationId])
    const jumlahReview = Math.min(randInt(3, 10), kolamUser.length)
    const pengulas = pickMany(kolamUser, jumlahReview)
    for (const user of pengulas) {
      const rating = weighted<number>([[5, 40], [4, 32], [3, 15], [2, 9], [1, 4]])
      const komentar = rating >= 4 ? pick(KOMENTAR_POSITIF) : rating === 3 ? pick(KOMENTAR_NETRAL) : pick(KOMENTAR_NEGATIF)
      const createdAt = tanggalCampuran()
      const buatNotif = rand() < 0.35
      const notifRead = rand() < 0.5

      if (apply) {
        // Lewati kalau user ini sudah pernah mengulas destinasi ini (data lama).
        const created = await prisma.review.createMany({
          data: [{ userId: user.id, destinationId: dest.id, rating, komentar, createdAt }],
          skipDuplicates: true,
        })
        if (created.count === 0) continue
        if (buatNotif) {
          await prisma.notifikasi.create({
            data: {
              userId: pengelolaId,
              judul: 'Ulasan Baru Masuk',
              pesan: `${user.name} memberi rating ${rating} bintang untuk ${dest.name}.`,
              link: `/pengelola/destinasi/${dest.id}`,
              kategori: 'REVIEW',
              isRead: notifRead,
              createdAt,
            },
          })
        }
      }
      if (buatNotif) hitung.notifikasi++
      hitung.review++
    }

    // ---------------------------------------------------------- 7. BOOKING
    if (serviceDibuat.length > 0) {
      const jumlahBooking = randInt(2, 4)
      for (let i = 0; i < jumlahBooking; i++) {
        const user = pick(kolamUser)
        const service = pick(serviceDibuat)
        const status = weighted<BookingStatus>([['COMPLETED', 45], ['CONFIRMED', 25], ['PENDING', 20], ['EXPIRED', 10]])
        const createdAt = tanggalCampuran()
        // PENDING/CONFIRMED -> tanggal perjalanan di masa depan; COMPLETED/EXPIRED -> masa lalu.
        const travelDate =
          status === 'PENDING' || status === 'CONFIRMED'
            ? new Date(NOW + randInt(1, 45) * HARI)
            : new Date(createdAt.getTime() + randInt(1, 20) * HARI)

        const booking = {
          userId: user.id,
          serviceId: service.id,
          destinationId: dest.id,
          travelDate,
          meetingPoint: pick(TITIK_JEMPUT),
          notes: rand() < 0.5 ? pick(['Rombongan keluarga 4 orang.', 'Mohon dijemput tepat waktu.', 'Bawa anak kecil, tolong pelan-pelan.', 'Rencana kejar sunrise.']) : null,
          contactNumber: `08${randInt(11, 89)}${randInt(10000000, 99999999)}`,
          estimatedArrivalTime: `${String(randInt(5, 16)).padStart(2, '0')}:${pick(['00', '15', '30', '45'])}`,
          status,
          createdAt,
        }
        const notifPengelola = rand() < 0.35
        const notifPengelolaRead = rand() < 0.5
        const notifWisatawan = status !== 'PENDING' && rand() < 0.35
        const notifWisatawanRead = rand() < 0.6
        const notifWisatawanAt = tambahJam(createdAt, randInt(2, 48))

        if (apply) {
          const created = await prisma.booking.create({ data: booking, select: { id: true } })

          if (notifPengelola) {
            await prisma.notifikasi.create({
              data: {
                userId: pengelolaId,
                judul: 'Booking Transport Baru',
                pesan: `${user.name} booking ${service.providerName} (${service.serviceType}) di ${dest.name} untuk tanggal ${travelDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}.`,
                link: `/pengelola/destinasi/${dest.id}`,
                kategori: 'TRANSPORT',
                isRead: notifPengelolaRead,
                createdAt,
              },
            })
          }
          if (notifWisatawan) {
            const konten =
              status === 'CONFIRMED'
                ? { judul: 'Booking Dikonfirmasi', pesan: `Booking transport Anda di ${dest.name} telah dikonfirmasi oleh pengelola.` }
                : status === 'COMPLETED'
                  ? { judul: 'Booking Selesai', pesan: `Terima kasih, booking transport Anda di ${dest.name} telah selesai.` }
                  : { judul: 'Booking Ditolak', pesan: `Booking transport Anda di ${dest.name} ditolak oleh pengelola.` }
            await prisma.notifikasi.create({
              data: {
                userId: user.id,
                judul: konten.judul,
                pesan: konten.pesan,
                link: `/booking/${created.id}`,
                kategori: 'TRANSPORT',
                isRead: notifWisatawanRead,
                createdAt: notifWisatawanAt,
              },
            })
          }
        }
        if (notifPengelola) hitung.notifikasi++
        if (notifWisatawan) hitung.notifikasi++
        hitung.booking++
      }
    }
  }

  const label = apply ? 'BERHASIL DIBUAT' : 'AKAN DIBUAT (dry run)'
  console.log(`=== RINGKASAN ${label} ===`)
  console.log(`  Akun wisatawan dummy : ${hitung.user}`)
  console.log(`  Destinasi terisi     : ${destinasi.length}`)
  console.log(`  Fasilitas            : ${hitung.fasilitas}`)
  console.log(`  UMKM (warung)        : ${hitung.warung}  (produk/menu: ${hitung.menu})`)
  console.log(`  Transport (service)  : ${hitung.service}  (titik jemput: ${hitung.titikJemput})`)
  console.log(`  Transaksi            : ${hitung.transaksi}  (item: ${hitung.transaksiItem})`)
  console.log(`  Laporan              : ${hitung.laporan}`)
  console.log(`  Review               : ${hitung.review}`)
  console.log(`  Booking              : ${hitung.booking}`)
  console.log(`  Notifikasi           : ${hitung.notifikasi}`)

  if (!apply) console.log('\nDRY RUN — belum ada data yang ditulis. Tambahkan --apply untuk eksekusi.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
