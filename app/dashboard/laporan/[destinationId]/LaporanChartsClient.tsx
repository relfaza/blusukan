"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type MouseHandlerDataParam,
} from "recharts";
import ChartDetailDialog, { type DetailColumn } from "../../ChartDetailDialog";
import { useChartDetail } from "../../useChartDetail";
import type { LaporanDistribusi } from "@/lib/laporan";

const ROAD_LABEL: Record<string, string> = {
  MUDAH: "Mudah",
  SEDANG: "Sedang",
  SULIT: "Sulit",
  RUSAK: "Rusak",
  BELUM_ADA_DATA: "Belum ada data",
};

const ROAD_COLOR: Record<string, string> = {
  MUDAH: "var(--blusukan-primary)",
  SEDANG: "var(--blusukan-secondary)",
  SULIT: "var(--blusukan-tertiary)",
  RUSAK: "var(--blusukan-error)",
  BELUM_ADA_DATA: "var(--blusukan-outline)",
};

const SIGNAL_LABEL: Record<string, string> = {
  LEMAH: "Lemah",
  SEDANG: "Sedang",
  KUAT: "Kuat",
};

const SIGNAL_COLOR: Record<string, string> = {
  LEMAH: "var(--blusukan-error)",
  SEDANG: "var(--blusukan-secondary)",
  KUAT: "var(--blusukan-primary)",
};

const CROWD_LABEL: Record<string, string> = {
  SEPI: "Sepi",
  SEDANG: "Sedang",
  PADAT: "Padat",
};

const CROWD_COLOR: Record<string, string> = {
  SEPI: "var(--blusukan-primary)",
  SEDANG: "var(--blusukan-secondary)",
  PADAT: "var(--blusukan-tertiary)",
};

function formatTanggalSingkat(iso: unknown): string {
  if (typeof iso !== "string" || !iso) return "–";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

const ROAD_CLICK_COLUMNS: DetailColumn[] = [
  { key: "userName", label: "Pelapor" },
  { key: "signalStrength", label: "Sinyal", format: (v) => SIGNAL_LABEL[v as string] ?? String(v) },
  { key: "crowdLevel", label: "Keramaian", format: (v) => CROWD_LABEL[v as string] ?? String(v) },
  { key: "notes", label: "Catatan", format: (v) => (v ? String(v) : "–") },
  { key: "createdAt", label: "Tanggal", format: formatTanggalSingkat },
];

const SIGNAL_CLICK_COLUMNS: DetailColumn[] = [
  { key: "userName", label: "Pelapor" },
  { key: "roadCondition", label: "Kondisi Jalan", format: (v) => ROAD_LABEL[v as string] ?? String(v) },
  { key: "crowdLevel", label: "Keramaian", format: (v) => CROWD_LABEL[v as string] ?? String(v) },
  { key: "notes", label: "Catatan", format: (v) => (v ? String(v) : "–") },
  { key: "createdAt", label: "Tanggal", format: formatTanggalSingkat },
];

const CROWD_CLICK_COLUMNS: DetailColumn[] = [
  { key: "userName", label: "Pelapor" },
  { key: "roadCondition", label: "Kondisi Jalan", format: (v) => ROAD_LABEL[v as string] ?? String(v) },
  { key: "signalStrength", label: "Sinyal", format: (v) => SIGNAL_LABEL[v as string] ?? String(v) },
  { key: "notes", label: "Catatan", format: (v) => (v ? String(v) : "–") },
  { key: "createdAt", label: "Tanggal", format: formatTanggalSingkat },
];

const axisTickStyle = { fontSize: 11, fill: "var(--blusukan-on-surface-variant)" };

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ value?: unknown }>;
  label?: string | number;
}) {
  if (!active || !payload || !payload.length) return null;
  const value = Number(payload[0]?.value ?? 0);
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-md"
      style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
    >
      <p style={{ color: "var(--blusukan-on-surface-variant)" }}>{label}</p>
      <p className="font-bold" style={{ color: "var(--blusukan-on-surface)" }}>
        {value} laporan
      </p>
    </div>
  );
}

