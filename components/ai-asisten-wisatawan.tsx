"use client";

import { useState } from "react";
import { AlertTriangle, Info, Loader2, Sparkles, Send } from "lucide-react";
import DestinasiCard from "@/components/destinasi-card";
import { bersihkanTeksAi, keDaftarPoin } from "@/lib/ai-teks";
import type { DestinationForClient } from "@/lib/destinasi-beranda";

type Rekomendasi = {
  alasan: string;
  destination: DestinationForClient;
};

type HasilRekomendasi = {
  responsSingkat: string;
  rekomendasi: Rekomendasi[];
};

const PESAN_ERROR_UMUM = "Coba lagi sebentar ya, asisten sedang sibuk.";

const CONTOH_PROMPT = [
  "aku pengen healing yang sepi",
  "cari tempat buat foto-foto sunset",
  "petualangan seru tapi jalannya aman",
];

export default function AiAsistenWisatawan() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasil, setHasil] = useState<HasilRekomendasi | null>(null);

  // Gemini kadang menjawab dalam format markdown list. Dipecah per poin dan
  // penandanya dibuang, supaya tidak muncul "-" mentah di depan teks.
  const responsSingkat = hasil ? keDaftarPoin(hasil.responsSingkat) : [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const teks = prompt.trim();
    if (!teks || loading) return;

    setLoading(true);
    setError(null);
    setHasil(null);

    try {
      const res = await fetch("/api/ai/rekomendasi-destinasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: teks }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(
          (data as { message?: string } | null)?.message ?? PESAN_ERROR_UMUM
        );
        return;
      }

      setHasil(data as HasilRekomendasi);
    } catch {
      setError(PESAN_ERROR_UMUM);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      id="ai-asisten-wisatawan"
      className="rounded-3xl p-5 sm:p-6"
      style={{
        background: "var(--blusukan-surface-container-lowest)",
        border: "1px solid var(--blusukan-outline-variant)",
      }}
    >
      {/* ── Judul ── */}
      <div className="flex items-center gap-2.5">
        <span
          className="flex items-center justify-center w-9 h-9 rounded-full shrink-0"
          style={{
            background: "var(--blusukan-primary-container)",
            color: "var(--blusukan-primary)",
          }}
        >
          <Sparkles size={17} />
        </span>
        <div>
          <h2
            className="text-base sm:text-lg font-extrabold leading-tight"
            style={{ color: "var(--blusukan-on-surface)", fontFamily: "Montserrat, sans-serif" }}
          >
            Bingung mau ke mana?
          </h2>
          <p
            className="text-xs sm:text-sm mt-0.5"
            style={{ color: "var(--blusukan-outline)", fontFamily: "Inter, sans-serif" }}
          >
            Ceritakan maumu, asisten kami carikan destinasinya.
          </p>
        </div>
      </div>

      {/* ── Input + tombol kirim ── */}
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row gap-2">
        <input
          id="ai-asisten-input"
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
          maxLength={500}
          placeholder="Ceritakan mood atau keinginanmu... (contoh: 'aku pengen healing yang sepi')"
          className="flex-1 px-4 py-3 rounded-full text-sm transition-all focus:outline-none disabled:opacity-60"
          style={{
            background: "var(--blusukan-surface-container)",
            color: "var(--blusukan-on-surface)",
            border: "1px solid var(--blusukan-outline-variant)",
            fontFamily: "Inter, sans-serif",
          }}
        />
        <button
          id="ai-asisten-kirim"
          type="submit"
          disabled={loading || prompt.trim() === ""}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold shrink-0 transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "var(--blusukan-primary)",
            color: "var(--blusukan-on-primary)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Mencari…
            </>
          ) : (
            <>
              <Send size={16} />
              Kirim
            </>
          )}
        </button>
      </form>

      {/* ── Contoh prompt — sekali klik langsung isi input ── */}
      {!hasil && !loading && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {CONTOH_PROMPT.map((contoh) => (
            <button
              key={contoh}
              type="button"
              onClick={() => setPrompt(contoh)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors hover:opacity-80"
              style={{
                background: "var(--blusukan-surface-container)",
                color: "var(--blusukan-on-surface-variant)",
                border: "1px solid var(--blusukan-outline-variant)",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {contoh}
            </button>
          ))}
        </div>
      )}

      {/* ── Disclaimer ── */}
      <p
        className="mt-3 flex items-center gap-1.5 text-[11px]"
        style={{ color: "var(--blusukan-outline)", fontFamily: "Inter, sans-serif" }}
      >
        <Info size={12} className="shrink-0" />
        Rekomendasi dari AI, hasil bisa bervariasi.
      </p>

      {/* ── Loading ── */}
      {loading && (
        <div
          className="mt-4 flex items-center gap-2.5 rounded-2xl px-4 py-3.5 text-sm"
          style={{
            background: "var(--blusukan-surface-container)",
            color: "var(--blusukan-on-surface-variant)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <Loader2 size={16} className="animate-spin shrink-0" style={{ color: "var(--blusukan-primary)" }} />
          Asisten lagi mikir, sebentar ya…
        </div>
      )}

      {/* ── Error ── */}
      {error && !loading && (
        <div
          id="ai-asisten-error"
          role="alert"
          className="mt-4 flex items-start gap-2.5 rounded-2xl px-4 py-3.5 text-sm"
          style={{
            background: "var(--blusukan-error-container)",
            color: "var(--blusukan-on-error-container)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* ── Hasil ── */}
      {hasil && !loading && (
        <div className="mt-4">
          <div
            className="rounded-2xl px-4 py-3.5 text-sm leading-relaxed"
            style={{
              background: "var(--blusukan-primary-container)",
              color: "var(--blusukan-on-primary-container)",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {/* Kalau Gemini menjawab dalam beberapa poin, tampilkan sebagai bullet
                asli — bukan satu paragraf berisi tanda "-". */}
            {responsSingkat.length > 1 ? (
              <ul className="list-disc pl-5 space-y-1">
                {responsSingkat.map((poin, i) => (
                  <li key={i}>{poin}</li>
                ))}
              </ul>
            ) : (
              responsSingkat[0]
            )}
          </div>

          {hasil.rekomendasi.length === 0 ? (
            <p
              className="mt-3 text-sm"
              style={{ color: "var(--blusukan-outline)", fontFamily: "Inter, sans-serif" }}
            >
              Belum ketemu destinasi yang pas. Coba ceritakan dengan kata lain ya.
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {hasil.rekomendasi.map(({ destination, alasan }) => (
                <DestinasiCard
                  key={destination.id}
                  dest={destination}
                  footer={
                    <p
                      className="rounded-xl px-3 py-2 text-xs leading-relaxed"
                      style={{
                        background: "var(--blusukan-surface-container)",
                        color: "var(--blusukan-on-surface-variant)",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {bersihkanTeksAi(alasan)}
                    </p>
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
