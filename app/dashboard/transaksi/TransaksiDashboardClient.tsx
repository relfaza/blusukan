"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Receipt, SlidersHorizontal } from "lucide-react";
import { TYPE_LABEL, formatRupiah } from "../keuangan/keuangan-shared";

type TransaksiRow = {
  id: string;
  kodeTransaksi: string;
  userName: string;
  destinationName: string;
  type: string;
  totalHarga: number;
  status: string;
  createdAt: string;
};

type DestinasiOption = { id: string; name: string };

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu Konfirmasi",
  DIKONFIRMASI: "Dikonfirmasi",
  SELESAI: "Selesai",
  DIBATALKAN: "Dibatalkan",
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: "#fef3e7", color: "#805533" },
  DIKONFIRMASI: { bg: "var(--blusukan-primary-container)", color: "#1d4ed8" },
  SELESAI: { bg: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" },
  DIBATALKAN: { bg: "#eeeeee", color: "var(--blusukan-on-surface-variant)" },
};

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "PENDING", label: "Menunggu Konfirmasi" },
  { value: "DIKONFIRMASI", label: "Dikonfirmasi" },
  { value: "SELESAI", label: "Selesai" },
  { value: "DIBATALKAN", label: "Dibatalkan" },
];

const selectStyle = {
  border: "1px solid var(--blusukan-outline-variant)",
  borderRadius: "8px",
  color: "var(--blusukan-on-surface)",
  background: "#ffffff",
};

function formatTanggal(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" }).format(new Date(iso));
}

export default function TransaksiDashboardClient({
  destinasiOptions,
  backHref,
  backLabel,
}: {
  destinasiOptions: DestinasiOption[];
  backHref: string;
  backLabel: string;
}) {
  const [items, setItems] = useState<TransaksiRow[] | null>(null);
  const [error, setError] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (destinationId) params.set("destinationId", destinationId);
    if (status) params.set("status", status);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);

    fetch(`/api/admin/transaksi?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setError("Gagal memuat data transaksi.");
      });
    return () => {
      cancelled = true;
    };
  }, [destinationId, status, dateFrom, dateTo]);

  return (
    <div className="min-h-screen" style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10">
        <Link
          href={backHref}
          id="transaksi-back"
          className="flex items-center gap-1.5 text-sm font-semibold mb-6 hover:opacity-70 transition-opacity"
          style={{ color: "var(--blusukan-primary)" }}
        >
          <ArrowLeft size={16} />
          {backLabel}
        </Link>

        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}>
          Log Transaksi
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          {items ? `${items.length} transaksi ditemukan` : "Riwayat transaksi seluruh destinasi untuk kebutuhan audit"}
        </p>

        <div
          className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6 p-4 rounded-2xl"
          style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
        >
          <div className="flex items-center gap-2 shrink-0" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            <SlidersHorizontal size={16} />
            <span className="text-xs font-semibold">Filter</span>
          </div>

          <select
            id="filter-destinasi"
            value={destinationId}
            onChange={(e) => setDestinationId(e.target.value)}
            className="flex-1 min-w-[160px] px-3 py-2 text-sm"
            style={selectStyle}
          >
            <option value="">Semua Destinasi</option>
            {destinasiOptions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            id="filter-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="flex-1 min-w-[140px] px-3 py-2 text-sm"
            style={selectStyle}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <input
            id="filter-tanggal-dari"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="flex-1 min-w-[130px] px-3 py-2 text-sm"
            style={selectStyle}
          />
          <input
            id="filter-tanggal-sampai"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="flex-1 min-w-[130px] px-3 py-2 text-sm"
            style={selectStyle}
          />
        </div>

        {error && (
          <p className="text-sm px-4 py-2.5 rounded-lg mb-4" style={{ background: "var(--blusukan-error-container)", color: "var(--blusukan-error)" }}>
            {error}
          </p>
        )}

        {items === null ? (
          <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Memuat...
          </p>
        ) : items.length === 0 ? (
          <div className="rounded-2xl p-10 flex flex-col items-center text-center" style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}>
            <Receipt size={40} style={{ color: "var(--blusukan-outline)" }} className="mb-3" />
            <p className="text-sm font-medium" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Tidak ada transaksi yang cocok dengan filter
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((t) => {
              const statusStyle = STATUS_STYLE[t.status] ?? STATUS_STYLE.PENDING;
              return (
                <div key={t.id} className="rounded-2xl p-5" style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-sm font-bold tracking-wide" style={{ fontFamily: "monospace", color: "var(--blusukan-on-surface)" }}>
                        {t.kodeTransaksi}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                        {t.destinationName} · {t.userName} · {TYPE_LABEL[t.type] ?? t.type}
                      </p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                      {STATUS_LABEL[t.status] ?? t.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px dashed var(--blusukan-outline-variant)" }}>
                    <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                      {formatTanggal(t.createdAt)}
                    </p>
                    <p className="text-sm font-bold" style={{ color: "var(--blusukan-primary)" }}>
                      {formatRupiah(t.totalHarga)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
