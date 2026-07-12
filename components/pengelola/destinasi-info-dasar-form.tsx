"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { X } from "lucide-react";
import RupiahInput from "@/components/ui/rupiah-input";

const MapPicker = dynamic(() => import("@/components/map-picker"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-64 sm:h-80 flex items-center justify-center rounded-2xl"
      style={{ background: "var(--blusukan-surface-low)", border: "1px solid var(--blusukan-outline-variant)" }}
    >
      <span className="text-sm" style={{ color: "var(--blusukan-outline)" }}>
        Memuat peta…
      </span>
    </div>
  ),
});

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

const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_PHOTOS = 5;

type PhotoSlot = { kind: "existing"; url: string } | { kind: "new"; file: File; previewUrl: string };

export type DestinasiFormInitial = {
  name: string;
  kabupaten: string;
  kategori: string;
  latitude: number;
  longitude: number;
  buka24Jam: boolean;
  jamBuka: string | null;
  jamTutup: string | null;
  htmResmi: number;
  htmAnak: number | null;
  hasToilet: boolean;
  hasParkir: boolean;
  hasTempatIbadah: boolean;
  hasTempatDuduk: boolean;
  hasPenitipanBarang: boolean;
  aksesibilitas: string | null;
  vibeTags: string[];
  photoUrls: string[];
};

export type DestinasiInfoDasarPayload = {
  name: string;
  kabupaten: string;
  kategori: string;
  latitude: number;
  longitude: number;
  jamOperasional: string | null;
  jamBuka: string | null;
  jamTutup: string | null;
  buka24Jam: boolean;
  htmResmi: number;
  htmAnak: number | null;
  hasToilet: boolean;
  hasParkir: boolean;
  hasTempatIbadah: boolean;
  hasTempatDuduk: boolean;
  hasPenitipanBarang: boolean;
  aksesibilitas: string | null;
  vibeTags: string[];
  photoUrls: string[];
};

/**
 * Field-field info dasar destinasi — dipakai baik oleh form Edit Destinasi (submit langsung
 * lewat PATCH) maupun step 1 wizard Ajukan Destinasi (submit disimpan dulu di state wizard,
 * baru dikirim ke server setelah step opsional selesai). Komponen ini tidak tahu soal mode/
 * endpoint; pemanggil cukup kirim `onSubmit` yang menerima payload final (termasuk photoUrls
 * yang sudah diupload).
 */
