"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { ChevronRight, Flame, Receipt, Star } from "lucide-react";

const KABUPATEN_LABEL: Record<string, string> = {
  SLEMAN: "Sleman",
  GUNUNGKIDUL: "Gunungkidul",
  BANTUL: "Bantul",
  KULON_PROGO: "Kulon Progo",
  KOTA_YOGYAKARTA: "Kota Yogyakarta",
};

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export type PeringkatWidgetDataSource = "kunjungan" | "rating" | "pendapatan";

export type PeringkatWidgetTab = {
  key: string;
  label: string;
  dataSource: PeringkatWidgetDataSource;
};

export type PeringkatWidgetItem = {
  id: string;
  name: string;
  kabupaten: string;
  /** jumlahKunjungan, rataRataRating, atau totalPendapatan tergantung dataSource tab */
  value: number;
  /** hanya relevan untuk dataSource "rating" */
  totalReview?: number;
};

interface PeringkatWidgetProps {
  title: string;
  tabs: PeringkatWidgetTab[];
  /** data untuk tabs[0], sudah tersedia dari server sehingga tab default tidak perlu fetch ulang */
  initialItems: PeringkatWidgetItem[];
  source: "dashboard" | "keuangan";
}

const API_ENDPOINT: Record<PeringkatWidgetDataSource, string> = {
  kunjungan: "/api/admin/peringkat",
  rating: "/api/admin/peringkat-rating",
  pendapatan: "/api/admin/peringkat-keuangan",
};

const FULL_PERINGKAT_HREF: Record<PeringkatWidgetDataSource, string> = {
  kunjungan: "/dashboard/peringkat",
  rating: "/dashboard/peringkat-rating",
  pendapatan: "/dashboard/peringkat-keuangan",
};

const TAB_ICON: Record<PeringkatWidgetDataSource, ReactNode> = {
  kunjungan: <Flame size={13} />,
  rating: <Star size={13} />,
  pendapatan: <Receipt size={13} />,
};

const EMPTY_MESSAGE: Record<PeringkatWidgetDataSource, string> = {
  kunjungan: "Belum ada destinasi yang disetujui",
  rating: "Belum ada destinasi dengan ulasan",
  pendapatan: "Belum ada destinasi dengan transaksi",
};

type RawKunjungan = { id: string; name: string; kabupaten: string; jumlahKunjungan: number };
type RawRating = { id: string; name: string; kabupaten: string; rataRataRating: number; totalReview: number };
type RawPendapatan = { id: string; name: string; kabupaten: string; totalPendapatan: number };

function normalizeRaw(dataSource: PeringkatWidgetDataSource, raw: unknown[]): PeringkatWidgetItem[] {
  switch (dataSource) {
    case "kunjungan":
      return (raw as RawKunjungan[]).map((d) => ({ id: d.id, name: d.name, kabupaten: d.kabupaten, value: d.jumlahKunjungan }));
    case "rating":
      return (raw as RawRating[]).map((d) => ({
        id: d.id,
        name: d.name,
        kabupaten: d.kabupaten,
        value: d.rataRataRating,
        totalReview: d.totalReview,
      }));
    case "pendapatan":
      return (raw as RawPendapatan[]).map((d) => ({ id: d.id, name: d.name, kabupaten: d.kabupaten, value: d.totalPendapatan }));
  }
}

function getTop5(items: PeringkatWidgetItem[], dataSource: PeringkatWidgetDataSource): PeringkatWidgetItem[] {
  // Mode "kunjungan" tidak difilter — destinasi baru dengan 0 kunjungan tetap boleh muncul.
  // Mode "rating"/"pendapatan" difilter agar destinasi tanpa ulasan/transaksi tidak dianggap "top".
  const filtered = dataSource === "kunjungan" ? items : items.filter((d) => d.value > 0);
  return [...filtered].sort((a, b) => b.value - a.value).slice(0, 5);
}

function formatValue(dataSource: PeringkatWidgetDataSource, item: PeringkatWidgetItem): ReactNode {
  if (dataSource === "pendapatan") return formatRupiah(item.value);
  if (dataSource === "rating") {
    return (
      <span className="flex items-center gap-1">
        <Star size={13} fill="#f5a623" style={{ color: "#f5a623" }} />
        {item.value.toFixed(1)} ({item.totalReview ?? 0})
      </span>
    );
  }
  return `${item.value} kunjungan`;
}

