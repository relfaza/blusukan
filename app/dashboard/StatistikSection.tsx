"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MapPin, Clock, MessageSquare, Receipt } from "lucide-react";

type Statistik = {
  totalDestinasi: number;
  totalPending: number;
  totalLaporan: number;
  totalTransaksi: number;
  totalPendapatanEstimasi: number;
  laporanPerBulan: { bulan: string; jumlah: number }[];
  transaksiPerBulan: { bulan: string; jumlah: number }[];
  destinasiPerKategori: { kategori: string; jumlah: number }[];
  destinasiPerKabupaten: { kabupaten: string; jumlah: number }[];
};

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

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatRupiahCompact(n: number): string {
  return new Intl.NumberFormat("id-ID", { notation: "compact" }).format(n);
}

/** Tooltip minimal — nilai jadi elemen dengan kontras tinggi, label jadi sekunder */
function ChartTooltip({
  active,
  payload,
  label,
  formatValue,
}: {
  active?: boolean;
  payload?: Array<{ value?: number | string }>;
  label?: string;
  formatValue: (v: number) => string;
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
        {formatValue(value)}
      </p>
    </div>
  );
}

/** Stat tile — label, value besar, ikon identitas dalam kotak warna */
function KpiCard({
  icon,
  label,
  value,
  subtitle,
  iconBg,
  iconColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </div>
        <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          {label}
        </p>
      </div>
      <p
        className="text-2xl font-bold"
        style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
      >
        {value}
      </p>
      {subtitle && (
        <p className="text-xs mt-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

/** Card pembungkus tiap grafik — judul + isi (grafik atau pesan data kosong) */
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
    >
      <h3
        className="text-sm font-bold mb-4"
        style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function EmptyChartState() {
  return (
    <div className="h-[220px] flex items-center justify-center text-center">
      <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
        Data belum cukup untuk ditampilkan
      </p>
    </div>
  );
}

const axisTickStyle = { fontSize: 12, fill: "var(--blusukan-on-surface-variant)" };

function TrenLaporanChart({ data }: { data: Statistik["laporanPerBulan"] }) {
  if (data.every((d) => d.jumlah === 0)) return <EmptyChartState />;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--blusukan-outline-variant)" />
        <XAxis
          dataKey="bulan"
          tick={axisTickStyle}
          axisLine={{ stroke: "var(--blusukan-outline-variant)" }}
          tickLine={false}
        />
        <YAxis allowDecimals={false} tick={axisTickStyle} axisLine={false} tickLine={false} width={32} />
        <Tooltip
          content={({ active, payload, label }: any) => (
            <ChartTooltip active={active} payload={payload} label={label} formatValue={(v) => `${v} laporan`} />
          )}
        />
        <Line
          type="monotone"
          dataKey="jumlah"
          stroke="var(--blusukan-primary)"
          strokeWidth={2}
          dot={{ r: 4, fill: "var(--blusukan-primary)", stroke: "#ffffff", strokeWidth: 2 }}
          activeDot={{ r: 6, fill: "var(--blusukan-primary)", stroke: "#ffffff", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function TrenTransaksiChart({ data }: { data: Statistik["transaksiPerBulan"] }) {
  if (data.every((d) => d.jumlah === 0)) return <EmptyChartState />;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -4, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--blusukan-outline-variant)" />
        <XAxis
          dataKey="bulan"
          tick={axisTickStyle}
          axisLine={{ stroke: "var(--blusukan-outline-variant)" }}
          tickLine={false}
        />
        <YAxis
          tick={axisTickStyle}
          axisLine={false}
          tickLine={false}
          width={48}
          tickFormatter={(v) => formatRupiahCompact(Number(v))}
        />
        <Tooltip
          content={({ active, payload, label }: any) => (
            <ChartTooltip active={active} payload={payload} label={label} formatValue={formatRupiah} />
          )}
        />
        <Line
          type="monotone"
          dataKey="jumlah"
          stroke="var(--blusukan-primary)"
          strokeWidth={2}
          dot={{ r: 4, fill: "var(--blusukan-primary)", stroke: "#ffffff", strokeWidth: 2 }}
          activeDot={{ r: 6, fill: "var(--blusukan-primary)", stroke: "#ffffff", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function DistribusiChart({
  data,
  labelKey,
  labelMap,
}: {
  data: Record<string, string | number>[];
  labelKey: string;
  labelMap: Record<string, string>;
}) {
  if (data.length === 0) return <EmptyChartState />;

  const chartData = data.map((d) => {
    const rawLabel = String(d[labelKey]);
    return { jumlah: Number(d.jumlah), label: labelMap[rawLabel] ?? rawLabel };
  });

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--blusukan-outline-variant)" />
        <XAxis dataKey="label" tick={axisTickStyle} axisLine={{ stroke: "var(--blusukan-outline-variant)" }} tickLine={false} />
        <YAxis allowDecimals={false} tick={axisTickStyle} axisLine={false} tickLine={false} width={32} />
        <Tooltip
          content={({ active, payload, label }: any) => (
            <ChartTooltip active={active} payload={payload} label={label} formatValue={(v) => `${v} destinasi`} />
          )}
        />
        <Bar dataKey="jumlah" fill="var(--blusukan-primary)" radius={[4, 4, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function StatistikSection() {
  const [data, setData] = useState<Statistik | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/statistik")
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setError("Gagal memuat data statistik.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <p
        className="text-sm px-4 py-2.5 rounded-lg mb-8"
        style={{ background: "var(--blusukan-error-container)", color: "var(--blusukan-error)" }}
      >
        {error}
      </p>
    );
  }

  if (!data) {
    return (
      <div className="mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl p-5 h-[104px] animate-pulse"
              style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
            />
          ))}
        </div>
        <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Memuat statistik...
        </p>
      </div>
    );
  }

  return (
    <div className="mb-10">
      <h2
        className="text-lg font-bold mb-4"
        style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
      >
        Statistik
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <KpiCard
          icon={<MapPin size={18} />}
          label="Total Destinasi Aktif"
          value={String(data.totalDestinasi)}
          iconBg="var(--blusukan-primary-container)"
          iconColor="var(--blusukan-primary)"
        />
        <KpiCard
          icon={<Clock size={18} />}
          label="Menunggu Persetujuan"
          value={String(data.totalPending)}
          iconBg="#fef3e7"
          iconColor="#805533"
        />
        <KpiCard
          icon={<MessageSquare size={18} />}
          label="Total Laporan Masuk"
          value={String(data.totalLaporan)}
          iconBg="var(--blusukan-primary-container)"
          iconColor="var(--blusukan-primary)"
        />
        <KpiCard
          icon={<Receipt size={18} />}
          label="Total Transaksi"
          value={String(data.totalTransaksi)}
          subtitle={`Estimasi pendapatan: ${formatRupiah(data.totalPendapatanEstimasi)}`}
          iconBg="var(--blusukan-primary-container)"
          iconColor="var(--blusukan-primary)"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Tren Laporan Masuk (6 Bulan Terakhir)">
          <TrenLaporanChart data={data.laporanPerBulan} />
        </ChartCard>
        <ChartCard title="Tren Transaksi & Pendapatan (6 Bulan Terakhir)">
          <TrenTransaksiChart data={data.transaksiPerBulan} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Distribusi Destinasi per Kategori">
          <DistribusiChart data={data.destinasiPerKategori} labelKey="kategori" labelMap={KATEGORI_LABEL} />
        </ChartCard>
        <ChartCard title="Distribusi Destinasi per Kabupaten">
          <DistribusiChart data={data.destinasiPerKabupaten} labelKey="kabupaten" labelMap={KABUPATEN_LABEL} />
        </ChartCard>
      </div>
    </div>
  );
}
