"use client";

import StatistikSection from "./StatistikSection";
import PeringkatWidget, { type PeringkatWidgetItem, type PeringkatWidgetTab } from "@/components/admin/peringkat-widget";
import InsightAi from "@/components/admin/insight-ai";
import type { PeringkatDestinasi } from "@/lib/peringkat";

const PERINGKAT_TABS: PeringkatWidgetTab[] = [
  { key: "populer", label: "Populer", dataSource: "kunjungan" },
  { key: "rating", label: "Rating", dataSource: "rating" },
  { key: "pendapatan", label: "Pendapatan", dataSource: "pendapatan" },
];

export default function DashboardClient({ peringkat }: { peringkat: PeringkatDestinasi[] }) {
  const initialItems: PeringkatWidgetItem[] = peringkat.map((d) => ({
    id: d.id,
    name: d.name,
    kabupaten: d.kabupaten,
    value: d.jumlahKunjungan,
  }));

  return (
    <div className="min-h-screen" style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
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
        <InsightAi />
        <PeringkatWidget
          title="🏆 Top 5 Destinasi"
          tabs={PERINGKAT_TABS}
          initialItems={initialItems}
          source="dashboard"
        />
      </div>
    </div>
  );
}
