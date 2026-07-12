"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import RupiahInput from "@/components/ui/rupiah-input";

type Destination = {
  id: string;
  name: string;
  kabupaten: string;
  latitude: number;
  longitude: number;
};

const KABUPATEN_LABEL: Record<string, string> = {
  SLEMAN: "Sleman",
  GUNUNGKIDUL: "Gunungkidul",
  BANTUL: "Bantul",
  KULON_PROGO: "Kulon Progo",
  KOTA_YOGYAKARTA: "Kota Yogyakarta",
};

const ROAD_CONDITIONS = [
  { value: "MUDAH", label: "Mudah" },
  { value: "SEDANG", label: "Sedang" },
  { value: "SULIT", label: "Sulit" },
  { value: "RUSAK", label: "Rusak" },
] as const;

const SIGNAL_STRENGTHS = [
  { value: "LEMAH", label: "Lemah" },
  { value: "SEDANG", label: "Sedang" },
  { value: "KUAT", label: "Kuat" },
] as const;

const CROWD_LEVELS = [
  { value: "SEPI", label: "Sepi" },
  { value: "SEDANG", label: "Sedang" },
  { value: "PADAT", label: "Padat" },
] as const;

const FASILITAS_FIELDS = [
  { key: "toiletLayak", label: "Toilet layak" },
  { key: "parkirLayak", label: "Parkir layak" },
  { key: "tempatIbadahLayak", label: "Tempat ibadah layak" },
  { key: "tempatDudukLayak", label: "Tempat duduk layak" },
  { key: "penitipanBarangLayak", label: "Penitipan barang layak" },
] as const;

type GeoStatus = "loading" | "granted" | "denied" | "error";

