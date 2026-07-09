"use client";

import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

/**
 * Modal konfirmasi custom Blusukan — pengganti window.confirm() native supaya konsisten
 * dengan desain aplikasi. Bisa ditutup lewat tombol Batal atau klik overlay di luar card.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = "Batal",
  onConfirm,
  onCancel,
  isDestructive = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl p-6"
        style={{ background: "#ffffff", borderRadius: "16px" }}
      >
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center mb-4"
          style={
            isDestructive
              ? { background: "var(--blusukan-error-container)", color: "var(--blusukan-error)" }
              : { background: "#fef3e7", color: "#805533" }
          }
        >
          <AlertTriangle size={22} />
        </div>

        <h2
          id="confirm-dialog-title"
          className="text-base font-bold mb-2"
          style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
        >
          {title}
        </h2>
        <p
          id="confirm-dialog-message"
          className="text-sm mb-6"
          style={{ color: "var(--blusukan-on-surface-variant)" }}
        >
          {message}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="confirm-dialog-cancel"
            onClick={onCancel}
            className="flex-1 text-sm font-bold px-4 py-2.5 rounded-lg transition-opacity hover:opacity-90"
            style={{
              background: "#ffffff",
              color: "var(--blusukan-on-surface-variant)",
              border: "1px solid var(--blusukan-outline-variant)",
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            id="confirm-dialog-confirm"
            onClick={onConfirm}
            className="flex-1 text-sm font-bold px-4 py-2.5 rounded-lg transition-opacity hover:opacity-90"
            style={
              isDestructive
                ? { background: "var(--blusukan-error)", color: "#ffffff" }
                : { background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
