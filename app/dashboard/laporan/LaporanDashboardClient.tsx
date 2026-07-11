"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, MapPin } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type DestinasiLaporan = {
  id: string;
  name: string;
  kabupaten: string;
  jumlahLaporan: number;
  breakdownKondisiJalan: Record<string, number>;
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

function TopLaporanChart({ data }: { data: DestinasiLaporan[] }) {
  const top5 = data.slice(0, 5).map((d) => ({ name: d.name, jumlahLaporan: d.jumlahLaporan }));

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
      <BarChart data={top5} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--blusukan-outline-variant)" />
        <XAxis dataKey="name" tick={axisTickStyle} axisLine={{ stroke: "var(--blusukan-outline-variant)" }} tickLine={false} />
        <YAxis allowDecimals={false} tick={axisTickStyle} axisLine={false} tickLine={false} width={28} />
        <Tooltip
          content={({ active, payload, label }: any) => (
            <ChartTooltip active={active} payload={payload} label={label} />
          )}
        />
        <Bar dataKey="jumlahLaporan" fill="var(--blusukan-primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function LaporanDashboardClient() {
  const [items, setItems] = useState<DestinasiLaporan[] | null>(null);
  const [error, setError] = useState("");

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
            <div
              className="rounded-2xl p-5 mb-6"
              style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
            >
              <h3
                className="text-sm font-bold mb-4"
                style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
              >
                Destinasi dengan Laporan Terbanyak
              </h3>
              <TopLaporanChart data={items} />
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
    </div>
  );
}