export default function LaporanFormClient() {
  const router = useRouter();

  const [destinations, setDestinations] = useState<Destination[] | null>(null);
  const [destinationId, setDestinationId] = useState("");
  const [roadCondition, setRoadCondition] = useState("");
  const [signalStrength, setSignalStrength] = useState("");
  const [crowdLevel, setCrowdLevel] = useState("");
  const [fasilitas, setFasilitas] = useState<Record<string, boolean>>({});
  const [reportedFee, setReportedFee] = useState<number | "">("");
  const [notes, setNotes] = useState("");

  const [geoStatus, setGeoStatus] = useState<GeoStatus>("loading");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/destinations")
      .then((res) => res.json())
      .then((data) => setDestinations(Array.isArray(data) ? data : []))
      .catch(() => setDestinations([]));
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus("error");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setGeoStatus("granted");
      },
      (err) => {
        setGeoStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  function toggleFasilitas(key: string) {
    setFasilitas((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!destinationId) next.destinationId = "Pilih destinasi terlebih dahulu.";
    if (!roadCondition) next.roadCondition = "Pilih kondisi jalan.";
    if (!signalStrength) next.signalStrength = "Pilih kekuatan sinyal.";
    if (!crowdLevel) next.crowdLevel = "Pilih tingkat keramaian.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");

    if (!validate()) return;

    const selectedDestination = destinations?.find((d) => d.id === destinationId);
    const latitude = coords?.latitude ?? selectedDestination?.latitude ?? null;
    const longitude = coords?.longitude ?? selectedDestination?.longitude ?? null;

    if (latitude === null || longitude === null) {
      setSubmitError("Lokasi tidak tersedia. Coba lagi setelah izinkan akses lokasi.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/laporan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationId,
          roadCondition,
          signalStrength,
          crowdLevel,
          latitude,
          longitude,
          toiletLayak: fasilitas.toiletLayak ?? false,
          parkirLayak: fasilitas.parkirLayak ?? false,
          tempatIbadahLayak: fasilitas.tempatIbadahLayak ?? false,
          tempatDudukLayak: fasilitas.tempatDudukLayak ?? false,
          penitipanBarangLayak: fasilitas.penitipanBarangLayak ?? false,
          reportedFee: reportedFee === "" ? null : reportedFee,
          notes: notes.trim() === "" ? null : notes.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.message || "Gagal mengirim laporan. Coba lagi.");
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/"), 1800);
    } catch {
      setSubmitError("Terjadi kesalahan jaringan. Coba lagi.");
      setSubmitting(false);
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
          style={{ background: "var(--blusukan-surface-container-lowest)", border: "1px solid var(--blusukan-outline-variant)", borderRadius: "16px" }}
        >
          <CheckCircle2 size={48} style={{ color: "var(--blusukan-primary)" }} className="mb-4" />
          <h1
            className="text-lg font-bold mb-1"
            style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
          >
            Laporan berhasil dikirim
          </h1>
          <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Terima kasih! Anda akan diarahkan kembali ke beranda...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}
    >
      <div className="max-w-xl mx-auto px-4 py-6 pb-16">
        <Link
          href="/"
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
          Lapor Kondisi Lapangan
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Bantu wisatawan lain dengan info kondisi terkini destinasi.
        </p>

        {/* Status lokasi */}
        <div
          className="flex items-start gap-2.5 text-sm rounded-2xl px-4 py-3 mb-6"
          style={{
            borderRadius: "16px",
            background:
              geoStatus === "granted" ? "var(--blusukan-primary-container)" : "var(--blusukan-secondary-container)",
            color: geoStatus === "granted" ? "var(--blusukan-primary)" : "var(--blusukan-secondary)",
          }}
        >
          {geoStatus === "loading" && (
            <>
              <Loader2 size={18} className="mt-0.5 animate-spin shrink-0" />
              <span>Mengambil lokasi Anda...</span>
            </>
          )}
          {geoStatus === "granted" && (
            <>
              <MapPin size={18} className="mt-0.5 shrink-0" />
              <span>Lokasi berhasil diambil.</span>
            </>
          )}
          {(geoStatus === "denied" || geoStatus === "error") && (
            <>
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <span>
                {geoStatus === "denied"
                  ? "Izin lokasi ditolak."
                  : "Lokasi tidak dapat diambil."}{" "}
                Laporan tetap bisa dikirim menggunakan lokasi perkiraan destinasi.
              </span>
            </>
          )}
        </div>

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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Destinasi */}
          <div>
            <label
              htmlFor="destinationId"
              className="block text-sm font-semibold mb-2"
              style={{ color: "var(--blusukan-on-surface)" }}
            >
              Destinasi
            </label>
            <select
              id="destinationId"
              value={destinationId}
              onChange={(e) => setDestinationId(e.target.value)}
              className="w-full px-4 py-3.5 text-base"
              style={{
                border: `1px solid ${errors.destinationId ? "var(--blusukan-error)" : "var(--blusukan-outline-variant)"}`,
                borderRadius: "8px",
                background: "var(--blusukan-surface-container-lowest)",
                color: "var(--blusukan-on-surface)",
              }}
              disabled={destinations === null}
            >
              <option value="">
                {destinations === null ? "Memuat destinasi..." : "Pilih destinasi"}
              </option>
              {destinations?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({KABUPATEN_LABEL[d.kabupaten] ?? d.kabupaten})
                </option>
              ))}
            </select>
            {errors.destinationId && (
              <p className="text-xs mt-1.5" style={{ color: "var(--blusukan-error)" }}>
                {errors.destinationId}
              </p>
            )}
          </div>

          {/* Kondisi jalan */}
          <PillGroup
            label="Kondisi Jalan"
            options={ROAD_CONDITIONS}
            value={roadCondition}
            onChange={setRoadCondition}
            error={errors.roadCondition}
          />

          {/* Kekuatan sinyal */}
          <PillGroup
            label="Kekuatan Sinyal"
            options={SIGNAL_STRENGTHS}
            value={signalStrength}
            onChange={setSignalStrength}
            error={errors.signalStrength}
          />

          {/* Tingkat keramaian */}
          <PillGroup
            label="Tingkat Keramaian"
            options={CROWD_LEVELS}
            value={crowdLevel}
            onChange={setCrowdLevel}
            error={errors.crowdLevel}
          />

          {/* Fasilitas */}
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: "var(--blusukan-on-surface)" }}
            >
              Fasilitas yang layak (centang jika kondisinya baik)
            </label>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid var(--blusukan-outline-variant)", borderRadius: "16px" }}
            >
              {FASILITAS_FIELDS.map((f, idx) => (
                <label
                  key={f.key}
                  className="flex items-center gap-3 px-4 py-3.5 cursor-pointer"
                  style={{
                    borderTop: idx === 0 ? "none" : "1px solid var(--blusukan-outline-variant)",
                    background: "var(--blusukan-surface-container-lowest)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!fasilitas[f.key]}
                    onChange={() => toggleFasilitas(f.key)}
                    className="w-5 h-5 shrink-0"
                    style={{ accentColor: "var(--blusukan-primary)" }}
                  />
                  <span className="text-sm" style={{ color: "var(--blusukan-on-surface)" }}>
                    {f.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Biaya */}
          <div>
            <label
              htmlFor="reportedFee"
              className="block text-sm font-semibold mb-2"
              style={{ color: "var(--blusukan-on-surface)" }}
            >
              Biaya yang dikeluarkan (opsional)
            </label>
            <RupiahInput
              id="reportedFee"
              value={reportedFee}
              onChange={setReportedFee}
              placeholder="0"
              className="w-full pl-11 pr-4 py-3.5 text-base"
              style={{ fontSize: "1rem" }}
            />
          </div>

          {/* Catatan */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-semibold mb-2"
              style={{ color: "var(--blusukan-on-surface)" }}
            >
              Catatan tambahan (opsional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Ceritakan kondisi lapangan lainnya..."
              className="w-full px-4 py-3.5 text-base resize-none"
              style={{
                border: "1px solid var(--blusukan-outline-variant)",
                borderRadius: "8px",
                background: "var(--blusukan-surface-container-lowest)",
                color: "var(--blusukan-on-surface)",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full font-semibold py-3.5 text-base transition-opacity"
            style={{
              backgroundColor: "var(--blusukan-primary)",
              color: "var(--blusukan-on-primary)",
              borderRadius: "8px",
              opacity: submitting ? 0.6 : 1,
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Mengirim..." : "Kirim Laporan"}
          </button>
        </form>
      </div>
    </div>
  );
}

function PillGroup({
  label,
  options,
  value,
  onChange,
  error,
}: {
  label: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2" style={{ color: "var(--blusukan-on-surface)" }}>
        {label}
      </label>
      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className="py-3 text-sm font-semibold text-center transition-colors"
              style={{
                borderRadius: "8px",
                border: `1.5px solid ${selected ? "var(--blusukan-primary)" : "var(--blusukan-outline-variant)"}`,
                background: selected ? "var(--blusukan-primary-container)" : "var(--blusukan-surface-container-lowest)",
                color: selected ? "var(--blusukan-primary)" : "var(--blusukan-on-surface)",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {error && (
        <p className="text-xs mt-1.5" style={{ color: "var(--blusukan-error)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
