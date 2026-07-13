# 🏞️ Blusukan

> Platform digital untuk menemukan, menilai, dan mengelola *hidden gem* wisata Yogyakarta dari harga tiket yang transparan sampai kondisi jalan yang dilaporkan langsung oleh sesama wisatawan.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI-8E75B2?logo=googlegemini&logoColor=white)

---

## 📖 Tentang Proyek

Yogyakarta punya ratusan destinasi wisata di luar nama-nama besar yang sudah ramai seperti pantai kecil di Gunungkidul, air terjun di Kulon Progo, bukit sunrise di Sleman. Masalahnya, informasi tentang tempat-tempat ini tersebar dan sering tidak bisa dipercaya. Harga tiket yang tertulis di internet berbeda dengan yang ditagih di lokasi, kondisi jalan menuju lokasi tidak pernah terdokumentasi sampai wisatawan terlanjur nyasar, dan warung serta jasa ojek/jeep lokal di sekitarnya nyaris tidak punya kanal digital sama sekali.

**Blusukan** menjawabnya dengan menjadikan wisatawan sebagai sumber data. Setiap orang yang datang bisa melaporkan kondisi jalan, kekuatan sinyal, tingkat keramaian, kelayakan fasilitas, dan **harga tiket yang benar-benar dibayar** di lokasi. Laporan-laporan ini menumpuk jadi gambaran kondisi terkini yang jauh lebih jujur daripada satu artikel blog yang ditulis tiga tahun lalu. Di sisi lain, pengelola lokal mendapat lapak digital untuk mendaftarkan destinasi, menjual tiket dan sewa fasilitas, memajang UMKM/warung beserta menunya, serta menawarkan jasa transport lokal (ojek, jeep, guide) lengkap dengan titik jemput dan tarifnya.

Seluruh aktivitas ini bermuara ke **dashboard MIS untuk Dinas Pariwisata**: sebaran destinasi per kabupaten dan kategori, tren laporan dan transaksi enam bulan terakhir, peringkat destinasi berdasarkan popularitas/rating/pendapatan, sampai antrean persetujuan destinasi baru. Ditambah **asisten AI berbasis Google Gemini** yang membantu di tiga sisi sekaligus yaitu merekomendasikan destinasi sesuai *mood* wisatawan, memberi saran perbaikan konkret ke pengelola berdasarkan data destinasinya, dan menyusun insight kebijakan dari data agregat sistem untuk admin.

---

## ✨ Fitur Utama

### 🧳 Wisatawan

- **Jelajah & cari destinasi** — filter berdasarkan kabupaten, kategori (pantai, air terjun, gunung, bukit, tebing), dan *vibe tag* (sunset, sunrise, spot foto, quiet place).
- **Peta interaktif** lokasi destinasi berbasis Leaflet.
- **Detail destinasi lengkap** — HTM resmi (dewasa & anak), jam operasional, fasilitas (toilet, parkir, tempat ibadah, tempat duduk, penitipan barang), aksesibilitas, dan galeri foto.
- **🤖 AI Asisten Wisatawan** — ceritakan *mood* atau keinginanmu dalam bahasa bebas ("aku pengen healing yang sepi"), AI merekomendasikan destinasi yang paling cocok beserta alasannya.
- **Lapor kondisi lapangan** (*crowdsourced*) — kondisi jalan, kekuatan sinyal, tingkat keramaian, kelayakan fasilitas, foto, dan **harga tiket riil yang dibayar** sebagai pembanding HTM resmi.
- **Transaksi** — pesan tiket masuk, sewa fasilitas, dan belanja produk UMKM dengan pembayaran COD atau transfer manual, lengkap dengan kode transaksi.
- **Booking jasa transport lokal** — ojek, jeep, atau guide, dengan pilihan titik jemput dan estimasi waktu.
- **Ulasan & rating** destinasi (1 ulasan per destinasi per pengguna).
- **Riwayat** transaksi dan booking, **notifikasi** in-app, serta pengaturan preferensi notifikasi.

### 🏪 Pengelola Lokal

- **Ajukan destinasi baru** untuk ditinjau admin, lengkap dengan koordinat, foto, tarif, jam operasional, dan fasilitas.
- **Kelola destinasi** — edit detail dan atur status aktif/nonaktif.
- **Kelola fasilitas sewa** — nama, harga sewa, satuan waktu, jumlah unit, dan lokasi di dalam destinasi.
- **Kelola UMKM/warung** — data warung, kategori (kuliner, kerajinan, fashion, jasa), foto, dan daftar menu beserta harganya.
- **Kelola jasa transport** — penyedia ojek/jeep/guide, tarif dasar, kapasitas penumpang, kontak WhatsApp, dan titik jemput.
- **Kelola transaksi & booking** — konfirmasi, selesaikan, atau batalkan pesanan yang masuk.
- **🤖 Saran AI Destinasi** — AI membaca laporan kondisi, ulasan, dan transaksi 30 hari terakhir destinasi, lalu memberi saran perbaikan konkret yang bisa langsung ditindaklanjuti.

