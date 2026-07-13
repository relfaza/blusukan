"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle,
  Droplets,
  ImageOff,
  Star,
  TrendingUp,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import type { DestinationForClient } from "@/lib/destinasi-beranda";
import { getPopularityBadge } from "@/lib/popularity";

// ── Label maps ───────────────────────────────────────────────
export const KABUPATEN_LABEL: Record<string, string> = {
  SLEMAN: "Sleman",
  GUNUNGKIDUL: "Gunungkidul",
  BANTUL: "Bantul",
  KULON_PROGO: "Kulon Progo",
  KOTA_YOGYAKARTA: "Kota Yogyakarta",
};

export const KATEGORI_LABEL: Record<string, string> = {
  PANTAI: "Pantai",
  AIR_TERJUN: "Air Terjun",
  GUNUNG: "Gunung",
  BUKIT: "Bukit",
  TEBING: "Tebing",
};

export const VIBE_LABEL: Record<string, string> = {
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

interface DestinasiCardProps {
  dest: DestinationForClient;
  /** Baris tambahan di bawah nama — dipakai asisten AI untuk menaruh alasan rekomendasi. */
  footer?: React.ReactNode;
}

/**
 * Kartu destinasi — dipakai di grid Beranda dan di hasil rekomendasi asisten AI,
 * supaya keduanya selalu menampilkan badge & info yang sama.
 */
export default function DestinasiCard({ dest, footer }: DestinasiCardProps) {
  const badge = getRouteBadge(dest.routeStatus);
  const popularityBadge = getPopularityBadge(dest);
  const report = dest.reports[0];
  const signalInfo = report?.signalStrength ? SIGNAL_LABEL[report.signalStrength] : null;
  const crowdLabel = report?.crowdLevel ? CROWD_LABEL[report.crowdLevel] : null;

  return (
    <Link href={`/destinasi/${dest.id}`} id={`card-${dest.id}`} className="group block h-full">
      <article
        className="h-full flex flex-col overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1"
        style={{
          background: "var(--blusukan-surface-container-lowest)",
          border: "1px solid var(--blusukan-outline-variant)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        }}
      >
        {/* Card photo — polos, tanpa overlay/badge/teks di atasnya */}
        <div className="aspect-[4/3] relative w-full overflow-hidden shrink-0">
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
              <ImageOff
                size={28}
                style={{ color: "color-mix(in srgb, var(--blusukan-tertiary) 45%, transparent)" }}
              />
            </div>
          )}
        </div>

        {/* Card body — seluruh keterangan ada di sini, tinggi antar-card dijaga konsisten oleh flex-col + mt-auto pada vibe tags */}
        <div className="p-4 flex flex-col flex-1 gap-2.5">
          {/* Kategori + wilayah */}
          <p
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "var(--blusukan-secondary)", fontFamily: "Inter, sans-serif" }}
          >
            {KATEGORI_LABEL[dest.kategori] ?? dest.kategori}
            {" · "}
            {KABUPATEN_LABEL[dest.kabupaten] ?? dest.kabupaten}
          </p>

          {/* Nama + rating */}
          <div className="flex items-start justify-between gap-2">
            <h3
              className="text-lg font-extrabold leading-tight"
              style={{ color: "var(--blusukan-on-surface)", fontFamily: "Montserrat, sans-serif" }}
            >
              {dest.name}
            </h3>
            {dest.totalReview > 0 && (
              <span
                className="inline-flex items-center gap-1 text-xs font-bold shrink-0"
                style={{ color: "var(--blusukan-on-surface)", fontFamily: "Inter, sans-serif" }}
              >
                <Star size={13} fill="var(--blusukan-rating)" style={{ color: "var(--blusukan-rating)" }} />
                {dest.rataRataRating.toFixed(1)}
              </span>
            )}
          </div>

          {footer}

          {/* Badge kondisi rute + badge popularitas */}
          {(badge || popularityBadge) && (
            <div className="flex flex-wrap items-center gap-1.5">
              {badge && (
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
                  style={{
                    background: badge.bg,
                    color: badge.textColor,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {badge.icon}
                  {badge.label}
                </span>
              )}
              {popularityBadge && (
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                  style={{
                    background: "var(--blusukan-secondary-container)",
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
          )}

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

          {/* Vibe tags — mt-auto supaya menempel di bawah, menjaga tinggi card tetap sejajar antar-baris */}
          {dest.vibeTags.length > 0 && (
            <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
              {dest.vibeTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: "color-mix(in srgb, var(--blusukan-primary-fixed-dim) 25%, transparent)",
                    color: "var(--blusukan-primary)",
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
}
