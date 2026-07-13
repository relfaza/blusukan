"use client";

import { useState } from "react";
import { AlertTriangle, Info, Lightbulb, Loader2, Sparkles, TrendingUp } from "lucide-react";

type Hasil = {
  insightUtama: string[];
  rekomendasi: string[];
  basisData: {
    totalDestinasi: number;
    totalLaporan: number;
    totalTransaksi: number;
  };
};

const PESAN_ERROR_UMUM = "Coba lagi sebentar ya, asisten sedang sibuk.";

export default function InsightAi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasil, setHasil] = useState<Hasil | null>(null);

  // Sengaja TIDAK pakai useEffect: request ke Gemini berbiaya kuota, jadi hanya
  // jalan kalau admin menekan tombol.
  async function analisa() {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/insight-admin", { method: "POST" });
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
      id="insight-ai"
      className="rounded-3xl p-6 mb-8"
      style={{
        background: "var(--blusukan-surface-container-lowest)",
        border: "1px solid var(--blusukan-outline-variant)",
        boxShadow: "0 2px 10px -4px rgba(0,0,0,0.08)",
      }}
    >
      <h2
        className="flex items-center gap-2 text-base font-extrabold mb-1"
        style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
      >
        <Sparkles size={18} style={{ color: "var(--blusukan-primary)" }} />
        Insight &amp; Rekomendasi AI
      </h2>
      <p className="text-sm mb-4" style={{ color: "var(--blusukan-on-surface-variant)" }}>
        Asisten akan membaca data agregat sistem — sebaran destinasi, laporan kondisi, peringkat, dan
        tren 6 bulan terakhir — lalu menyusun insight serta usulan kebijakan.
      </p>

      <button
        type="button"
        id="btn-analisa-data"
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
            {hasil ? "Analisa Ulang" : "Analisa Data Sekarang"}
          </>
        )}
      </button>

      {/* ── Disclaimer ── */}
      <p
        className="mt-3 flex items-center gap-1.5 text-[11px]"
        style={{ color: "var(--blusukan-outline)" }}
      >
        <Info size={12} className="shrink-0" />
        Analisa dari AI berdasarkan data sistem, gunakan sebagai bahan pertimbangan tambahan.
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
          Asisten sedang membaca data agregat sistem…
        </div>
      )}

      {/* ── Error ── */}
      {error && !loading && (
        <div
          id="insight-ai-error"
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

      {/* ── Hasil: 2 kolom — Insight Utama & Rekomendasi Kebijakan ── */}
      {hasil && !loading && (
        <div className="mt-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Kolom 1 — Insight Utama (list dengan ikon) */}
            <section
              className="rounded-2xl p-4"
              style={{ background: "var(--blusukan-surface-low)" }}
            >
              <h3
                className="flex items-center gap-2 text-sm font-extrabold mb-3"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  color: "var(--blusukan-on-surface)",
                }}
              >
                <TrendingUp size={15} style={{ color: "var(--blusukan-primary)" }} />
                Insight Utama
              </h3>

              {hasil.insightUtama.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--blusukan-outline)" }}>
                  Belum ada insight yang bisa disimpulkan dari data saat ini.
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {hasil.insightUtama.map((poin, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Lightbulb
                        size={15}
                        className="shrink-0 mt-0.5"
                        style={{ color: "var(--blusukan-primary)" }}
                      />
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: "var(--blusukan-on-surface)" }}
                      >
                        {poin}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Kolom 2 — Rekomendasi Kebijakan (list bernomor) */}
            <section
              className="rounded-2xl p-4"
              style={{ background: "var(--blusukan-surface-low)" }}
            >
              <h3
                className="flex items-center gap-2 text-sm font-extrabold mb-3"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  color: "var(--blusukan-on-surface)",
                }}
              >
                <Sparkles size={15} style={{ color: "var(--blusukan-primary)" }} />
                Rekomendasi Kebijakan
              </h3>

              {hasil.rekomendasi.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--blusukan-outline)" }}>
                  Belum ada rekomendasi yang bisa disusun dari data saat ini.
                </p>
              ) : (
                <ol className="space-y-2.5">
                  {hasil.rekomendasi.map((poin, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span
                        className="flex items-center justify-center w-6 h-6 rounded-full shrink-0 text-[11px] font-extrabold"
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
                        {poin}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>

          <p
            className="mt-3 flex items-start gap-1.5 text-[11px]"
            style={{ color: "var(--blusukan-outline)" }}
          >
            <Info size={12} className="shrink-0 mt-0.5" />
            Disimpulkan dari {hasil.basisData.totalDestinasi} destinasi aktif,{" "}
            {hasil.basisData.totalLaporan} laporan kondisi, dan {hasil.basisData.totalTransaksi}{" "}
            transaksi selesai.
          </p>
        </div>
      )}
    </div>
  );
}
