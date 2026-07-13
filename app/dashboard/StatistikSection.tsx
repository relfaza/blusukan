"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  Bar,
  BarChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MapPin, Clock, MessageSquare, Receipt } from "lucide-react";
import ChartDetailDialog, { type DetailColumn } from "./ChartDetailDialog";
import { useChartDetail } from "./useChartDetail";
import { pointValueLabelContent } from "@/components/admin/chart-value-label";

type Statistik = {
  totalDestinasi: number;
  totalPending: number;
  totalLaporan: number;
  totalTransaksi: number;
  totalPendapatanEstimasi: number;
  destinasiBaruBulanIni: number;
  rataRataHariMenunggu: number;
  laporanMingguIni: number;
  transaksiMingguIni: number;
  laporanPerBulan: { bulan: string; jumlah: number }[];
  transaksiPerBulan: { bulan: string; jumlah: number }[];
  destinasiPerKategori: { kategori: string; jumlah: number }[];
  destinasiPerKabupaten: { kabupaten: string; jumlah: number }[];
  distribusiKondisiJalan: { kondisi: string; jumlah: number }[];
  distribusiKeramaian: { keramaian: string; jumlah: number }[];
  trenRatingRataRata: { bulan: string; rataRata: number }[];
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

const TRANSAKSI_TYPE_LABEL: Record<string, string> = {
  TIKET_MASUK: "Tiket Masuk",
  FASILITAS: "Fasilitas",
  UMKM: "UMKM",
};

const TRANSAKSI_STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu Konfirmasi",
  DIKONFIRMASI: "Dikonfirmasi",
  SELESAI: "Selesai",
  DIBATALKAN: "Dibatalkan",
};

function formatTanggalSingkat(iso: unknown): string {
  if (typeof iso !== "string" || !iso) return "–";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

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

/** Stat tile — label, value besar, ikon identitas dalam kotak warna. Bisa diklik kalau diberi href. */
function KpiCard({
  icon,
  label,
  value,
  subtitle,
  iconBg,
  iconColor,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  iconBg: string;
  iconColor: string;
  href?: string;
}) {
  const [hovered, setHovered] = useState(false);

  const card = (
    <div
      className="rounded-2xl p-5 transition-shadow duration-150"
      style={{
        background: "#ffffff",
        border: `1px solid ${hovered ? "var(--blusukan-primary)" : "var(--blusukan-outline-variant)"}`,
        boxShadow: hovered ? "0 4px 14px rgba(0,0,0,0.08)" : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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

  if (!href) return card;

  return (
    <Link href={href} className="block" style={{ textDecoration: "none" }}>
      {card}
    </Link>
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

function TrenLaporanChart({
  data,
  onPointClick,
}: {
  data: Statistik["laporanPerBulan"];
  onPointClick?: (bulan: string) => void;
}) {
  if (data.every((d) => d.jumlah === 0)) return <EmptyChartState />;

  const labelContent = pointValueLabelContent(
    data.map((d) => d.jumlah),
    (v) => `${v}`,
    "var(--blusukan-primary)"
  );

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 12, left: -16, bottom: 0 }}
        style={{ cursor: onPointClick ? "pointer" : undefined }}
        onClick={(state: any) => {
          if (onPointClick && typeof state?.activeLabel === "string") onPointClick(state.activeLabel);
        }}
      >
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
        >
          <LabelList dataKey="jumlah" content={labelContent} />
        </Line>
      </LineChart>
    </ResponsiveContainer>
  );
}

function TrenTransaksiChart({
  data,
  onPointClick,
}: {
  data: Statistik["transaksiPerBulan"];
  onPointClick?: (bulan: string) => void;
}) {
  if (data.every((d) => d.jumlah === 0)) return <EmptyChartState />;

  const labelContent = pointValueLabelContent(
    data.map((d) => d.jumlah),
    formatRupiahCompact,
    "var(--blusukan-primary)"
  );

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 12, left: -4, bottom: 0 }}
        style={{ cursor: onPointClick ? "pointer" : undefined }}
        onClick={(state: any) => {
          if (onPointClick && typeof state?.activeLabel === "string") onPointClick(state.activeLabel);
        }}
      >
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
        >
          <LabelList dataKey="jumlah" content={labelContent} />
        </Line>
      </LineChart>
    </ResponsiveContainer>
  );
}