function DistribusiBarChart({
  data,
  labelMap,
  colorMap,
  onBarClick,
}: {
  data: { kondisi: string; jumlah: number }[];
  labelMap: Record<string, string>;
  colorMap: Record<string, string>;
  onBarClick?: (raw: string, label: string) => void;
}) {
  if (data.length === 0 || data.every((d) => d.jumlah === 0)) {
    return (
      <div className="h-[160px] flex items-center justify-center text-center">
        <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Belum ada data
        </p>
      </div>
    );
  }

  const chartData = data.map((d) => ({ label: labelMap[d.kondisi] ?? d.kondisi, jumlah: d.jumlah, raw: d.kondisi }));

  const handleClick = (state: MouseHandlerDataParam) => {
    if (!onBarClick || typeof state?.activeLabel !== "string") return;
    const match = chartData.find((d) => d.label === state.activeLabel);
    if (match) onBarClick(match.raw, match.label);
  };

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 8, left: -20, bottom: 0 }}
        style={{ cursor: onBarClick ? "pointer" : undefined }}
        onClick={handleClick}
      >
        <CartesianGrid vertical={false} stroke="var(--blusukan-outline-variant)" />
        <XAxis dataKey="label" tick={axisTickStyle} axisLine={{ stroke: "var(--blusukan-outline-variant)" }} tickLine={false} />
        <YAxis allowDecimals={false} tick={axisTickStyle} axisLine={false} tickLine={false} width={24} />
        <Tooltip
          content={({ active, payload, label }) => (
            <ChartTooltip active={active} payload={payload} label={label} />
          )}
        />
        <Bar dataKey="jumlah" radius={[4, 4, 0, 0]} maxBarSize={36}>
          <LabelList
            dataKey="jumlah"
            position="top"
            style={{ fontSize: 11, fontWeight: 700, fill: "var(--blusukan-on-surface)" }}
          />
          {chartData.map((entry) => (
            <Cell key={entry.raw} fill={colorMap[entry.raw] ?? "var(--blusukan-primary)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}>
      <h3
        className="text-xs font-bold mb-2"
        style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function LaporanChartsClient({
  destinationId,
  distribusi,
}: {
  destinationId: string;
  distribusi: LaporanDistribusi;
}) {
  const { state: detailState, show: showDetail, onOpenChange: closeDetail } = useChartDetail();

  function handleRoadClick(raw: string, label: string) {
    showDetail({ destinationId, roadCondition: raw }, `Kondisi Jalan: ${label}`, ROAD_CLICK_COLUMNS, "/api/admin/laporan");
  }

  function handleSignalClick(raw: string, label: string) {
    showDetail({ destinationId, signalStrength: raw }, `Kekuatan Sinyal: ${label}`, SIGNAL_CLICK_COLUMNS, "/api/admin/laporan");
  }

  function handleCrowdClick(raw: string, label: string) {
    showDetail({ destinationId, crowdLevel: raw }, `Tingkat Keramaian: ${label}`, CROWD_CLICK_COLUMNS, "/api/admin/laporan");
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <ChartCard title="Kondisi Jalan">
          <DistribusiBarChart data={distribusi.roadCondition} labelMap={ROAD_LABEL} colorMap={ROAD_COLOR} onBarClick={handleRoadClick} />
        </ChartCard>
        <ChartCard title="Kekuatan Sinyal">
          <DistribusiBarChart data={distribusi.signalStrength} labelMap={SIGNAL_LABEL} colorMap={SIGNAL_COLOR} onBarClick={handleSignalClick} />
        </ChartCard>
        <ChartCard title="Tingkat Keramaian">
          <DistribusiBarChart data={distribusi.crowdLevel} labelMap={CROWD_LABEL} colorMap={CROWD_COLOR} onBarClick={handleCrowdClick} />
        </ChartCard>
      </div>

      <ChartDetailDialog state={detailState} onOpenChange={closeDetail} />
    </>
  );
}
