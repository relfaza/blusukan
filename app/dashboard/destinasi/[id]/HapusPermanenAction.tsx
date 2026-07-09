"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function HapusPermanenAction({
  destinationId,
  destinationName,
}: {
  destinationId: string;
  destinationName: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      `Yakin ingin menghapus "${destinationName}" secara PERMANEN? Tindakan ini TIDAK BISA dibatalkan. Semua data fasilitas dan UMKM terkait juga akan ikut terhapus.`
    );
    if (!confirmed) return;

    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/destinasi/${destinationId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal menghapus destinasi.");
        return;
      }
      router.push("/dashboard/destinasi");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "var(--blusukan-error-container)", border: "1px solid var(--blusukan-error)" }}
    >
      <p className="text-sm font-bold mb-1" style={{ color: "var(--blusukan-error)" }}>
        Zona Berbahaya
      </p>
      <p className="text-xs mb-3" style={{ color: "var(--blusukan-on-surface-variant)" }}>
        Hanya bisa dilakukan kalau destinasi belum punya riwayat transaksi, laporan, atau ulasan sama sekali.
      </p>
      {error && (
        <p
          className="text-sm px-4 py-2.5 rounded-lg mb-3"
          style={{ background: "#ffffff", color: "var(--blusukan-error)" }}
        >
          {error}
        </p>
      )}
      <button
        type="button"
        id="btn-hapus-permanen"
        disabled={busy}
        onClick={handleDelete}
        className="flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ background: "var(--blusukan-error)", color: "#ffffff" }}
      >
        <Trash2 size={16} />
        {busy ? "Menghapus..." : "Hapus Permanen"}
      </button>
    </div>
  );
}