export default function PeringkatWidget({ title, tabs, initialItems, source }: PeringkatWidgetProps) {
  const [activeKey, setActiveKey] = useState(tabs[0].key);
  const [cache, setCache] = useState<Record<string, PeringkatWidgetItem[]>>({ [tabs[0].key]: initialItems });

  const activeTab = tabs.find((t) => t.key === activeKey) ?? tabs[0];

  useEffect(() => {
    const tab = tabs.find((t) => t.key === activeKey);
    if (!tab || cache[tab.key]) return;

    let cancelled = false;
    fetch(API_ENDPOINT[tab.dataSource])
      .then((res) => res.json())
      .then((raw: unknown[]) => {
        if (cancelled) return;
        setCache((prev) => ({ ...prev, [tab.key]: normalizeRaw(tab.dataSource, raw) }));
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey]);

  const items = cache[activeKey];
  const displayed = items ? getTop5(items, activeTab.dataSource) : [];
  const isLoading = !items;

  const fullPeringkatHref = `${FULL_PERINGKAT_HREF[activeTab.dataSource]}?from=${source}`;

  function destinasiHref(id: string): string {
    return source === "keuangan" ? `/dashboard/destinasi/${id}?from=keuangan` : `/dashboard/destinasi/${id}`;
  }

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2
          className="text-lg font-bold"
          style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
        >
          {title}
        </h2>
        {tabs.length > 1 && (
          <div
            className="inline-flex p-1 rounded-xl shrink-0"
            style={{ background: "var(--blusukan-surface)", border: "1px solid var(--blusukan-outline-variant)" }}
          >
            {tabs.map((tab) => {
              const active = tab.key === activeKey;
              return (
                <button
                  key={tab.key}
                  type="button"
                  id={`peringkat-widget-toggle-${tab.key}`}
                  onClick={() => setActiveKey(tab.key)}
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  style={{
                    background: active ? "var(--blusukan-primary)" : "transparent",
                    color: active ? "#ffffff" : "var(--blusukan-on-surface-variant)",
                  }}
                >
                  {TAB_ICON[tab.dataSource]}
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {isLoading ? (
        <div
          className="rounded-2xl p-6 text-center"
          style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
        >
          <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Memuat...
          </p>
        </div>
      ) : displayed.length === 0 ? (
        <div
          className="rounded-2xl p-6 text-center"
          style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
        >
          <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            {EMPTY_MESSAGE[activeTab.dataSource]}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}>
          {displayed.map((d, idx) => {
            const rank = idx + 1;
            return (
              <Link
                key={d.id}
                href={destinasiHref(d.id)}
                id={`row-peringkat-widget-${d.id}`}
                className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[#f7f8f5]"
                style={{ borderTop: idx === 0 ? "none" : "1px solid var(--blusukan-outline-variant)" }}
              >
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                  style={{
                    background: rank <= 3 ? "var(--blusukan-primary)" : "var(--blusukan-surface)",
                    color: rank <= 3 ? "#ffffff" : "var(--blusukan-on-surface-variant)",
                  }}
                >
                  #{rank}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-bold truncate"
                    style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
                  >
                    {d.name}
                  </p>
                  <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                    {KABUPATEN_LABEL[d.kabupaten] ?? d.kabupaten}
                  </p>
                </div>
                <p className="text-sm font-bold shrink-0" style={{ color: "var(--blusukan-primary)" }}>
                  {formatValue(activeTab.dataSource, d)}
                </p>
              </Link>
            );
          })}
        </div>
      )}

      <Link
        href={fullPeringkatHref}
        id="peringkat-widget-lihat-lengkap"
        className="flex items-center gap-0.5 text-xs font-semibold mt-3 hover:opacity-70 transition-opacity"
        style={{ color: "var(--blusukan-primary)" }}
      >
        Lihat Peringkat Lengkap
        <ChevronRight size={14} />
      </Link>
    </div>
  );
}
