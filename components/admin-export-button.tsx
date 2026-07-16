"use client";

import { useEffect, useRef, useState } from "react";
import { Download, FileSpreadsheet, FileText, Check, AlertCircle, ChevronDown } from "lucide-react";

export type ExportColumn<T> = {
  /** Kunci properti pada objek data (dipakai kalau tidak ada `format`). */
  key: string;
  /** Judul kolom pada header CSV/PDF. */
  header: string;
  /** Opsional: turunkan nilai sel dari row (mis. mapping enum → label). */
  format?: (row: T) => string | number | null | undefined;
};

type ToastState = { type: "success" | "error"; message: string } | null;

// --blusukan-primary (#1f4d2c) sebagai warna header tabel PDF.
const PDF_HEADER_RGB: [number, number, number] = [31, 77, 44];

function today(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function tanggalIndo(): string {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" }).format(new Date());
}

function cellValue<T extends Record<string, unknown>>(row: T, col: ExportColumn<T>): string {
  const raw = col.format ? col.format(row) : (row[col.key] as unknown);
  if (raw === null || raw === undefined) return "";
  return String(raw);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Beri jeda sebelum revoke supaya unduhan sempat mulai.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Tombol "Ekspor Laporan" reusable — dropdown dengan opsi Unduh CSV / Unduh PDF.
 * Semua konversi dilakukan client-side dari `data` yang dilewatkan halaman.
 */
export default function AdminExportButton<T extends Record<string, unknown>>({
  data,
  columns,
  filenameBase,
  title,
  disabled = false,
  className = "",
}: {
  data: T[];
  columns: ExportColumn<T>[];
  filenameBase: string;
  title: string;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const noData = disabled || data.length === 0;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(id);
  }, [toast]);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
  }

  async function exportCsv() {
    setOpen(false);
    if (noData) return;
    setBusy(true);
    try {
      const { unparse } = await import("papaparse");
      const rows = data.map((row) => columns.map((col) => cellValue(row, col)));
      const csv = unparse({ fields: columns.map((c) => c.header), data: rows });
      // BOM supaya Excel membaca UTF-8 dengan benar.
      const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
      triggerDownload(blob, `blusukan-${filenameBase}-${today()}.csv`);
      showToast("success", "CSV berhasil diunduh.");
    } catch (err) {
      console.error("Ekspor CSV gagal:", err);
      showToast("error", "Gagal membuat file CSV. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  async function exportPdf() {
    setOpen(false);
    if (noData) return;
    setBusy(true);
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const landscape = columns.length > 6;
      const doc = new jsPDF({ orientation: landscape ? "landscape" : "portrait", unit: "pt", format: "a4" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(31, 77, 44);
      doc.text(title, 40, 44);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(`Diekspor: ${tanggalIndo()} · ${data.length} baris`, 40, 60);

      autoTable(doc, {
        head: [columns.map((c) => c.header)],
        body: data.map((row) => columns.map((col) => cellValue(row, col))),
        startY: 74,
        margin: { left: 40, right: 40 },
        styles: { fontSize: 9, cellPadding: 5, overflow: "linebreak" },
        headStyles: { fillColor: PDF_HEADER_RGB, textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [244, 247, 242] },
      });

      doc.save(`blusukan-${filenameBase}-${today()}.pdf`);
      showToast("success", "PDF berhasil diunduh.");
    } catch (err) {
      console.error("Ekspor PDF gagal:", err);
      showToast("error", "Gagal membuat file PDF. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        id="admin-export-button"
        onClick={() => setOpen((v) => !v)}
        disabled={noData || busy}
        title={noData ? "Tidak ada data untuk diekspor" : undefined}
        className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
        style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
      >
        <Download size={16} />
        {busy ? "Mengekspor…" : "Ekspor Laporan"}
        <ChevronDown size={14} style={{ opacity: 0.85 }} />
      </button>

      {open && !noData && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-xl overflow-hidden z-50"
          style={{
            background: "var(--blusukan-surface-container-lowest, #ffffff)",
            border: "1px solid var(--blusukan-outline-variant)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          }}
        >
          <button
            type="button"
            id="admin-export-csv"
            onClick={exportCsv}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors hover:bg-[var(--blusukan-surface)]"
            style={{ color: "var(--blusukan-on-surface)" }}
          >
            <FileSpreadsheet size={16} style={{ color: "var(--blusukan-primary)" }} />
            Unduh CSV
          </button>
          <button
            type="button"
            id="admin-export-pdf"
            onClick={exportPdf}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors hover:bg-[var(--blusukan-surface)]"
            style={{ color: "var(--blusukan-on-surface)", borderTop: "1px solid var(--blusukan-outline-variant)" }}
          >
            <FileText size={16} style={{ color: "var(--blusukan-primary)" }} />
            Unduh PDF
          </button>
        </div>
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold shadow-lg"
          style={{
            background: toast.type === "success" ? "var(--blusukan-primary-container)" : "var(--blusukan-error-container)",
            color: toast.type === "success" ? "var(--blusukan-on-primary-container)" : "var(--blusukan-error)",
            border: `1px solid ${toast.type === "success" ? "var(--blusukan-primary)" : "var(--blusukan-error)"}`,
          }}
        >
          {toast.type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
