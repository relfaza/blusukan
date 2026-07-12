"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Home,
  AlertTriangle,
  User,
  CheckCircle,
  Droplets,
  Wifi,
  WifiOff,
  Users,
  MapPin,
  Map,
  X,
  Star,
  TrendingUp,
  ImageOff,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MapDestination } from "@/components/DestinationMap";
import { getPopularityBadge } from "@/lib/popularity";

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

// ── Types ────────────────────────────────────────────────────
export type DestinationForClient = {
  id: string;
  name: string;
  kabupaten: string;
  kategori: string;
  latitude: number;
  longitude: number;
  routeStatus: string;
  vibeTags: string[];
  photoUrls: string[];
  totalUpvotes: number;
  verifiedReportsCount: number;
  populerMingguIni: boolean;
  rataRataRating: number;
  totalReview: number;
  reports: Array<{
    signalStrength: string | null;
    crowdLevel: string | null;
  }>;
};

// ── Label maps ───────────────────────────────────────────────
const KABUPATEN_LABEL: Record<string, string> = {
  SLEMAN: "Sleman",
  GUNUNGKIDUL: "Gunungkidul",
  BANTUL: "Bantul",
  KULON_PROGO: "Kulon Progo",
  KOTA_YOGYAKARTA: "Kota Yogyakarta",
};

const KATEGORI_LABEL: Record<string, string> = {
  PANTAI: "Pantai",
  AIR_TERJUN: "Air Terjun",
  GUNUNG: "Gunung",
  BUKIT: "Bukit",
  TEBING: "Tebing",
};

const VIBE_LABEL: Record<string, string> = {
  SUNSET: "Sunset Spot",
  SUNRISE: "Sunrise Spot",
  SPOT_FOTO: "Spot Foto",
  QUIET_PLACE: "Quiet Place",
};

const SIGNAL_LABEL: Record<string, { label: string; icon: React.ReactNode }> = {
  KUAT: { label: "Sinyal Kuat", icon: <Wifi size={13} /> },
  SEDANG: { label: "Sinyal Sedang", icon: <Wifi size={13} /> },
  LEMAH: { label: "Sinyal Lemah", icon: <WifiOff size={13} /> },
};

const CROWD_LABEL: Record<string, string> = {
  SEPI: "Sepi",
  SEDANG: "Sedang",
  PADAT: "Padat",
};

