"use client";

import { useEffect, useState } from "react";
import { Inbox, MapPin, Check, X } from "lucide-react";
import StatistikSection from "./StatistikSection";

type PendingDestination = {
  id: string;
  name: string;
  kabupaten: string;
  kategori: string;
  submittedByName: string;
  createdAt: string;
};

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

export default function DashboardClient() {
  const [items, setItems] = useState<PendingDestination[] | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/destinasi")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setError("Gagal memuat data destinasi.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleAction(id: string, status: "APPROVED" | "REJECTED") {
    setProcessingId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/destinasi/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal memperbarui destinasi.");
        return;
      }
      setItems((prev) => (prev ? prev.filter((d) => d.id !== id) : prev));
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
        >
          Dashboard Admin
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Destinasi yang menunggu persetujuan
        </p>

        <StatistikSection />

        <h2
          className="text-lg font-bold mb-4"
          style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
        >
          Persetujuan Destinasi
        </h2>

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
            <Inbox size={40} style={{ color: "var(--blusukan-outline)" }} className="mb-3" />
            <p className="text-sm font-medium" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Tidak ada destinasi menunggu persetujuan
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((d) => {
              const busy = processingId === d.id;
              return (
                <div
                  key={d.id}
                  id={`card-pending-${d.id}`}
                  className="rounded-2xl p-5"
                  style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <MapPin size={14} style={{ color: "var(--blusukan-on-surface-variant)" }} />
                    <span className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                      {KABUPATEN_LABEL[d.kabupaten] ?? d.kabupaten}
                    </span>
                  </div>

                  <p
                    className="text-base font-bold mb-1"
                    style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
                  >
                    {d.name}
                  </p>
                  <p className="text-xs mb-4" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                    {KATEGORI_LABEL[d.kategori] ?? d.kategori} · Diajukan oleh {d.submittedByName}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id={`btn-setujui-${d.id}`}
                      disabled={busy}
                      onClick={() => handleAction(d.id, "APPROVED")}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
                    >
                      <Check size={14} />
                      Setujui
                    </button>
                    <button
                      type="button"
                      id={`btn-tolak-${d.id}`}
                      disabled={busy}
                      onClick={() => handleAction(d.id, "REJECTED")}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ border: "1px solid var(--blusukan-error)", color: "var(--blusukan-error)", background: "#ffffff" }}
                    >
                      <X size={14} />
                      Tolak
                    </button>
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
