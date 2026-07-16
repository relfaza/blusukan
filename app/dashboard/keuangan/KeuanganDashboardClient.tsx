"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Minus, Wallet, MapPin, Receipt } from "lucide-react";
import type { PeringkatKeuangan } from "@/lib/peringkat-keuangan";
import PeringkatWidget, { type PeringkatWidgetItem, type PeringkatWidgetTab } from "@/components/admin/peringkat-widget";
import AdminFilterBar from "@/components/admin/admin-filter-bar";
import AdminExportButton, { type ExportColumn } from "@/components/admin-export-button";
import ChartDetailDialog, { type DetailColumn } from "../ChartDetailDialog";
import { useChartDetail } from "../useChartDetail";
import {
  ChartCard,
  EmptyChartState,
  PERIODE_OPTIONS,
  PERIODE_SEBELUMNYA_LABEL,
  PeriodeToggle,
  TrenPendapatanChart,
  BreakdownJenisChart,
  TYPE_LABEL,
  formatRupiah,
  type KeuanganResponse,
  type Periode,
} from "./keuangan-shared";

const PERINGKAT_TABS: PeringkatWidgetTab[] = [{ key: "terlaris", label: "Terlaris", dataSource: "pendapatan" }];

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

const TRANSAKSI_STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu Konfirmasi",
  DIKONFIRMASI: "Dikonfirmasi",
  SELESAI: "Selesai",
  DIBATALKAN: "Dibatalkan",
};

