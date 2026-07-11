"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Minus, Wallet, Receipt } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Periode = "harian" | "mingguan" | "bulanan" | "tahunan";

type KeuanganResponse = {
  periode: Periode;
  tren: { label: string; totalPendapatan: number }[];
  totalPeriodeIni: number;
  persenPerubahan: number;
  perJenis: { type: string; totalPendapatan: number }[];
  top5Destinasi: { destinationId: string; name: string; totalPendapatan: number; jumlahTransaksi: number }[];
};

const PERIODE_OPTIONS: { value: Periode; label: string }[] = [
  { value: "harian", label: "Harian" },
  { value: "mingguan", label: "Mingguan" },
  { value: "bulanan", label: "Bulanan" },
  { value: "tahunan", label: "Tahunan" },
];

const PERIODE_SEBELUMNYA_LABEL: Record<Periode, string> = {
  harian: "kemarin",
  mingguan: "minggu lalu",
  bulanan: "bulan lalu",
  tahunan: "tahun lalu",
};

const TYPE_LABEL: Record<string, string> = {
  TIKET_MASUK: "Tiket Masuk",
  FASILITAS: "Fasilitas",
  UMKM: "UMKM",
};

const axisTickStyle = { fontSize: 12, fill: "var(--blusukan-on-surface-variant)" };

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function formatRupiahCompact(n: number): string {
  return new Intl.NumberFormat("id-ID", { notation: "compact" }).format(n);
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
        {formatRupiah(value)}
      </p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}>
      <h3 className="text-sm font-bold mb-4" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function EmptyChartState({ message = "Data belum cukup untuk ditampilkan" }: { message?: string }) {
  return (
    <div className="h-[220px] flex items-center justify-center text-center">
      <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
        {message}
      </p>
    </div>
  );
}

