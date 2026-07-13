"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Home,
  User,
  MapPin,
  Map,
  X,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { MapDestination } from "@/components/DestinationMap";
import DestinasiCard from "@/components/destinasi-card";
import AiAsistenWisatawan from "@/components/ai-asisten-wisatawan";
import type { DestinationForClient } from "@/lib/destinasi-beranda";

// Leaflet is browser-only — load dynamically with ssr: false
const DestinationMap = dynamic(
  () => import("@/components/DestinationMap"),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ background: "var(--blusukan-surface-low)" }}
      >
        <span className="text-sm" style={{ color: "var(--blusukan-outline)" }}>
          Memuat peta…
        </span>
      </div>
    ),
  }
);

// ── Filter chip helpers ──────────────────────────────────────
const WILAYAH_OPTIONS = [
  { value: "ALL", label: "Semua" },
  { value: "SLEMAN", label: "Sleman" },
  { value: "GUNUNGKIDUL", label: "Gunungkidul" },
  { value: "BANTUL", label: "Bantul" },
  { value: "KULON_PROGO", label: "Kulon Progo" },
  { value: "KOTA_YOGYAKARTA", label: "Kota Yogyakarta" },
];

const KATEGORI_OPTIONS = [
  { value: "ALL", label: "Semua" },
  { value: "PANTAI", label: "Pantai" },
  { value: "AIR_TERJUN", label: "Air Terjun" },
  { value: "GUNUNG", label: "Gunung" },
  { value: "BUKIT", label: "Bukit" },
  { value: "TEBING", label: "Tebing" },
];

// ── Main component ───────────────────────────────────────────
interface BerandaClientProps {
  destinations: DestinationForClient[];
}

