"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Flame, Receipt, Star } from "lucide-react";

const KABUPATEN_LABEL: Record<string, string> = {
  SLEMAN: "Sleman",
  GUNUNGKIDUL: "Gunungkidul",
  BANTUL: "Bantul",
  KULON_PROGO: "Kulon Progo",
  KOTA_YOGYAKARTA: "Kota Yogyakarta",
};

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export type PeringkatWidgetItem = {
  id: string;
  name: string;
  kabupaten: string;
  /** jumlahKunjungan (mode "kunjungan") atau totalPendapatan (mode "pendapatan") */
  primaryValue: number;
  rataRataRating: number;
  totalReview: number;
};

type ActiveMode = "primary" | "rating";

interface PeringkatWidgetProps {
  title: string;
  items: PeringkatWidgetItem[];
  defaultMode: "kunjungan" | "pendapatan";
  source: "dashboard" | "keuangan";
}

export default function PeringkatWidget({ title, items, defaultMode, source }: PeringkatWidgetProps) {
  const [activeMode, setActiveMode] = useState<ActiveMode>("primary");

  const primaryLabel = defaultMode === "kunjungan" ? "Populer" : "Terlaris";
  const primaryIcon = defaultMode === "kunjungan" ? <Flame size={13} /> : <Receipt size={13} />;

  // Mode "primary" selalu diurutkan berdasarkan primaryValue — destinasi dengan nilai
  // tertinggi harus tetap #1 walau rating-nya rendah, jadi rating tidak boleh ikut campur di sini.
  const primaryTop5 = [...items].sort((a, b) => b.primaryValue - a.primaryValue).slice(0, 5);
  const ratingTop5 = items
    .filter((d) => d.totalReview > 0)
    .sort((a, b) => b.rataRataRating - a.rataRataRating)
    .slice(0, 5);

  const displayed = activeMode === "primary" ? primaryTop5 : ratingTop5;

  const fullPeringkatHref =
    activeMode === "rating"
      ? `/dashboard/peringkat-rating?from=${source}`
      : defaultMode === "kunjungan"
        ? `/dashboard/peringkat?from=${source}`
        : `/dashboard/peringkat-keuangan?from=${source}`;

  function destinasiHref(id: string): string {
    return source === "keuangan" ? `/dashboard/destinasi/${id}?from=keuangan` : `/dashboard/destinasi/${id}`;
  }

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2
          className="text-lg font-bold"
          style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
        >
          {title}
        </h2>
        <div
          className="inline-flex p-1 rounded-xl shrink-0"
          style={{ background: "var(--blusukan-surface)", border: "1px solid var(--blusukan-outline-variant)" }}
        >
          <button
            type="button"
            id="peringkat-widget-toggle-primary"
            onClick={() => setActiveMode("primary")}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            style={{
              background: activeMode === "primary" ? "var(--blusukan-primary)" : "transparent",
              color: activeMode === "primary" ? "#ffffff" : "var(--blusukan-on-surface-variant)",
            }}
          >
            {primaryIcon}
            {primaryLabel}
          </button>
          <button
            type="button"
            id="peringkat-widget-toggle-rating"
            onClick={() => setActiveMode("rating")}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            style={{
              background: activeMode === "rating" ? "var(--blusukan-primary)" : "transparent",
              color: activeMode === "rating" ? "#ffffff" : "var(--blusukan-on-surface-variant)",
            }}
          >
            <Star size={13} />
            Rating
          </button>
        </div>
      </div>

      {displayed.length === 0 ? (
        <div
          className="rounded-2xl p-6 text-center"
          style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
        >
          <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            {activeMode === "rating" ? "Belum ada destinasi dengan ulasan" : "Belum ada destinasi yang disetujui"}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}>
          {displayed.map((d, idx) => {
            const rank = idx + 1;
            return (
              <Link
                key={d.id}
                href={destinasiHref(d.id)}
                id={`row-peringkat-widget-${d.id}`}
                className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[#f7f8f5]"
                style={{ borderTop: idx === 0 ? "none" : "1px solid var(--blusukan-outline-variant)" }}
              >
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                  style={{
                    background: rank <= 3 ? "var(--blusukan-primary)" : "var(--blusukan-surface)",
                    color: rank <= 3 ? "#ffffff" : "var(--blusukan-on-surface-variant)",
                  }}
                >
                  #{rank}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-bold truncate"
                    style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
                  >
                    {d.name}
                  </p>
                  <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                    {KABUPATEN_LABEL[d.kabupaten] ?? d.kabupaten}
                  </p>
                </div>
                {activeMode === "rating" ? (
                  <p className="text-sm font-bold shrink-0 flex items-center gap-1" style={{ color: "var(--blusukan-primary)" }}>
                    <Star size={13} fill="#f5a623" style={{ color: "#f5a623" }} />
                    {d.rataRataRating.toFixed(1)} ({d.totalReview})
                  </p>
                ) : (
                  <p className="text-sm font-bold shrink-0" style={{ color: "var(--blusukan-primary)" }}>
                    {defaultMode === "kunjungan" ? `${d.primaryValue} kunjungan` : formatRupiah(d.primaryValue)}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}

      <Link
        href={fullPeringkatHref}
        id="peringkat-widget-lihat-lengkap"
        className="flex items-center gap-0.5 text-xs font-semibold mt-3 hover:opacity-70 transition-opacity"
        style={{ color: "var(--blusukan-primary)" }}
      >
        Lihat Peringkat Lengkap
        <ChevronRight size={14} />
      </Link>
    </div>
  );
}
