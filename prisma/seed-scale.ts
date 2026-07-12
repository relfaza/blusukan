/**
 * Scale-up data dummy Blusukan.
 *
 * Menambah (bukan mengganti) data di atas seed yang sudah ada:
 *  - Kunjungan 30 hari terakhir: top-1 destinasi ~1000, sisanya 900..100 menurun bertahap.
 *    "Kunjungan" = JUMLAH BARIS Transaksi {type: TIKET_MASUK, status: SELESAI, selesaiAt <= 30 hari},
 *    sesuai app/api/admin/kunjungan/route.ts yang memakai .length (bukan kuantitas tiket).
 *  - Pendapatan mengikuti htmResmi x kuantitas tiap transaksi, jadi konsisten by construction.
 *  - Fasilitas/UMKM/Transport di-top-up sampai memenuhi angka minimal.
 *  - Laporan/Review/Booking diskalakan proporsional terhadap kunjungan.
 *  - Sebaran tanggal: 75% transaksi di 6 bulan terakhir, 25% merata Jan 2021 -> sekarang.
 *
 *   npx tsx --env-file=.env prisma/seed-scale.ts             -> dry run
 *   npx tsx --env-file=.env prisma/seed-scale.ts --ringan    -> dry run profil ringan
 *   npx tsx --env-file=.env prisma/seed-scale.ts --apply     -> tulis ke database
 */
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import type { Kategori, RouteStatus, SignalStrength, CrowdLevel, ServiceType, KategoriUmkm, TransaksiStatus, TransaksiType, BookingStatus, PaymentMethod } from '../lib/generated/prisma/client'

// ---------------------------------------------------------------- Konfigurasi

const KUNJUNGAN_TOP = 1000
const KUNJUNGAN_MAX_LAIN = 900
const KUNJUNGAN_MIN = 100

/** Kunjungan bulan ke-2..6 sebagai rasio terhadap 30 hari terakhir (cerita platform yang tumbuh). */
const RAMP_PENUH = [0.72, 0.64, 0.57, 0.5, 0.44]
const RAMP_RINGAN = [0.36, 0.32, 0.28, 0.25, 0.22]
/** Transaksi non-backbone (FASILITAS/UMKM + status selain SELESAI) sebagai rasio dari backbone. */
const EXTRA_RATIO = 0.3
/** Porsi transaksi yang harus jatuh di 6 bulan terakhir. Sisanya merata Jan 2021 -> sekarang. */
const PORSI_6_BULAN = 0.75

const AWAL_HISTORIS = new Date('2021-01-01T00:00:00Z')
const TARGET_WISATAWAN = 200

// ---------------------------------------------------------------- RNG (seeded)