export default function BerandaClient({ destinations }: BerandaClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWilayah, setSelectedWilayah] = useState("ALL");
  const [selectedKategori, setSelectedKategori] = useState("ALL");
  const [mapOpen, setMapOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return destinations.filter((d) => {
      const matchSearch = !q || d.name.toLowerCase().includes(q);
      const matchWilayah =
        selectedWilayah === "ALL" || d.kabupaten === selectedWilayah;
      const matchKategori =
        selectedKategori === "ALL" || d.kategori === selectedKategori;
      return matchSearch && matchWilayah && matchKategori;
    });
  }, [destinations, searchQuery, selectedWilayah, selectedKategori]);

  // Semua destinasi untuk peta (SELALU lengkap, tidak mengikuti filter)
  const allMapDestinations: MapDestination[] = destinations.map((d) => ({
    id: d.id,
    name: d.name,
    latitude: d.latitude,
    longitude: d.longitude,
    routeStatus: d.routeStatus,
  }));

  // ID destinasi yang sesuai filter aktif (untuk highlight di peta)
  const filteredIds = new Set(filtered.map((d) => d.id));

  const wilayahLabel =
    WILAYAH_OPTIONS.find((o) => o.value === selectedWilayah)?.label ?? "Semua";
  const kategoriLabel =
    KATEGORI_OPTIONS.find((o) => o.value === selectedKategori)?.label ?? "Semua";

  // Statistik singkat untuk hero — murni turunan dari prop destinations, tanpa fetch baru
  const wilayahCount = new Set(destinations.map((d) => d.kabupaten)).size;
  const kategoriCount = new Set(destinations.map((d) => d.kategori)).size;
  const heroStats = [
    { icon: <Sparkles size={14} />, value: destinations.length, label: "Destinasi" },
    { icon: <MapPin size={14} />, value: wilayahCount, label: "Wilayah" },
    { icon: <Map size={14} />, value: kategoriCount, label: "Kategori" },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--blusukan-surface)", color: "var(--blusukan-on-surface)" }}
    >
      {/* ── Hero — foto full-bleed + overlay gradient brand, headline besar, strip statistik ──
          -mt menarik foto sampai mentok ke ujung atas viewport, menembus "ruang kosong" yang
          ditinggalkan navbar sticky (yang in-flow). Kompensasinya ada di wrapper konten teks
          di bawah (pt sebesar nilai yang sama), supaya posisi teks TIDAK ikut naik. ── */}
      <div className="relative overflow-hidden px-4 lg:px-8 pt-16 pb-28 sm:pt-20 sm:pb-32 lg:pt-24 lg:pb-36 min-h-[520px] sm:min-h-[600px] lg:min-h-[680px] -mt-[72px] sm:-mt-[76px]">
        {/* Foto latar — object-position ditarik ke bagian atas supaya puncak candi tidak terpotong */}
        <Image
          src="/prambanan.jpg"
          alt=""
          fill
          priority
          className="object-cover z-0"
          style={{ objectPosition: "center 20%" }}
          sizes="100vw"
        />

        {/* Gradient overlay brand — dari gelap ke agak transparan supaya teks tetap terbaca di atas foto */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              "linear-gradient(165deg, color-mix(in srgb, var(--blusukan-primary) 92%, black 8%) 0%, color-mix(in srgb, var(--blusukan-primary) 80%, transparent) 45%, color-mix(in srgb, var(--blusukan-tertiary) 85%, transparent) 100%)",
          }}
        />

        {/* Bentuk dekoratif — blur circle, murni turunan token, bukan warna baru */}
        <div
          className="absolute -top-24 -right-16 w-72 h-72 rounded-full blur-3xl opacity-30 pointer-events-none z-[1]"
          style={{ background: "var(--blusukan-primary-fixed-dim)" }}
        />
        <div
          className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none z-[1]"
          style={{ background: "var(--blusukan-secondary-container)" }}
        />

        {/* pt di sini mengkompensasi -mt pada wrapper hero, supaya teks tetap di posisi
            visual semula meski foto sudah ditarik mentok ke atas viewport ── */}
        <div className="relative z-10 max-w-7xl mx-auto text-center lg:text-left pt-[72px] sm:pt-[76px]">
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-6"
            style={{
              background: "color-mix(in srgb, var(--blusukan-on-primary) 16%, transparent)",
              color: "var(--blusukan-on-primary)",
              border: "1px solid color-mix(in srgb, var(--blusukan-on-primary) 28%, transparent)",
              fontFamily: "Inter, sans-serif",
            }}
          >
            <Sparkles size={12} />
            Yogyakarta · Hidden Gem
          </span>

          <h1
            className="font-black leading-[0.98] tracking-tight"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            <span
              className="block text-4xl sm:text-5xl lg:text-[4.25rem]"
              style={{ color: "var(--blusukan-on-primary)" }}
            >
              Jelajahi
            </span>
            <span
              className="block text-4xl sm:text-5xl lg:text-[4.25rem] italic"
              style={{ color: "var(--blusukan-primary-fixed-dim)" }}
            >
              Hidden Gem
            </span>
            <span
              className="block text-4xl sm:text-5xl lg:text-[4.25rem]"
              style={{ color: "var(--blusukan-on-primary)" }}
            >
              Yogyakarta
            </span>
          </h1>

          <p
            className="text-sm sm:text-base mt-5 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            style={{ color: "var(--blusukan-primary-container)", fontFamily: "Inter, sans-serif" }}
          >
            Temukan destinasi wisata tersembunyi yang menakjubkan
          </p>

          {/* Strip statistik singkat — dihitung dari prop destinations */}
          <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-4">
            {heroStats.map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-4">
                {i > 0 && (
                  <span
                    className="hidden sm:block w-px h-8"
                    style={{ background: "color-mix(in srgb, var(--blusukan-on-primary) 25%, transparent)" }}
                  />
                )}
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex items-center justify-center w-9 h-9 rounded-full shrink-0"
                    style={{
                      background: "color-mix(in srgb, var(--blusukan-on-primary) 14%, transparent)",
                      color: "var(--blusukan-primary-fixed-dim)",
                    }}
                  >
                    {stat.icon}
                  </span>
                  <div className="text-left">
                    <p
                      className="text-base font-extrabold leading-none"
                      style={{ color: "var(--blusukan-on-primary)", fontFamily: "Montserrat, sans-serif" }}
                    >
                      {stat.value}
                    </p>
                    <p
                      className="text-[10px] uppercase tracking-wide mt-1"
                      style={{ color: "var(--blusukan-primary-container)" }}
                    >
                      {stat.label}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main scrollable content ── */}
      <main className="flex-1 px-4 lg:px-8 py-5 pb-28 max-w-7xl mx-auto w-full">

        {/* ── Search bar — center, fokus utama di bawah headline hero ── */}
        <div className="relative z-10 -mt-10 sm:-mt-12 lg:-mt-16 mb-10 sm:mb-12 lg:mb-14 max-w-3xl mx-auto">
          <div
            className="relative w-full rounded-full p-1.5"
            style={{
              background: "var(--blusukan-surface-container-lowest)",
              border: "1px solid var(--blusukan-outline-variant)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <Search
              size={18}
              className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--blusukan-outline)" }}
            />
            <input
              id="search-destinasi"
              type="text"
              placeholder="Cari destinasi atau wilayah…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3 pl-12 pr-4 rounded-full text-sm transition-all focus:outline-none bg-transparent"
              style={{
                color: "var(--blusukan-on-surface)",
                fontFamily: "Inter, sans-serif",
              }}
            />
          </div>

          {/* ── Filter dropdowns: Wilayah & Kategori, + tombol Lihat Peta ── */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  id="filter-wilayah-trigger"
                  type="button"
                  className="flex items-center gap-2 pl-5 pr-4 py-2.5 rounded-full text-sm font-semibold transition-colors hover:opacity-80"
                  style={{
                    background: "var(--blusukan-surface-container-lowest)",
                    color: "var(--blusukan-on-surface)",
                    border: "1px solid var(--blusukan-outline-variant)",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  <MapPin size={17} style={{ color: "var(--blusukan-outline)" }} />
                  Wilayah: {wilayahLabel}
                  <ChevronDown size={16} style={{ color: "var(--blusukan-outline)" }} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="min-w-48">
                <DropdownMenuRadioGroup value={selectedWilayah}>
                  {WILAYAH_OPTIONS.map((opt) => (
                    <DropdownMenuRadioItem
                      key={opt.value}
                      id={`filter-wilayah-${opt.value.toLowerCase()}`}
                      value={opt.value}
                      onClick={() => setSelectedWilayah(opt.value)}
                    >
                      {opt.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  id="filter-kategori-trigger"
                  type="button"
                  className="flex items-center gap-2 pl-5 pr-4 py-2.5 rounded-full text-sm font-semibold transition-colors hover:opacity-80"
                  style={{
                    background: "var(--blusukan-surface-container-lowest)",
                    color: "var(--blusukan-on-surface)",
                    border: "1px solid var(--blusukan-outline-variant)",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Kategori: {kategoriLabel}
                  <ChevronDown size={16} style={{ color: "var(--blusukan-outline)" }} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="min-w-48">
                <DropdownMenuRadioGroup value={selectedKategori}>
                  {KATEGORI_OPTIONS.map((opt) => (
                    <DropdownMenuRadioItem
                      key={opt.value}
                      id={`filter-kategori-${opt.value.toLowerCase()}`}
                      value={opt.value}
                      onClick={() => setSelectedKategori(opt.value)}
                    >
                      {opt.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Tombol Lihat Peta sejajar dengan filter dropdown */}
            <button
              id="btn-lihat-peta"
              type="button"
              onClick={() => setMapOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors hover:opacity-80"
              style={{
                background: "var(--blusukan-primary)",
                color: "var(--blusukan-on-primary)",
                fontFamily: "Inter, sans-serif",
              }}
            >
              <Map size={16} />
              Lihat Peta
            </button>
          </div>
        </div>

        {/* ── Asisten AI — alternatif pencarian yang lebih personal dibanding filter manual di atas ── */}
        <div className="mb-10 sm:mb-12">
          <AiAsistenWisatawan />
        </div>

        <div className="space-y-8">
        {/* ── Modal Peta (Tugas 4) ── */}
        <Dialog open={mapOpen} onOpenChange={setMapOpen}>
          <DialogContent
            showCloseButton={false}
            className="!max-w-4xl !w-[calc(100vw-2rem)] !h-[80vh] !p-0 overflow-hidden"
          >
            <DialogHeader className="flex flex-row items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--blusukan-outline-variant)" }}>
              <DialogTitle
                className="text-sm font-bold"
                style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
              >
                Peta Destinasi Yogyakarta
                {(selectedWilayah !== "ALL" || selectedKategori !== "ALL") && (
                  <span className="ml-2 text-xs font-normal" style={{ color: "var(--blusukan-outline)" }}>
                    (pin berwarna = sesuai filter aktif)
                  </span>
                )}
              </DialogTitle>
              <button
                type="button"
                onClick={() => setMapOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-[var(--blusukan-surface-low)]"
                style={{ color: "var(--blusukan-on-surface-variant)" }}
                aria-label="Tutup peta"
              >
                <X size={16} />
              </button>
            </DialogHeader>
            <div className="flex-1" style={{ height: "calc(80vh - 52px)" }}>
              <DestinationMap
                destinations={allMapDestinations}
                highlightIds={filteredIds}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Jumlah hasil ── */}
        <p className="text-xs" style={{ color: "var(--blusukan-outline)", fontFamily: "Inter, sans-serif" }}>
          {filtered.length} dari {destinations.length} destinasi
        </p>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {filtered.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center text-center py-16">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ background: "var(--blusukan-primary-container)" }}
              >
                <MapPin size={28} style={{ color: "var(--blusukan-primary)" }} />
              </div>
              <p
                className="text-base font-bold"
                style={{ color: "var(--blusukan-on-surface)", fontFamily: "Montserrat, sans-serif" }}
              >
                Belum ada destinasi tersedia
              </p>
              <p className="text-sm mt-1.5 max-w-xs" style={{ color: "var(--blusukan-outline)" }}>
                Coba ubah filter atau kata kunci pencarian
              </p>
            </div>
          ) : (
            filtered.map((dest) => <DestinasiCard key={dest.id} dest={dest} />)
          )}
        </section>

        </div> {/* end space-y-8 wrapper */}
      </main>

      {/* ── Fixed bottom navigation ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-2 pt-2 pb-3 md:hidden"
        style={{
          background: "var(--blusukan-surface)",
          borderTop: "1px solid var(--blusukan-tertiary)",
          borderRadius: "12px 12px 0 0",
          boxShadow: "0 -2px 12px rgba(0,0,0,0.08)",
        }}
      >
        {/* Beranda — active */}
        <Link
          href="/"
          id="nav-beranda"
          className="flex flex-col items-center justify-center px-4 py-1 rounded-full"
          style={{ background: "var(--blusukan-primary)" }}
        >
          <Home size={22} style={{ color: "var(--blusukan-primary-fixed-dim)" }} />
          <span
            className="text-xs font-bold mt-0.5"
            style={{ color: "var(--blusukan-primary-fixed-dim)", fontFamily: "Inter, sans-serif" }}
          >
            Beranda
          </span>
        </Link>

        {/* Info & Update */}
        <Link
          href="/info"
          id="nav-info"
          className="flex flex-col items-center justify-center px-4 py-1 rounded-full hover:bg-[var(--blusukan-surface-container-high)] transition-colors"
        >
          <Sparkles size={22} style={{ color: "var(--blusukan-on-surface-variant)" }} />
          <span
            className="text-xs font-semibold mt-0.5"
            style={{ color: "var(--blusukan-on-surface-variant)", fontFamily: "Inter, sans-serif" }}
          >
            Info
          </span>
        </Link>

        {/* Profil */}
        <Link
          href="/profil"
          id="nav-profil"
          className="flex flex-col items-center justify-center px-4 py-1 rounded-full hover:bg-[var(--blusukan-surface-container-high)] transition-colors"
        >
          <User size={22} style={{ color: "var(--blusukan-on-surface-variant)" }} />
          <span
            className="text-xs font-semibold mt-0.5"
            style={{ color: "var(--blusukan-on-surface-variant)", fontFamily: "Inter, sans-serif" }}
          >
            Profil
          </span>
        </Link>
      </nav>
    </div>
  );
}
