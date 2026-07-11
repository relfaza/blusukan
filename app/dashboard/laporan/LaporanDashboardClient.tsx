"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, MapPin } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartDetailDialog, { type DetailColumn } from "../ChartDetailDialog";
import { useChartDetail } from "../useChartDetail";

type DestinasiLaporan = {
  id: string;
  name: string;
  kabupaten: string;
  jumlahLaporan: number;
  breakdownKondisiJalan: Record<string, number>;
};

type LaporanTotal = {
  distribusiKondisiJalan: { kondisi: string; jumlah: number }[];
};

const KABUPATEN_LABEL: Record<string, string> = {
  SLEMAN: "Sleman",
  GUNUNGKIDUL: "Gunungkidul",
  BANTUL: "Bantul",
  KULON_PROGO: "Kulon Progo",
  KOTA_YOGYAKARTA: "Kota Yogyakarta",
};

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

const CROWD_LABEL: Record<string, string> = {
  SEPI: "Sepi",
  SEDANG: "Sedang",
  PADAT: "Padat",
};

function formatTanggalSingkat(iso: unknown): string {
  if (typeof iso !== "string" || !iso) return "–";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

const LAPORAN_DESTINASI_COLUMNS: DetailColumn[] = [
  { key: "userName", label: "Pelapor" },
  { key: "roadCondition", label: "Kondisi Jalan", format: (v) => ROAD_LABEL[v as string] ?? String(v) },
  { key: "crowdLevel", label: "Keramaian", format: (v) => CROWD_LABEL[v as string] ?? String(v) },
  { key: "notes", label: "Catatan", format: (v) => (v ? String(v) : "–") },
  { key: "createdAt", label: "Tanggal", format: formatTanggalSingkat },
];

const KONDISI_JALAN_COLUMNS: DetailColumn[] = [
  { key: "destinationName", label: "Destinasi" },
  { key: "userName", label: "Pelapor" },
  { key: "crowdLevel", label: "Keramaian", format: (v) => CROWD_LABEL[v as string] ?? String(v) },
  { key: "createdAt", label: "Tanggal", format: formatTanggalSingkat },
];

const axisTickStyle = { fontSize: 11, fill: "var(--blusukan-on-surface-variant)" };

function formatBreakdownRingkas(breakdown: Record<string, number>): string {
  const entries = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return "Belum ada data kondisi";
  return entries
    .slice(0, 2)
    .map(([kondisi, jumlah]) => `${jumlah} ${ROAD_LABEL[kondisi] ?? kondisi}`)
    .join(", ");
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number | string }>;
  label?: string;
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

function TopLaporanChart({
  data,
  onBarClick,
}: {
  data: DestinasiLaporan[];
  onBarClick?: (destinationId: string, name: string) => void;
}) {
  const top5 = data.slice(0, 5).map((d) => ({ name: d.name, jumlahLaporan: d.jumlahLaporan, id: d.id }));

  if (top5.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-center">
        <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Data belum cukup untuk ditampilkan
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={top5}
        margin={{ top: 20, right: 12, left: -16, bottom: 0 }}
        style={{ cursor: onBarClick ? "pointer" : undefined }}
        onClick={(state: any) => {
          if (!onBarClick || typeof state?.activeLabel !== "string") return;
          const match = top5.find((d) => d.name === state.activeLabel);
          if (match) onBarClick(match.id, match.name);
        }}
      >
        <CartesianGrid vertical={false} stroke="var(--blusukan-outline-variant)" />
        <XAxis dataKey="name" tick={axisTickStyle} axisLine={{ stroke: "var(--blusukan-outline-variant)" }} tickLine={false} />
        <YAxis allowDecimals={false} tick={axisTickStyle} axisLine={false} tickLine={false} width={28} />
        <Tooltip
          content={({ active, payload, label }: any) => (
            <ChartTooltip active={active} payload={payload} label={label} />
          )}
        />
        <Bar dataKey="jumlahLaporan" fill="var(--blusukan-primary)" radius={[4, 4, 0, 0]} maxBarSize={40}>
          <LabelList
            dataKey="jumlahLaporan"
            position="top"
            style={{ fontSize: 11, fontWeight: 700, fill: "var(--blusukan-on-surface)" }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function DistribusiKondisiJalanTotalChart({
  data,
  onBarClick,
}: {
  data: LaporanTotal["distribusiKondisiJalan"];
  onBarClick?: (kondisiRaw: string, kondisiLabel: string) => void;
}) {
  if (data.length === 0 || data.every((d) => d.jumlah === 0)) {
    return (
      <div className="h-[200px] flex items-center justify-center text-center">
        <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Data belum cukup untuk ditampilkan
        </p>
      </div>
    );
  }

  const chartData = data.map((d) => ({ kondisi: ROAD_LABEL[d.kondisi] ?? d.kondisi, jumlah: d.jumlah, raw: d.kondisi }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 12, left: -16, bottom: 0 }}
        style={{ cursor: onBarClick ? "pointer" : undefined }}
        onClick={(state: any) => {
          if (!onBarClick || typeof state?.activeLabel !== "string") return;
          const match = chartData.find((d) => d.kondisi === state.activeLabel);
          if (match) onBarClick(match.raw, match.kondisi);
        }}
      >
        <CartesianGrid vertical={false} stroke="var(--blusukan-outline-variant)" />
        <XAxis dataKey="kondisi" tick={axisTickStyle} axisLine={{ stroke: "var(--blusukan-outline-variant)" }} tickLine={false} />
        <YAxis allowDecimals={false} tick={axisTickStyle} axisLine={false} tickLine={false} width={28} />
        <Tooltip
          content={({ active, payload, label }: any) => (
            <ChartTooltip active={active} payload={payload} label={label} />
          )}
        />
        <Bar dataKey="jumlah" radius={[4, 4, 0, 0]} maxBarSize={40}>
          <LabelList
            dataKey="jumlah"
            position="top"
            style={{ fontSize: 11, fontWeight: 700, fill: "var(--blusukan-on-surface)" }}
          />
          {chartData.map((entry) => (
            <Cell key={entry.raw} fill={ROAD_COLOR[entry.raw] ?? "var(--blusukan-primary)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function LaporanDashboardClient() {
  const [items, setItems] = useState<DestinasiLaporan[] | null>(null);
  const [laporanTotal, setLaporanTotal] = useState<LaporanTotal | null>(null);
  const [error, setError] = useState("");
  const { state: detailState, show: showDetail, onOpenChange: closeDetail } = useChartDetail();

  function handleDestinasiBarClick(destinationId: string, name: string) {
    showDetail({ destinationId }, `Laporan — ${name}`, LAPORAN_DESTINASI_COLUMNS, "/api/admin/laporan");
  }

  function handleKondisiJalanClick(raw: string, label: string) {
    showDetail({ type: "kondisiJalan", kondisi: raw }, `Laporan Kondisi Jalan: ${label}`, KONDISI_JALAN_COLUMNS);
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/laporan")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setError("Gagal memuat data laporan.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/laporan-total")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setLaporanTotal(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10">
        <Link
          href="/dashboard"
          id="laporan-back"
          className="flex items-center gap-1.5 text-sm font-semibold mb-6 hover:opacity-70 transition-opacity"
          style={{ color: "var(--blusukan-primary)" }}
        >
          <ArrowLeft size={16} />
          Kembali ke Dashboard
        </Link>

        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
        >
          Laporan Masuk
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Destinasi dengan laporan kondisi lapangan dari wisatawan
        </p>

        {error && (
          <p
            className="text-sm px-4 py-2.5 rounded-lg mb-4"
            style={{ background: "var(--blusukan-error-container)", color: "var(--blusukan-error)" }}
          >
            {error}
          </p>
        )}

        {items === null ? (
          <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Memuat...
          </p>
        ) : items.length === 0 ? (
          <div
            className="rounded-2xl p-10 flex flex-col items-center text-center"
            style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
          >
            <MessageSquare size={40} style={{ color: "var(--blusukan-outline)" }} className="mb-3" />
            <p className="text-sm font-medium" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Belum ada laporan masuk
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <div
                className="rounded-2xl p-5"
                style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
              >
                <h3
                  className="text-sm font-bold mb-4"
                  style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
                >
                  Destinasi dengan Laporan Terbanyak
                </h3>
                <TopLaporanChart data={items} onBarClick={handleDestinasiBarClick} />
              </div>

              <div
                className="rounded-2xl p-5"
                style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
              >
                <h3
                  className="text-sm font-bold mb-4"
                  style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
                >
                  Distribusi Kondisi Jalan (Semua Destinasi)
                </h3>
                <DistribusiKondisiJalanTotalChart
                  data={laporanTotal?.distribusiKondisiJalan ?? []}
                  onBarClick={handleKondisiJalanClick}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((d) => (
                <Link
                  key={d.id}
                  href={`/dashboard/laporan/${d.id}`}
                  id={`card-laporan-${d.id}`}
                  className="block rounded-2xl p-5 transition-shadow hover:shadow-md"
                  style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <MapPin size={14} style={{ color: "var(--blusukan-on-surface-variant)" }} />
                    <span className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                      {KABUPATEN_LABEL[d.kabupaten] ?? d.kabupaten}
                    </span>
                  </div>

                  <p
                    className="text-base font-bold mb-2"
                    style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
                  >
                    {d.name}
                  </p>

                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                      style={{ background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }}
                    >
                      {d.jumlahLaporan} laporan
                    </span>
                  </div>
                  <p className="text-xs mt-2" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                    {formatBreakdownRingkas(d.breakdownKondisiJalan)}
                  </p>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      <ChartDetailDialog state={detailState} onOpenChange={closeDetail} />
    </div>
  );
}
