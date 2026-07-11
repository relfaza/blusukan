"use client";

import { useEffect, useState } from "react";
import { CartesianGrid, LabelList, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Users } from "lucide-react";
import ChartDetailDialog, { type DetailColumn } from "./ChartDetailDialog";
import { useChartDetail } from "./useChartDetail";
import { pointValueLabelContent } from "@/components/admin/chart-value-label";

function formatTanggalSingkat(iso: unknown): string {
  if (typeof iso !== "string" || !iso) return "–";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

const KUNJUNGAN_COLUMNS: DetailColumn[] = [
  { key: "kodeTransaksi", label: "Kode Transaksi" },
  { key: "destinationName", label: "Destinasi" },
  { key: "userName", label: "Wisatawan" },
  { key: "selesaiAt", label: "Selesai", format: formatTanggalSingkat },
];

type Periode = "harian" | "mingguan" | "bulanan";

type KunjunganResponse = {
  periode: Periode;
  data: { label: string; jumlahKunjungan: number }[];
  totalKunjungan: number;
};

const PERIODE_OPTIONS: { value: Periode; label: string }[] = [
  { value: "harian", label: "Harian" },
  { value: "mingguan", label: "Mingguan" },
  { value: "bulanan", label: "Bulanan" },
];

const axisTickStyle = { fontSize: 12, fill: "var(--blusukan-on-surface-variant)" };

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
        {value} kunjungan
      </p>
    </div>
  );
}

function PeriodeToggle({ value, onChange }: { value: Periode; onChange: (p: Periode) => void }) {
  return (
    <div
      className="inline-flex p-1 rounded-xl"
      style={{ background: "var(--blusukan-surface)", border: "1px solid var(--blusukan-outline-variant)" }}
    >
      {PERIODE_OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
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

export default function TrenKunjunganSection({
  destinationId,
  title = "📊 Tren Kunjungan Wisatawan",
}: {
  destinationId?: string;
  title?: string;
}) {
  const [periode, setPeriode] = useState<Periode>("harian");
  const [result, setResult] = useState<KunjunganResponse | null>(null);
  const [total30Hari, setTotal30Hari] = useState<number | null>(null);
  const [error, setError] = useState("");
  const { state: detailState, show: showDetail, onOpenChange: closeDetail } = useChartDetail();

  function handlePointClick(label: string) {
    const params: Record<string, string> = { type: "kunjungan", periode, label };
    if (destinationId) params.destinationId = destinationId;
    showDetail(params, `Kunjungan — ${label}`, KUNJUNGAN_COLUMNS);
  }

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ periode });
    if (destinationId) params.set("destinationId", destinationId);

    fetch(`/api/admin/kunjungan?${params.toString()}`)
      .then((res) => res.json())
      .then((json: KunjunganResponse) => {
        if (cancelled) return;
        setResult(json);
        if (periode === "harian") setTotal30Hari(json.totalKunjungan);
      })
      .catch(() => {
        if (!cancelled) setError("Gagal memuat data tren kunjungan.");
      });

    return () => {
      cancelled = true;
    };
  }, [periode, destinationId]);

  return (
    <div className="mb-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2
          className="text-lg font-bold"
          style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
        >
          {title}
        </h2>
        <PeriodeToggle value={periode} onChange={setPeriode} />
      </div>

      {error ? (
        <p
          className="text-sm px-4 py-2.5 rounded-lg"
          style={{ background: "var(--blusukan-error-container)", color: "var(--blusukan-error)" }}
        >
          {error}
        </p>
      ) : (
        <div
          className="rounded-2xl p-5"
          style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }}
            >
              <Users size={18} />
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                Total Kunjungan (30 hari terakhir)
              </p>
              <p
                className="text-xl font-bold"
                style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
              >
                {total30Hari ?? "–"}
              </p>
            </div>
          </div>

          {!result ? (
            <div className="h-[220px] flex items-center justify-center">
              <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                Memuat...
              </p>
            </div>
          ) : result.data.every((d) => d.jumlahKunjungan === 0) ? (
            <div className="h-[220px] flex items-center justify-center text-center">
              <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                Data kunjungan belum cukup untuk periode ini
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart
                data={result.data}
                margin={{ top: 20, right: 12, left: -16, bottom: 0 }}
                style={{ cursor: "pointer" }}
                onClick={(state: any) => {
                  if (typeof state?.activeLabel === "string") handlePointClick(state.activeLabel);
                }}
              >
                <CartesianGrid vertical={false} stroke="var(--blusukan-outline-variant)" />
                <XAxis
                  dataKey="label"
                  tick={axisTickStyle}
                  axisLine={{ stroke: "var(--blusukan-outline-variant)" }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis allowDecimals={false} tick={axisTickStyle} axisLine={false} tickLine={false} width={32} />
                <Tooltip
                  content={({ active, payload, label }: any) => (
                    <ChartTooltip active={active} payload={payload} label={label} />
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="jumlahKunjungan"
                  stroke="var(--blusukan-primary)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "var(--blusukan-primary)", stroke: "#ffffff", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "var(--blusukan-primary)", stroke: "#ffffff", strokeWidth: 2 }}
                >
                  <LabelList
                    dataKey="jumlahKunjungan"
                    content={pointValueLabelContent(
                      result.data.map((d) => d.jumlahKunjungan),
                      (v) => `${v}`,
                      "var(--blusukan-primary)"
                    )}
                  />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      <ChartDetailDialog state={detailState} onOpenChange={closeDetail} />
    </div>
  );
}
