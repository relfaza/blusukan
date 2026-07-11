"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Search, BarChart3 } from "lucide-react";

type DestinasiRow = {
  id: string;
  name: string;
  kabupaten: string;
  kategori: string;
  submittedByName: string;
  createdAt: string;
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

const KABUPATEN_OPTIONS = [{ value: "ALL", label: "Semua" }, ...Object.entries(KABUPATEN_LABEL).map(([value, label]) => ({ value, label }))];
const KATEGORI_OPTIONS = [{ value: "ALL", label: "Semua" }, ...Object.entries(KATEGORI_LABEL).map(([value, label]) => ({ value, label }))];

const SORT_OPTIONS: { value: "terbaru" | "terlama"; label: string }[] = [
  { value: "terbaru", label: "Terbaru" },
  { value: "terlama", label: "Terlama" },
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

export default function DestinasiAktifClient() {
  const [items, setItems] = useState<DestinasiRow[] | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [kabupaten, setKabupaten] = useState("ALL");
  const [kategori, setKategori] = useState("ALL");
  const [sortBy, setSortBy] = useState<"terbaru" | "terlama">("terbaru");

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ status: "APPROVED", sortBy });
    if (search.trim()) params.set("search", search.trim());
    if (kabupaten !== "ALL") params.set("kabupaten", kabupaten);
    if (kategori !== "ALL") params.set("kategori", kategori);

    const timeout = setTimeout(() => {
      fetch(`/api/admin/destinasi?${params.toString()}`)
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled) setItems(Array.isArray(data) ? data : []);
        })
        .catch(() => {
          if (!cancelled) setError("Gagal memuat data destinasi.");
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [search, kabupaten, kategori, sortBy]);

  return (
    <div className="min-h-screen" style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Link
            href="/dashboard"
            id="destinasi-back"
            className="flex items-center gap-1.5 text-sm font-semibold hover:opacity-70 transition-opacity"
            style={{ color: "var(--blusukan-primary)" }}
          >
            ← Kembali ke Dashboard
          </Link>
          <Link
            href="/dashboard/peringkat"
            id="link-lihat-peringkat"
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full transition-opacity hover:opacity-90"
            style={{ background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }}
          >
            <BarChart3 size={14} />
            Lihat Peringkat Keramaian
          </Link>
        </div>

        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
        >
          Destinasi Aktif
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          {items ? `${items.length} destinasi ditemukan` : "Destinasi berstatus disetujui"}
        </p>

        {/* Search bar */}
        <div className="relative w-full max-w-2xl mb-5">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--blusukan-on-surface-variant)" }}
          />
          <input
            id="search-destinasi-admin"
            type="text"
            placeholder="Cari nama destinasi…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-3 pl-11 pr-4 rounded-full text-sm transition-all focus:outline-none"
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
            <h2 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Kabupaten
            </h2>
            <FilterChipRow options={KABUPATEN_OPTIONS} value={kabupaten} onChange={setKabupaten} />
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Kategori
            </h2>
            <FilterChipRow options={KATEGORI_OPTIONS} value={kategori} onChange={setKategori} />
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Urutkan
            </h2>
            <div className="inline-flex gap-1 rounded-lg p-1" style={{ background: "var(--blusukan-surface)", border: "1px solid var(--blusukan-outline-variant)" }}>
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
            <MapPin size={40} style={{ color: "var(--blusukan-outline)" }} className="mb-3" />
            <p className="text-sm font-medium" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Tidak ada destinasi yang cocok dengan filter
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((d) => (
              <Link
                key={d.id}
                href={`/dashboard/destinasi/${d.id}`}
                id={`card-destinasi-${d.id}`}
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
                  className="text-base font-bold mb-1"
                  style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
                >
                  {d.name}
                </p>
                <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                  {KATEGORI_LABEL[d.kategori] ?? d.kategori} · Dikelola oleh {d.submittedByName}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