function DistribusiChart({
  data,
  labelKey,
  labelMap,
  unitLabel = "destinasi",
  onItemClick,
}: {
  data: Record<string, string | number>[];
  labelKey: string;
  labelMap: Record<string, string>;
  unitLabel?: string;
  onItemClick?: (rawValue: string, displayLabel: string) => void;
}) {
  if (data.length === 0) return <EmptyChartState />;

  const chartData = data.map((d) => {
    const rawLabel = String(d[labelKey]);
    return { jumlah: Number(d.jumlah), label: labelMap[rawLabel] ?? rawLabel, raw: rawLabel };
  });

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 12, left: -16, bottom: 0 }}
        style={{ cursor: onItemClick ? "pointer" : undefined }}
        onClick={(state: any) => {
          if (!onItemClick || typeof state?.activeLabel !== "string") return;
          const match = chartData.find((d) => d.label === state.activeLabel);
          if (match) onItemClick(match.raw, match.label);
        }}
      >
        <CartesianGrid vertical={false} stroke="var(--blusukan-outline-variant)" />
        <XAxis dataKey="label" tick={axisTickStyle} axisLine={{ stroke: "var(--blusukan-outline-variant)" }} tickLine={false} />
        <YAxis allowDecimals={false} tick={axisTickStyle} axisLine={false} tickLine={false} width={32} />
        <Tooltip
          content={({ active, payload, label }: any) => (
            <ChartTooltip active={active} payload={payload} label={label} formatValue={(v) => `${v} ${unitLabel}`} />
          )}
        />
        <Bar dataKey="jumlah" fill="var(--blusukan-primary)" radius={[4, 4, 0, 0]} maxBarSize={24}>
          <LabelList
            dataKey="jumlah"
            position="top"
            style={{ fontSize: 11, fontWeight: 700, fill: "var(--blusukan-on-surface)" }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function DistribusiKondisiJalanChart({
  data,
  onSliceClick,
}: {
  data: Statistik["distribusiKondisiJalan"];
  onSliceClick?: (raw: string, label: string) => void;
}) {
  if (data.length === 0 || data.every((d) => d.jumlah === 0)) return <EmptyChartState />;

  const chartData = data.map((d) => ({
    raw: d.kondisi,
    name: ROAD_LABEL[d.kondisi] ?? d.kondisi,
    value: d.jumlah,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Tooltip
          content={({ active, payload }: any) => {
            if (!active || !payload || !payload.length) return null;
            return (
              <div
                className="rounded-lg px-3 py-2 text-xs shadow-md"
                style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
              >
                <p style={{ color: "var(--blusukan-on-surface-variant)" }}>{payload[0].name}</p>
                <p className="font-bold" style={{ color: "var(--blusukan-on-surface)" }}>
                  {payload[0].value} laporan
                </p>
              </div>
            );
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, color: "var(--blusukan-on-surface-variant)" }}
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={48}
          outerRadius={78}
          paddingAngle={2}
          style={{ cursor: onSliceClick ? "pointer" : undefined }}
          onClick={(entry: any) => {
            if (onSliceClick) onSliceClick(entry.raw, entry.name);
          }}
        >
          {chartData.map((entry) => (
            <Cell key={entry.raw} fill={ROAD_COLOR[entry.raw] ?? "var(--blusukan-outline)"} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

function TrenRatingChart({
  data,
  onPointClick,
}: {
  data: Statistik["trenRatingRataRata"];
  onPointClick?: (bulan: string) => void;
}) {
  if (data.every((d) => d.rataRata === 0)) return <EmptyChartState />;

  const labelContent = pointValueLabelContent(
    data.map((d) => d.rataRata),
    (v) => `${v.toFixed(1)} ★`,
    "var(--blusukan-secondary)"
  );

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 12, left: -16, bottom: 0 }}
        style={{ cursor: onPointClick ? "pointer" : undefined }}
        onClick={(state: any) => {
          if (onPointClick && typeof state?.activeLabel === "string") onPointClick(state.activeLabel);
        }}
      >
        <CartesianGrid vertical={false} stroke="var(--blusukan-outline-variant)" />
        <XAxis
          dataKey="bulan"
          tick={axisTickStyle}
          axisLine={{ stroke: "var(--blusukan-outline-variant)" }}
          tickLine={false}
        />
        <YAxis domain={[0, 5]} tick={axisTickStyle} axisLine={false} tickLine={false} width={32} />
        <Tooltip
          content={({ active, payload, label }: any) => (
            <ChartTooltip active={active} payload={payload} label={label} formatValue={(v) => `${v.toFixed(1)} ★`} />
          )}
        />
        <Line
          type="monotone"
          dataKey="rataRata"
          stroke="var(--blusukan-secondary)"
          strokeWidth={2}
          dot={{ r: 4, fill: "var(--blusukan-secondary)", stroke: "#ffffff", strokeWidth: 2 }}
          activeDot={{ r: 6, fill: "var(--blusukan-secondary)", stroke: "#ffffff", strokeWidth: 2 }}
        >
          <LabelList dataKey="rataRata" content={labelContent} />
        </Line>
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function StatistikSection() {
  const [data, setData] = useState<Statistik | null>(null);
  const [error, setError] = useState("");
  const { state: detailState, show: showDetail, onOpenChange: closeDetail } = useChartDetail();

  const laporanColumns: DetailColumn[] = [
    { key: "destinationName", label: "Destinasi" },
    { key: "userName", label: "Pelapor" },
    { key: "roadCondition", label: "Kondisi Jalan", format: (v) => ROAD_LABEL[v as string] ?? String(v) },
    { key: "crowdLevel", label: "Keramaian", format: (v) => CROWD_LABEL[v as string] ?? String(v) },
    { key: "createdAt", label: "Tanggal", format: formatTanggalSingkat },
  ];

  const transaksiColumns: DetailColumn[] = [
    { key: "kodeTransaksi", label: "Kode Transaksi" },
    { key: "destinationName", label: "Destinasi" },
    { key: "userName", label: "Pemesan" },
    { key: "type", label: "Jenis", format: (v) => TRANSAKSI_TYPE_LABEL[v as string] ?? String(v) },
    { key: "totalHarga", label: "Total", format: (v) => formatRupiah(Number(v)) },
    { key: "status", label: "Status", format: (v) => TRANSAKSI_STATUS_LABEL[v as string] ?? String(v) },
    { key: "createdAt", label: "Tanggal", format: formatTanggalSingkat },
  ];

  const kategoriColumns: DetailColumn[] = [
    { key: "name", label: "Nama Destinasi" },
    { key: "kabupaten", label: "Kabupaten", format: (v) => KABUPATEN_LABEL[v as string] ?? String(v) },
    { key: "createdAt", label: "Diajukan", format: formatTanggalSingkat },
  ];

  const kabupatenColumns: DetailColumn[] = [
    { key: "name", label: "Nama Destinasi" },
    { key: "kategori", label: "Kategori", format: (v) => KATEGORI_LABEL[v as string] ?? String(v) },
    { key: "createdAt", label: "Diajukan", format: formatTanggalSingkat },
  ];

  const kondisiJalanColumns: DetailColumn[] = [
    { key: "destinationName", label: "Destinasi" },
    { key: "userName", label: "Pelapor" },
    { key: "crowdLevel", label: "Keramaian", format: (v) => CROWD_LABEL[v as string] ?? String(v) },
    { key: "createdAt", label: "Tanggal", format: formatTanggalSingkat },
  ];

  const keramaianColumns: DetailColumn[] = [
    { key: "destinationName", label: "Destinasi" },
    { key: "userName", label: "Pelapor" },
    { key: "roadCondition", label: "Kondisi Jalan", format: (v) => ROAD_LABEL[v as string] ?? String(v) },
    { key: "createdAt", label: "Tanggal", format: formatTanggalSingkat },
  ];

  const ratingColumns: DetailColumn[] = [
    { key: "destinationName", label: "Destinasi" },
    { key: "userName", label: "Reviewer" },
    { key: "rating", label: "Rating", format: (v) => `${v} / 5` },
    { key: "komentar", label: "Komentar", format: (v) => (v ? String(v) : "–") },
    { key: "createdAt", label: "Tanggal", format: formatTanggalSingkat },
  ];

  function handleLaporanBulanClick(bulan: string) {
    showDetail({ type: "laporanBulan", bulan }, `Laporan Masuk — ${bulan}`, laporanColumns);
  }
  function handleTransaksiBulanClick(bulan: string) {
    showDetail({ type: "transaksiBulan", bulan }, `Transaksi — ${bulan}`, transaksiColumns);
  }
  function handleKategoriClick(raw: string, label: string) {
    showDetail({ type: "kategoriDestinasi", kategori: raw }, `Destinasi Kategori ${label}`, kategoriColumns);
  }
  function handleKabupatenClick(raw: string, label: string) {
    showDetail({ type: "kabupatenDestinasi", kabupaten: raw }, `Destinasi Kabupaten ${label}`, kabupatenColumns);
  }
  function handleKondisiJalanClick(raw: string, label: string) {
    showDetail({ type: "kondisiJalan", kondisi: raw }, `Laporan Kondisi Jalan: ${label}`, kondisiJalanColumns);
  }
  function handleKeramaianClick(raw: string, label: string) {
    showDetail({ type: "keramaian", keramaian: raw }, `Laporan Keramaian: ${label}`, keramaianColumns);
  }
  function handleRatingBulanClick(bulan: string) {
    showDetail({ type: "ratingBulan", bulan }, `Ulasan — ${bulan}`, ratingColumns);
  }

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
          subtitle={`${data.destinasiBaruBulanIni} ditambahkan bulan ini`}
          iconBg="var(--blusukan-primary-container)"
          iconColor="var(--blusukan-primary)"
          href="/dashboard/destinasi"
        />
        <KpiCard
          icon={<Clock size={18} />}
          label="Menunggu Persetujuan"
          value={String(data.totalPending)}
          subtitle={`Rata-rata menunggu ${data.rataRataHariMenunggu} hari`}
          iconBg="#fef3e7"
          iconColor="#805533"
          href="/dashboard/persetujuan"
        />
        <KpiCard
          icon={<MessageSquare size={18} />}
          label="Total Laporan Masuk"
          value={String(data.totalLaporan)}
          subtitle={`${data.laporanMingguIni} laporan minggu ini`}
          iconBg="var(--blusukan-primary-container)"
          iconColor="var(--blusukan-primary)"
          href="/dashboard/laporan"
        />
        <KpiCard
          icon={<Receipt size={18} />}
          label="Total Transaksi"
          value={String(data.totalTransaksi)}
          subtitle={`${data.transaksiMingguIni} transaksi minggu ini`}
          iconBg="var(--blusukan-primary-container)"
          iconColor="var(--blusukan-primary)"
          href="/dashboard/keuangan"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Tren Laporan Masuk (6 Bulan Terakhir)">
          <TrenLaporanChart data={data.laporanPerBulan} onPointClick={handleLaporanBulanClick} />
        </ChartCard>
        <ChartCard title="Tren Transaksi & Pendapatan (6 Bulan Terakhir)">
          <TrenTransaksiChart data={data.transaksiPerBulan} onPointClick={handleTransaksiBulanClick} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Distribusi Destinasi per Kategori">
          <DistribusiChart
            data={data.destinasiPerKategori}
            labelKey="kategori"
            labelMap={KATEGORI_LABEL}
            onItemClick={handleKategoriClick}
          />
        </ChartCard>
        <ChartCard title="Distribusi Destinasi per Kabupaten">
          <DistribusiChart
            data={data.destinasiPerKabupaten}
            labelKey="kabupaten"
            labelMap={KABUPATEN_LABEL}
            onItemClick={handleKabupatenClick}
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Distribusi Kondisi Jalan">
          <DistribusiKondisiJalanChart data={data.distribusiKondisiJalan} onSliceClick={handleKondisiJalanClick} />
        </ChartCard>
        <ChartCard title="Distribusi Tingkat Keramaian">
          <DistribusiChart
            data={data.distribusiKeramaian}
            labelKey="keramaian"
            labelMap={CROWD_LABEL}
            unitLabel="laporan"
            onItemClick={handleKeramaianClick}
          />
        </ChartCard>
      </div>

      <ChartCard title="Tren Rating Rata-rata (6 Bulan Terakhir)">
        <TrenRatingChart data={data.trenRatingRataRata} onPointClick={handleRatingBulanClick} />
      </ChartCard>

      <ChartDetailDialog state={detailState} onOpenChange={closeDetail} />
    </div>
  );
}