export default function DestinasiInfoDasarForm({
  initial,
  onSubmit,
  submitting,
  submitLabel,
}: {
  initial?: DestinasiFormInitial;
  onSubmit: (payload: DestinasiInfoDasarPayload) => void;
  submitting: boolean;
  submitLabel: string;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [kabupaten, setKabupaten] = useState(initial?.kabupaten ?? "");
  const [kategori, setKategori] = useState(initial?.kategori ?? "");
  const [latitude, setLatitude] = useState<number | null>(initial?.latitude ?? null);
  const [longitude, setLongitude] = useState<number | null>(initial?.longitude ?? null);
  const [buka24Jam, setBuka24Jam] = useState(initial?.buka24Jam ?? false);
  const [jamBuka, setJamBuka] = useState(initial?.jamBuka ?? "");
  const [jamTutup, setJamTutup] = useState(initial?.jamTutup ?? "");
  const [htmResmi, setHtmResmi] = useState<number | "">(initial?.htmResmi ?? "");
  const [htmAnak, setHtmAnak] = useState<number | "">(initial?.htmAnak ?? "");
  const [fasilitas, setFasilitas] = useState<Record<string, boolean>>({
    hasToilet: initial?.hasToilet ?? false,
    hasParkir: initial?.hasParkir ?? false,
    hasTempatIbadah: initial?.hasTempatIbadah ?? false,
    hasTempatDuduk: initial?.hasTempatDuduk ?? false,
    hasPenitipanBarang: initial?.hasPenitipanBarang ?? false,
  });
  const [aksesibilitas, setAksesibilitas] = useState(initial?.aksesibilitas ?? "");
  const [vibeTags, setVibeTags] = useState<string[]>(initial?.vibeTags ?? []);
  const [photos, setPhotos] = useState<PhotoSlot[]>(
    () => initial?.photoUrls.map((url): PhotoSlot => ({ kind: "existing", url })) ?? []
  );
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  function handlePhotosChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (selected.length === 0) return;

    const invalid = selected.find(
      (file) => !ALLOWED_PHOTO_TYPES.includes(file.type) || file.size > MAX_PHOTO_SIZE_BYTES
    );
    if (invalid) {
      setErrors((prev) => ({ ...prev, photos: "Foto harus JPEG/PNG/WebP dan maksimal 5MB per foto." }));
      return;
    }

    if (photos.length + selected.length > MAX_PHOTOS) {
      setErrors((prev) => ({ ...prev, photos: `Maksimal ${MAX_PHOTOS} foto.` }));
      return;
    }

    setErrors((prev) => {
      const { photos: _omit, ...rest } = prev;
      return rest;
    });
    setPhotos((prev) => [
      ...prev,
      ...selected.map((file): PhotoSlot => ({ kind: "new", file, previewUrl: URL.createObjectURL(file) })),
    ]);
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      const target = prev[index];
      if (target?.kind === "new") URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

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
    if (latitude === null || longitude === null) next.koordinat = "Pilih lokasi di peta terlebih dahulu.";
    if (!buka24Jam) {
      if (!jamBuka) next.jamBuka = "Jam buka wajib diisi.";
      if (!jamTutup) next.jamTutup = "Jam tutup wajib diisi.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function uploadPhoto(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Gagal mengunggah salah satu foto.");
    }
    setUploadProgress((prev) => (prev ? { done: prev.done + 1, total: prev.total } : prev));
    return data.url as string;
  }

  async function resolvePhotoUrls(): Promise<string[]> {
    if (photos.length === 0) return [];
    const newCount = photos.filter((p) => p.kind === "new").length;
    if (newCount > 0) setUploadProgress({ done: 0, total: newCount });
    const urls = await Promise.all(photos.map((p) => (p.kind === "existing" ? p.url : uploadPhoto(p.file))));
    setUploadProgress(null);
    return urls;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;

    try {
      const photoUrls = await resolvePhotoUrls();

      const jamOperasionalDerived = buka24Jam
        ? "Buka 24 Jam"
        : jamBuka && jamTutup
          ? `${jamBuka} - ${jamTutup}`
          : null;

      onSubmit({
        name: name.trim(),
        kabupaten,
        kategori,
        latitude: latitude as number,
        longitude: longitude as number,
        jamOperasional: jamOperasionalDerived,
        jamBuka: buka24Jam ? null : jamBuka || null,
        jamTutup: buka24Jam ? null : jamTutup || null,
        buka24Jam,
        htmResmi: htmResmi === "" ? 0 : htmResmi,
        htmAnak: htmAnak === "" ? null : htmAnak,
        hasToilet: fasilitas.hasToilet ?? false,
        hasParkir: fasilitas.hasParkir ?? false,
        hasTempatIbadah: fasilitas.hasTempatIbadah ?? false,
        hasTempatDuduk: fasilitas.hasTempatDuduk ?? false,
        hasPenitipanBarang: fasilitas.hasPenitipanBarang ?? false,
        aksesibilitas: aksesibilitas.trim() === "" ? null : aksesibilitas.trim(),
        vibeTags,
        photoUrls,
      });
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        photos: err instanceof Error ? err.message : "Terjadi kesalahan jaringan. Coba lagi.",
      }));
      setUploadProgress(null);
    }
  }

  const busy = submitting || uploadProgress !== null;
  const buttonLabel = uploadProgress
    ? `Mengunggah foto (${uploadProgress.done}/${uploadProgress.total})...`
    : submitting
      ? "Menyimpan..."
      : submitLabel;

  return (
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
            background: "var(--blusukan-surface-container-lowest)",
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
            background: "var(--blusukan-surface-container-lowest)",
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
            background: "var(--blusukan-surface-container-lowest)",
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
          Lokasi di Peta
        </label>
        <MapPicker
          initialLatitude={initial?.latitude}
          initialLongitude={initial?.longitude}
          onLocationSelect={(lat, lng) => {
            setLatitude(lat);
            setLongitude(lng);
          }}
        />
        {errors.koordinat && (
          <p className="text-xs mt-1.5" style={{ color: "var(--blusukan-error)" }}>
            {errors.koordinat}
          </p>
        )}
      </div>

      {/* Jam operasional */}
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: "var(--blusukan-on-surface)" }}>
          Jam Operasional
        </label>
        <label htmlFor="buka24Jam" className="flex items-center gap-2 mb-3 cursor-pointer">
          <input
            id="buka24Jam"
            type="checkbox"
            checked={buka24Jam}
            onChange={(e) => setBuka24Jam(e.target.checked)}
            className="w-4 h-4"
            style={{ accentColor: "var(--blusukan-primary)" }}
          />
          <span className="text-sm" style={{ color: "var(--blusukan-on-surface)" }}>
            Buka 24 Jam
          </span>
        </label>

        {!buka24Jam && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="jamBuka" className="block text-xs font-medium mb-1.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                Jam Buka <span style={{ color: "var(--blusukan-error)" }}>*</span>
              </label>
              <input
                id="jamBuka"
                type="time"
                value={jamBuka}
                onChange={(e) => setJamBuka(e.target.value)}
                className="w-full px-4 py-3.5 text-base"
                style={{
                  border: "1px solid var(--blusukan-outline-variant)",
                  borderRadius: "8px",
                  background: "var(--blusukan-surface-container-lowest)",
                  color: "var(--blusukan-on-surface)",
                }}
              />
              {errors.jamBuka && (
                <p className="text-xs mt-1.5" style={{ color: "var(--blusukan-error)" }}>
                  {errors.jamBuka}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="jamTutup" className="block text-xs font-medium mb-1.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                Jam Tutup <span style={{ color: "var(--blusukan-error)" }}>*</span>
              </label>
              <input
                id="jamTutup"
                type="time"
                value={jamTutup}
                onChange={(e) => setJamTutup(e.target.value)}
                className="w-full px-4 py-3.5 text-base"
                style={{
                  border: "1px solid var(--blusukan-outline-variant)",
                  borderRadius: "8px",
                  background: "var(--blusukan-surface-container-lowest)",
                  color: "var(--blusukan-on-surface)",
                }}
              />
              {errors.jamTutup && (
                <p className="text-xs mt-1.5" style={{ color: "var(--blusukan-error)" }}>
                  {errors.jamTutup}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* HTM */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="htmResmi" className="block text-sm font-semibold mb-2" style={{ color: "var(--blusukan-on-surface)" }}>
            Harga Tiket Dewasa (opsional)
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
        <div>
          <label htmlFor="htmAnak" className="block text-sm font-semibold mb-2" style={{ color: "var(--blusukan-on-surface)" }}>
            Harga Tiket Anak-anak (opsional)
          </label>
          <RupiahInput
            id="htmAnak"
            value={htmAnak}
            onChange={setHtmAnak}
            placeholder="0"
            className="w-full pl-11 pr-4 py-3.5 text-base"
            style={{ fontSize: "1rem" }}
          />
          <p className="text-xs mt-1.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Kosongkan kalau destinasi tidak membedakan harga anak-anak.
          </p>
        </div>
      </div>

      {/* Fasilitas */}
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: "var(--blusukan-on-surface)" }}>
          Fasilitas Umum (Gratis)
        </label>
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--blusukan-outline-variant)", borderRadius: "16px" }}>
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
                  background: selected ? "var(--blusukan-primary-container)" : "var(--blusukan-surface-container-lowest)",
                  color: selected ? "var(--blusukan-primary)" : "var(--blusukan-on-surface)",
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Foto destinasi */}
      <div>
        <label htmlFor="photos" className="block text-sm font-semibold mb-2" style={{ color: "var(--blusukan-on-surface)" }}>
          Foto Destinasi (opsional, maksimal {MAX_PHOTOS} foto)
        </label>
        <input
          id="photos"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handlePhotosChange}
          disabled={photos.length >= MAX_PHOTOS}
          className="w-full text-sm"
          style={{ color: "var(--blusukan-on-surface-variant)" }}
        />
        {errors.photos && (
          <p className="text-xs mt-1.5" style={{ color: "var(--blusukan-error)" }}>
            {errors.photos}
          </p>
        )}
        {photos.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-3">
            {photos.map((p, idx) => (
              <div
                key={p.kind === "existing" ? p.url : p.previewUrl}
                className="relative aspect-square rounded-lg overflow-hidden"
                style={{ border: "1px solid var(--blusukan-outline-variant)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.kind === "existing" ? p.url : p.previewUrl}
                  alt={`Preview foto ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  aria-label={`Hapus foto ${idx + 1}`}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.6)", color: "var(--blusukan-surface-container-lowest)" }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
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
            background: "var(--blusukan-surface-container-lowest)",
            color: "var(--blusukan-on-surface)",
          }}
        />
      </div>

      <button
        type="submit"
        disabled={busy}
        className="w-full font-semibold py-3.5 text-base transition-opacity"
        style={{
          backgroundColor: "var(--blusukan-primary)",
          color: "var(--blusukan-on-primary)",
          borderRadius: "8px",
          opacity: busy ? 0.6 : 1,
          cursor: busy ? "not-allowed" : "pointer",
        }}
      >
        {buttonLabel}
      </button>
    </form>
  );
}
