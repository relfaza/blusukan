"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bell, Inbox, Ticket } from "lucide-react";

type TransaksiRow = {
  id: string;
  type: string;
  totalHarga: number;
  status: string;
  kodeTransaksi: string;
  createdAt: string;
  namaPemesan: string;
};

const TYPE_LABEL: Record<string, string> = {
  TIKET_MASUK: "Tiket Masuk",
  FASILITAS: "Fasilitas",
  UMKM: "UMKM",
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

const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "Semua" },
  { value: "PENDING", label: "Menunggu Konfirmasi" },
  { value: "DIKONFIRMASI", label: "Dikonfirmasi" },
  { value: "SELESAI", label: "Selesai" },
  { value: "DIBATALKAN", label: "Dibatalkan" },
];

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatTanggal(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" }).format(new Date(iso));
}

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLE[status] ?? STATUS_STYLE.PENDING;
  return (
    <span
      className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ background: style.bg, color: style.color }}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
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
            id={`filter-status-transaksi-${opt.value.toLowerCase()}`}
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

interface Props {
  destinationId: string;
  destinationName: string;
  initialTransaksis: TransaksiRow[];
}

export default function TransaksiLengkapClient({ destinationId, destinationName, initialTransaksis }: Props) {
  const [status, setStatus] = useState("ALL");
  const [dari, setDari] = useState("");
  const [sampai, setSampai] = useState("");

  const filtered = useMemo(() => {
    let result = initialTransaksis;

    if (status !== "ALL") {
      result = result.filter((t) => t.status === status);
    }

    if (dari) {
      const dariTime = new Date(dari).getTime();
      result = result.filter((t) => new Date(t.createdAt).getTime() >= dariTime);
    }

    if (sampai) {
      // Akhir hari "sampai" — inklusif sampai jam 23:59:59
      const sampaiTime = new Date(sampai).getTime() + 24 * 60 * 60 * 1000 - 1;
      result = result.filter((t) => new Date(t.createdAt).getTime() <= sampaiTime);
    }

    return result;
  }, [initialTransaksis, status, dari, sampai]);

  return (
    <div className="min-h-screen" style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-3xl mx-auto px-4 lg:px-8 py-10">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <Link
            href={`/pengelola/destinasi/${destinationId}`}
            id="btn-kembali-transaksi-lengkap"
            className="flex items-center gap-1.5 text-sm font-semibold hover:opacity-70 transition-opacity"
            style={{ color: "var(--blusukan-primary)" }}
          >
            <ArrowLeft size={16} />
            Kembali ke Detail Destinasi
          </Link>
          <Link
            href="/notifikasi"
            id="link-ke-notifikasi-umum"
            className="flex items-center gap-1.5 text-xs font-semibold hover:opacity-70 transition-opacity"
            style={{ color: "var(--blusukan-on-surface-variant)" }}
          >
            <Bell size={13} />
            Buka Notifikasi
          </Link>
        </div>

        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
        >
          Semua Transaksi Masuk
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          {destinationName}
        </p>

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
              Rentang Tanggal
            </h2>
            <div className="flex items-center gap-3 flex-wrap">
              <div>
                <label htmlFor="filter-dari" className="sr-only">
                  Dari tanggal
                </label>
                <input
                  id="filter-dari"
                  type="date"
                  value={dari}
                  onChange={(e) => setDari(e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg"
                  style={{ border: "1px solid var(--blusukan-outline-variant)", background: "#ffffff", color: "var(--blusukan-on-surface)" }}
                />
              </div>
              <span className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                sampai
              </span>
              <div>
                <label htmlFor="filter-sampai" className="sr-only">
                  Sampai tanggal
                </label>
                <input
                  id="filter-sampai"
                  type="date"
                  value={sampai}
                  onChange={(e) => setSampai(e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg"
                  style={{ border: "1px solid var(--blusukan-outline-variant)", background: "#ffffff", color: "var(--blusukan-on-surface)" }}
                />
              </div>
              {(dari || sampai) && (
                <button
                  type="button"
                  id="btn-reset-rentang-tanggal"
                  onClick={() => {
                    setDari("");
                    setSampai("");
                  }}
                  className="text-xs font-semibold hover:opacity-70 transition-opacity"
                  style={{ color: "var(--blusukan-primary)" }}
                >
                  Reset
                </button>
              )}
            </div>
          </section>
        </div>

        {initialTransaksis.length === 0 ? (
          <div
            className="rounded-2xl p-10 flex flex-col items-center text-center"
            style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
          >
            <Ticket size={36} style={{ color: "var(--blusukan-outline)" }} className="mb-3" />
            <p className="text-sm font-medium" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Belum ada transaksi masuk untuk destinasi ini.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="rounded-2xl p-10 flex flex-col items-center text-center"
            style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
          >
            <Inbox size={36} style={{ color: "var(--blusukan-outline)" }} className="mb-3" />
            <p className="text-sm font-medium" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Tidak ada transaksi yang cocok dengan filter.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Menampilkan {filtered.length} dari {initialTransaksis.length} transaksi
            </p>
            {filtered.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl p-5"
                style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p
                      className="text-sm font-bold tracking-wide"
                      style={{ fontFamily: "monospace", color: "var(--blusukan-on-surface)" }}
                    >
                      {t.kodeTransaksi}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                      {t.namaPemesan} · {TYPE_LABEL[t.type] ?? t.type}
                    </p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>

                <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px dashed var(--blusukan-outline-variant)" }}>
                  <p className="text-sm font-bold" style={{ color: "var(--blusukan-primary)" }}>
                    {formatRupiah(t.totalHarga)}
                  </p>
                  <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                    {formatTanggal(t.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
