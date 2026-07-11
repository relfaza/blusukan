"use client";

import Link from "next/link";
import { TrendingUp, ChevronRight } from "lucide-react";
import StatistikSection from "./StatistikSection";
import TrenKunjunganSection from "./TrenKunjunganSection";
import type { PeringkatDestinasi } from "@/lib/peringkat";

const KABUPATEN_LABEL: Record<string, string> = {
  SLEMAN: "Sleman",
  GUNUNGKIDUL: "Gunungkidul",
  BANTUL: "Bantul",
  KULON_PROGO: "Kulon Progo",
  KOTA_YOGYAKARTA: "Kota Yogyakarta",
};

function TopDestinasiWidget({ items }: { items: PeringkatDestinasi[] }) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2
          className="text-lg font-bold"
          style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
        >
          🏆 Top 5 Destinasi Terpopuler
        </h2>
        <Link
          href="/dashboard/peringkat"
          id="link-lihat-peringkat-lengkap"
          className="flex items-center gap-0.5 text-xs font-semibold hover:opacity-70 transition-opacity"
          style={{ color: "var(--blusukan-primary)" }}
        >
          Lihat Peringkat Lengkap
          <ChevronRight size={14} />
        </Link>
      </div>

      {items.length === 0 ? (
        <div
          className="rounded-2xl p-6 text-center"
          style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
        >
          <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Belum ada destinasi yang disetujui
          </p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}>
          {items.map((d, idx) => {
            const rank = idx + 1;
            return (
              <Link
                key={d.id}
                href={`/dashboard/destinasi/${d.id}`}
                id={`row-top-populer-${d.id}`}
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
                <p className="text-sm font-bold shrink-0" style={{ color: "var(--blusukan-primary)" }}>
                  {d.jumlahKunjungan} kunjungan
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function DashboardClient({ top5Destinasi }: { top5Destinasi: PeringkatDestinasi[] }) {
  return (
    <div className="min-h-screen" style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
          >
            Dashboard Admin
          </h1>
          <Link
            href="/dashboard/peringkat"
            id="link-lihat-peringkat-dashboard"
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full transition-opacity hover:opacity-90"
            style={{ background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }}
          >
            <TrendingUp size={14} />
            Lihat Peringkat Keramaian
          </Link>
        </div>
        <p className="text-sm mb-8" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Ringkasan aktivitas Blusukan
        </p>

        <StatistikSection />
        <TopDestinasiWidget items={top5Destinasi} />
        <TrenKunjunganSection />
      </div>
    </div>
  );
}
