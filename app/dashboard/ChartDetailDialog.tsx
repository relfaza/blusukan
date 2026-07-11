"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type DetailColumn = { key: string; label: string; format?: (value: unknown) => string };

export type ChartDetailState = {
  open: boolean;
  title: string;
  columns: DetailColumn[];
  rows: Record<string, unknown>[] | null;
  error: string;
};

export default function ChartDetailDialog({
  state,
  onOpenChange,
}: {
  state: ChartDetailState;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={state.open} onOpenChange={onOpenChange}>
      <DialogContent
        className="!max-w-2xl !w-[calc(100vw-2rem)] !p-0 !rounded-2xl overflow-hidden"
        style={{ background: "#ffffff" }}
      >
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle
            className="text-base font-bold"
            style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
          >
            {state.title}
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 pb-5 max-h-[60vh] overflow-y-auto">
          {state.error ? (
            <p
              className="text-sm px-4 py-2.5 rounded-lg"
              style={{ background: "var(--blusukan-error-container)", color: "var(--blusukan-error)" }}
            >
              {state.error}
            </p>
          ) : state.rows === null ? (
            <p className="text-sm py-6 text-center" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Memuat...
            </p>
          ) : state.rows.length === 0 ? (
            <p className="text-sm py-6 text-center" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Tidak ada data untuk titik ini.
            </p>
          ) : (
            <div className="space-y-2">
              {state.rows.map((row, idx) => (
                <div
                  key={idx}
                  className="rounded-xl px-3.5 py-3"
                  style={{ background: "var(--blusukan-surface)", border: "1px solid var(--blusukan-outline-variant)" }}
                >
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                    {state.columns.map((col) => (
                      <div key={col.key}>
                        <p className="text-[11px]" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                          {col.label}
                        </p>
                        <p className="text-xs font-semibold" style={{ color: "var(--blusukan-on-surface)" }}>
                          {col.format ? col.format(row[col.key]) : String(row[col.key] ?? "–")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
