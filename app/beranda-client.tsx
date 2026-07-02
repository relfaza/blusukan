"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Home,
  AlertTriangle,
  CalendarCheck,
  User,
  CheckCircle,
  Droplets,
  Wifi,
  WifiOff,
  Users,
  MapPin,
} from "lucide-react";
import type { MapDestination } from "@/components/DestinationMap";

// Leaflet is browser-only — load dynamically with ssr: false
const DestinationMap = dynamic(
  () => import("@/components/DestinationMap"),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ background: "#f3f3f3" }}
      >
        <span className="text-sm" style={{ color: "#72796e" }}>
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
        bg: "#2d5a27",
        textColor: "#ffffff",
        icon: <CheckCircle size={12} />,
      };
    case "SULIT":
      return {
        label: "Berlumpur",
        bg: "#44372a",
        textColor: "#ffffff",
        icon: <Droplets size={12} />,
      };
    case "RUSAK":
      return {
        label: "Rusak",
        bg: "#ba1a1a",
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

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return destinations.filter((d) => {
      const matchSearch =
        !q ||
        d.name.toLowerCase().includes(q) ||
        KABUPATEN_LABEL[d.kabupaten]?.toLowerCase().includes(q);
      const matchWilayah =
        selectedWilayah === "ALL" || d.kabupaten === selectedWilayah;
      const matchKategori =
        selectedKategori === "ALL" || d.kategori === selectedKategori;
      return matchSearch && matchWilayah && matchKategori;
    });
  }, [destinations, searchQuery, selectedWilayah, selectedKategori]);

  const mapDestinations: MapDestination[] = filtered.map((d) => ({
    id: d.id,
    name: d.name,
    latitude: d.latitude,
    longitude: d.longitude,
    routeStatus: d.routeStatus,
  }));

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#f9f9f9", color: "#1a1c1c" }}
    >
      {/* ── Sticky search header ── */}
      <header
        className="sticky top-0 z-40 px-4 py-3 border-b"
        style={{
          background: "rgba(249,249,249,0.92)",
          backdropFilter: "blur(8px)",
          borderColor: "#c2c9bb",
        }}
      >
        <div className="relative w-full max-w-2xl mx-auto">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "#72796e" }}
          />
          <input
            id="search-destinasi"
            type="text"
            placeholder="Cari destinasi atau wilayah…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-3 pl-11 pr-4 rounded-full text-sm transition-all focus:outline-none focus:ring-2"
            style={{
              background: "#ffffff",
              border: "1px solid #c2c9bb",
              color: "#1a1c1c",
              fontFamily: "Inter, sans-serif",
              // focus ring colour set via JS below — ring-2 defaults to theme ring
            }}
          />
        </div>
      </header>

      {/* ── Main scrollable content ── */}
      <main className="flex-1 px-4 py-5 pb-28 space-y-6 max-w-2xl mx-auto w-full">

        {/* ── Wilayah filter ── */}
        <section>
          <h2
            className="text-xs font-semibold uppercase tracking-wide mb-2"
            style={{ color: "#42493e", fontFamily: "Inter, sans-serif" }}
          >
            Wilayah
          </h2>
          <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
            {WILAYAH_OPTIONS.map((opt) => {
              const active = selectedWilayah === opt.value;
              return (
                <button
                  key={opt.value}
                  id={`filter-wilayah-${opt.value.toLowerCase()}`}
                  onClick={() => setSelectedWilayah(opt.value)}
                  className="shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-colors"
                  style={
                    active
                      ? {
                          background: "#154212",
                          color: "#ffffff",
                          border: "1px solid #154212",
                          fontFamily: "Inter, sans-serif",
                        }
                      : {
                          background: "#ffffff",
                          color: "#1a1c1c",
                          border: "1px solid #c2c9bb",
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
            className="text-xs font-semibold uppercase tracking-wide mb-2"
            style={{ color: "#42493e", fontFamily: "Inter, sans-serif" }}
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
                  className="shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-colors"
                  style={
                    active
                      ? {
                          background: "#2d5a27",
                          color: "#ffffff",
                          border: "1px solid #2d5a27",
                          fontFamily: "Inter, sans-serif",
                        }
                      : {
                          background: "#e2e2e2",
                          color: "#1a1c1c",
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

        {/* ── Leaflet Map ── */}
        <section
          className="rounded-xl overflow-hidden border shadow-sm"
          style={{
            height: 280,
            borderColor: "#44372a",
            background: "#f3f3f3",
          }}
        >
          <DestinationMap destinations={mapDestinations} />
        </section>

        {/* ── Destination cards ── */}
        <section className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <MapPin
                size={48}
                className="mx-auto mb-4"
                style={{ color: "#c2c9bb" }}
              />
              <p
                className="text-base font-semibold"
                style={{ color: "#42493e", fontFamily: "Montserrat, sans-serif" }}
              >
                Belum ada destinasi tersedia
              </p>
              <p className="text-sm mt-1" style={{ color: "#72796e" }}>
                Coba ubah filter atau kata kunci pencarian
              </p>
            </div>
          ) : (
            filtered.map((dest) => {
              const badge = getRouteBadge(dest.routeStatus);
              const report = dest.reports[0];
              const signalInfo = report?.signalStrength
                ? SIGNAL_LABEL[report.signalStrength]
                : null;
              const crowdLabel = report?.crowdLevel
                ? CROWD_LABEL[report.crowdLevel]
                : null;

              return (
                <article
                  key={dest.id}
                  className="rounded-xl overflow-hidden flex flex-col transition-shadow hover:shadow-lg"
                  style={{
                    background: "#ffffff",
                    border: "1px solid #44372a",
                  }}
                >
                  {/* Card photo */}
                  <div className="h-48 relative w-full">
                    <Image
                      src="/destination-placeholder.png"
                      alt={dest.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 672px"
                    />
                    {/* Road condition badge */}
                    {badge && (
                      <div className="absolute top-2 left-2">
                        <span
                          className="flex items-center gap-1 px-2 py-1 rounded text-xs font-bold shadow-sm"
                          style={{
                            background: badge.bg,
                            color: badge.textColor,
                            fontFamily: "Inter, sans-serif",
                          }}
                        >
                          {badge.icon}
                          {badge.label}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-4 flex flex-col flex-1">
                    {/* Category + name */}
                    <p
                      className="text-xs font-bold uppercase tracking-wider mb-1"
                      style={{
                        color: "#805533",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {KATEGORI_LABEL[dest.kategori] ?? dest.kategori}
                    </p>
                    <h3
                      className="text-lg font-bold leading-tight mb-3"
                      style={{
                        color: "#1a1c1c",
                        fontFamily: "Montserrat, sans-serif",
                      }}
                    >
                      {dest.name}
                    </h3>

                    {/* Signal + crowd chips */}
                    {(signalInfo || crowdLabel) && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {signalInfo && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs"
                            style={{
                              background: "#eeeeee",
                              color: "#42493e",
                              fontFamily: "Inter, sans-serif",
                            }}
                          >
                            {signalInfo.icon}
                            {signalInfo.label}
                          </span>
                        )}
                        {crowdLabel && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs"
                            style={{
                              background: "#eeeeee",
                              color: "#42493e",
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
                      <div className="mt-auto flex flex-wrap gap-1">
                        {dest.vibeTags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 rounded text-xs font-semibold"
                            style={{
                              background: "rgba(161, 212, 148, 0.2)",
                              color: "#154212",
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
              );
            })
          )}
        </section>
      </main>

      {/* ── Fixed bottom navigation ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-2 pt-2 pb-3 md:hidden"
        style={{
          background: "#f9f9f9",
          borderTop: "1px solid #44372a",
          borderRadius: "12px 12px 0 0",
          boxShadow: "0 -2px 12px rgba(0,0,0,0.08)",
        }}
      >
        {/* Beranda — active */}
        <Link
          href="/"
          id="nav-beranda"
          className="flex flex-col items-center justify-center px-4 py-1 rounded-full"
          style={{ background: "#2d5a27" }}
        >
          <Home size={22} style={{ color: "#9dd090" }} />
          <span
            className="text-xs font-bold mt-0.5"
            style={{ color: "#9dd090", fontFamily: "Inter, sans-serif" }}
          >
            Beranda
          </span>
        </Link>

        {/* Laporan */}
        <Link
          href="/laporan"
          id="nav-laporan"
          className="flex flex-col items-center justify-center px-4 py-1 rounded-full hover:bg-[#e8e8e8] transition-colors"
        >
          <AlertTriangle size={22} style={{ color: "#42493e" }} />
          <span
            className="text-xs font-semibold mt-0.5"
            style={{ color: "#42493e", fontFamily: "Inter, sans-serif" }}
          >
            Laporan
          </span>
        </Link>

        {/* Booking */}
        <Link
          href="/booking"
          id="nav-booking"
          className="flex flex-col items-center justify-center px-4 py-1 rounded-full hover:bg-[#e8e8e8] transition-colors"
        >
          <CalendarCheck size={22} style={{ color: "#42493e" }} />
          <span
            className="text-xs font-semibold mt-0.5"
            style={{ color: "#42493e", fontFamily: "Inter, sans-serif" }}
          >
            Booking
          </span>
        </Link>

        {/* Profil */}
        <Link
          href="/profil"
          id="nav-profil"
          className="flex flex-col items-center justify-center px-4 py-1 rounded-full hover:bg-[#e8e8e8] transition-colors"
        >
          <User size={22} style={{ color: "#42493e" }} />
          <span
            className="text-xs font-semibold mt-0.5"
            style={{ color: "#42493e", fontFamily: "Inter, sans-serif" }}
          >
            Profil
          </span>
        </Link>
      </nav>
    </div>
  );
}