function TrenPendapatanChart({ data }: { data: KeuanganResponse["tren"] }) {
  if (data.every((d) => d.totalPendapatan === 0)) return <EmptyChartState />;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -4, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--blusukan-outline-variant)" />
        <XAxis dataKey="label" tick={axisTickStyle} axisLine={{ stroke: "var(--blusukan-outline-variant)" }} tickLine={false} interval="preserveStartEnd" />
        <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} width={48} tickFormatter={(v) => formatRupiahCompact(Number(v))} />
        <Tooltip content={({ active, payload, label }: any) => <ChartTooltip active={active} payload={payload} label={label} />} />
        <Line
          type="monotone"
          dataKey="totalPendapatan"
          stroke="var(--blusukan-primary)"
          strokeWidth={2}
          dot={{ r: 4, fill: "var(--blusukan-primary)", stroke: "#ffffff", strokeWidth: 2 }}
          activeDot={{ r: 6, fill: "var(--blusukan-primary)", stroke: "#ffffff", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function BreakdownJenisChart({ data }: { data: KeuanganResponse["perJenis"] }) {
  if (data.every((d) => d.totalPendapatan === 0) || data.length === 0) return <EmptyChartState />;

  const chartData = data.map((d) => ({ jenis: TYPE_LABEL[d.type] ?? d.type, totalPendapatan: d.totalPendapatan }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 8, right: 12, left: -4, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--blusukan-outline-variant)" />
        <XAxis dataKey="jenis" tick={axisTickStyle} axisLine={{ stroke: "var(--blusukan-outline-variant)" }} tickLine={false} />
        <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} width={48} tickFormatter={(v) => formatRupiahCompact(Number(v))} />
        <Tooltip content={({ active, payload, label }: any) => <ChartTooltip active={active} payload={payload} label={label} />} />
        <Bar dataKey="totalPendapatan" fill="var(--blusukan-primary)" radius={[4, 4, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function PeriodeToggle({ value, onChange }: { value: Periode; onChange: (p: Periode) => void }) {
  return (
    <div className="inline-flex p-1 rounded-xl" style={{ background: "var(--blusukan-surface)", border: "1px solid var(--blusukan-outline-variant)" }}>
      {PERIODE_OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            id={`periode-${opt.value}`}
            onClick={() => onChange(opt.value)}
            className="text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors"
            style={{
              background: active ? "var(--blusukan-primary)" : "transparent",
              color: active ? "#ffffff" : "var(--blusukan-on-surface-variant)",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default function KeuanganDashboardClient() {
  const [periode, setPeriode] = useState<Periode>("harian");
  const [data, setData] = useState<KeuanganResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/keuangan?periode=${periode}`)
      .then((res) => res.json())
      .then((json: KeuanganResponse) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setError("Gagal memuat data keuangan.");
      });
    return () => {
      cancelled = true;
    };
  }, [periode]);

  const naik = (data?.persenPerubahan ?? 0) > 0;
  const turun = (data?.persenPerubahan ?? 0) < 0;
  const trendColor = naik ? "var(--blusukan-primary)" : turun ? "var(--blusukan-error)" : "var(--blusukan-on-surface-variant)";
  const trendBg = naik ? "var(--blusukan-primary-container)" : turun ? "var(--blusukan-error-container)" : "var(--blusukan-surface)";

  return (
    <div className="min-h-screen" style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Link
            href="/dashboard"
            id="keuangan-back"
            className="flex items-center gap-1.5 text-sm font-semibold hover:opacity-70 transition-opacity"
            style={{ color: "var(--blusukan-primary)" }}
          >
            <ArrowLeft size={16} />
            Kembali ke Dashboard
          </Link>
          <Link
            href="/dashboard/transaksi"
            id="link-lihat-semua-transaksi"
            className="text-xs font-semibold hover:opacity-70 transition-opacity"
            style={{ color: "var(--blusukan-on-surface-variant)" }}
          >
            Lihat semua transaksi (detail) →
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}>
            Dashboard Keuangan
          </h1>
          <PeriodeToggle value={periode} onChange={setPeriode} />
        </div>
        <p className="text-sm mb-8" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Pendapatan dari transaksi berstatus Selesai atau Dikonfirmasi
        </p>

        {error && (
          <p className="text-sm px-4 py-2.5 rounded-lg mb-4" style={{ background: "var(--blusukan-error-container)", color: "var(--blusukan-error)" }}>
            {error}
          </p>
        )}

        {/* KPI besar */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }}>
              <Wallet size={18} />
            </div>
            <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Total Pendapatan ({PERIODE_OPTIONS.find((p) => p.value === periode)?.label})
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <p className="text-3xl font-bold" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}>
              {data ? formatRupiah(data.totalPeriodeIni) : "–"}
            </p>
            {data && (
              <span
                className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap mb-1"
                style={{ background: trendBg, color: trendColor }}
              >
                {naik ? <ArrowUpRight size={13} /> : turun ? <ArrowDownRight size={13} /> : <Minus size={13} />}
                {Math.abs(data.persenPerubahan)}% dari {PERIODE_SEBELUMNYA_LABEL[periode]}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <ChartCard title="Tren Pendapatan">
            {data ? <TrenPendapatanChart data={data.tren} /> : <EmptyChartState message="Memuat..." />}
          </ChartCard>
          <ChartCard title="Breakdown Pendapatan per Jenis">
            {data ? <BreakdownJenisChart data={data.perJenis} /> : <EmptyChartState message="Memuat..." />}
          </ChartCard>
        </div>

        {/* Top 5 Destinasi Terlaris */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}>
          <div className="px-5 pt-5 pb-1 flex items-center gap-2">
            <Receipt size={16} style={{ color: "var(--blusukan-primary)" }} />
            <h3 className="text-sm font-bold" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}>
              Top 5 Destinasi Terlaris
            </h3>
          </div>
          {!data || data.top5Destinasi.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                {data ? "Belum ada transaksi pada periode ini" : "Memuat..."}
              </p>
            </div>
          ) : (
            <div className="px-2 pb-2">
              {data.top5Destinasi.map((d, idx) => (
                <Link
                  key={d.destinationId}
                  href={`/dashboard/destinasi/${d.destinationId}`}
                  id={`row-top-destinasi-${d.destinationId}`}
                  className="flex items-center gap-4 px-3 py-3 mt-2 rounded-xl transition-colors hover:bg-[#f7f8f5]"
                >
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                    style={{ background: "var(--blusukan-primary)", color: "#ffffff" }}
                  >
                    #{idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}>
                      {d.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                      {d.jumlahTransaksi} transaksi
                    </p>
                  </div>
                  <p className="text-sm font-bold shrink-0" style={{ color: "var(--blusukan-primary)" }}>
                    {formatRupiah(d.totalPendapatan)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
