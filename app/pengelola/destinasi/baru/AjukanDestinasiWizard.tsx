"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Plus, Trash2, AlertTriangle } from "lucide-react";
import DestinasiInfoDasarForm, {
  type DestinasiInfoDasarPayload,
} from "@/components/pengelola/destinasi-info-dasar-form";
import FasilitasForm, { type FasilitasFormValues } from "@/components/pengelola/fasilitas-form";
import UmkmForm, { type WarungFormValues } from "@/components/pengelola/umkm-form";
import JasaTransportForm, {
  type JasaTransportFormValues,
  SERVICE_TYPE_LABEL,
} from "@/components/pengelola/jasa-transport-form";

type UmkmDraft = WarungFormValues & { items: { nama: string; harga: number }[] };

const STEP_TITLES: Record<number, string> = {
  1: "Info Dasar",
  2: "Fasilitas Sewa",
  3: "UMKM",
  4: "Jasa Transport",
};

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-4">
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="flex items-center gap-1.5">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={
              n <= step
                ? { background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }
                : { background: "#ffffff", color: "var(--blusukan-on-surface-variant)", border: "1px solid var(--blusukan-outline-variant)" }
            }
          >
            {n}
          </div>
          {n < 4 && (
            <div
              className="w-4 h-0.5 sm:w-8"
              style={{ background: n < step ? "var(--blusukan-primary)" : "var(--blusukan-outline-variant)" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function StepFooter({
  onBack,
  onSkip,
  skipLabel = "Lewati",
  onNext,
  nextLabel,
  nextDisabled,
}: {
  onBack?: () => void;
  onSkip?: () => void;
  skipLabel?: string;
  onNext: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 pt-2">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-semibold px-4 py-2.5 rounded-lg transition-opacity hover:opacity-80"
          style={{ color: "var(--blusukan-on-surface-variant)" }}
        >
          Kembali
        </button>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-2">
        {onSkip && (
          <button
            type="button"
            id="btn-wizard-lewati"
            onClick={onSkip}
            className="text-sm font-semibold px-4 py-2.5 rounded-lg transition-opacity hover:opacity-80"
            style={{ color: "var(--blusukan-on-surface-variant)", border: "1px solid var(--blusukan-outline-variant)" }}
          >
            {skipLabel}
          </button>
        )}
        <button
          type="button"
          id="btn-wizard-lanjut"
          onClick={onNext}
          disabled={nextDisabled}
          className="text-sm font-bold px-5 py-2.5 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid var(--blusukan-outline-variant)",
  borderRadius: "16px",
};

export default function AjukanDestinasiWizard() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [infoDasar, setInfoDasar] = useState<DestinasiInfoDasarPayload | null>(null);

  const [fasilitasDrafts, setFasilitasDrafts] = useState<FasilitasFormValues[]>([]);
  const [showFasilitasForm, setShowFasilitasForm] = useState(false);

  const [umkmDrafts, setUmkmDrafts] = useState<UmkmDraft[]>([]);
  const [showUmkmForm, setShowUmkmForm] = useState(false);

  const [transportDrafts, setTransportDrafts] = useState<JasaTransportFormValues[]>([]);
  const [showTransportForm, setShowTransportForm] = useState(false);

  const [finalSubmitting, setFinalSubmitting] = useState(false);
  const [finalError, setFinalError] = useState("");
  const [secondaryWarnings, setSecondaryWarnings] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  function handleInfoDasarSubmit(payload: DestinasiInfoDasarPayload) {
    setInfoDasar(payload);
    setStep(2);
  }

  async function handleFinalSubmit() {
    if (!infoDasar) {
      setStep(1);
      return;
    }

    setFinalError("");
    setFinalSubmitting(true);

    try {
      const res = await fetch("/api/pengelola/destinasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(infoDasar),
      });
      const data = await res.json();

      if (!res.ok) {
        setFinalError(data.message || "Gagal mengajukan destinasi. Coba lagi.");
        setFinalSubmitting(false);
        return;
      }

      const destinationId = data.id as string;
      const warnings: string[] = [];

      // Data tambahan dikirim berurutan, mereferensikan destinationId yang baru dibuat.
      // Kegagalan di sini tidak membatalkan keberhasilan pengajuan destinasi utama.
      for (const f of fasilitasDrafts) {
        try {
          const r = await fetch("/api/pengelola/fasilitas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ destinationId, ...f }),
          });
          if (!r.ok) warnings.push(`Fasilitas "${f.nama}" gagal disimpan.`);
        } catch {
          warnings.push(`Fasilitas "${f.nama}" gagal disimpan.`);
        }
      }

      for (const w of umkmDrafts) {
        try {
          const r = await fetch("/api/pengelola/warung", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ destinationId, ...w }),
          });
          if (!r.ok) warnings.push(`UMKM "${w.name}" gagal disimpan.`);
        } catch {
          warnings.push(`UMKM "${w.name}" gagal disimpan.`);
        }
      }

      for (const t of transportDrafts) {
        try {
          const r = await fetch("/api/pengelola/jasa-transport", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ destinationId, ...t }),
          });
          if (!r.ok) warnings.push(`Jasa transport "${t.providerName}" gagal disimpan.`);
        } catch {
          warnings.push(`Jasa transport "${t.providerName}" gagal disimpan.`);
        }
      }

      setSecondaryWarnings(warnings);
      setSuccess(true);
      setTimeout(() => router.push("/pengelola"), 1800);
    } catch (err) {
      setFinalError(err instanceof Error ? err.message : "Terjadi kesalahan jaringan. Coba lagi.");
      setFinalSubmitting(false);
    }
  }

  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}
      >
        <div
          className="w-full max-w-sm rounded-2xl p-8 flex flex-col items-center text-center"
          style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)", borderRadius: "16px" }}
        >
          <CheckCircle2 size={48} style={{ color: "var(--blusukan-primary)" }} className="mb-4" />
          <h1
            className="text-lg font-bold mb-1"
            style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
          >
            Pengajuan destinasi terkirim, menunggu persetujuan Admin
          </h1>
          <p className="text-sm mb-3" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Anda akan diarahkan kembali...
          </p>
          {secondaryWarnings.length > 0 && (
            <div
              className="text-xs text-left rounded-lg px-3 py-2.5 w-full"
              style={{ background: "var(--blusukan-error-container)", color: "var(--blusukan-error)" }}
            >
              <p className="font-semibold mb-1">Beberapa data tambahan gagal disimpan:</p>
              <ul className="list-disc list-inside space-y-0.5">
                {secondaryWarnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
              <p className="mt-1.5">Anda bisa menambahkannya lagi lewat halaman destinasi.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-xl mx-auto px-4 py-6 pb-16">
        {step === 1 && (
          <Link
            href="/pengelola"
            className="inline-flex items-center gap-1.5 text-sm font-medium mb-4"
            style={{ color: "var(--blusukan-on-surface-variant)" }}
          >
            <ArrowLeft size={16} />
            Kembali
          </Link>
        )}

        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
        >
          Ajukan Destinasi Baru
        </h1>
        <p className="text-sm mb-5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Langkah {step} dari 4: {STEP_TITLES[step]}
        </p>

        <StepIndicator step={step} />

        {finalError && (
          <div
            className="text-sm rounded-2xl px-4 py-3 mb-6"
            style={{ background: "var(--blusukan-error-container)", color: "var(--blusukan-error)", borderRadius: "16px" }}
          >
            {finalError}
          </div>
        )}

        {/* Step 1: Info Dasar */}
        {step === 1 && (
          <DestinasiInfoDasarForm initial={infoDasar ?? undefined} submitting={false} submitLabel="Lanjut" onSubmit={handleInfoDasarSubmit} />
        )}

        {/* Step 2: Fasilitas Sewa (opsional) */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Tambahkan fasilitas sewa (opsional) — Anda bisa menambahkan lebih dari satu sekaligus, atau lewati langkah ini.
            </p>

            {fasilitasDrafts.length > 0 && (
              <div className="space-y-2">
                {fasilitasDrafts.map((f, idx) => (
                  <div key={idx} className="rounded-2xl p-4 flex items-center justify-between gap-3" style={cardStyle}>
                    <div>
                      <p className="text-sm font-bold" style={{ color: "var(--blusukan-on-surface)" }}>
                        {f.nama}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                        {formatRupiah(f.hargaSewa)} / {f.satuanWaktu} · {f.jumlahUnit} unit
                      </p>
                    </div>
                    <button
                      type="button"
                      id={`btn-hapus-draft-fasilitas-${idx}`}
                      onClick={() => setFasilitasDrafts((prev) => prev.filter((_, i) => i !== idx))}
                      aria-label={`Hapus ${f.nama}`}
                      className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center transition-colors hover:bg-[#fde8e8]"
                      style={{ border: "1px solid var(--blusukan-error)", color: "var(--blusukan-error)" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showFasilitasForm ? (
              <FasilitasForm
                onCancel={() => setShowFasilitasForm(false)}
                onSubmit={(values) => {
                  setFasilitasDrafts((prev) => [...prev, values]);
                  setShowFasilitasForm(false);
                }}
                submitting={false}
              />
            ) : (
              <button
                type="button"
                id="btn-tambah-fasilitas-wizard"
                onClick={() => setShowFasilitasForm(true)}
                className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
                style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
              >
                <Plus size={16} />
                Tambah Fasilitas
              </button>
            )}

            <StepFooter onBack={() => setStep(1)} onSkip={() => setStep(3)} onNext={() => setStep(3)} nextLabel="Lanjut" />
          </div>
        )}

        {/* Step 3: UMKM (opsional) */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Tambahkan UMKM (opsional) — Anda bisa menambahkan lebih dari satu sekaligus, atau lewati langkah ini.
            </p>

            {umkmDrafts.length > 0 && (
              <div className="space-y-2">
                {umkmDrafts.map((w, idx) => (
                  <div key={idx} className="rounded-2xl p-4 flex items-center justify-between gap-3" style={cardStyle}>
                    <div>
                      <p className="text-sm font-bold" style={{ color: "var(--blusukan-on-surface)" }}>
                        {w.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                        {w.items.length} produk
                      </p>
                    </div>
                    <button
                      type="button"
                      id={`btn-hapus-draft-umkm-${idx}`}
                      onClick={() => setUmkmDrafts((prev) => prev.filter((_, i) => i !== idx))}
                      aria-label={`Hapus ${w.name}`}
                      className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center transition-colors hover:bg-[#fde8e8]"
                      style={{ border: "1px solid var(--blusukan-error)", color: "var(--blusukan-error)" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showUmkmForm ? (
              <UmkmForm
                mode="create"
                onCancel={() => setShowUmkmForm(false)}
                onSubmit={(values) => {
                  setUmkmDrafts((prev) => [...prev, values]);
                  setShowUmkmForm(false);
                }}
                submitting={false}
              />
            ) : (
              <button
                type="button"
                id="btn-tambah-umkm-wizard"
                onClick={() => setShowUmkmForm(true)}
                className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
                style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
              >
                <Plus size={16} />
                Tambah UMKM
              </button>
            )}

            <StepFooter onBack={() => setStep(2)} onSkip={() => setStep(4)} onNext={() => setStep(4)} nextLabel="Lanjut" />
          </div>
        )}

        {/* Step 4: Jasa Transport (opsional) */}
        {step === 4 && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Tambahkan jasa transport lokal (opsional) — Anda bisa menambahkan lebih dari satu sekaligus, atau lewati langkah ini untuk langsung mengajukan.
            </p>

            {transportDrafts.length > 0 && (
              <div className="space-y-2">
                {transportDrafts.map((t, idx) => (
                  <div key={idx} className="rounded-2xl p-4 flex items-center justify-between gap-3" style={cardStyle}>
                    <div>
                      <p className="text-sm font-bold" style={{ color: "var(--blusukan-on-surface)" }}>
                        {t.providerName}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                        {SERVICE_TYPE_LABEL[t.serviceType] ?? t.serviceType} · {formatRupiah(t.baseRate)}
                      </p>
                    </div>
                    <button
                      type="button"
                      id={`btn-hapus-draft-transport-${idx}`}
                      onClick={() => setTransportDrafts((prev) => prev.filter((_, i) => i !== idx))}
                      aria-label={`Hapus ${t.providerName}`}
                      className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center transition-colors hover:bg-[#fde8e8]"
                      style={{ border: "1px solid var(--blusukan-error)", color: "var(--blusukan-error)" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showTransportForm ? (
              <JasaTransportForm
                onCancel={() => setShowTransportForm(false)}
                onSubmit={(values) => {
                  setTransportDrafts((prev) => [...prev, values]);
                  setShowTransportForm(false);
                }}
                submitting={false}
              />
            ) : (
              <button
                type="button"
                id="btn-tambah-transport-wizard"
                onClick={() => setShowTransportForm(true)}
                className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
                style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
              >
                <Plus size={16} />
                Tambah Jasa Transport
              </button>
            )}

            {finalSubmitting && (
              <p className="flex items-center gap-1.5 text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                <AlertTriangle size={13} />
                Mengirim pengajuan, jangan tutup halaman ini...
              </p>
            )}

            <StepFooter
              onBack={() => setStep(3)}
              onSkip={handleFinalSubmit}
              skipLabel="Lewati"
              onNext={handleFinalSubmit}
              nextLabel={finalSubmitting ? "Mengirim..." : "Ajukan Destinasi"}
              nextDisabled={finalSubmitting}
            />
          </div>
        )}
      </div>
    </div>
  );
}
