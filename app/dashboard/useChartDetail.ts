"use client";

import { useCallback, useState } from "react";
import type { DetailColumn } from "./ChartDetailDialog";

export function useChartDetail() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [columns, setColumns] = useState<DetailColumn[]>([]);
  const [rows, setRows] = useState<Record<string, unknown>[] | null>(null);
  const [error, setError] = useState("");

  const show = useCallback((params: Record<string, string>, dialogTitle: string, dialogColumns: DetailColumn[]) => {
    setOpen(true);
    setTitle(dialogTitle);
    setColumns(dialogColumns);
    setRows(null);
    setError("");

    const query = new URLSearchParams(params);
    fetch(`/api/admin/statistik/detail?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.rows)) setRows(data.rows);
        else setError(data.message || "Gagal memuat detail.");
      })
      .catch(() => setError("Terjadi kesalahan. Coba lagi."));
  }, []);

  const onOpenChange = useCallback((next: boolean) => {
    setOpen(next);
  }, []);

  return { state: { open, title, columns, rows, error }, show, onOpenChange };
}
