# Prompt untuk Google Antigravity — Fitur Register & Login "Blusukan"

Jalankan task ini di repo yang sudah terbuka di workspace (project Next.js "Blusukan"). Baca dulu struktur project (`app/`, `lib/`, `prisma/schema.prisma`, `auth.ts`, `middleware.ts`) sebelum membuat perubahan apa pun.

## Konteks Project

"Blusukan" adalah platform pemetaan dan pelaporan destinasi wisata *hidden gem* di Yogyakarta (Next.js 14 App Router, TypeScript, Tailwind CSS + shadcn/ui, Prisma + PostgreSQL, NextAuth.js untuk autentikasi berbasis role).

Ada 3 role user di `prisma/schema.prisma` (enum `Role`): `WISATAWAN`, `PENGELOLA`, `ADMIN`. Model `User` sudah punya field `phone`, `nikEncrypted`, `role`, `passwordHash` — jangan ubah schema kecuali memang diperlukan.

## Tugas: Rombak total halaman & API Register + Login

### 1. Alur Register (`app/register/page.tsx`)

Buat form 2 tahap dalam satu halaman (client-side state, tidak perlu multi-route):

**Tahap 1 — Pilih tipe akun:**
Dua kartu pilihan yang bisa diklik: "Wisatawan" dan "Pengelola Lokal". Tiap kartu punya judul + deskripsi singkat 1 kalimat. Setelah dipilih, lanjut ke Tahap 2 dengan field yang berbeda sesuai role.

**Tahap 2A — Form Wisatawan:**
- Nama Lengkap (wajib)
- Email (wajib)
- Nomor Telepon (opsional, beri label "Opsional")
- Password (wajib, min 8 karakter)
- Konfirmasi Password (wajib, harus cocok)
- Checkbox consent Syarat & Ketentuan + Kebijakan Privasi (wajib dicentang)

**Tahap 2B — Form Pengelola Lokal:**
- Nama Lengkap (wajib)
- Email (wajib)
- Nomor Telepon (wajib, beri label "Wajib")
- NIK — Nomor Induk Kependudukan (wajib, harus 16 digit angka, tampilkan helper text kecil di bawah field: "Data dienkripsi, hanya untuk verifikasi keaslian pengelola.")
- Password (wajib, min 8 karakter)
- Konfirmasi Password (wajib, harus cocok)
- Checkbox consent (wajib dicentang)

Ada tombol "← Kembali" di Tahap 2 untuk balik ke Tahap 1.

### 2. Halaman Login (`app/login/page.tsx`)

Form tunggal — **JANGAN** ada pilihan role di halaman ini (role sudah melekat ke akun sejak register):
- Email
- Password (dengan toggle show/hide)
- Link "Lupa Password?" (link saja, belum perlu implementasi halamannya)
- Tombol submit "Masuk"
- Link ke "/register" untuk yang belum punya akun

### 3. API `app/api/register/route.ts`

- Terima body: `{ role, nama, email, telepon, nik, password }`
- Validasi: `role` harus `"WISATAWAN"` atau `"PENGELOLA"`. Kalau `PENGELOLA`, `telepon` dan `nik` (16 digit) wajib ada. Password minimal 8 karakter. Cek email belum terdaftar.
- Hash password dengan bcrypt (`bcryptjs`, sudah jadi dependency).
- **Enkripsi NIK** sebelum disimpan ke kolom `nikEncrypted` — buat helper `lib/encryption.ts` yang pakai Node `crypto` AES-256-GCM dengan key dari `process.env.NIK_ENCRYPTION_KEY` (32-byte hex, generate contoh dengan `openssl rand -hex 32` dan tambahkan ke `.env.example`, JANGAN hardcode key di kode).
- Simpan user ke Prisma dengan `role` sesuai pilihan (bukan hardcode `WISATAWAN` seperti sebelumnya).

### 4. API `app/api/login/route.ts`

- **PERBAIKI BUG**: kode lama mengambil role dari `result?.role` hasil `signIn()` NextAuth — ini selalu `undefined` karena `signIn()` tidak mengembalikan field custom seperti itu, jadi role selalu fallback ke `WISATAWAN` walau yang login itu Pengelola/Admin.
- Setelah `signIn("credentials", { email, password, redirect: false })` berhasil (tidak throw `AuthError`), ambil role user dari database via Prisma (`prisma.user.findUnique({ where: { email }, select: { role: true } })`) dan kembalikan di response JSON.

### 5. Desain visual — WAJIB match dengan referensi gambar, JANGAN improvisasi

**PENTING: Saya melampirkan screenshot hasil desain final di Google Stitch bersama prompt ini (attach langsung di chat, bukan hanya deskripsi). Gunakan gambar-gambar ini sebagai visual ground truth — implementasikan SEPERSIS mungkin, jangan menciptakan gaya/warna/layout baru versimu sendiri.**