// ── Road status badge config ─────────────────────────────────
type BadgeCfg = { label: string; bg: string; textColor: string; icon: React.ReactNode } | null;
function getRouteBadge(routeStatus: string): BadgeCfg {
  switch (routeStatus) {
    case "MUDAH":
    case "SEDANG":
      return {
        label: "Aman",
        bg: "var(--blusukan-primary)",
        textColor: "var(--blusukan-on-primary)",
        icon: <CheckCircle size={12} />,
      };
    case "SULIT":
      return {
        label: "Berlumpur",
        bg: "var(--blusukan-tertiary)",
        textColor: "var(--blusukan-on-tertiary)",
        icon: <Droplets size={12} />,
      };
    case "RUSAK":
      return {
        label: "Perlu Perhatian",
        bg: "var(--blusukan-error)",
        textColor: "#ffffff",
        icon: <AlertTriangle size={12} />,
      };
    default:
      return null;
  }
}

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
      {/* ── Hero — editorial gradient, headline besar, strip statistik ── */}
      <div
        className="relative overflow-hidden px-4 lg:px-8 pt-16 pb-28 sm:pt-20 sm:pb-32 lg:pt-24 lg:pb-36"
        style={{
          background:
            "linear-gradient(160deg, var(--blusukan-primary) 0%, color-mix(in srgb, var(--blusukan-primary) 55%, var(--blusukan-tertiary) 45%) 55%, var(--blusukan-primary-fixed-dim) 135%)",
        }}
      >
        {/* Bentuk dekoratif — blur circle, murni turunan token, bukan warna baru */}
        <div
          className="absolute -top-24 -right-16 w-72 h-72 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ background: "var(--blusukan-primary-fixed-dim)" }}
        />
        <div
          className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: "var(--blusukan-secondary-container)" }}
        />
        {/* Overlay tekstur subtle — hanya turunan warna palet (on-primary), bukan warna baru */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 18%, color-mix(in srgb, var(--blusukan-on-primary) 14%, transparent) 0%, transparent 45%), radial-gradient(circle at 88% 8%, color-mix(in srgb, var(--blusukan-on-primary) 10%, transparent) 0%, transparent 40%)",
          }}
        />

        <div className="relative max-w-7xl mx-auto text-center lg:text-left">
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

        {/* ── Search bar — mengambang di batas hero (logic sama persis, hanya restyle) ── */}
        <div className="relative z-10 -mt-12 sm:-mt-14 lg:-mt-16 mb-8 max-w-2xl mx-auto lg:mx-0">
          <div
            className="relative w-full rounded-2xl p-2 flex items-center gap-2.5"
            style={{
              background: "var(--blusukan-surface-container-lowest)",
              border: "1px solid var(--blusukan-outline-variant)",
              boxShadow: "0 20px 50px -12px rgba(0,0,0,0.25), 0 8px 16px -8px rgba(0,0,0,0.1)",
            }}
          >
            <span
              className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
              style={{ background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }}
            >
              <Search size={18} />
            </span>
            <input
              id="search-destinasi"
              type="text"
              placeholder="Cari destinasi atau wilayah…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2.5 pr-4 text-sm transition-all focus:outline-none bg-transparent"
              style={{
                color: "var(--blusukan-on-surface)",
                fontFamily: "Inter, sans-serif",
              }}
            />
          </div>
        </div>

        <div className="space-y-8">
        {/* ── Destination cards — grid 3 kolom (Tugas 1) ── */}
        <section>
          <div className="flex items-center justify-between mb-2.5">
            <h2
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--blusukan-on-surface-variant)", fontFamily: "Inter, sans-serif" }}
            >
              Wilayah
            </h2>
            {/* Tombol Lihat Peta di samping label filter */}
            <button
              id="btn-lihat-peta"
              type="button"
              onClick={() => setMapOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all hover:shadow-md active:scale-95"
              style={{
                background: "var(--blusukan-primary)",
                color: "var(--blusukan-on-primary)",
                fontFamily: "Inter, sans-serif",
              }}
            >
              <Map size={13} />
              Lihat Peta
            </button>
          </div>
          <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
            {WILAYAH_OPTIONS.map((opt) => {
              const active = selectedWilayah === opt.value;
              return (
                <button
                  key={opt.value}
                  id={`filter-wilayah-${opt.value.toLowerCase()}`}
                  onClick={() => setSelectedWilayah(opt.value)}
                  className="shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all"
                  style={
                    active
                      ? {
                          background: "var(--blusukan-primary)",
                          color: "var(--blusukan-on-primary)",
                          border: "1px solid var(--blusukan-primary)",
                          fontFamily: "Inter, sans-serif",
                          boxShadow: "0 4px 12px -4px color-mix(in srgb, var(--blusukan-primary) 60%, transparent)",
                        }
                      : {
                          background: "var(--blusukan-surface-container-lowest)",
                          color: "var(--blusukan-on-surface-variant)",
                          border: "1px solid var(--blusukan-outline-variant)",
                          fontFamily: "Inter, sans-serif",
                        }
                  }
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Kategori filter ── */}
        <section>
          <h2
            className="text-xs font-bold uppercase tracking-widest mb-2.5"
            style={{ color: "var(--blusukan-on-surface-variant)", fontFamily: "Inter, sans-serif" }}
          >
            Kategori
          </h2>
          <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
            {KATEGORI_OPTIONS.map((opt) => {
              const active = selectedKategori === opt.value;
              return (
                <button
                  key={opt.value}
                  id={`filter-kategori-${opt.value.toLowerCase()}`}
                  onClick={() => setSelectedKategori(opt.value)}
                  className="shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all"
                  style={
                    active
                      ? {
                          background: "var(--blusukan-secondary)",
                          color: "var(--blusukan-on-secondary)",
                          border: "1px solid var(--blusukan-secondary)",
                          fontFamily: "Inter, sans-serif",
                          boxShadow: "0 4px 12px -4px color-mix(in srgb, var(--blusukan-secondary) 60%, transparent)",
                        }
                      : {
                          background: "var(--blusukan-surface-container)",
                          color: "var(--blusukan-on-surface-variant)",
                          border: "1px solid transparent",
                          fontFamily: "Inter, sans-serif",
                        }
                  }
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Modal Peta (Tugas 4) ── */}
        <Dialog open={mapOpen} onOpenChange={setMapOpen}>
          <DialogContent
            showCloseButton={false}
            className="!max-w-4xl !w-[calc(100vw-2rem)] !h-[80vh] !p-0 overflow-hidden !rounded-3xl"
            style={{ border: "1px solid var(--blusukan-outline-variant)" }}
          >
            <DialogHeader
              className="flex flex-row items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: "var(--blusukan-outline-variant)", background: "var(--blusukan-surface-container-lowest)" }}
            >
              <DialogTitle
                className="text-sm font-bold flex items-center gap-2.5"
                style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
              >
                <span
                  className="flex items-center justify-center w-7 h-7 rounded-full shrink-0"
                  style={{ background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }}
                >
                  <Map size={14} />
                </span>
                Peta Destinasi Yogyakarta
                {(selectedWilayah !== "ALL" || selectedKategori !== "ALL") && (
                  <span className="ml-1 text-xs font-normal hidden sm:inline" style={{ color: "var(--blusukan-outline)" }}>
                    (pin berwarna = sesuai filter aktif)
                  </span>
                )}
              </DialogTitle>
              <button
                type="button"
                onClick={() => setMapOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:bg-[var(--blusukan-surface-container)]"
                style={{ color: "var(--blusukan-on-surface-variant)" }}
                aria-label="Tutup peta"
              >
                <X size={16} />
              </button>
            </DialogHeader>
            <div className="flex-1" style={{ height: "calc(80vh - 60px)" }}>
              <DestinationMap
                destinations={allMapDestinations}
                highlightIds={filteredIds}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Judul grid + jumlah hasil ── */}
        <div className="flex items-end justify-between gap-3">
          <h2
            className="text-xl sm:text-2xl font-extrabold"
            style={{ color: "var(--blusukan-on-surface)", fontFamily: "Montserrat, sans-serif" }}
          >
            Destinasi Pilihan
          </h2>
          <p className="text-xs shrink-0" style={{ color: "var(--blusukan-outline)", fontFamily: "Inter, sans-serif" }}>
            {filtered.length} dari {destinations.length} destinasi
          </p>
        </div>

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
            filtered.map((dest) => {
              const badge = getRouteBadge(dest.routeStatus);
              const popularityBadge = getPopularityBadge(dest);
              const report = dest.reports[0];
              const signalInfo = report?.signalStrength
                ? SIGNAL_LABEL[report.signalStrength]
                : null;
              const crowdLabel = report?.crowdLevel
                ? CROWD_LABEL[report.crowdLevel]
                : null;

              return (
                <Link
                  key={dest.id}
                  href={`/destinasi/${dest.id}`}
                  id={`card-${dest.id}`}
                  className="group block h-full"
                >
                  <article
                    className="h-full flex flex-col overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1"
                    style={{
                      background: "var(--blusukan-surface-container-lowest)",
                      border: "1px solid var(--blusukan-outline-variant)",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                    }}
                  >
                    {/* Card photo — editorial overlay: badge & judul di atas foto */}
                    <div className="h-56 relative w-full overflow-hidden">
                      {dest.photoUrls[0] ? (
                        <Image
                          src={dest.photoUrls[0]}
                          alt={dest.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 672px"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{
                            background:
                              "linear-gradient(135deg, var(--blusukan-primary-container) 0%, var(--blusukan-tertiary-container) 100%)",
                          }}
                        >
                          <ImageOff size={28} style={{ color: "color-mix(in srgb, var(--blusukan-tertiary) 45%, transparent)" }} />
                        </div>
                      )}

                      {/* Gradient overlay tipis — supaya teks di atas foto tetap terbaca */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.18) 48%, rgba(0,0,0,0) 68%)",
                        }}
                      />

                      {/* Baris atas: badge kondisi rute + badge popularitas */}
                      <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                        {badge ? (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm"
                            style={{
                              background: badge.bg,
                              color: badge.textColor,
                              fontFamily: "Inter, sans-serif",
                            }}
                          >
                            {badge.icon}
                            {badge.label}
                          </span>
                        ) : <span />}

                        {popularityBadge && (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-sm backdrop-blur-sm shrink-0"
                            style={{
                              background: "color-mix(in srgb, var(--blusukan-surface-container-lowest) 90%, transparent)",
                              color: "var(--blusukan-secondary)",
                              fontFamily: "Inter, sans-serif",
                            }}
                          >
                            {popularityBadge.kind === "trending" ? (
                              <TrendingUp size={12} />
                            ) : (
                              <Star size={12} />
                            )}
                            <span className="max-w-[8.5rem] truncate">{popularityBadge.label}</span>
                          </span>
                        )}
                      </div>

                      {/* Teks bawah di atas foto: kategori/wilayah, nama, rating */}
                      <div className="absolute bottom-0 left-0 right-0 p-3.5">
                        <p
                          className="text-[10px] font-bold uppercase tracking-widest mb-1"
                          style={{ color: "var(--blusukan-primary-fixed-dim)", fontFamily: "Inter, sans-serif" }}
                        >
                          {KATEGORI_LABEL[dest.kategori] ?? dest.kategori}
                          {" · "}
                          {KABUPATEN_LABEL[dest.kabupaten] ?? dest.kabupaten}
                        </p>
                        <div className="flex items-end justify-between gap-2">
                          <h3
                            className="text-lg font-extrabold leading-tight"
                            style={{ color: "var(--blusukan-on-primary)", fontFamily: "Montserrat, sans-serif" }}
                          >
                            {dest.name}
                          </h3>
                          {dest.totalReview > 0 && (
                            <span
                              className="inline-flex items-center gap-1 text-xs font-bold shrink-0 px-2 py-1 rounded-full backdrop-blur-sm"
                              style={{
                                background: "color-mix(in srgb, var(--blusukan-on-primary) 18%, transparent)",
                                color: "var(--blusukan-on-primary)",
                                fontFamily: "Inter, sans-serif",
                              }}
                            >
                              <Star size={13} fill="var(--blusukan-rating)" style={{ color: "var(--blusukan-rating)" }} />
                              {dest.rataRataRating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="p-4 flex flex-col flex-1 gap-3">
                      {/* Signal + crowd chips */}
                      {(signalInfo || crowdLabel) && (
                        <div className="flex flex-wrap gap-2">
                          {signalInfo && (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                              style={{
                                background: "var(--blusukan-surface-container)",
                                color: "var(--blusukan-on-surface-variant)",
                                fontFamily: "Inter, sans-serif",
                              }}
                            >
                              {signalInfo.icon}
                              {signalInfo.label}
                            </span>
                          )}
                          {crowdLabel && (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                              style={{
                                background: "var(--blusukan-surface-container)",
                                color: "var(--blusukan-on-surface-variant)",
                                fontFamily: "Inter, sans-serif",
                              }}
                            >
                              <Users size={13} />
                              {crowdLabel}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Vibe tags */}
                      {dest.vibeTags.length > 0 && (
                        <div className="mt-auto flex flex-wrap gap-1.5">
                          {dest.vibeTags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2.5 py-1 rounded-full text-xs font-semibold"
                              style={{
                                background: "var(--blusukan-primary-container)",
                                color: "var(--blusukan-on-primary-container)",
                                fontFamily: "Inter, sans-serif",
                              }}
                            >
                              {VIBE_LABEL[tag] ?? tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                </Link>
              );
            })
          )}
        </section>

        </div> {/* end space-y-8 wrapper */}
      </main>

      {/* ── Fixed bottom navigation ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-2 pt-2 md:hidden backdrop-blur-md"
        style={{
          background: "color-mix(in srgb, var(--blusukan-surface-container-lowest) 92%, transparent)",
          borderTop: "1px solid var(--blusukan-outline-variant)",
          borderRadius: "20px 20px 0 0",
          boxShadow: "0 -8px 24px rgba(0,0,0,0.08)",
          paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))",
        }}
      >
        {/* Beranda — active */}
        <Link
          href="/"
          id="nav-beranda"
          className="flex flex-col items-center justify-center px-5 py-1.5 rounded-2xl"
          style={{ background: "var(--blusukan-primary)" }}
        >
          <Home size={22} style={{ color: "var(--blusukan-on-primary)" }} />
          <span
            className="text-xs font-bold mt-0.5"
            style={{ color: "var(--blusukan-on-primary)", fontFamily: "Inter, sans-serif" }}
          >
            Beranda
          </span>
        </Link>

        {/* Info & Update */}
        <Link
          href="/info"
          id="nav-info"
          className="flex flex-col items-center justify-center px-5 py-1.5 rounded-2xl transition-colors hover:bg-[var(--blusukan-surface-container)]"
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
          className="flex flex-col items-center justify-center px-5 py-1.5 rounded-2xl transition-colors hover:bg-[var(--blusukan-surface-container)]"
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
