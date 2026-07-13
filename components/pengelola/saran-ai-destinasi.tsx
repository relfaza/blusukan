"use client";

import { useState } from "react";
import { AlertTriangle, Info, Lightbulb, Loader2, Sparkles } from "lucide-react";

type Hasil = {
  ringkasan: string;
  saran: string[];
  basisData: {
    jumlahLaporan: number;
    jumlahUlasan: number;
    jumlahTransaksi30Hari: number;
  };
};

const PESAN_ERROR_UMUM = "Coba lagi sebentar ya, asisten sedang sibuk.";

export default function SaranAiDestinasi({ destinationId }: { destinationId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasil, setHasil] = useState<Hasil | null>(null);

  // Sengaja TIDAK pakai useEffect: request ke Gemini berbiaya kuota, jadi hanya
  // jalan kalau pengelola menekan tombol.
  async function analisa() {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/saran-pengelola", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinationId }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError((data as { message?: string } | null)?.message ?? PESAN_ERROR_UMUM);
        return;
      }

      setHasil(data as Hasil);
    } catch {
      setError(PESAN_ERROR_UMUM);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      id="saran-ai-destinasi"
      className="rounded-3xl p-6 mb-6"
      style={{
        background: "var(--blusukan-surface-container-lowest)",
        border: "1px solid var(--blusukan-outline-variant)",
        boxShadow: "0 2px 10px -4px rgba(0,0,0,0.08)",
      }}
    >
      <h2
        className="flex items-center gap-2.5 text-base font-extrabold mb-4"
        style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
      >
        <span
          className="w-1 h-5 rounded-full shrink-0"
          style={{ background: "var(--blusukan-primary)" }}
        />
        <Sparkles size={17} style={{ color: "var(--blusukan-primary)" }} />
        Saran AI untuk Destinasi Ini
      </h2>

      <p className="text-sm mb-4" style={{ color: "var(--blusukan-on-surface-variant)" }}>
        Asisten akan membaca laporan kondisi, ulasan, dan transaksi 30 hari terakhir destinasi ini,
        lalu memberi saran perbaikan yang bisa langsung ditindaklanjuti.
      </p>

      <button
        type="button"
        id="btn-analisa-ai"
        onClick={analisa}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 text-sm font-bold px-5 py-2.5 rounded-full transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          background: "var(--blusukan-primary)",
          color: "var(--blusukan-on-primary)",
          boxShadow: "0 6px 16px -6px color-mix(in srgb, var(--blusukan-primary) 65%, transparent)",
        }}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Menganalisa…
          </>
        ) : (
          <>
            <Sparkles size={16} />
            {hasil ? "Analisa Ulang" : "Analisa Sekarang"}
          </>
        )}
      </button>

      {/* ── Disclaimer ── */}
      <p
        className="mt-3 flex items-center gap-1.5 text-[11px]"
        style={{ color: "var(--blusukan-outline)" }}
      >
        <Info size={12} className="shrink-0" />
        Saran dari AI, gunakan sebagai referensi tambahan.
      </p>

      {/* ── Loading ── */}
      {loading && (
        <div
          className="mt-4 flex items-center gap-2.5 rounded-2xl px-4 py-3.5 text-sm"
          style={{
            background: "var(--blusukan-surface-low)",
            color: "var(--blusukan-on-surface-variant)",
          }}
        >
          <Loader2
            size={16}
            className="animate-spin shrink-0"
            style={{ color: "var(--blusukan-primary)" }}
          />
          Asisten sedang membaca data destinasi ini…
        </div>
      )}

      {/* ── Error ── */}
      {error && !loading && (
        <div
          id="saran-ai-error"
          role="alert"
          className="mt-4 flex items-start gap-2.5 rounded-2xl px-4 py-3.5 text-sm"
          style={{
            background: "var(--blusukan-error-container)",
            color: "var(--blusukan-on-error-container)",
          }}
        >
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* ── Hasil ── */}
      {hasil && !loading && (
        <div className="mt-5 space-y-4">
          {/* Ringkasan kondisi */}
          <div
            className="rounded-2xl p-4"
            style={{
              background: "var(--blusukan-primary-container)",
              color: "var(--blusukan-on-primary-container)",
            }}
          >
            <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5">
              Ringkasan Kondisi
            </p>
            <p className="text-sm leading-relaxed">{hasil.ringkasan}</p>
          </div>

          {/* Daftar saran */}
          {hasil.saran.length > 0 && (
            <ul className="space-y-2.5">
              {hasil.saran.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-2xl p-4"
                  style={{ background: "var(--blusukan-surface-low)" }}
                >
                  <span
                    className="flex items-center justify-center w-7 h-7 rounded-full shrink-0 text-xs font-extrabold"
                    style={{
                      background: "var(--blusukan-primary)",
                      color: "var(--blusukan-on-primary)",
                    }}
                  >
                    {i + 1}
                  </span>
                  <p
                    className="text-sm leading-relaxed pt-0.5"
                    style={{ color: "var(--blusukan-on-surface)" }}
                  >
                    {s}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {/* Basis data — supaya pengelola tahu saran ini disimpulkan dari berapa banyak data */}
          <p
            className="flex items-start gap-1.5 text-[11px]"
            style={{ color: "var(--blusukan-outline)" }}
          >
            <Lightbulb size={12} className="shrink-0 mt-0.5" />
            Disimpulkan dari {hasil.basisData.jumlahLaporan} laporan kondisi,{" "}
            {hasil.basisData.jumlahUlasan} ulasan, dan{" "}
            {hasil.basisData.jumlahTransaksi30Hari} transaksi dalam 30 hari terakhir.
          </p>
        </div>
      )}
    </div>
  );
}
