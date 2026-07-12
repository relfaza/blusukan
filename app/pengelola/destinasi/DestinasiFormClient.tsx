"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import DestinasiInfoDasarForm, {
  type DestinasiFormInitial,
  type DestinasiInfoDasarPayload,
} from "@/components/pengelola/destinasi-info-dasar-form";

export type { DestinasiFormInitial };

interface DestinasiFormClientProps {
  destinationId: string;
  initial: DestinasiFormInitial;
}

/** Form Edit Destinasi — form Ajukan Destinasi Baru sekarang pakai wizard multi-step (lihat app/pengelola/destinasi/baru) */
export default function DestinasiFormClient({ destinationId, initial }: DestinasiFormClientProps) {
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(payload: DestinasiInfoDasarPayload) {
    setSubmitError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/pengelola/destinasi/${destinationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.message || "Gagal menyimpan. Coba lagi.");
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push(`/pengelola/destinasi/${destinationId}`), 1500);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Terjadi kesalahan jaringan. Coba lagi.");
      setSubmitting(false);
    }
  }

  const backHref = `/pengelola/destinasi/${destinationId}`;

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
            Perubahan berhasil disimpan
          </h1>
          <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Anda akan diarahkan kembali...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-xl mx-auto px-4 py-6 pb-16">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm font-medium mb-4"
          style={{ color: "var(--blusukan-on-surface-variant)" }}
        >
          <ArrowLeft size={16} />
          Kembali
        </Link>

        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
        >
          Edit Destinasi
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Perubahan tersimpan langsung tanpa perlu persetujuan ulang Admin.
        </p>

        {submitError && (
          <div
            className="text-sm rounded-2xl px-4 py-3 mb-6"
            style={{
              background: "var(--blusukan-error-container)",
              color: "var(--blusukan-error)",
              borderRadius: "16px",
            }}
          >
            {submitError}
          </div>
        )}

        <DestinasiInfoDasarForm
          initial={initial}
          submitting={submitting}
          submitLabel="Simpan Perubahan"
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