### 🏛️ Admin / Dinas Pariwisata

- **Dashboard statistik MIS** — KPI destinasi aktif, antrean persetujuan, total laporan, dan total transaksi.
- **Visualisasi data** (Recharts) — tren laporan masuk, tren transaksi & pendapatan, tren rating rata-rata 6 bulan terakhir, distribusi destinasi per kategori dan kabupaten, distribusi kondisi jalan dan tingkat keramaian. Setiap titik data bisa diklik untuk melihat rincian di baliknya.
- **Persetujuan destinasi** — tinjau, setujui, atau tolak destinasi yang diajukan pengelola.
- **Peringkat destinasi** — berdasarkan popularitas/kunjungan, rating, dan pendapatan.
- **Monitoring laporan, transaksi, dan keuangan** per destinasi.
- **🤖 Insight & Rekomendasi AI** — AI membaca data agregat sistem lalu menyusun insight utama dan usulan kebijakan yang bersandar pada angka nyata.

### 🔐 Umum

- Autentikasi berbasis peran (Wisatawan / Pengelola / Admin) dengan NextAuth.js.
- Registrasi, login, lupa password, dan reset password lewat email (Resend).
- Upload foto ke Cloudinary.
- Enkripsi NIK pengguna dan *rate limiting* pada endpoint AI.

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
| --- | --- |
| **Framework** | Next.js 16 (App Router), React 19 |
| **Bahasa** | TypeScript 5 |
| **Database** | PostgreSQL |
| **ORM** | Prisma 7 |
| **Styling** | Tailwind CSS 4, shadcn/ui, Radix UI, Lucide Icons |
| **Autentikasi** | NextAuth.js v5 (Auth.js) + bcryptjs |
| **Media** | Cloudinary |
| **Peta** | Leaflet.js + React Leaflet |
| **Grafik** | Recharts |
| **AI** | Google Gemini (`@google/genai`) |
| **Email** | Resend |

---

## 🚀 Cara Instalasi Lokal

### Prasyarat

- Node.js 20+
- PostgreSQL yang sudah berjalan
- Akun Cloudinary, Google Gemini API, dan Resend (untuk fitur upload, AI, dan email)

### Langkah

```bash
# 1. Clone repository
git clone https://github.com/<username>/blusukan.git
cd blusukan

# 2. Install dependencies
npm install

# 3. Siapkan environment variables
cp .env.example .env
# lalu isi kredensialnya (lihat tabel di bawah)

# 4. Generate Prisma Client
npx prisma generate

# 5. Jalankan migrasi database
npx prisma migrate dev

# 6. (Opsional) Isi database dengan data awal
npx prisma db seed

# 7. Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Environment Variables

| Variabel | Keterangan |
| --- | --- |
| `DATABASE_URL` | Connection string PostgreSQL |
| `AUTH_SECRET` | Secret NextAuth.js (`npx auth secret`) |
| `NEXT_PUBLIC_APP_URL` | Base URL aplikasi, mis. `http://localhost:3000` |
| `CLOUDINARY_CLOUD_NAME` | Nama cloud Cloudinary |
| `CLOUDINARY_API_KEY` | API key Cloudinary |
| `CLOUDINARY_API_SECRET` | API secret Cloudinary |
| `GEMINI_API_KEY` | API key Google Gemini |
| `GEMINI_MODEL` | Model Gemini yang dipakai |
| `RESEND_API_KEY` | API key Resend untuk pengiriman email |
| `NIK_ENCRYPTION_KEY` | Kunci enkripsi NIK pengguna |

---

## 👥 Struktur Role & Akun Testing

Aplikasi memiliki tiga peran dengan hak akses berbeda:

| Role | Akses |
| --- | --- |
| `WISATAWAN` | Jelajah destinasi, lapor kondisi, transaksi, booking, ulasan |
| `PENGELOLA` | Kelola destinasi miliknya, fasilitas, UMKM, transport, transaksi, booking |
| `ADMIN` | Dashboard MIS, persetujuan destinasi, peringkat, monitoring, insight AI |

Akun testing (isi setelah menjalankan seed):

| Role | Email | Password |
| --- | --- | --- |
| Wisatawan | `-` | `-` |
| Pengelola | `-` | `-` |
| Admin | `-` | `-` |

---

## 🤝 Kontributor

| Nama | Peran | Kontak |
| --- | --- | --- |
| _(isi nama)_ | _(isi peran)_ | _(isi kontak)_ |
| _(isi nama)_ | _(isi peran)_ | _(isi kontak)_ |
| _(isi nama)_ | _(isi peran)_ | _(isi kontak)_ |

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan **Tugas Akhir / Mata Kuliah _(isi nama mata kuliah)_**.

Kode sumber ditujukan untuk keperluan akademik dan pembelajaran.

---

<p align="center">Dibuat dengan ❤️ untuk pariwisata Yogyakarta</p>
