"use client";

import { useCallback, useState } from "react";
import type { DetailColumn } from "./ChartDetailDialog";

export function useChartDetail() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [columns, setColumns] = useState<DetailColumn[]>([]);
  const [rows, setRows] = useState<Record<string, unknown>[] | null>(null);
  const [error, setError] = useState("");

  const show = useCallback(
    (
      params: Record<string, string>,
      dialogTitle: string,
      dialogColumns: DetailColumn[],
      endpoint: string = "/api/admin/statistik/detail"
    ) => {
      setOpen(true);
      setTitle(dialogTitle);
      setColumns(dialogColumns);
      setRows(null);
      setError("");

      const query = new URLSearchParams(params);
      fetch(`${endpoint}?${query.toString()}`)
        .then((res) => res.json())
        .then((data) => {
          const rows = Array.isArray(data) ? data : data.rows;
          if (Array.isArray(rows)) setRows(rows);
          else setError(data.message || "Gagal memuat detail.");
        })
        .catch(() => setError("Terjadi kesalahan. Coba lagi."));
    },
    []
  );

  const onOpenChange = useCallback((next: boolean) => {
    setOpen(next);
  }, []);

  return { state: { open, title, columns, rows, error }, show, onOpenChange };
}
