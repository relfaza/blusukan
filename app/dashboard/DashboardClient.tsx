"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react";
import StatistikSection from "./StatistikSection";
import TrenKunjunganSection from "./TrenKunjunganSection";

export default function DashboardClient() {
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
        <TrenKunjunganSection />
      </div>
    </div>
  );
}
