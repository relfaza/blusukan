"use client";

import { useState } from "react";
import { BedDouble, Car, Sparkles, Loader2, MapPin, Phone, Info, Route } from "lucide-react";

const DISCLAIMER = "Rekomendasi dari AI berdasarkan data terdaftar";

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

const SERVICE_TYPE_LABEL: Record<string, string> = {
  OJEK: "Ojek",
  JEEP: "Jeep",
  GUIDE: "Pemandu",
};

/** Card pembungkus — meniru gaya SectionCard di halaman detail. */
function AiCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-3xl p-6"
      style={{
        background: "var(--blusukan-surface-container-lowest)",
        border: "1px solid var(--blusukan-outline-variant)",
        boxShadow: "0 2px 10px -4px rgba(0,0,0,0.08)",
      }}
    >
      {children}
    </div>
  );
}

function CardTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <h2
      className="flex items-center gap-2.5 text-base font-extrabold mb-2"
      style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
    >
      {icon}
      {children}
    </h2>
  );
}

function TriggerButton({
  onClick,
  loading,
  loaded,
  label,
}: {
  onClick: () => void;
  loading: boolean;
  loaded: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
      style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
      {loading ? "Meminta rekomendasi AI…" : loaded ? "Minta ulang" : label}
    </button>
  );
}

function Disclaimer() {
  return (
    <p className="flex items-center gap-1.5 text-xs mt-4" style={{ color: "var(--blusukan-outline)" }}>
      <Info size={12} />
      {DISCLAIMER}
    </p>
  );
}

function ErrorLine({ message }: { message: string }) {
  return (
    <p
      className="text-sm px-4 py-2.5 rounded-lg mt-4"
      style={{ background: "var(--blusukan-error-container)", color: "var(--blusukan-error)" }}
    >
      {message}
    </p>
  );
}

// ── Penginapan ──────────────────────────────────────────────────
type PenginapanItem = {
  id: string;
  nama: string;
  jarakKm: number;
  estimasiHarga: number;
  kontak: string;
  alasan: string;
};

type PenginapanHasil = {
  kosong?: boolean;
  message?: string;
  responsSingkat?: string;
  rekomendasi: PenginapanItem[];
};

export function RekomendasiPenginapanSection({ destinationId }: { destinationId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasil, setHasil] = useState<PenginapanHasil | null>(null);

  async function minta() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/rekomendasi-penginapan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinationId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal memuat rekomendasi. Coba lagi.");
        setHasil(null);
      } else {
        setHasil(data as PenginapanHasil);
      }
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
      setHasil(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AiCard>
      <CardTitle icon={<BedDouble size={18} />}>🏨 Penginapan Terdekat</CardTitle>
      <p className="text-sm mb-4" style={{ color: "var(--blusukan-on-surface-variant)" }}>
        Minta AI mengurutkan penginapan terdaftar di sekitar destinasi ini berdasarkan harga dan jarak.
      </p>

      <TriggerButton onClick={minta} loading={loading} loaded={hasil !== null} label="Rekomendasikan Penginapan" />

      {error && <ErrorLine message={error} />}

      {hasil?.kosong && (
        <p
          className="text-sm px-4 py-3 rounded-xl mt-4"
          style={{ background: "var(--blusukan-surface-low)", color: "var(--blusukan-on-surface-variant)" }}
        >
          {hasil.message}
        </p>
      )}

      {hasil && !hasil.kosong && hasil.rekomendasi.length > 0 && (
        <div className="mt-4 space-y-3">
          {hasil.responsSingkat && (
            <p className="text-sm" style={{ color: "var(--blusukan-on-surface)" }}>
              {hasil.responsSingkat}
            </p>
          )}
          {hasil.rekomendasi.map((p, idx) => (
            <div
              key={p.id}
              className="rounded-2xl p-4"
              style={{ border: "1px solid var(--blusukan-outline-variant)", background: "var(--blusukan-surface-low)" }}
            >
              <div className="flex items-start gap-3">
                <span
                  className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                  style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
                >
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold" style={{ color: "var(--blusukan-on-surface)" }}>
                    {p.nama}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} /> {p.jarakKm} km
                    </span>
                    <span className="font-semibold" style={{ color: "var(--blusukan-primary)" }}>
                      ± {formatRupiah(p.estimasiHarga)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Phone size={12} /> {p.kontak}
                    </span>
                  </div>
                  {p.alasan && (
                    <p className="text-xs mt-1.5 italic" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                      {p.alasan}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Disclaimer />
    </AiCard>
  );
}

// ── Transport ───────────────────────────────────────────────────
type LayananItem = {
  id: string;
  providerName: string;
  serviceType: string;
  contactWa: string;
  baseRate: number;
  kapasitasPenumpang: number | null;
  alasan: string;
};

type TransportHasil = {
  rekomendasi: string;
  moda: string | null;
  layanan: LayananItem[];
  routeStatus: string;
};

export function RekomendasiTransportSection({ destinationId }: { destinationId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasil, setHasil] = useState<TransportHasil | null>(null);

  async function minta() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/rekomendasi-transport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinationId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal memuat rekomendasi. Coba lagi.");
        setHasil(null);
      } else {
        setHasil(data as TransportHasil);
      }
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
      setHasil(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AiCard>
      <CardTitle icon={<Car size={18} />}>🚗 Rekomendasi Transportasi</CardTitle>
      <p className="text-sm mb-4" style={{ color: "var(--blusukan-on-surface-variant)" }}>
        Minta AI menyarankan moda transportasi paling sesuai dengan kondisi jalan menuju destinasi ini.
      </p>

      <TriggerButton onClick={minta} loading={loading} loaded={hasil !== null} label="Rekomendasikan Transportasi" />

      {error && <ErrorLine message={error} />}

      {hasil && (
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl p-4" style={{ background: "var(--blusukan-primary-container)" }}>
            {hasil.moda && (
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full mb-2"
                style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
              >
                <Route size={12} /> {hasil.moda}
              </span>
            )}
            <p className="text-sm" style={{ color: "var(--blusukan-on-surface)" }}>
              {hasil.rekomendasi}
            </p>
          </div>

          {hasil.layanan.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--blusukan-outline)" }}>
                Jasa transport tersedia
              </p>
              {hasil.layanan.map((s) => (
                <div
                  key={s.id}
                  className="rounded-2xl p-4"
                  style={{ border: "1px solid var(--blusukan-outline-variant)", background: "var(--blusukan-surface-low)" }}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold" style={{ color: "var(--blusukan-on-surface)" }}>
                      {s.providerName}
                    </p>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "var(--blusukan-secondary-container)", color: "var(--blusukan-secondary)" }}
                    >
                      {SERVICE_TYPE_LABEL[s.serviceType] ?? s.serviceType}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                    <span className="font-semibold" style={{ color: "var(--blusukan-primary)" }}>
                      {formatRupiah(s.baseRate)}
                    </span>
                    {s.kapasitasPenumpang != null && <span>{s.kapasitasPenumpang} penumpang</span>}
                    <span className="inline-flex items-center gap-1">
                      <Phone size={12} /> {s.contactWa}
                    </span>
                  </div>
                  {s.alasan && (
                    <p className="text-xs mt-1.5 italic" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                      {s.alasan}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Disclaimer />
    </AiCard>
  );
}
