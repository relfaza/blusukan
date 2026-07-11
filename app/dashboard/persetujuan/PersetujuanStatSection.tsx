"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Clock, CalendarPlus, AlertTriangle } from "lucide-react";

type DestinasiRingkas = { id: string; name: string; hari: number };

type PersetujuanStat = {
  perTanggal: { tanggal: string; jumlah: number }[];
  perKabupaten: { kabupaten: string; jumlah: number }[];
  perKategori: { kategori: string; jumlah: number }[];
  totalPending: number;
  destinasiTerlama: DestinasiRingkas | null;
  destinasiTerbaru: DestinasiRingkas | null;
};

// Ambang dominasi kategori — kalau satu kategori melebihi ini dari total PENDING, tampilkan insight ke Admin
const DOMINASI_THRESHOLD_PCT = 50;

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

const axisTickStyle = { fontSize: 11, fill: "var(--blusukan-on-surface-variant)" };

function ChartCard({ title, badge, children }: { title: string; badge?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
    >
      <h3
        className={`text-sm font-bold ${badge ? "mb-2" : "mb-4"}`}
        style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
      >
        {title}
      </h3>
      {badge && <div className="mb-4">{badge}</div>}
      {children}
    </div>
  );
}

function DominasiBadge({ label }: { label: string }) {
  return (
    <div
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg"
      style={{ background: "var(--blusukan-error-container)", color: "var(--blusukan-error)" }}
    >
      <AlertTriangle size={13} />
      Kategori {label} mendominasi pengajuan saat ini
    </div>
  );
}

function InfoCard({
  id,
  icon,
  label,
  destinasi,
  hariSuffix,
  active,
  onClick,
}: {
  id: string;
  icon: React.ReactNode;
  label: string;
  destinasi: DestinasiRingkas | null;
  hariSuffix: (hari: number) => string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      id={id}
      onClick={onClick}
      className="rounded-2xl p-5 flex items-start gap-3 text-left w-full transition-colors"
      style={{
        background: active ? "var(--blusukan-primary-container)" : "#ffffff",
        border: active ? "1.5px solid var(--blusukan-primary)" : "1px solid var(--blusukan-outline-variant)",
      }}
    >
      <div
        className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
        style={{ background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          {label}
        </p>
        {destinasi ? (
          <>
            <p className="text-sm font-bold truncate" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}>
              {destinasi.name}
            </p>
            <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              {hariSuffix(destinasi.hari)}
            </p>
          </>
        ) : (
          <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Tidak ada data
          </p>
        )}
      </div>
    </button>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="h-[160px] flex items-center justify-center text-center">
      <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
        {message}
      </p>
    </div>
  );
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
        {value} pengajuan
      </p>
    </div>
  );
}

function PengajuanPerTanggalChart({ data }: { data: PersetujuanStat["perTanggal"] }) {
  if (data.every((d) => d.jumlah === 0)) {
    return <EmptyState message="Belum ada pengajuan dalam 30 hari terakhir" />;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--blusukan-outline-variant)" />
        <XAxis
          dataKey="tanggal"
          tick={axisTickStyle}
          axisLine={{ stroke: "var(--blusukan-outline-variant)" }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis allowDecimals={false} tick={axisTickStyle} axisLine={false} tickLine={false} width={28} />
        <Tooltip
          content={({ active, payload, label }: any) => (
            <ChartTooltip active={active} payload={payload} label={label} />
          )}
        />
        <Bar dataKey="jumlah" fill="var(--blusukan-primary)" radius={[4, 4, 0, 0]} maxBarSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function BreakdownList({
  data,
  labelKey,
  labelMap,
  total,
}: {
  data: Record<string, string | number>[];
  labelKey: string;
  labelMap: Record<string, string>;
  total: number;
}) {
  if (data.length === 0 || total === 0) {
    return <EmptyState message="Tidak ada destinasi menunggu persetujuan" />;
  }

  const sorted = [...data].sort((a, b) => Number(b.jumlah) - Number(a.jumlah));

  return (
    <div className="space-y-3">
      {sorted.map((d) => {
        const rawLabel = String(d[labelKey]);
        const label = labelMap[rawLabel] ?? rawLabel;
        const jumlah = Number(d.jumlah);
        const pct = total > 0 ? Math.round((jumlah / total) * 100) : 0;
        return (
          <div key={rawLabel}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium" style={{ color: "var(--blusukan-on-surface)" }}>
                {label}
              </span>
              <span className="text-xs font-bold" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                {jumlah}
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--blusukan-surface)" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, background: "var(--blusukan-primary)" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function PersetujuanStatSection({
  activeSort,
  onSortSelect,
}: {
  activeSort: "terlama" | "terbaru" | null;
  onSortSelect: (sort: "terlama" | "terbaru") => void;
}) {
  const [data, setData] = useState<PersetujuanStat | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/persetujuan-stat")
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setError("Gagal memuat statistik persetujuan.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <p
        className="text-sm px-4 py-2.5 rounded-lg mb-6"
        style={{ background: "var(--blusukan-error-container)", color: "var(--blusukan-error)" }}
      >
        {error}
      </p>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="rounded-2xl p-5 h-[76px] animate-pulse"
              style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
            />
          ))}
        </div>
        <div
          className="rounded-2xl p-5 h-[236px] animate-pulse"
          style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="rounded-2xl p-5 h-[180px] animate-pulse"
              style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
            />
          ))}
        </div>
      </div>
    );
  }

  const dominanKategori = [...data.perKategori].sort((a, b) => b.jumlah - a.jumlah)[0];
  const dominanPct = dominanKategori && data.totalPending > 0 ? (dominanKategori.jumlah / data.totalPending) * 100 : 0;
  const showDominasiBadge = dominanKategori && dominanPct > DOMINASI_THRESHOLD_PCT;

  return (
    <div className="space-y-4 mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoCard
          id="sort-terlama"
          icon={<Clock size={16} />}
          label="Menunggu Terlama"
          destinasi={data.destinasiTerlama}
          hariSuffix={(hari) => `${hari} hari menunggu`}
          active={activeSort === "terlama"}
          onClick={() => onSortSelect("terlama")}
        />
        <InfoCard
          id="sort-terbaru"
          icon={<CalendarPlus size={16} />}
          label="Diajukan Terbaru"
          destinasi={data.destinasiTerbaru}
          hariSuffix={(hari) => (hari <= 0 ? "Hari ini" : `${hari} hari lalu`)}
          active={activeSort === "terbaru"}
          onClick={() => onSortSelect("terbaru")}
        />
      </div>

      <ChartCard title="Pengajuan per Tanggal (30 Hari Terakhir)">
        <PengajuanPerTanggalChart data={data.perTanggal} />
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Distribusi PENDING per Kabupaten">
          <BreakdownList data={data.perKabupaten} labelKey="kabupaten" labelMap={KABUPATEN_LABEL} total={data.totalPending} />
        </ChartCard>
        <ChartCard
          title="Distribusi PENDING per Kategori"
          badge={
            showDominasiBadge ? (
              <DominasiBadge label={KATEGORI_LABEL[dominanKategori.kategori] ?? dominanKategori.kategori} />
            ) : undefined
          }
        >
          <BreakdownList data={data.perKategori} labelKey="kategori" labelMap={KATEGORI_LABEL} total={data.totalPending} />
        </ChartCard>
      </div>
    </div>
  );
}