function formatTanggalSingkat(iso: unknown): string {
  if (typeof iso !== "string" || !iso) return "–";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

const TRANSAKSI_COLUMNS: DetailColumn[] = [
  { key: "kodeTransaksi", label: "Kode Transaksi" },
  { key: "destinationName", label: "Destinasi" },
  { key: "userName", label: "Pemesan" },
  { key: "type", label: "Jenis", format: (v) => TYPE_LABEL[v as string] ?? String(v) },
  { key: "totalHarga", label: "Total", format: (v) => formatRupiah(Number(v)) },
  { key: "status", label: "Status", format: (v) => TRANSAKSI_STATUS_LABEL[v as string] ?? String(v) },
  { key: "createdAt", label: "Tanggal", format: formatTanggalSingkat },
];

const EXPORT_COLUMNS: ExportColumn<PeringkatKeuangan>[] = [
  { key: "name", header: "Nama Destinasi" },
  { key: "kabupaten", header: "Kabupaten", format: (d) => KABUPATEN_LABEL[d.kabupaten] ?? d.kabupaten },
  { key: "kategori", header: "Kategori", format: (d) => KATEGORI_LABEL[d.kategori] ?? d.kategori },
  { key: "submittedByName", header: "Dikelola oleh" },
  { key: "totalPendapatan", header: "Total Pendapatan", format: (d) => formatRupiah(d.totalPendapatan) },
  { key: "jumlahTransaksi", header: "Jumlah Transaksi", format: (d) => String(d.jumlahTransaksi) },
];

export default function KeuanganDashboardClient({
  semuaDestinasiKeuangan,
  peringkatWidgetItems,
}: {
  semuaDestinasiKeuangan: PeringkatKeuangan[];
  peringkatWidgetItems: PeringkatWidgetItem[];
}) {
  const [periode, setPeriode] = useState<Periode>("harian");
  const [data, setData] = useState<KeuanganResponse | null>(null);
  const [error, setError] = useState("");
  const { state: detailState, show: showDetail, onOpenChange: closeDetail } = useChartDetail();

  const searchParams = useSearchParams();
  const kabupaten = searchParams.get("kabupaten");

  function handleTrenBucketClick(label: string) {
    showDetail(
      { type: "bucket", periode, label },
      `Transaksi — ${label}`,
      TRANSAKSI_COLUMNS,
      "/api/admin/keuangan/detail"
    );
  }

  function handleJenisClick(jenisRaw: string, jenisLabel: string) {
    showDetail(
      { type: "jenis", periode, jenis: jenisRaw },
      `Transaksi Jenis ${jenisLabel}`,
      TRANSAKSI_COLUMNS,
      "/api/admin/keuangan/detail"
    );
  }

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ periode });
    if (kabupaten) params.set("kabupaten", kabupaten);
    fetch(`/api/admin/keuangan?${params.toString()}`)
      .then((res) => res.json())
      .then((json: KeuanganResponse) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setError("Gagal memuat data keuangan.");
      });
    return () => {
      cancelled = true;
    };
  }, [periode, kabupaten]);

  const naik = (data?.persenPerubahan ?? 0) > 0;
  const turun = (data?.persenPerubahan ?? 0) < 0;
  const trendColor = naik ? "var(--blusukan-primary)" : turun ? "var(--blusukan-error)" : "var(--blusukan-on-surface-variant)";
  const trendBg = naik ? "var(--blusukan-primary-container)" : turun ? "var(--blusukan-error-container)" : "var(--blusukan-surface)";

  return (
    <div className="min-h-screen" style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Link
            href="/dashboard"
            id="keuangan-back"
            className="flex items-center gap-1.5 text-sm font-semibold hover:opacity-70 transition-opacity"
            style={{ color: "var(--blusukan-primary)" }}
          >
            <ArrowLeft size={16} />
            Kembali ke Dashboard
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <AdminExportButton
              data={semuaDestinasiKeuangan}
              columns={EXPORT_COLUMNS}
              filenameBase="keuangan-per-destinasi"
              title="Keuangan per Destinasi"
            />
            <Link
              href="/dashboard/transaksi?from=keuangan"
              id="link-log-transaksi"
              className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full transition-opacity hover:opacity-90"
              style={{ background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }}
            >
              <Receipt size={14} />
              Log Transaksi
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}>
            Dashboard Keuangan
          </h1>
          <PeriodeToggle value={periode} onChange={setPeriode} />
        </div>
        <p className="text-sm mb-5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Pendapatan dari transaksi berstatus Selesai atau Dikonfirmasi
        </p>

        <AdminFilterBar showKondisiJalan={false} className="mb-8" />

        {error && (
          <p className="text-sm px-4 py-2.5 rounded-lg mb-4" style={{ background: "var(--blusukan-error-container)", color: "var(--blusukan-error)" }}>
            {error}
          </p>
        )}

        {/* KPI besar */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }}>
              <Wallet size={18} />
            </div>
            <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Total Pendapatan ({PERIODE_OPTIONS.find((p) => p.value === periode)?.label})
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <p className="text-3xl font-bold" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}>
              {data ? formatRupiah(data.totalPeriodeIni) : "–"}
            </p>
            {data && (
              <span
                className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap mb-1"
                style={{ background: trendBg, color: trendColor }}
              >
                {naik ? <ArrowUpRight size={13} /> : turun ? <ArrowDownRight size={13} /> : <Minus size={13} />}
                {Math.abs(data.persenPerubahan)}% dari {PERIODE_SEBELUMNYA_LABEL[periode]}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <ChartCard title="Tren Pendapatan">
            {data ? (
              <TrenPendapatanChart data={data.tren} onPointClick={handleTrenBucketClick} />
            ) : (
              <EmptyChartState message="Memuat..." />
            )}
          </ChartCard>
          <ChartCard title="Breakdown Pendapatan per Jenis">
            {data ? (
              <BreakdownJenisChart data={data.perJenis} onBarClick={handleJenisClick} />
            ) : (
              <EmptyChartState message="Memuat..." />
            )}
          </ChartCard>
        </div>

        <PeringkatWidget
          title="🧾 Top 5 Destinasi Terlaris"
          tabs={PERINGKAT_TABS}
          initialItems={peringkatWidgetItems}
          source="keuangan"
        />

        {/* Keuangan per Destinasi */}
        <section>
          <h3 className="text-sm font-bold mb-1" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}>
            Keuangan per Destinasi
          </h3>
          <p className="text-xs mb-3" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Klik destinasi untuk lihat detail keuangannya
          </p>

          {semuaDestinasiKeuangan.length === 0 ? (
            <div className="rounded-2xl p-10 flex flex-col items-center text-center" style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}>
              <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                Belum ada destinasi dengan transaksi
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {semuaDestinasiKeuangan.map((d) => (
                <Link
                  key={d.id}
                  href={`/dashboard/keuangan/${d.id}`}
                  id={`card-keuangan-destinasi-${d.id}`}
                  className="block rounded-2xl p-5 transition-shadow hover:shadow-md"
                  style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <MapPin size={14} style={{ color: "var(--blusukan-on-surface-variant)" }} />
                    <span className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                      {KABUPATEN_LABEL[d.kabupaten] ?? d.kabupaten}
                    </span>
                  </div>

                  <p className="text-base font-bold mb-1" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}>
                    {d.name}
                  </p>
                  <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                    {KATEGORI_LABEL[d.kategori] ?? d.kategori} · Dikelola oleh {d.submittedByName}
                  </p>
                  <p className="text-xs font-bold mt-2" style={{ color: "var(--blusukan-primary)" }}>
                    Total Pendapatan: {formatRupiah(d.totalPendapatan)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <ChartDetailDialog state={detailState} onOpenChange={closeDetail} />
    </div>
  );
}
