"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Inbox,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
} from "lucide-react";

type DestinasiRow = {
  id: string;
  name: string;
  kabupaten: string;
  status: string;
  createdAt: string;
  pendingCount: number;
};

const KABUPATEN_LABEL: Record<string, string> = {
  SLEMAN: "Sleman",
  GUNUNGKIDUL: "Gunungkidul",
  BANTUL: "Bantul",
  KULON_PROGO: "Kulon Progo",
  KOTA_YOGYAKARTA: "Kota Yogyakarta",
};

const STATUS_LABEL: Record<string, string> = {
  APPROVED: "Disetujui",
  PENDING: "Menunggu Persetujuan",
  REJECTED: "Ditolak",
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  APPROVED: { bg: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" },
  PENDING: {
    bg: "color-mix(in srgb, var(--blusukan-secondary-container) 55%, transparent)",
    color: "var(--blusukan-secondary)",
  },
  REJECTED: { bg: "var(--blusukan-error-container)", color: "var(--blusukan-error)" },
};

const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "Semua" },
  { value: "APPROVED", label: "Disetujui" },
  { value: "REJECTED", label: "Ditolak" },
  { value: "PENDING", label: "Menunggu Persetujuan" },
];

const SORT_OPTIONS: { value: "terbaru" | "terlama"; label: string }[] = [
  { value: "terbaru", label: "Terbaru Diajukan" },
  { value: "terlama", label: "Terlama Diajukan" },
];

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
            id={`filter-status-${opt.value.toLowerCase()}`}
            onClick={() => onChange(opt.value)}
            className="shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95"
            style={
              active
                ? {
                    background: "var(--blusukan-primary)",
                    color: "var(--blusukan-on-primary)",
                    border: "1px solid var(--blusukan-primary)",
                    boxShadow:
                      "0 6px 16px -6px color-mix(in srgb, var(--blusukan-primary) 65%, transparent)",
                  }
                : {
                    background: "var(--blusukan-surface-container-lowest)",
                    color: "var(--blusukan-on-surface-variant)",
                    border: "1px solid var(--blusukan-outline-variant)",
                  }
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      className="rounded-3xl p-12 flex flex-col items-center text-center"
      style={{
        background: "var(--blusukan-surface-container-lowest)",
        border: "1px dashed var(--blusukan-outline-variant)",
      }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ background: "var(--blusukan-primary-container)" }}
      >
        <Inbox size={28} style={{ color: "var(--blusukan-primary)" }} />
      </div>
      <p
        className="text-base font-bold"
        style={{ color: "var(--blusukan-on-surface)", fontFamily: "Montserrat, sans-serif" }}
      >
        {message}
      </p>
    </div>
  );
}

