"use client";

import { useMemo, useState } from "react";
import { Wifi, WifiOff, Users, MessageCircle, CheckCircle2, XCircle } from "lucide-react";
import type { LaporanDetail } from "@/lib/laporan";

const ROAD_LABEL: Record<string, string> = {
  MUDAH: "Mudah",
  SEDANG: "Sedang",
  SULIT: "Sulit",
  RUSAK: "Rusak",
  BELUM_ADA_DATA: "Belum ada data",
};

const ROAD_STYLE: Record<string, { bg: string; color: string }> = {
  MUDAH: { bg: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" },
  SEDANG: { bg: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" },
  SULIT: { bg: "#fef3e7", color: "#805533" },
  RUSAK: { bg: "var(--blusukan-error-container)", color: "var(--blusukan-error)" },
  BELUM_ADA_DATA: { bg: "#eeeeee", color: "var(--blusukan-on-surface-variant)" },
};

const SIGNAL_LABEL: Record<string, { label: string; icon: React.ReactNode }> = {
  KUAT: { label: "Sinyal Kuat", icon: <Wifi size={13} /> },
  SEDANG: { label: "Sinyal Sedang", icon: <Wifi size={13} /> },
  LEMAH: { label: "Sinyal Lemah", icon: <WifiOff size={13} /> },
};

const CROWD_LABEL: Record<string, string> = {
  SEPI: "Sepi",
  SEDANG: "Sedang",
  PADAT: "Padat",
};

const FASILITAS_FIELDS: { key: "toiletLayak" | "parkirLayak" | "tempatIbadahLayak" | "tempatDudukLayak" | "penitipanBarangLayak"; label: string }[] = [
  { key: "toiletLayak", label: "Toilet" },
  { key: "parkirLayak", label: "Parkir" },
  { key: "tempatIbadahLayak", label: "Tempat Ibadah" },
  { key: "tempatDudukLayak", label: "Tempat Duduk" },
  { key: "penitipanBarangLayak", label: "Penitipan Barang" },
];

const ROAD_FILTER_OPTIONS = [
  { value: "ALL", label: "Semua" },
  { value: "MUDAH", label: "Mudah" },
  { value: "SEDANG", label: "Sedang" },
  { value: "SULIT", label: "Sulit" },
  { value: "RUSAK", label: "Rusak" },
];

const SIGNAL_FILTER_OPTIONS = [
  { value: "ALL", label: "Semua" },
  { value: "LEMAH", label: "Lemah" },
  { value: "SEDANG", label: "Sedang" },
  { value: "KUAT", label: "Kuat" },
];

const CROWD_FILTER_OPTIONS = [
  { value: "ALL", label: "Semua" },
  { value: "SEPI", label: "Sepi" },
  { value: "SEDANG", label: "Sedang" },
  { value: "PADAT", label: "Padat" },
];

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function formatTanggal(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" }).format(new Date(iso));
}

function FilterChipRow({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-colors"
            style={
              active
                ? { background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)", border: "1px solid var(--blusukan-primary)" }
                : { background: "#ffffff", color: "var(--blusukan-on-surface)", border: "1px solid var(--blusukan-outline-variant)" }
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default function LaporanListClient({ reports }: { reports: LaporanDetail[] }) {
  const [roadFilter, setRoadFilter] = useState("ALL");
  const [signalFilter, setSignalFilter] = useState("ALL");
  const [crowdFilter, setCrowdFilter] = useState("ALL");

  const filtered = useMemo(
    () =>
      reports.filter(
        (r) =>
          (roadFilter === "ALL" || r.roadCondition === roadFilter) &&
          (signalFilter === "ALL" || r.signalStrength === signalFilter) &&
          (crowdFilter === "ALL" || r.crowdLevel === crowdFilter)
      ),
    [reports, roadFilter, signalFilter, crowdFilter]
  );

  return (
    <div>
      <div className="space-y-4 mb-6">
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Kondisi Jalan
          </h2>
          <FilterChipRow options={ROAD_FILTER_OPTIONS} value={roadFilter} onChange={setRoadFilter} />
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Kekuatan Sinyal
          </h2>
          <FilterChipRow options={SIGNAL_FILTER_OPTIONS} value={signalFilter} onChange={setSignalFilter} />
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Tingkat Keramaian
          </h2>
          <FilterChipRow options={CROWD_FILTER_OPTIONS} value={crowdFilter} onChange={setCrowdFilter} />
        </section>
      </div>

      {filtered.length === 0 ? (
        <div
          className="rounded-2xl p-10 flex flex-col items-center text-center"
          style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
        >
          <MessageCircle size={40} style={{ color: "var(--blusukan-outline)" }} className="mb-3" />
          <p className="text-sm font-medium" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Tidak ada laporan yang cocok dengan filter
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const roadStyle = ROAD_STYLE[r.roadCondition] ?? ROAD_STYLE.BELUM_ADA_DATA;
            const signalInfo = SIGNAL_LABEL[r.signalStrength];
            const fasilitasReported = FASILITAS_FIELDS.filter((f) => r[f.key] != null);

            return (
              <div
                key={r.id}
                className="rounded-2xl p-5"
                style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-bold" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}>
                      {r.userName}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                      {formatTanggal(r.createdAt)}
                    </p>
                  </div>
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                    style={{ background: roadStyle.bg, color: roadStyle.color }}
                  >
                    Jalan: {ROAD_LABEL[r.roadCondition] ?? r.roadCondition}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {signalInfo && (
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ background: "#f0f0f0", color: "#4b4f45" }}
                    >
                      {signalInfo.icon}
                      {signalInfo.label}
                    </span>
                  )}
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ background: "#f0f0f0", color: "#4b4f45" }}
                  >
                    <Users size={13} />
                    Keramaian: {CROWD_LABEL[r.crowdLevel] ?? r.crowdLevel}
                  </span>
                  {r.reportedFee != null && (
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ background: "#f0f0f0", color: "#4b4f45" }}
                    >
                      Biaya dilaporkan: {formatRupiah(r.reportedFee)}
                    </span>
                  )}
                </div>

                {fasilitasReported.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {fasilitasReported.map((f) => {
                      const layak = r[f.key];
                      return (
                        <span
                          key={f.key}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{
                            background: layak ? "var(--blusukan-primary-container)" : "var(--blusukan-error-container)",
                            color: layak ? "var(--blusukan-primary)" : "var(--blusukan-error)",
                          }}
                        >
                          {layak ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {f.label}
                        </span>
                      );
                    })}
                  </div>
                )}

                {r.notes && (
                  <p
                    className="text-xs italic pt-3"
                    style={{ borderTop: "1px dashed var(--blusukan-outline-variant)", color: "var(--blusukan-on-surface-variant)" }}
                  >
                    &ldquo;{r.notes}&rdquo;
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
