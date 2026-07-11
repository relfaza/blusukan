import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type Periode = "harian" | "mingguan" | "bulanan" | "tahunan";

export type KeuanganResponse = {
  periode: Periode;
  tren: { label: string; totalPendapatan: number }[];
  totalPeriodeIni: number;
  persenPerubahan: number;
  perJenis: { type: string; totalPendapatan: number }[];
  top5Destinasi: { destinationId: string; name: string; totalPendapatan: number; jumlahTransaksi: number }[];
};

export const PERIODE_OPTIONS: { value: Periode; label: string }[] = [
  { value: "harian", label: "Harian" },
  { value: "mingguan", label: "Mingguan" },
  { value: "bulanan", label: "Bulanan" },
  { value: "tahunan", label: "Tahunan" },
];

export const PERIODE_SEBELUMNYA_LABEL: Record<Periode, string> = {
  harian: "kemarin",
  mingguan: "minggu lalu",
  bulanan: "bulan lalu",
  tahunan: "tahun lalu",
};

export const TYPE_LABEL: Record<string, string> = {
  TIKET_MASUK: "Tiket Masuk",
  FASILITAS: "Fasilitas",
  UMKM: "UMKM",
};

const axisTickStyle = { fontSize: 12, fill: "var(--blusukan-on-surface-variant)" };

export function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export function formatRupiahCompact(n: number): string {
  return new Intl.NumberFormat("id-ID", { notation: "compact" }).format(n);
}

export function ChartTooltip({
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

export function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}>
      <h3 className="text-sm font-bold mb-4" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

export function EmptyChartState({ message = "Data belum cukup untuk ditampilkan" }: { message?: string }) {
  return (
    <div className="h-[220px] flex items-center justify-center text-center">
      <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
        {message}
      </p>
    </div>
  );
}

export function TrenPendapatanChart({ data }: { data: KeuanganResponse["tren"] }) {
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

export function BreakdownJenisChart({ data }: { data: KeuanganResponse["perJenis"] }) {
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

export function PeriodeToggle({ value, onChange }: { value: Periode; onChange: (p: Periode) => void }) {
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
