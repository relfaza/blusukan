"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import RupiahInput from "@/components/ui/rupiah-input";

const KABUPATEN_OPTIONS = [
  { value: "SLEMAN", label: "Sleman" },
  { value: "GUNUNGKIDUL", label: "Gunungkidul" },
  { value: "BANTUL", label: "Bantul" },
  { value: "KULON_PROGO", label: "Kulon Progo" },
  { value: "KOTA_YOGYAKARTA", label: "Kota Yogyakarta" },
] as const;

const KATEGORI_OPTIONS = [
  { value: "PANTAI", label: "Pantai" },
  { value: "AIR_TERJUN", label: "Air Terjun" },
  { value: "GUNUNG", label: "Gunung" },
  { value: "BUKIT", label: "Bukit" },
  { value: "TEBING", label: "Tebing" },
] as const;

const VIBE_OPTIONS = [
  { value: "SUNSET", label: "Sunset Spot" },
  { value: "SUNRISE", label: "Sunrise Spot" },
  { value: "SPOT_FOTO", label: "Spot Foto" },
  { value: "QUIET_PLACE", label: "Quiet Place" },
] as const;

const FASILITAS_FIELDS = [
  { key: "hasToilet", label: "Toilet" },
  { key: "hasParkir", label: "Parkir" },
  { key: "hasTempatIbadah", label: "Tempat ibadah" },
  { key: "hasTempatDuduk", label: "Tempat duduk" },
  { key: "hasPenitipanBarang", label: "Penitipan barang" },
] as const;

