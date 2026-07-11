"use client";

import StatistikSection from "./StatistikSection";
import TrenKunjunganSection from "./TrenKunjunganSection";
import PeringkatWidget, { type PeringkatWidgetItem } from "@/components/admin/peringkat-widget";
import type { PeringkatDestinasi } from "@/lib/peringkat";

export default function DashboardClient({ peringkat }: { peringkat: PeringkatDestinasi[] }) {
  const peringkatWidgetItems: PeringkatWidgetItem[] = peringkat.map((d) => ({
    id: d.id,
    name: d.name,
    kabupaten: d.kabupaten,
    primaryValue: d.jumlahKunjungan,
    rataRataRating: d.rataRataRating,
    totalReview: d.totalReview,
  }));

  return (
    <div className="min-h-screen" style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
        >
          Dashboard Admin
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Ringkasan aktivitas Blusukan
        </p>

        <StatistikSection />
        <PeringkatWidget title="🏆 Top 5 Destinasi" items={peringkatWidgetItems} defaultMode="kunjungan" source="dashboard" />
        <TrenKunjunganSection />
      </div>
    </div>
  );
}
