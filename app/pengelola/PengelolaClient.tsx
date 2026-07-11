"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Inbox, Search } from "lucide-react";

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
  PENDING: { bg: "#fef3e7", color: "#805533" },
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

function EmptyState({ message }: { message: string }) {
  return (
    <div
      className="rounded-2xl p-10 flex flex-col items-center text-center"
      style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
    >
      <Inbox size={40} style={{ color: "var(--blusukan-outline)" }} className="mb-3" />
      <p className="text-sm font-medium" style={{ color: "var(--blusukan-on-surface-variant)" }}>
        {message}
      </p>
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
      <p className="text-sm font-semibold mb-6" style={{ color: "var(--blusukan-on-surface)" }}>
        {summary.approved} Disetujui · {summary.rejected} Ditolak · {summary.pending} Menunggu
      </p>

      <div className="relative w-full max-w-md mb-5">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--blusukan-on-surface-variant)" }}
        />
        <input
          id="search-destinasi-pengelola"
          type="text"
          placeholder="Cari nama destinasi…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full py-2.5 pl-11 pr-4 rounded-full text-sm transition-all focus:outline-none"
          style={{
            background: "#ffffff",
            border: "1px solid var(--blusukan-outline-variant)",
            color: "var(--blusukan-on-surface)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        />
      </div>

      <div className="space-y-4 mb-6">
        <section>
          <h2
            className="text-xs font-semibold uppercase tracking-wide mb-2"
            style={{ color: "var(--blusukan-on-surface-variant)" }}
          >
            Status
          </h2>
          <FilterChipRow options={STATUS_FILTER_OPTIONS} value={status} onChange={setStatus} />
        </section>

        <section>
          <h2
            className="text-xs font-semibold uppercase tracking-wide mb-2"
            style={{ color: "var(--blusukan-on-surface-variant)" }}
          >
            Urutkan
          </h2>
          <div
            className="inline-flex gap-1 rounded-lg p-1"
            style={{ background: "var(--blusukan-surface)", border: "1px solid var(--blusukan-outline-variant)" }}
          >
            {SORT_OPTIONS.map((opt) => {
              const active = opt.value === sortBy;
              return (
                <button
                  key={opt.value}
                  type="button"
                  id={`sort-${opt.value}`}
                  onClick={() => setSortBy(opt.value)}
                  className="text-xs font-semibold px-3.5 py-1.5 rounded-md transition-colors"
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
        </section>
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
                className="relative rounded-2xl p-5 transition-shadow hover:shadow-md"
                style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
              >
                {d.pendingCount > 0 && (
                  <span
                    className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: "var(--blusukan-error)", color: "#ffffff" }}
                  >
                    {d.pendingCount}
                  </span>
                )}

                <div className="flex items-center gap-1.5 mb-2">
                  <MapPin size={14} style={{ color: "var(--blusukan-on-surface-variant)" }} />
                  <span className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                    {KABUPATEN_LABEL[d.kabupaten] ?? d.kabupaten}
                  </span>
                </div>

                <p
                  className="text-base font-bold mb-3"
                  style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
                >
                  {d.name}
                </p>

                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: statusStyle.bg, color: statusStyle.color }}
                  >
                    {STATUS_LABEL[d.status] ?? d.status}
                  </span>
                  {d.pendingCount > 0 && (
                    <span className="text-xs font-semibold" style={{ color: "var(--blusukan-error)" }}>
                      {d.pendingCount} perlu dikonfirmasi
                    </span>
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