export default function AjukanDestinasiFormClient() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [kabupaten, setKabupaten] = useState("");
  const [kategori, setKategori] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [jamOperasional, setJamOperasional] = useState("");
  const [htmResmi, setHtmResmi] = useState<number | "">("");
  const [fasilitas, setFasilitas] = useState<Record<string, boolean>>({});
  const [aksesibilitas, setAksesibilitas] = useState("");
  const [vibeTags, setVibeTags] = useState<string[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);

  function toggleFasilitas(key: string) {
    setFasilitas((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleVibeTag(value: string) {
    setVibeTags((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Nama destinasi wajib diisi.";
    if (!kabupaten) next.kabupaten = "Pilih kabupaten.";
    if (!kategori) next.kategori = "Pilih kategori.";
    if (latitude.trim() === "" || Number.isNaN(Number(latitude))) next.latitude = "Latitude wajib diisi dan berupa angka.";
    if (longitude.trim() === "" || Number.isNaN(Number(longitude))) next.longitude = "Longitude wajib diisi dan berupa angka.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");

    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/pengelola/destinasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          kabupaten,
          kategori,
          latitude: Number(latitude),
          longitude: Number(longitude),
          jamOperasional: jamOperasional.trim() === "" ? null : jamOperasional.trim(),
          htmResmi: htmResmi === "" ? 0 : htmResmi,
          hasToilet: fasilitas.hasToilet ?? false,
          hasParkir: fasilitas.hasParkir ?? false,
          hasTempatIbadah: fasilitas.hasTempatIbadah ?? false,
          hasTempatDuduk: fasilitas.hasTempatDuduk ?? false,
          hasPenitipanBarang: fasilitas.hasPenitipanBarang ?? false,
          aksesibilitas: aksesibilitas.trim() === "" ? null : aksesibilitas.trim(),
          vibeTags,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.message || "Gagal mengirim pengajuan. Coba lagi.");
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/pengelola"), 1800);
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
          style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)", borderRadius: "16px" }}
        >
          <CheckCircle2 size={48} style={{ color: "var(--blusukan-primary)" }} className="mb-4" />
          <h1
            className="text-lg font-bold mb-1"
            style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
          >
            Pengajuan destinasi terkirim, menunggu persetujuan Admin
          </h1>
          <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Anda akan diarahkan kembali ke dashboard...
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
          href="/pengelola"
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
          Ajukan Destinasi Baru
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Pengajuan akan ditinjau oleh Admin sebelum tampil ke publik.
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nama */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold mb-2" style={{ color: "var(--blusukan-on-surface)" }}>
              Nama Destinasi
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Curug Setawing"
              className="w-full px-4 py-3.5 text-base"
              style={{
                border: `1px solid ${errors.name ? "var(--blusukan-error)" : "var(--blusukan-outline-variant)"}`,
                borderRadius: "8px",
                background: "#ffffff",
                color: "var(--blusukan-on-surface)",
              }}
            />
            {errors.name && (
              <p className="text-xs mt-1.5" style={{ color: "var(--blusukan-error)" }}>
                {errors.name}
              </p>
            )}
          </div>

          {/* Kabupaten */}
          <div>
            <label htmlFor="kabupaten" className="block text-sm font-semibold mb-2" style={{ color: "var(--blusukan-on-surface)" }}>
              Kabupaten
            </label>
            <select
              id="kabupaten"
              value={kabupaten}
              onChange={(e) => setKabupaten(e.target.value)}
              className="w-full px-4 py-3.5 text-base"
              style={{
                border: `1px solid ${errors.kabupaten ? "var(--blusukan-error)" : "var(--blusukan-outline-variant)"}`,
                borderRadius: "8px",
                background: "#ffffff",
                color: "var(--blusukan-on-surface)",
              }}
            >
              <option value="">Pilih kabupaten</option>
              {KABUPATEN_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.kabupaten && (
              <p className="text-xs mt-1.5" style={{ color: "var(--blusukan-error)" }}>
                {errors.kabupaten}
              </p>
            )}
          </div>

          {/* Kategori */}
          <div>
            <label htmlFor="kategori" className="block text-sm font-semibold mb-2" style={{ color: "var(--blusukan-on-surface)" }}>
              Kategori
            </label>
            <select
              id="kategori"
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="w-full px-4 py-3.5 text-base"
              style={{
                border: `1px solid ${errors.kategori ? "var(--blusukan-error)" : "var(--blusukan-outline-variant)"}`,
                borderRadius: "8px",
                background: "#ffffff",
                color: "var(--blusukan-on-surface)",
              }}
            >
              <option value="">Pilih kategori</option>
              {KATEGORI_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.kategori && (
              <p className="text-xs mt-1.5" style={{ color: "var(--blusukan-error)" }}>
                {errors.kategori}
              </p>
            )}
          </div>

          {/* Koordinat */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--blusukan-on-surface)" }}>
              Koordinat
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  id="latitude"
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="Latitude, cth: -7.7956"
                  className="w-full px-4 py-3.5 text-base"
                  style={{
                    border: `1px solid ${errors.latitude ? "var(--blusukan-error)" : "var(--blusukan-outline-variant)"}`,
                    borderRadius: "8px",
                    background: "#ffffff",
                    color: "var(--blusukan-on-surface)",
                  }}
                />
                {errors.latitude && (
                  <p className="text-xs mt-1.5" style={{ color: "var(--blusukan-error)" }}>
                    {errors.latitude}
                  </p>
                )}
              </div>
              <div>
                <input
                  id="longitude"
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="Longitude, cth: 110.3695"
                  className="w-full px-4 py-3.5 text-base"
                  style={{
                    border: `1px solid ${errors.longitude ? "var(--blusukan-error)" : "var(--blusukan-outline-variant)"}`,
                    borderRadius: "8px",
                    background: "#ffffff",
                    color: "var(--blusukan-on-surface)",
                  }}
                />
                {errors.longitude && (
                  <p className="text-xs mt-1.5" style={{ color: "var(--blusukan-error)" }}>
                    {errors.longitude}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Jam operasional */}
          <div>
            <label htmlFor="jamOperasional" className="block text-sm font-semibold mb-2" style={{ color: "var(--blusukan-on-surface)" }}>
              Jam Operasional (opsional)
            </label>
            <input
              id="jamOperasional"
              type="text"
              value={jamOperasional}
              onChange={(e) => setJamOperasional(e.target.value)}
              placeholder="Contoh: 08.00 - 17.00 WIB"
              className="w-full px-4 py-3.5 text-base"
              style={{
                border: "1px solid var(--blusukan-outline-variant)",
                borderRadius: "8px",
                background: "#ffffff",
                color: "var(--blusukan-on-surface)",
              }}
            />
          </div>

          {/* HTM */}
          <div>
            <label htmlFor="htmResmi" className="block text-sm font-semibold mb-2" style={{ color: "var(--blusukan-on-surface)" }}>
              Harga Tiket Masuk (opsional)
            </label>
            <RupiahInput
              id="htmResmi"
              value={htmResmi}
              onChange={setHtmResmi}
              placeholder="0"
              className="w-full pl-11 pr-4 py-3.5 text-base"
              style={{ fontSize: "1rem" }}
            />
          </div>

          {/* Fasilitas */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--blusukan-on-surface)" }}>
              Fasilitas yang tersedia
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
                    background: "#ffffff",
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

          {/* Vibe tags */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--blusukan-on-surface)" }}>
              Vibe Tags (opsional, bisa pilih lebih dari satu)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {VIBE_OPTIONS.map((opt) => {
                const selected = vibeTags.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleVibeTag(opt.value)}
                    className="py-3 text-sm font-semibold text-center transition-colors"
                    style={{
                      borderRadius: "8px",
                      border: `1.5px solid ${selected ? "var(--blusukan-primary)" : "var(--blusukan-outline-variant)"}`,
                      background: selected ? "var(--blusukan-primary-container)" : "#ffffff",
                      color: selected ? "var(--blusukan-primary)" : "var(--blusukan-on-surface)",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aksesibilitas */}
          <div>
            <label htmlFor="aksesibilitas" className="block text-sm font-semibold mb-2" style={{ color: "var(--blusukan-on-surface)" }}>
              Aksesibilitas (opsional)
            </label>
            <textarea
              id="aksesibilitas"
              value={aksesibilitas}
              onChange={(e) => setAksesibilitas(e.target.value)}
              rows={4}
              placeholder="Ceritakan akses jalan, kondisi jalur, dsb..."
              className="w-full px-4 py-3.5 text-base resize-none"
              style={{
                border: "1px solid var(--blusukan-outline-variant)",
                borderRadius: "8px",
                background: "#ffffff",
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
            {submitting ? "Mengirim..." : "Ajukan Destinasi"}
          </button>
        </form>
      </div>
    </div>
  );
}