let rngState = 0x1f2e3d4c
function rand(): number {
  rngState = (rngState + 0x6d2b79f5) | 0
  let t = Math.imul(rngState ^ (rngState >>> 15), 1 | rngState)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min
const pick = <T,>(arr: readonly T[]): T => arr[randInt(0, arr.length - 1)]
function pickMany<T>(arr: readonly T[], n: number): T[] {
  const pool = [...arr]
  const out: T[] = []
  for (let i = 0; i < n && pool.length > 0; i++) out.push(...pool.splice(randInt(0, pool.length - 1), 1))
  return out
}
function weighted<T>(entries: readonly (readonly [T, number])[]): T {
  const total = entries.reduce((s, [, w]) => s + w, 0)
  let r = rand() * total
  for (const [v, w] of entries) {
    r -= w
    if (r <= 0) return v
  }
  return entries[entries.length - 1][0]
}

let idCounter = 0
/** Id gaya cuid: dipakai supaya baris bisa dibuat lewat createMany tapi tetap bisa direferensikan. */
function newId(): string {
  idCounter++
  return `c${Date.now().toString(36)}${idCounter.toString(36).padStart(4, '0')}${Math.floor(rand() * 1e10).toString(36)}`
}

const KODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const kodeTerpakai = new Set<string>()
function kodeTransaksi(): string {
  for (;;) {
    let s = ''
    for (let i = 0; i < 6; i++) s += KODE_CHARS[Math.floor(rand() * KODE_CHARS.length)]
    const kode = `BLS-${s}`
    if (!kodeTerpakai.has(kode)) {
      kodeTerpakai.add(kode)
      return kode
    }
  }
}

// ---------------------------------------------------------------- Waktu

const NOW = new Date()
const HARI = 24 * 60 * 60 * 1000
const jamAcak = () => randInt(6, 19) * 60 * 60 * 1000 + randInt(0, 59) * 60 * 1000

/** Tanggal acak `hariLalu` hari ke belakang, dengan jam wajar. */
function tanggalHariLalu(hariLalu: number): Date {
  const d = new Date(NOW.getTime() - hariLalu * HARI)
  d.setHours(0, 0, 0, 0)
  return new Date(d.getTime() + jamAcak())
}
/** Merata dari Jan 2021 sampai sekarang. */
function tanggalHistoris(): Date {
  const span = NOW.getTime() - AWAL_HISTORIS.getTime()
  const d = new Date(AWAL_HISTORIS.getTime() + rand() * span)
  d.setHours(0, 0, 0, 0)
  return new Date(d.getTime() + jamAcak())
}
const tambahJam = (d: Date, jam: number) => new Date(d.getTime() + jam * 60 * 60 * 1000)

// ---------------------------------------------------------------- Katalog

const NAMA_DEPAN = ['Budi', 'Sri', 'Agus', 'Rina', 'Dwi', 'Eko', 'Wahyu', 'Siti', 'Bambang', 'Retno', 'Joko', 'Endang', 'Slamet', 'Nur', 'Tri', 'Yuni', 'Hendra', 'Lestari', 'Purnomo', 'Wati', 'Andi', 'Dewi', 'Rizky', 'Putri', 'Fajar', 'Ayu', 'Bagus', 'Nadia', 'Reza', 'Intan', 'Galih', 'Sekar', 'Bayu', 'Ratna', 'Dimas', 'Anisa', 'Rifqi', 'Maya', 'Teguh', 'Hesti']
const NAMA_BELAKANG = ['Santoso', 'Wijaya', 'Nugroho', 'Setiawan', 'Kusuma', 'Hartono', 'Prasetyo', 'Rahayu', 'Widodo', 'Saputra', 'Utami', 'Suryani', 'Firmansyah', 'Handoko', 'Wibowo', 'Puspita', 'Ramadhan', 'Maharani', 'Anggraini', 'Permana', 'Susanto', 'Hidayat', 'Kurniawan', 'Safitri', 'Wicaksono']

type FasilitasTpl = { nama: string; harga: number; satuan: string; manfaat: string }
const FASILITAS_PER_KATEGORI: Record<Kategori, FasilitasTpl[]> = {
  PANTAI: [
    { nama: 'Sewa Ban Pelampung', harga: 10000, satuan: 'per jam', manfaat: 'Aman untuk berenang di area dangkal, tersedia ukuran anak dan dewasa.' },
    { nama: 'Sewa Payung Pantai', harga: 20000, satuan: 'per hari', manfaat: 'Berteduh dari terik matahari sambil menikmati suasana pantai.' },
    { nama: 'Sewa Tikar Piknik', harga: 15000, satuan: 'per hari', manfaat: 'Alas duduk lesehan untuk keluarga di tepi pantai.' },
    { nama: 'Sewa Kano', harga: 50000, satuan: 'per jam', manfaat: 'Menyusuri garis pantai dengan kano dua penumpang.' },
    { nama: 'Bilas dan Ganti Baju', harga: 5000, satuan: 'per orang', manfaat: 'Kamar bilas air tawar bersih setelah bermain air.' },
    { nama: 'Sewa Gazebo Keluarga', harga: 60000, satuan: 'per hari', manfaat: 'Saung beratap untuk rombongan keluarga, muat 8 orang.' },
    { nama: 'Sewa Papan Bodyboard', harga: 35000, satuan: 'per jam', manfaat: 'Bermain ombak di zona aman yang diawasi penjaga pantai.' },
    { nama: 'Sewa Loker Barang', harga: 5000, satuan: 'per hari', manfaat: 'Menyimpan tas dan gawai selama bermain air.' },
    { nama: 'Sewa Kursi Santai', harga: 15000, satuan: 'per hari', manfaat: 'Berjemur dan bersantai menghadap laut.' },
  ],
  AIR_TERJUN: [
    { nama: 'Sewa Pelampung', harga: 10000, satuan: 'per jam', manfaat: 'Wajib dipakai saat berenang di kolam bawah air terjun.' },
    { nama: 'Sewa Loker Barang', harga: 5000, satuan: 'per hari', manfaat: 'Menyimpan tas dan gawai agar tetap kering dan aman.' },
    { nama: 'Sewa Dry Bag', harga: 20000, satuan: 'per hari', manfaat: 'Tas kedap air untuk membawa kamera dan ponsel.' },
    { nama: 'Sewa Sandal Gunung', harga: 15000, satuan: 'per hari', manfaat: 'Anti selip di jalur batu yang basah dan licin.' },
    { nama: 'Bilas dan Ganti Baju', harga: 5000, satuan: 'per orang', manfaat: 'Kamar bilas air bersih setelah bermain air.' },
    { nama: 'Sewa Helm Body Rafting', harga: 20000, satuan: 'per hari', manfaat: 'Pelindung kepala saat menyusuri aliran sungai berbatu.' },
    { nama: 'Sewa Jaket Pelampung Anak', harga: 12000, satuan: 'per jam', manfaat: 'Ukuran khusus anak, standar keamanan pengelola.' },
    { nama: 'Sewa Sepatu Air', harga: 18000, satuan: 'per hari', manfaat: 'Melindungi kaki dari batu tajam di dasar kolam.' },
    { nama: 'Jasa Pemandu Kolam', harga: 40000, satuan: 'per jam', manfaat: 'Pendampingan pengunjung di titik air dalam.' },
  ],
  GUNUNG: [
    { nama: 'Sewa Headlamp', harga: 15000, satuan: 'per hari', manfaat: 'Penerangan wajib untuk pendakian dini hari mengejar sunrise.' },
    { nama: 'Sewa Jaket Gunung', harga: 25000, satuan: 'per hari', manfaat: 'Menahan angin dan suhu dingin di puncak.' },
    { nama: 'Sewa Tenda Dome', harga: 75000, satuan: 'per hari', manfaat: 'Tenda kapasitas 2-3 orang untuk bermalam di area camping.' },
    { nama: 'Sewa Sleeping Bag', harga: 25000, satuan: 'per hari', manfaat: 'Tidur tetap hangat saat camping di ketinggian.' },
    { nama: 'Sewa Trekking Pole', harga: 20000, satuan: 'per hari', manfaat: 'Meringankan beban lutut di jalur menanjak dan turunan.' },
    { nama: 'Sewa Kompor Portable', harga: 30000, satuan: 'per hari', manfaat: 'Memasak air panas dan mi di area camping.' },
    { nama: 'Sewa Carrier 60L', harga: 40000, satuan: 'per hari', manfaat: 'Tas gunung berkapasitas besar untuk perlengkapan bermalam.' },
    { nama: 'Sewa Matras Camping', harga: 12000, satuan: 'per hari', manfaat: 'Alas tidur agar punggung tidak langsung kena tanah dingin.' },
    { nama: 'Sewa Sarung Tangan Gunung', harga: 10000, satuan: 'per hari', manfaat: 'Melindungi tangan saat scrambling di jalur batu.' },
  ],
  BUKIT: [
    { nama: 'Sewa Tikar Piknik', harga: 15000, satuan: 'per hari', manfaat: 'Alas duduk santai sambil menikmati panorama bukit.' },
    { nama: 'Sewa Hammock', harga: 20000, satuan: 'per hari', manfaat: 'Bersantai di antara pohon pinus sambil menunggu senja.' },
    { nama: 'Sewa Kursi Lipat', harga: 10000, satuan: 'per hari', manfaat: 'Duduk nyaman di spot terbuka tanpa kotor.' },
    { nama: 'Sewa Tenda Dome', harga: 75000, satuan: 'per hari', manfaat: 'Bermalam di area camping ground bukit.' },
    { nama: 'Sewa Binokular', harga: 20000, satuan: 'per jam', manfaat: 'Mengamati lanskap dan gunung di kejauhan lebih jelas.' },
    { nama: 'Sewa Gazebo Pandang', harga: 50000, satuan: 'per hari', manfaat: 'Saung beratap di titik pandang terbaik, muat 6 orang.' },
    { nama: 'Sewa Payung Camping', harga: 15000, satuan: 'per hari', manfaat: 'Melindungi dari gerimis dan terik saat menunggu sunset.' },
    { nama: 'Sewa Kamera Instan', harga: 45000, satuan: 'per jam', manfaat: 'Cetak foto langsung di spot foto bukit.' },
    { nama: 'Sewa Api Unggun Set', harga: 65000, satuan: 'per hari', manfaat: 'Paket kayu bakar dan tungku untuk malam camping.' },
  ],
  TEBING: [
    { nama: 'Sewa Helm Panjat', harga: 15000, satuan: 'per hari', manfaat: 'Pelindung kepala wajib saat aktivitas panjat tebing.' },
    { nama: 'Sewa Harness', harga: 25000, satuan: 'per hari', manfaat: 'Sabuk pengaman standar untuk pemanjatan.' },
    { nama: 'Sewa Sepatu Panjat', harga: 30000, satuan: 'per hari', manfaat: 'Cengkeraman maksimal di permukaan tebing.' },
    { nama: 'Sewa Tikar Piknik', harga: 15000, satuan: 'per hari', manfaat: 'Alas duduk menunggu giliran memanjat.' },
    { nama: 'Sewa Matras Bouldering', harga: 40000, satuan: 'per hari', manfaat: 'Bantalan pendaratan untuk latihan bouldering.' },
    { nama: 'Sewa Tali Karmantel', harga: 50000, satuan: 'per hari', manfaat: 'Tali dinamis standar keamanan untuk jalur panjat.' },
    { nama: 'Sewa Chalk Bag', harga: 10000, satuan: 'per hari', manfaat: 'Menjaga tangan tetap kering saat memanjat.' },
    { nama: 'Jasa Instruktur Panjat', harga: 100000, satuan: 'per jam', manfaat: 'Pendampingan instruktur bersertifikat untuk pemula.' },
    { nama: 'Sewa Gazebo Panggung', harga: 55000, satuan: 'per hari', manfaat: 'Tempat istirahat kelompok menghadap tebing.' },
  ],
}
const LOKASI_FASILITAS = ['Dekat pintu masuk', 'Area parkir utama', 'Pos jaga', 'Sebelah warung utama', 'Loket tiket', 'Gazebo tengah', 'Dekat titik pandang']

type WarungTpl = { name: string; menus: { name: string; price: number }[] }
const WARUNG: Record<KategoriUmkm, WarungTpl[]> = {
  KULINER: [
    { name: 'Warung Makan Bu Painem', menus: [{ name: 'Nasi Pecel', price: 12000 }, { name: 'Soto Ayam', price: 15000 }, { name: 'Es Teh Manis', price: 5000 }, { name: 'Gorengan (5 pcs)', price: 8000 }, { name: 'Nasi Rames', price: 15000 }, { name: 'Es Jeruk', price: 6000 }] },
    { name: 'Warung Sea Food Pak Wagiman', menus: [{ name: 'Ikan Bakar', price: 35000 }, { name: 'Cumi Goreng Tepung', price: 30000 }, { name: 'Nasi Putih', price: 5000 }, { name: 'Es Kelapa Muda', price: 12000 }, { name: 'Udang Asam Manis', price: 40000 }, { name: 'Sambal Terasi', price: 5000 }] },
    { name: 'Warung Sego Kucing Mbah Marto', menus: [{ name: 'Nasi Kucing', price: 4000 }, { name: 'Sate Usus', price: 3000 }, { name: 'Wedang Jahe', price: 6000 }, { name: 'Tempe Mendoan', price: 7000 }, { name: 'Sate Telur Puyuh', price: 3500 }, { name: 'Teh Poci', price: 7000 }] },
    { name: 'Kedai Kopi Sunrise', menus: [{ name: 'Kopi Tubruk', price: 8000 }, { name: 'Kopi Susu Gula Aren', price: 15000 }, { name: 'Indomie Rebus', price: 10000 }, { name: 'Pisang Goreng', price: 10000 }, { name: 'Roti Bakar', price: 12000 }, { name: 'Cappuccino', price: 18000 }] },
    { name: 'Warung Bakso Pak Slamet', menus: [{ name: 'Bakso Campur', price: 15000 }, { name: 'Mie Ayam', price: 13000 }, { name: 'Es Jeruk', price: 6000 }, { name: 'Bakso Urat', price: 18000 }, { name: 'Pangsit Goreng', price: 8000 }] },
    { name: 'Warung Gudeg Bu Tarmi', menus: [{ name: 'Gudeg Komplit', price: 20000 }, { name: 'Ayam Opor', price: 18000 }, { name: 'Teh Poci', price: 7000 }, { name: 'Krecek Pedas', price: 8000 }, { name: 'Nasi Gudeg Telur', price: 16000 }] },
    { name: 'Angkringan Mas Wahyu', menus: [{ name: 'Nasi Kucing Teri', price: 4000 }, { name: 'Sate Telur Puyuh', price: 3500 }, { name: 'Susu Jahe', price: 7000 }, { name: 'Bakwan Jagung', price: 3000 }, { name: 'Kopi Joss', price: 8000 }] },
    { name: 'Warung Lotek Bu Sri', menus: [{ name: 'Lotek Sayur', price: 13000 }, { name: 'Gado-Gado', price: 14000 }, { name: 'Es Dawet', price: 8000 }, { name: 'Pecel Lele', price: 17000 }, { name: 'Es Cendol', price: 9000 }] },
    { name: 'Warung Sate Klathak Pak Nardi', menus: [{ name: 'Sate Klathak', price: 30000 }, { name: 'Tongseng Kambing', price: 28000 }, { name: 'Nasi Putih', price: 5000 }, { name: 'Es Teh Tawar', price: 4000 }, { name: 'Gulai Kambing', price: 30000 }] },
    { name: 'Warung Mie Jawa Mbah Legi', menus: [{ name: 'Mie Godog', price: 16000 }, { name: 'Mie Goreng Jawa', price: 16000 }, { name: 'Magelangan', price: 17000 }, { name: 'Wedang Uwuh', price: 8000 }, { name: 'Teh Tubruk', price: 5000 }] },
  ],
  KERAJINAN: [
    { name: 'Kerajinan Bambu Pak Sukirman', menus: [{ name: 'Anyaman Tas Bambu', price: 45000 }, { name: 'Kipas Bambu Ukir', price: 20000 }, { name: 'Tempat Tisu Anyaman', price: 30000 }, { name: 'Lampu Hias Bambu', price: 85000 }, { name: 'Tempat Pensil Bambu', price: 18000 }] },
    { name: 'Souvenir Kerang Mbak Yani', menus: [{ name: 'Gelang Kerang', price: 15000 }, { name: 'Gantungan Kunci Kerang', price: 10000 }, { name: 'Hiasan Dinding Kerang', price: 60000 }, { name: 'Kalung Kerang', price: 25000 }, { name: 'Tirai Kerang', price: 95000 }] },
    { name: 'Galeri Gerabah Kasongan Mini', menus: [{ name: 'Vas Bunga Gerabah', price: 55000 }, { name: 'Celengan Gerabah', price: 25000 }, { name: 'Pot Mini Set', price: 40000 }, { name: 'Guci Hias Kecil', price: 75000 }, { name: 'Cangkir Tanah Liat', price: 20000 }] },
    { name: 'Ukiran Kayu Pak Darmaji', menus: [{ name: 'Miniatur Wayang', price: 75000 }, { name: 'Talenan Ukir', price: 50000 }, { name: 'Gantungan Kunci Kayu', price: 12000 }, { name: 'Topeng Kayu', price: 90000 }, { name: 'Asbak Kayu Jati', price: 35000 }] },
    { name: 'Batik Kayu Krebet Bu Wasih', menus: [{ name: 'Topeng Batik Kayu', price: 110000 }, { name: 'Nampan Batik Kayu', price: 70000 }, { name: 'Gantungan Batik Kayu', price: 15000 }, { name: 'Kotak Perhiasan Batik', price: 85000 }] },
  ],
  FASHION: [
    { name: 'Batik Tulis Mbok Ginem', menus: [{ name: 'Kain Batik Tulis', price: 150000 }, { name: 'Kaos Batik Cap', price: 85000 }, { name: 'Selendang Batik', price: 60000 }, { name: 'Kemeja Batik Pria', price: 175000 }, { name: 'Blouse Batik Wanita', price: 165000 }] },
    { name: 'Kaos Oleh-Oleh Jogja', menus: [{ name: 'Kaos Sablon Destinasi', price: 65000 }, { name: 'Topi Rimba', price: 45000 }, { name: 'Buff Multifungsi', price: 25000 }, { name: 'Jaket Hoodie Jogja', price: 145000 }, { name: 'Totebag Kanvas', price: 40000 }] },
    { name: 'Sandal Kulit Mas Tono', menus: [{ name: 'Sandal Kulit Pria', price: 120000 }, { name: 'Sandal Kulit Wanita', price: 110000 }, { name: 'Dompet Kulit', price: 90000 }, { name: 'Ikat Pinggang Kulit', price: 95000 }] },
    { name: 'Tenun Lurik Bu Marsini', menus: [{ name: 'Kain Lurik Meteran', price: 95000 }, { name: 'Outer Lurik', price: 160000 }, { name: 'Syal Lurik', price: 55000 }, { name: 'Tas Lurik', price: 85000 }] },
  ],
  JASA: [
    { name: 'Jasa Foto Prewedding Lensa Jogja', menus: [{ name: 'Paket Foto 1 Jam', price: 250000 }, { name: 'Paket Foto Setengah Hari', price: 600000 }, { name: 'Cetak Foto 10R', price: 35000 }, { name: 'Paket Foto Keluarga', price: 400000 }] },
    { name: 'Jasa Dokumentasi Drone Mas Rendi', menus: [{ name: 'Video Drone 3 Menit', price: 350000 }, { name: 'Foto Udara (10 frame)', price: 200000 }, { name: 'Paket Video Reels', price: 275000 }] },
    { name: 'Penitipan Motor dan Helm Pak Slamet', menus: [{ name: 'Penitipan Motor Harian', price: 10000 }, { name: 'Penitipan Helm', price: 5000 }, { name: 'Cuci Motor Kilat', price: 20000 }] },
    { name: 'Jasa Pijat Refleksi Bu Darmi', menus: [{ name: 'Pijat Kaki 30 Menit', price: 45000 }, { name: 'Pijat Punggung 45 Menit', price: 65000 }, { name: 'Kerokan Tradisional', price: 35000 }] },
  ],
  LAINNYA: [
    { name: 'Kios Serba Ada Bu Yatmi', menus: [{ name: 'Air Mineral 600ml', price: 5000 }, { name: 'Jas Hujan Plastik', price: 15000 }, { name: 'Tisu Basah', price: 8000 }, { name: 'Obat Nyamuk Oles', price: 12000 }] },
  ],
}
const LOKASI_WARUNG = ['Dekat pintu masuk', 'Area parkir', 'Sebelah loket tiket', 'Pinggir jalur utama', 'Depan gazebo', 'Sekitar spot foto', 'Deretan kios utama']

const PROVIDER: Record<ServiceType, string[]> = {
  OJEK: ['Ojek Wisata Pak Karno', 'Ojek Lokal Mas Tarno', 'Ojek Pangkalan Pak Marno', 'Ojek Wisata Mas Yanto', 'Ojek Desa Pak Sarno', 'Ojek Antar Jemput Mas Budi'],
  JEEP: ['Jeep Adventure Merapi Lestari', 'Jeep Wisata Sumber Rejeki', 'Jeep Off-Road Kali Kuning', 'Jeep Tour Manunggal', 'Jeep Lava Tour Sejahtera', 'Jeep Wisata Karang Taruna'],
  GUIDE: ['Guide Lokal Pak Sutrisno', 'Pemandu Wisata Karang Taruna', 'Guide Trekking Mas Bagus', 'Pemandu Lokal Bu Warsi', 'Guide Susur Gua Pak Tukiman', 'Pemandu Sunrise Mas Anto'],
}
const TITIK_JEMPUT = ['Terminal Wonosari', 'Pasar Desa', 'Pertigaan Jalan Utama', 'Basecamp Pendakian', 'Balai Desa', 'Stasiun Wates', 'Alun-Alun Kota', 'Pos Retribusi']

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
  'Parkiran luas dan petugasnya sigap. Nyaman buat rombongan.',
  'Udaranya sejuk, jalurnya juga sudah tertata rapi.',
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
const CATATAN_BOOKING = ['Rombongan keluarga 4 orang.', 'Mohon dijemput tepat waktu.', 'Bawa anak kecil, tolong pelan-pelan.', 'Rencana kejar sunrise.', 'Bawa banyak barang, mohon kendaraan yang muat.']

/** Destinasi yang paling dikenal publik didahulukan saat menentukan peringkat kunjungan. */
const URUTAN_POPULARITAS = [
  'Tebing Breksi', 'Gunung Api Purba Nglanggeran', 'Pantai Baron', 'Pantai Sundak', 'Puncak Pinus Becici',
  'Bukit Bintang', 'Bukit Klangon', 'Pantai Drini', 'Air Terjun Lepo', 'Bukit Paralayang Watugupit',
  'Gunung Ireng', 'Pantai Pandansari', 'Air Terjun Kembang Soka', 'Puncak Segoro', 'Gunung Gambar',
]

// ---------------------------------------------------------------- Tipe baris

type BarisTransaksi = { id: string; userId: string; destinationId: string; type: TransaksiType; totalHarga: number; status: TransaksiStatus; paymentMethod: PaymentMethod; jadwal: Date; kodeTransaksi: string; createdAt: Date; updatedAt: Date; dikonfirmasiAt: Date | null; selesaiAt: Date | null; dibatalkanAt: Date | null }
type BarisItem = { id: string; transaksiId: string; namaItem: string; hargaSatuan: number; kuantitas: number; subtotal: number }

async function main() {
  const apply = process.argv.includes('--apply')
  const ringan = process.argv.includes('--ringan')
  const RAMP = ringan ? RAMP_RINGAN : RAMP_PENUH

  const destinasi = await prisma.destination.findMany({
    where: { status: 'APPROVED' },
    select: { id: true, name: true, kategori: true, htmResmi: true, htmAnak: true, submittedById: true, latitude: true, longitude: true },
  })

  // ---- Peringkat popularitas: nama terkenal dulu, sisanya urut abjad (stabil & bisa direview)
  const peringkat = [...destinasi].sort((a, b) => {
    const ia = URUTAN_POPULARITAS.indexOf(a.name)
    const ib = URUTAN_POPULARITAS.indexOf(b.name)
    const ra = ia === -1 ? 999 : ia
    const rb = ib === -1 ? 999 : ib
    return ra !== rb ? ra - rb : a.name.localeCompare(b.name)
  })

  const n = peringkat.length
  const targetKunjungan = new Map<string, number>()
  peringkat.forEach((d, i) => {
    if (i === 0) {
      targetKunjungan.set(d.id, KUNJUNGAN_TOP)
      return
    }
    // Turun bertahap dari KUNJUNGAN_MAX_LAIN ke KUNJUNGAN_MIN, tidak ada yang di bawah minimum.
    const step = n > 2 ? (KUNJUNGAN_MAX_LAIN - KUNJUNGAN_MIN) / (n - 2) : 0
    const nilai = Math.round(KUNJUNGAN_MAX_LAIN - step * (i - 1))
    targetKunjungan.set(d.id, Math.max(KUNJUNGAN_MIN, nilai))
  })

  // ---- Data eksisting yang ikut dihitung ke target
  const sejak30 = new Date(NOW.getTime() - 30 * HARI)
  const existing = new Map<string, { kunjungan30: number; fasilitas: string[]; warung: { id: string; name: string; menu: number }[]; service: { id: string; providerName: string; serviceType: ServiceType; titik: number }[]; reviewUserIds: string[]; laporan: number; booking: number }>()

  for (const d of destinasi) {
    const [k30, fas, war, svc, rev, rep, bok] = await Promise.all([
      prisma.transaksi.count({ where: { destinationId: d.id, type: 'TIKET_MASUK', status: 'SELESAI', selesaiAt: { gte: sejak30 } } }),
      prisma.fasilitas.findMany({ where: { destinationId: d.id }, select: { nama: true } }),
      prisma.localWarung.findMany({ where: { destinationId: d.id }, select: { id: true, name: true, _count: { select: { menuItems: true } } } }),
      prisma.localService.findMany({ where: { destinationId: d.id }, select: { id: true, providerName: true, serviceType: true, _count: { select: { titikJemput: true } } } }),
      prisma.review.findMany({ where: { destinationId: d.id }, select: { userId: true } }),
      prisma.userReport.count({ where: { destinationId: d.id } }),
      prisma.booking.count({ where: { destinationId: d.id } }),
    ])
    existing.set(d.id, {
      kunjungan30: k30,
      fasilitas: fas.map((f) => f.nama),
      warung: war.map((w) => ({ id: w.id, name: w.name, menu: w._count.menuItems })),
      service: svc.map((s) => ({ id: s.id, providerName: s.providerName, serviceType: s.serviceType, titik: s._count.titikJemput })),
      reviewUserIds: rev.map((r) => r.userId),
      laporan: rep,
      booking: bok,
    })
  }

  // ---- Kolam wisatawan (dibuat dulu kalau perlu, karena jadi FK)
  const wisatawanLama = await prisma.user.findMany({ where: { role: 'WISATAWAN' }, select: { id: true, name: true } })
  const emailDipakai = new Set((await prisma.user.findMany({ select: { email: true } })).map((u) => u.email))
  const userBaru: { id: string; name: string; email: string; phone: string }[] = []
  for (let i = 1; userBaru.length + wisatawanLama.length < TARGET_WISATAWAN && i < 1000; i++) {
    const email = `wisatawan${i}@blusukan.id`
    if (emailDipakai.has(email)) continue
    userBaru.push({ id: newId(), name: `${pick(NAMA_DEPAN)} ${pick(NAMA_BELAKANG)}`, email, phone: `08${randInt(11, 89)}${randInt(10000000, 99999999)}` })
  }

  if (apply && userBaru.length > 0) {
    // Satu hash dipakai ulang: password dummy sama untuk semua akun seed, hemat ~190x bcrypt cost 12.
    const passwordHash = await bcrypt.hash('Wisatawan123', 12)
    await prisma.user.createMany({
      data: userBaru.map((u) => ({ id: u.id, name: u.name, email: u.email, phone: u.phone, passwordHash, role: 'WISATAWAN' as const })),
    })
  }
  const kolamUser = [...wisatawanLama, ...userBaru.map((u) => ({ id: u.id, name: u.name }))]

  // ---------------------------------------------------------------- Susun semua baris

  const rowsFasilitas: { id: string; destinationId: string; nama: string; hargaSewa: number; satuanWaktu: string; jumlahUnit: number; lokasiDalamDestinasi: string; deskripsiManfaat: string }[] = []
  const rowsWarung: { id: string; destinationId: string; name: string; location: string; kategori: KategoriUmkm; namaPemilik: string; bisaBooking: boolean }[] = []
  const rowsMenu: { id: string; warungId: string; name: string; price: number }[] = []
  const rowsService: { id: string; destinationId: string; providerName: string; serviceType: ServiceType; contactWa: string; baseRate: number; kapasitasPenumpang: number; isValidated: boolean; validatedById: string }[] = []
  const rowsTitik: { id: string; serviceId: string; namaLokasi: string; hargaTambahan: number; estimasiWaktu: string }[] = []
  const rowsTransaksi: BarisTransaksi[] = []
  const rowsItem: BarisItem[] = []
  const rowsLaporan: Record<string, unknown>[] = []
  const rowsReview: { id: string; userId: string; destinationId: string; rating: number; komentar: string; createdAt: Date }[] = []
  const rowsBooking: { id: string; userId: string; serviceId: string; destinationId: string; travelDate: Date; meetingPoint: string; notes: string | null; contactNumber: string; estimatedArrivalTime: string; status: BookingStatus; createdAt: Date }[] = []
  const rowsNotif: { id: string; userId: string; judul: string; pesan: string; link: string; kategori: string; isRead: boolean; createdAt: Date }[] = []

  const perDestinasi: { name: string; kunjungan30: number; pendapatan30: number; transaksi: number; fasilitas: number; umkm: number; transport: number; review: number; laporan: number; booking: number }[] = []

  for (const dest of peringkat) {
    const ex = existing.get(dest.id)!
    const base = targetKunjungan.get(dest.id)!
    const htm = Number(dest.htmResmi) || 10000
    const htmAnak = dest.htmAnak != null ? Number(dest.htmAnak) : null
    const pengelolaId = dest.submittedById
    const populer = base >= 700

    // ---- 3. FASILITAS: top-up ke 4-6 (populer 5-7), nama unik per destinasi
    const targetFasilitas = randInt(4, 6) + (populer ? 1 : 0)
    const namaTerpakai = new Set(ex.fasilitas)
    const tersedia = FASILITAS_PER_KATEGORI[dest.kategori as Kategori].filter((f) => !namaTerpakai.has(f.nama))
    const fasilitasBaru = pickMany(tersedia, Math.max(0, targetFasilitas - ex.fasilitas.length))
    for (const f of fasilitasBaru) {
      rowsFasilitas.push({
        id: newId(),
        destinationId: dest.id,
        nama: f.nama,
        hargaSewa: f.harga,
        satuanWaktu: f.satuan,
        jumlahUnit: randInt(5, 40),
        lokasiDalamDestinasi: pick(LOKASI_FASILITAS),
        deskripsiManfaat: f.manfaat,
      })
    }
    // Semua fasilitas (lama + baru) jadi kandidat item transaksi FASILITAS.
    const katalogFasilitas = [
      ...fasilitasBaru.map((f) => ({ nama: f.nama, harga: f.harga })),
      ...FASILITAS_PER_KATEGORI[dest.kategori as Kategori].filter((f) => namaTerpakai.has(f.nama)).map((f) => ({ nama: f.nama, harga: f.harga })),
    ]

    // ---- 3. UMKM: top-up ke 3-5 (populer 4-6), tiap warung 3-6 produk
    const targetWarung = randInt(3, 5) + (populer ? 1 : 0)
    const warungTerpakai = new Set(ex.warung.map((w) => w.name))
    const katalogMenu: { name: string; price: number }[] = []

    // Warung lama yang produknya kurang dari 3 ikut ditambah.
    for (const w of ex.warung) {
      if (w.menu >= 3) continue
      const tpl = Object.values(WARUNG).flat().find((t) => t.name === w.name)
      const tambahan = tpl ? pickMany(tpl.menus, 3 - w.menu) : []
      for (const m of tambahan) rowsMenu.push({ id: newId(), warungId: w.id, name: m.name, price: m.price })
    }

    for (let i = ex.warung.length; i < targetWarung; i++) {
      const kategoriUmkm = weighted<KategoriUmkm>([['KULINER', 58], ['KERAJINAN', 18], ['FASHION', 12], ['JASA', 12]])
      const kandidat = WARUNG[kategoriUmkm].filter((w) => !warungTerpakai.has(w.name))
      if (kandidat.length === 0) continue
      const tpl = pick(kandidat)
      warungTerpakai.add(tpl.name)
      const warungId = newId()
      rowsWarung.push({
        id: warungId,
        destinationId: dest.id,
        name: tpl.name,
        location: pick(LOKASI_WARUNG),
        kategori: kategoriUmkm,
        namaPemilik: `${pick(NAMA_DEPAN)} ${pick(NAMA_BELAKANG)}`,
        bisaBooking: rand() < 0.75,
      })
      const menus = pickMany(tpl.menus, Math.min(tpl.menus.length, randInt(3, 6)))
      for (const m of menus) {
        rowsMenu.push({ id: newId(), warungId, name: m.name, price: m.price })
        katalogMenu.push(m)
      }
    }
    if (katalogMenu.length === 0) katalogMenu.push(...WARUNG.KULINER[0].menus.slice(0, 3))

    // ---- 3. TRANSPORT: top-up ke 2-4 (populer 3-5), tiap jasa 2-3 titik jemput
    const targetService = randInt(2, 4) + (populer ? 1 : 0)
    const providerTerpakai = new Set(ex.service.map((s) => s.providerName))
    const serviceKandidat: { id: string; providerName: string; serviceType: ServiceType }[] = ex.service.map((s) => ({ id: s.id, providerName: s.providerName, serviceType: s.serviceType }))

    // Titik jemput jasa lama di-top-up ke minimal 2.
    for (const s of ex.service) {
      for (let t = s.titik; t < 2; t++) {
        rowsTitik.push({ id: newId(), serviceId: s.id, namaLokasi: pick(TITIK_JEMPUT), hargaTambahan: randInt(0, 4) * 5000, estimasiWaktu: `${randInt(10, 45)} menit` })
      }
    }

    for (let i = ex.service.length; i < targetService; i++) {
      const serviceType = weighted<ServiceType>([['OJEK', 45], ['JEEP', 25], ['GUIDE', 30]])
      const kandidat = PROVIDER[serviceType].filter((p) => !providerTerpakai.has(p))
      if (kandidat.length === 0) continue
      const providerName = pick(kandidat)
      providerTerpakai.add(providerName)
      const serviceId = newId()
      rowsService.push({
        id: serviceId,
        destinationId: dest.id,
        providerName,
        serviceType,
        contactWa: `08${randInt(11, 89)}${randInt(10000000, 99999999)}`,
        baseRate: serviceType === 'OJEK' ? randInt(3, 8) * 5000 : serviceType === 'JEEP' ? randInt(7, 15) * 25000 : randInt(3, 10) * 25000,
        kapasitasPenumpang: serviceType === 'OJEK' ? 1 : serviceType === 'JEEP' ? randInt(4, 6) : randInt(5, 15),
        isValidated: true,
        validatedById: pengelolaId,
      })
      for (const t of pickMany(TITIK_JEMPUT, randInt(2, 3))) {
        rowsTitik.push({ id: newId(), serviceId, namaLokasi: t, hargaTambahan: randInt(0, 4) * 5000, estimasiWaktu: `${randInt(10, 45)} menit` })
      }
      serviceKandidat.push({ id: serviceId, providerName, serviceType })
    }

    // ---- Helper: bikin 1 transaksi
    let pendapatan30 = 0
    let jumlahTransaksi = 0

    function buatTransaksi(opts: { createdAt: Date; type: TransaksiType; status: TransaksiStatus; selesaiAtPaksa?: Date }) {
      const user = pick(kolamUser)
      const { createdAt, type, status } = opts

      const items: { namaItem: string; hargaSatuan: number; kuantitas: number }[] = []
      if (type === 'TIKET_MASUK') {
        items.push({ namaItem: `Tiket Masuk ${dest.name}`, hargaSatuan: htm, kuantitas: randInt(1, 5) })
        if (htmAnak && htmAnak > 0 && rand() < 0.35) items.push({ namaItem: 'Tiket Masuk Anak', hargaSatuan: htmAnak, kuantitas: randInt(1, 3) })
      } else if (type === 'FASILITAS') {
        for (const f of pickMany(katalogFasilitas, randInt(1, Math.min(2, katalogFasilitas.length)))) {
          items.push({ namaItem: f.nama, hargaSatuan: f.harga, kuantitas: randInt(1, 4) })
        }
      } else {
        for (const m of pickMany(katalogMenu, randInt(1, Math.min(3, katalogMenu.length)))) {
          items.push({ namaItem: m.name, hargaSatuan: m.price, kuantitas: randInt(1, 4) })
        }
      }
      if (items.length === 0) items.push({ namaItem: `Tiket Masuk ${dest.name}`, hargaSatuan: htm, kuantitas: randInt(1, 3) })

      const totalHarga = items.reduce((s, it) => s + it.hargaSatuan * it.kuantitas, 0)

      let dikonfirmasiAt: Date | null = null
      let selesaiAt: Date | null = null
      let dibatalkanAt: Date | null = null
      if (status === 'SELESAI') {
        dikonfirmasiAt = tambahJam(createdAt, randInt(2, 30))
        selesaiAt = opts.selesaiAtPaksa ?? tambahJam(dikonfirmasiAt, randInt(6, 72))
        if (selesaiAt < dikonfirmasiAt) dikonfirmasiAt = tambahJam(selesaiAt, -randInt(2, 12))
      } else if (status === 'DIKONFIRMASI') {
        dikonfirmasiAt = tambahJam(createdAt, randInt(2, 30))
      } else if (status === 'DIBATALKAN') {
        dibatalkanAt = tambahJam(createdAt, randInt(1, 24))
      }

      const id = newId()
      const kode = kodeTransaksi()
      rowsTransaksi.push({
        id,
        userId: user.id,
        destinationId: dest.id,
        type,
        totalHarga,
        status,
        paymentMethod: weighted<PaymentMethod>([['COD', 70], ['TRANSFER_MANUAL', 30]]),
        jadwal: tambahJam(createdAt, randInt(24, 240)),
        kodeTransaksi: kode,
        createdAt,
        updatedAt: selesaiAt ?? dikonfirmasiAt ?? dibatalkanAt ?? createdAt,
        dikonfirmasiAt,
        selesaiAt,
        dibatalkanAt,
      })
      for (const it of items) {
        rowsItem.push({ id: newId(), transaksiId: id, namaItem: it.namaItem, hargaSatuan: it.hargaSatuan, kuantitas: it.kuantitas, subtotal: it.hargaSatuan * it.kuantitas })
      }
      jumlahTransaksi++
      if (type === 'TIKET_MASUK' && status === 'SELESAI' && selesaiAt && selesaiAt >= sejak30) pendapatan30 += totalHarga

      // Notifikasi hanya untuk kejadian 30 hari terakhir, supaya inbox tetap masuk akal.
      if (createdAt >= sejak30 && rand() < 0.06) {
        const kategoriNotif = type === 'TIKET_MASUK' ? 'TIKET' : type === 'FASILITAS' ? 'FASILITAS' : 'UMKM'
        rowsNotif.push({
          id: newId(),
          userId: pengelolaId,
          judul: 'Pesanan Baru Masuk',
          pesan: `${user.name} memesan ${items[0].namaItem} di ${dest.name}. Kode: ${kode}`,
          link: `/pengelola/destinasi/${dest.id}`,
          kategori: kategoriNotif,
          isRead: rand() < 0.5,
          createdAt,
        })
        if (status !== 'PENDING') {
          const at = selesaiAt ?? dikonfirmasiAt ?? dibatalkanAt!
          const konten =
            status === 'SELESAI'
              ? { judul: 'Kunjungan Selesai', pesan: `Terima kasih telah berkunjung ke ${dest.name}!` }
              : status === 'DIKONFIRMASI'
                ? { judul: 'Pesanan Dikonfirmasi', pesan: `Pesanan ${kode} di ${dest.name} telah dikonfirmasi oleh pengelola.` }
                : { judul: 'Pesanan Ditolak', pesan: `Pesanan ${kode} di ${dest.name} ditolak oleh pengelola.` }
          rowsNotif.push({ id: newId(), userId: user.id, judul: konten.judul, pesan: konten.pesan, link: `/transaksi/${id}`, kategori: kategoriNotif, isRead: rand() < 0.6, createdAt: at })
        }
      }
    }

    // ---- 2. BACKBONE: kunjungan 30 hari terakhir (dikurangi yang sudah ada)
    const perluKunjungan = Math.max(0, base - ex.kunjungan30)
    for (let i = 0; i < perluKunjungan; i++) {
      // selesaiAt tersebar merata di 30 hari, akhir pekan sedikit lebih ramai.
      let hariLalu = randInt(0, 29)
      const tgl = new Date(NOW.getTime() - hariLalu * HARI)
      const akhirPekan = tgl.getDay() === 0 || tgl.getDay() === 6
      if (!akhirPekan && rand() < 0.18) hariLalu = Math.max(0, hariLalu - randInt(1, 2))
      const selesaiAt = tanggalHariLalu(hariLalu)
      const createdAt = tambahJam(selesaiAt, -randInt(8, 96))
      buatTransaksi({ createdAt, type: 'TIKET_MASUK', status: 'SELESAI', selesaiAtPaksa: selesaiAt })
    }

    // ---- 2. Bulan ke-2..6: kunjungan menurun bertahap ke belakang
    let backboneLama = 0
    RAMP.forEach((faktor, idx) => {
      const jumlah = Math.round(base * faktor)
      backboneLama += jumlah
      for (let i = 0; i < jumlah; i++) {
        const hariLalu = 30 + idx * 30 + randInt(0, 29)
        const selesaiAt = tanggalHariLalu(hariLalu)
        const createdAt = tambahJam(selesaiAt, -randInt(8, 96))
        buatTransaksi({ createdAt, type: 'TIKET_MASUK', status: 'SELESAI', selesaiAtPaksa: selesaiAt })
      }
    })

    // ---- Transaksi non-backbone di 6 bulan terakhir (tipe & status bervariasi)
    const backbone6 = perluKunjungan + backboneLama
    const extra6 = Math.round(backbone6 * EXTRA_RATIO)
    for (let i = 0; i < extra6; i++) {
      const createdAt = tanggalHariLalu(randInt(0, 181))
      const type = weighted<TransaksiType>([['UMKM', 45], ['FASILITAS', 35], ['TIKET_MASUK', 20]])
      const status = weighted<TransaksiStatus>([['SELESAI', 45], ['DIKONFIRMASI', 25], ['PENDING', 20], ['DIBATALKAN', 10]])
      // Jangan sampai menambah kunjungan di jendela 30 hari — target Tugas 2 harus persis.
      if (type === 'TIKET_MASUK' && status === 'SELESAI' && createdAt >= sejak30) {
        buatTransaksi({ createdAt: tambahJam(createdAt, -24 * 60), type, status })
      } else {
        buatTransaksi({ createdAt, type, status })
      }
    }

    // ---- 4. Ekor historis: 25% dari total, merata Jan 2021 -> sekarang
    const recent6 = backbone6 + extra6
    const totalTransaksi = Math.round(recent6 / PORSI_6_BULAN)
    const ekor = Math.max(0, totalTransaksi - recent6)
    for (let i = 0; i < ekor; i++) {
      let createdAt = tanggalHistoris()
      const type = weighted<TransaksiType>([['TIKET_MASUK', 55], ['UMKM', 25], ['FASILITAS', 20]])
      const status = weighted<TransaksiStatus>([['SELESAI', 60], ['DIKONFIRMASI', 20], ['PENDING', 15], ['DIBATALKAN', 5]])
      if (type === 'TIKET_MASUK' && status === 'SELESAI' && createdAt >= new Date(NOW.getTime() - 35 * HARI)) {
        createdAt = new Date(createdAt.getTime() - 60 * HARI)
      }
      buatTransaksi({ createdAt, type, status })
    }

    // ---- 5. LAPORAN proporsional
    const targetLaporan = Math.min(45, Math.max(8, Math.round(base / 25)))
    const perluLaporan = Math.max(0, targetLaporan - ex.laporan)
    for (let i = 0; i < perluLaporan; i++) {
      const user = pick(kolamUser)
      const roadCondition = weighted<RouteStatus>([['MUDAH', 40], ['SEDANG', 30], ['SULIT', 18], ['RUSAK', 12]])
      const signalStrength = weighted<SignalStrength>([['KUAT', 45], ['SEDANG', 35], ['LEMAH', 20]])
      const crowdLevel = populer ? weighted<CrowdLevel>([['PADAT', 45], ['SEDANG', 40], ['SEPI', 15]]) : weighted<CrowdLevel>([['SEDANG', 45], ['SEPI', 33], ['PADAT', 22]])
      const createdAt = rand() < PORSI_6_BULAN ? tanggalHariLalu(randInt(0, 181)) : tanggalHistoris()
      rowsLaporan.push({
        id: newId(),
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
        upvoteCount: randInt(0, 40),
        notes: `${pick(CATATAN_LAPORAN[roadCondition])} ${CATATAN_SINYAL[signalStrength]} ${CATATAN_RAMAI[crowdLevel]}`,
        createdAt,
      })
    }

    // ---- 5. REVIEW proporsional, hormati unique [userId, destinationId]
    const targetReview = Math.min(70, Math.max(12, Math.round(base / 15)))
    const sudahReview = new Set(ex.reviewUserIds)
    const kandidatPengulas = kolamUser.filter((u) => !sudahReview.has(u.id))
    const pengulas = pickMany(kandidatPengulas, Math.max(0, Math.min(targetReview - ex.reviewUserIds.length, kandidatPengulas.length)))
    for (const user of pengulas) {
      const rating = weighted<number>([[5, 42], [4, 33], [3, 14], [2, 8], [1, 3]])
      const komentar = rating >= 4 ? pick(KOMENTAR_POSITIF) : rating === 3 ? pick(KOMENTAR_NETRAL) : pick(KOMENTAR_NEGATIF)
      const createdAt = rand() < PORSI_6_BULAN ? tanggalHariLalu(randInt(0, 181)) : tanggalHistoris()
      rowsReview.push({ id: newId(), userId: user.id, destinationId: dest.id, rating, komentar, createdAt })
      if (rand() < 0.25 && createdAt >= sejak30) {
        rowsNotif.push({
          id: newId(),
          userId: pengelolaId,
          judul: 'Ulasan Baru Masuk',
          pesan: `${user.name} memberi rating ${rating} bintang untuk ${dest.name}.`,
          link: `/pengelola/destinasi/${dest.id}`,
          kategori: 'REVIEW',
          isRead: rand() < 0.5,
          createdAt,
        })
      }
    }

    // ---- 5. BOOKING proporsional
    const targetBooking = Math.min(30, Math.max(6, Math.round(base / 40)))
    const perluBooking = Math.max(0, targetBooking - ex.booking)
    for (let i = 0; i < perluBooking && serviceKandidat.length > 0; i++) {
      const user = pick(kolamUser)
      const service = pick(serviceKandidat)
      const status = weighted<BookingStatus>([['COMPLETED', 45], ['CONFIRMED', 25], ['PENDING', 20], ['EXPIRED', 10]])
      const createdAt = rand() < PORSI_6_BULAN ? tanggalHariLalu(randInt(0, 181)) : tanggalHistoris()
      const travelDate =
        status === 'PENDING' || status === 'CONFIRMED'
          ? new Date(NOW.getTime() + randInt(1, 45) * HARI)
          : new Date(createdAt.getTime() + randInt(1, 20) * HARI)
      const bookingId = newId()
      rowsBooking.push({
        id: bookingId,
        userId: user.id,
        serviceId: service.id,
        destinationId: dest.id,
        travelDate,
        meetingPoint: pick(TITIK_JEMPUT),
        notes: rand() < 0.5 ? pick(CATATAN_BOOKING) : null,
        contactNumber: `08${randInt(11, 89)}${randInt(10000000, 99999999)}`,
        estimatedArrivalTime: `${String(randInt(5, 16)).padStart(2, '0')}:${pick(['00', '15', '30', '45'])}`,
        status,
        createdAt,
      })
      if (rand() < 0.3 && createdAt >= sejak30) {
        rowsNotif.push({
          id: newId(),
          userId: pengelolaId,
          judul: 'Booking Transport Baru',
          pesan: `${user.name} booking ${service.providerName} (${service.serviceType}) di ${dest.name} untuk tanggal ${travelDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}.`,
          link: `/pengelola/destinasi/${dest.id}`,
          kategori: 'TRANSPORT',
          isRead: rand() < 0.5,
          createdAt,
        })
      }
    }

    perDestinasi.push({
      name: dest.name,
      kunjungan30: base,
      pendapatan30,
      transaksi: jumlahTransaksi,
      fasilitas: ex.fasilitas.length + fasilitasBaru.length,
      umkm: Math.max(ex.warung.length, targetWarung),
      transport: serviceKandidat.length,
      review: ex.reviewUserIds.length + pengulas.length,
      laporan: ex.laporan + perluLaporan,
      booking: ex.booking + perluBooking,
    })
  }

  // ---------------------------------------------------------------- Ringkasan

  const rupiah = (n: number) => `Rp${n.toLocaleString('id-ID')}`
  const totalPendapatan30 = perDestinasi.reduce((s, d) => s + d.pendapatan30, 0)
  const avg = (f: (d: (typeof perDestinasi)[number]) => number) => (perDestinasi.reduce((s, d) => s + f(d), 0) / perDestinasi.length).toFixed(1)

  console.log(`PROFIL: ${ringan ? 'RINGAN' : 'PENUH'} | destinasi APPROVED: ${peringkat.length}\n`)

  console.log('=== KUNJUNGAN 30 HARI TERAKHIR — TOP 5 ===')
  for (const d of perDestinasi.slice(0, 5)) {
    console.log(`  ${String(d.kunjungan30).padStart(4)} kunjungan | ${rupiah(d.pendapatan30).padStart(16)} | ${d.name}`)
  }
  console.log('=== KUNJUNGAN 30 HARI TERAKHIR — BOTTOM 5 ===')
  for (const d of perDestinasi.slice(-5)) {
    console.log(`  ${String(d.kunjungan30).padStart(4)} kunjungan | ${rupiah(d.pendapatan30).padStart(16)} | ${d.name}`)
  }
  const minK = Math.min(...perDestinasi.map((d) => d.kunjungan30))
  console.log(`\n  Kunjungan terendah: ${minK} (syarat: >= ${KUNJUNGAN_MIN}) -> ${minK >= KUNJUNGAN_MIN ? 'OK' : 'GAGAL'}`)
  console.log(`  Total kunjungan 30 hari : ${perDestinasi.reduce((s, d) => s + d.kunjungan30, 0).toLocaleString('id-ID')}`)
  console.log(`  Total pendapatan 30 hari: ${rupiah(totalPendapatan30)}  (dari htmResmi x kuantitas tiket, per transaksi)`)

  console.log('\n=== RATA-RATA PER DESTINASI (setelah top-up) ===')
  console.log(`  Fasilitas: ${avg((d) => d.fasilitas)} | UMKM: ${avg((d) => d.umkm)} | Transport: ${avg((d) => d.transport)} | Review: ${avg((d) => d.review)} | Laporan: ${avg((d) => d.laporan)} | Booking: ${avg((d) => d.booking)}`)
  console.log(`  Minimum: fasilitas=${Math.min(...perDestinasi.map((d) => d.fasilitas))} umkm=${Math.min(...perDestinasi.map((d) => d.umkm))} transport=${Math.min(...perDestinasi.map((d) => d.transport))}`)

  const trxRecent6 = rowsTransaksi.filter((t) => t.createdAt >= new Date(NOW.getTime() - 182 * HARI)).length
  console.log('\n=== BARIS BARU YANG AKAN DIBUAT ===')
  console.log(`  User wisatawan : ${userBaru.length}`)
  console.log(`  Fasilitas      : ${rowsFasilitas.length}`)
  console.log(`  UMKM           : ${rowsWarung.length}  (produk: ${rowsMenu.length})`)
  console.log(`  Transport      : ${rowsService.length}  (titik jemput: ${rowsTitik.length})`)
  console.log(`  Transaksi      : ${rowsTransaksi.length.toLocaleString('id-ID')}  (item: ${rowsItem.length.toLocaleString('id-ID')})`)
  console.log(`  Laporan        : ${rowsLaporan.length}`)
  console.log(`  Review         : ${rowsReview.length}`)
  console.log(`  Booking        : ${rowsBooking.length}`)
  console.log(`  Notifikasi     : ${rowsNotif.length}`)
  console.log(`\n  Sebaran transaksi: ${((trxRecent6 / rowsTransaksi.length) * 100).toFixed(1)}% dalam 6 bulan terakhir (target ${PORSI_6_BULAN * 100}%), sisanya merata sejak Jan 2021.`)
  console.log(`  Total baris baru : ${(userBaru.length + rowsFasilitas.length + rowsWarung.length + rowsMenu.length + rowsService.length + rowsTitik.length + rowsTransaksi.length + rowsItem.length + rowsLaporan.length + rowsReview.length + rowsBooking.length + rowsNotif.length).toLocaleString('id-ID')}`)

  if (!apply) {
    console.log('\nDRY RUN — belum ada yang ditulis. Tambahkan --apply untuk eksekusi.')
    return
  }

  // ---------------------------------------------------------------- Insert

  async function batch<T>(nama: string, rows: T[], fn: (chunk: T[]) => Promise<unknown>) {
    const SIZE = 2000
    for (let i = 0; i < rows.length; i += SIZE) {
      await fn(rows.slice(i, i + SIZE))
      process.stdout.write(`\r  ${nama}: ${Math.min(i + SIZE, rows.length)}/${rows.length}   `)
    }
    if (rows.length > 0) console.log()
  }

  console.log('\nMenulis ke database...')
  await batch('fasilitas', rowsFasilitas, (c) => prisma.fasilitas.createMany({ data: c }))
  await batch('warung', rowsWarung, (c) => prisma.localWarung.createMany({ data: c }))
  await batch('menu', rowsMenu, (c) => prisma.menuItem.createMany({ data: c }))
  await batch('service', rowsService, (c) => prisma.localService.createMany({ data: c }))
  await batch('titikJemput', rowsTitik, (c) => prisma.titikJemput.createMany({ data: c }))
  await batch('transaksi', rowsTransaksi, (c) => prisma.transaksi.createMany({ data: c }))
  await batch('transaksiItem', rowsItem, (c) => prisma.transaksiItem.createMany({ data: c }))
  await batch('laporan', rowsLaporan, (c) => prisma.userReport.createMany({ data: c as never }))
  await batch('review', rowsReview, (c) => prisma.review.createMany({ data: c, skipDuplicates: true }))
  await batch('booking', rowsBooking, (c) => prisma.booking.createMany({ data: c }))
  await batch('notifikasi', rowsNotif, (c) => prisma.notifikasi.createMany({ data: c }))

  console.log('\nSELESAI.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
