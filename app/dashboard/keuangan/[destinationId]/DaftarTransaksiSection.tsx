"use client";

import { useEffect, useState } from "react";
import { Receipt, SlidersHorizontal } from "lucide-react";
import { TYPE_LABEL, formatRupiah } from "../keuangan-shared";

type TransaksiRow = {
  id: string;
  kodeTransaksi: string;
  userName: string;
  type: string;
  totalHarga: number;
  status: string;
  createdAt: string;
};

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

export default function DaftarTransaksiSection({ destinationId }: { destinationId: string }) {
  const [items, setItems] = useState<TransaksiRow[] | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ destinationId });
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
    <section className="mt-8">
      <h3 className="text-sm font-bold mb-3" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}>
        Daftar Transaksi
      </h3>

      <div
        className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4 p-4 rounded-2xl"
        style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
      >
        <div className="flex items-center gap-2 shrink-0" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          <SlidersHorizontal size={16} />
          <span className="text-xs font-semibold">Filter</span>
        </div>

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
                      {t.userName} · {TYPE_LABEL[t.type] ?? t.type}
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
    </section>
  );
}
