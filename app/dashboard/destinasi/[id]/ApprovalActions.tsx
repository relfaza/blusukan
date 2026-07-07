"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

export default function ApprovalActions({ destinationId }: { destinationId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"APPROVED" | "REJECTED" | null>(null);
  const [error, setError] = useState("");

  async function handleAction(status: "APPROVED" | "REJECTED") {
    setBusy(status);
    setError("");
    try {
      const res = await fetch(`/api/admin/destinasi/${destinationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal memperbarui destinasi.");
        return;
      }
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
    >
      {error && (
        <p
          className="text-sm px-4 py-2.5 rounded-lg mb-3"
          style={{ background: "var(--blusukan-error-container)", color: "var(--blusukan-error)" }}
        >
          {error}
        </p>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          id="btn-setujui-detail"
          disabled={busy !== null}
          onClick={() => handleAction("APPROVED")}
          className="flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
        >
          <Check size={16} />
          Setujui
        </button>
        <button
          type="button"
          id="btn-tolak-detail"
          disabled={busy !== null}
          onClick={() => handleAction("REJECTED")}
          className="flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ border: "1px solid var(--blusukan-error)", color: "var(--blusukan-error)", background: "#ffffff" }}
        >
          <X size={16} />
          Tolak
        </button>
      </div>
    </div>
  );
}