Label gambar yang saya lampirkan:
- `role-selection-desktop.png` — layout Tahap 1 (pilih role) versi desktop
- `role-selection-mobile.png` — layout Tahap 1 versi mobile
- `register-wisatawan-desktop.png` / `register-wisatawan-mobile.png` — Tahap 2A
- `register-pengelola-desktop.png` / `register-pengelola-mobile.png` — Tahap 2B
- `login-desktop.png` / `login-mobile.png` — halaman login

**Larangan tegas (negative prompting) — dilarang pakai nilai sembarang:**
- DILARANG hardcode hex color baru atau angka spacing sembarang (magic number) langsung di className/style. WAJIB pakai CSS variable yang sudah/akan didefinisikan di `app/globals.css` (`--blusukan-primary`, `--blusukan-surface`, dst).
- DILARANG mengubah komposisi layout dari referensi gambar (misal: kalau di gambar field-nya 1 kolom, jangan dibuat 2 kolom; kalau card role-selection stack vertikal di mobile, jangan dibuat horizontal).
- DILARANG menambahkan foto/gambar hero sungguhan — pakai gradient hijau tua sebagai placeholder panel visual (beri komentar TODO), karena belum ada asset foto asli di project ini.

**Token diskrit yang WAJIB dipakai** (isi ke `app/globals.css`, jangan menebak nilai lain dari gambar):
- `--blusukan-primary: #1f4d2c` (tombol utama, judul brand)
- `--blusukan-primary-container: #e3efe0` (hover/selected state kartu role)
- `--blusukan-surface: #f8f7f2` (background halaman)
- `--blusukan-on-surface: #1e1e1a` (teks utama)
- `--blusukan-on-surface-variant: #4b4f45` (teks sekunder/helper text — sudah lolos WCAG AA 4.5:1 di atas surface)
- `--blusukan-outline-variant: #dedad0` (border card/input)
- `--blusukan-error: #b3261e`, `--blusukan-error-container: #f9dedc` (pesan error)
- Radius: card `16px` (rounded-2xl), input/button `8px` (rounded-lg)
- Font: heading pakai `Montserrat` (bold), body pakai `Inter` — sudah di-import di `globals.css`
- Spacing antar field form: `16px` (space-y-4)

Semua helper text (password requirement, keterangan NIK) tampil sebagai teks kecil abu-abu polos di bawah field — BUKAN di dalam placeholder, BUKAN badge/pill berwarna (ini beda dari salah satu draft awal Stitch, sudah kita koreksi — ikuti versi final di gambar terlampir).

JANGAN tambahkan: tombol login Google/OAuth, field nationality/tanggal lahir, bottom navigation bar di halaman auth, atau field lain yang tidak ada di gambar referensi maupun spesifikasi field di atas.

### 5b. Verifikasi visual — WAJIB dilakukan, bukan opsional

Setelah implementasi, render di browser terintegrasi lalu **bandingkan langsung side-by-side dengan gambar referensi** yang saya lampirkan (resize ke breakpoint mobile 375px dan desktop). Kalau ada perbedaan (warna, spacing, radius, posisi elemen), perbaiki — jangan cuma laporkan "sudah selesai" tanpa membandingkan ke referensi gambar. Screenshot hasil akhir dan lampirkan sebagai artifact supaya saya bisa cek juga.

## Acceptance Criteria (verifikasi sendiri sebelum melapor selesai)

Gunakan browser agent untuk cek langsung, bukan cuma baca kode:

1. Buka `/register` → pilih "Wisatawan" → isi form → submit → user baru muncul di database dengan `role = WISATAWAN`, `nikEncrypted = null`.
2. Buka `/register` → pilih "Pengelola Lokal" → coba submit tanpa NIK → harus muncul error validasi, tidak lolos ke database.
3. Isi form Pengelola lengkap dengan NIK valid (16 digit) → submit → cek di database bahwa `nikEncrypted` **bukan** teks NIK asli (harus ter-enkripsi).
4. Buka `/login`, login pakai akun Pengelola yang baru dibuat → cek response API mengembalikan `role: "PENGELOLA"` (bukan fallback ke `WISATAWAN`).
5. Jalankan `npx tsc --noEmit` dan pastikan tidak ada error baru di file yang diubah.
6. Screenshot tampilan `/register` dan `/login` di viewport mobile (375px) dan desktop, lampirkan sebagai artifact.

## Yang TIDAK perlu dikerjakan sekarang
- Halaman "Lupa Password" (cukup link, belum perlu fungsional)
- Dashboard/halaman khusus untuk role Pengelola (redirect sementara ke `/` setelah login, boleh tinggalkan komentar TODO)
- Foto/gambar hero — pakai gradient warna hijau tua sebagai placeholder panel visual, beri komentar TODO untuk diganti foto asli nanti