// Kartu statistik ringkas — angka diturunkan dari summary, bukan fetch baru
function StatCard({
  icon,
  value,
  label,
  accent,
  tint,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  accent: string;
  tint: string;
}) {
  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-3.5 transition-shadow hover:shadow-sm"
      style={{
        background: "var(--blusukan-surface-container-lowest)",
        border: "1px solid var(--blusukan-outline-variant)",
      }}
    >
      <span
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: tint, color: accent }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p
          className="text-2xl font-extrabold leading-none"
          style={{ color: "var(--blusukan-on-surface)", fontFamily: "Montserrat, sans-serif" }}
        >
          {value}
        </p>
        <p
          className="text-xs mt-1 truncate"
          style={{ color: "var(--blusukan-on-surface-variant)" }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

export default function PengelolaClient({ destinations }: { destinations: DestinasiRow[] }) {
  const [status, setStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState<"terbaru" | "terlama">("terbaru");
  const [search, setSearch] = useState("");

  const summary = useMemo(() => {
    return destinations.reduce(
      (acc, d) => {
        if (d.status === "APPROVED") acc.approved += 1;
        else if (d.status === "REJECTED") acc.rejected += 1;
        else if (d.status === "PENDING") acc.pending += 1;
        return acc;
      },
      { approved: 0, rejected: 0, pending: 0 }
    );
  }, [destinations]);

  const filtered = useMemo(() => {
    let result = destinations;

    if (status !== "ALL") {
      result = result.filter((d) => d.status === status);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((d) => d.name.toLowerCase().includes(q));
    }

    result = [...result].sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortBy === "terbaru" ? -diff : diff;
    });

    return result;
  }, [destinations, status, search, sortBy]);

  if (destinations.length === 0) {
    return <EmptyState message="Anda belum mengelola destinasi apa pun." />;
  }

  return (
    <>
      {/* ── Strip statistik — turunan dari summary yang sudah dihitung ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <StatCard
          icon={<CheckCircle2 size={20} />}
          value={summary.approved}
          label="Disetujui"
          accent="var(--blusukan-primary)"
          tint="var(--blusukan-primary-container)"
        />
        <StatCard
          icon={<Clock size={20} />}
          value={summary.pending}
          label="Menunggu Persetujuan"
          accent="var(--blusukan-secondary)"
          tint="color-mix(in srgb, var(--blusukan-secondary-container) 55%, transparent)"
        />
        <StatCard
          icon={<XCircle size={20} />}
          value={summary.rejected}
          label="Ditolak"
          accent="var(--blusukan-error)"
          tint="var(--blusukan-error-container)"
        />
      </div>

      {/* ── Toolbar: pencarian + urutkan ── */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-5">
        <div className="relative w-full lg:max-w-md">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--blusukan-outline)" }}
          />
          <input
            id="search-destinasi-pengelola"
            type="text"
            placeholder="Cari nama destinasi…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-3 pl-11 pr-4 rounded-full text-sm transition-all focus:outline-none"
            style={{
              background: "var(--blusukan-surface-container-lowest)",
              border: "1px solid var(--blusukan-outline-variant)",
              color: "var(--blusukan-on-surface)",
              boxShadow: "0 4px 14px -6px rgba(0,0,0,0.12)",
            }}
          />
        </div>

        <div
          className="inline-flex gap-1 rounded-full p-1 self-start lg:ml-auto shrink-0"
          style={{
            background: "var(--blusukan-surface-container)",
            border: "1px solid var(--blusukan-outline-variant)",
          }}
        >
          {SORT_OPTIONS.map((opt) => {
            const active = opt.value === sortBy;
            return (
              <button
                key={opt.value}
                type="button"
                id={`sort-${opt.value}`}
                onClick={() => setSortBy(opt.value)}
                className="text-xs font-semibold px-4 py-2 rounded-full transition-all"
                style={{
                  background: active
                    ? "var(--blusukan-surface-container-lowest)"
                    : "transparent",
                  color: active
                    ? "var(--blusukan-primary)"
                    : "var(--blusukan-on-surface-variant)",
                  boxShadow: active ? "0 2px 8px -2px rgba(0,0,0,0.14)" : "none",
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Filter status ── */}
      <div className="mb-8">
        <FilterChipRow options={STATUS_FILTER_OPTIONS} value={status} onChange={setStatus} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="Tidak ada destinasi yang cocok dengan filter." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d) => {
            const statusStyle = STATUS_STYLE[d.status] ?? STATUS_STYLE.PENDING;

            return (
              <Link
                key={d.id}
                href={`/pengelola/destinasi/${d.id}`}
                id={`card-destinasi-${d.id}`}
                className="group relative flex flex-col h-full overflow-hidden rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{
                  background: "var(--blusukan-surface-container-lowest)",
                  border: "1px solid var(--blusukan-outline-variant)",
                }}
              >
                {d.pendingCount > 0 && (
                  <span
                    className="absolute top-4 right-4 min-w-[22px] h-[22px] px-1.5 rounded-full flex items-center justify-center text-xs font-bold shadow-sm"
                    style={{ background: "var(--blusukan-error)", color: "#ffffff" }}
                  >
                    {d.pendingCount}
                  </span>
                )}

                <div className="flex items-center gap-1.5 mb-2">
                  <MapPin size={14} style={{ color: "var(--blusukan-outline)" }} />
                  <span
                    className="text-[11px] font-bold uppercase tracking-widest"
                    style={{ color: "var(--blusukan-outline)" }}
                  >
                    {KABUPATEN_LABEL[d.kabupaten] ?? d.kabupaten}
                  </span>
                </div>

                <p
                  className="text-lg font-extrabold leading-tight mb-4 pr-6"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    color: "var(--blusukan-on-surface)",
                  }}
                >
                  {d.name}
                </p>

                <div className="mt-auto flex items-center justify-between gap-2">
                  <span
                    className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: statusStyle.bg, color: statusStyle.color }}
                  >
                    {STATUS_LABEL[d.status] ?? d.status}
                  </span>

                  {d.pendingCount > 0 ? (
                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: "var(--blusukan-error)" }}
                    >
                      {d.pendingCount} perlu dikonfirmasi
                    </span>
                  ) : (
                    <ArrowUpRight
                      size={18}
                      className="opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
                      style={{ color: "var(--blusukan-primary)" }}
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
