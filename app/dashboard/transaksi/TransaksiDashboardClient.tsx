"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Receipt } from "lucide-react";

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

const TYPE_LABEL: Record<string, string> = {
  TIKET_MASUK: "Tiket Masuk",
  FASILITAS: "Fasilitas",
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

export default function TransaksiDashboardClient() {
  const [items, setItems] = useState<TransaksiRow[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/transaksi")
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
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-3xl mx-auto px-4 lg:px-8 py-10">
        <Link
          href="/dashboard"
          id="transaksi-back"
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
          Transaksi
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          50 transaksi terbaru dari seluruh destinasi
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
            <Receipt size={40} style={{ color: "var(--blusukan-outline)" }} className="mb-3" />
            <p className="text-sm font-medium" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Belum ada transaksi
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((t) => {
              const statusStyle = STATUS_STYLE[t.status] ?? STATUS_STYLE.PENDING;
              return (
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
                        {t.userName} · {t.destinationName} · {TYPE_LABEL[t.type] ?? t.type}
                      </p>
                    </div>
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                      style={{ background: statusStyle.bg, color: statusStyle.color }}
                    >
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
