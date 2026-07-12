"use client";

import { useState } from "react";
import { X } from "lucide-react";
import RupiahInput from "@/components/ui/rupiah-input";

export const SERVICE_TYPE_VALUES = ["OJEK", "JEEP", "GUIDE"] as const;

export const SERVICE_TYPE_LABEL: Record<string, string> = {
  OJEK: "Ojek Lokal",
  JEEP: "Sewa Jeep",
  GUIDE: "Pemandu Wisata",
};

export type JasaTransportFormValues = {
  providerName: string;
  serviceType: string;
  contactWa: string;
  baseRate: number;
  kapasitasPenumpang: number | null;
  fotoUrl: string | null;
};

const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

type PhotoSlot = { kind: "existing"; url: string } | { kind: "new"; file: File; previewUrl: string };

/** Form tambah/edit jasa transport lokal (ojek/jeep/pemandu) — dipakai di step opsional wizard Ajukan Destinasi maupun halaman Kelola Transportasi */
export default function JasaTransportForm({
  initial,
  onCancel,
  onSubmit,
  submitting,
}: {
  initial?: JasaTransportFormValues;
  onCancel: () => void;
  onSubmit: (values: JasaTransportFormValues) => void;
  submitting: boolean;
}) {
  const [providerName, setProviderName] = useState(initial?.providerName ?? "");
  const [serviceType, setServiceType] = useState(initial?.serviceType ?? SERVICE_TYPE_VALUES[0]);
  const [contactWa, setContactWa] = useState(initial?.contactWa ?? "");
  const [baseRate, setBaseRate] = useState<number | "">(initial ? initial.baseRate : "");
  const [kapasitasPenumpang, setKapasitasPenumpang] = useState(
    initial?.kapasitasPenumpang != null ? String(initial.kapasitasPenumpang) : ""
  );
  const [photo, setPhoto] = useState<PhotoSlot | null>(
    initial?.fotoUrl ? { kind: "existing", url: initial.fotoUrl } : null
  );
  const [photoError, setPhotoError] = useState("");
  const [uploading, setUploading] = useState(false);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ALLOWED_PHOTO_TYPES.includes(file.type) || file.size > MAX_PHOTO_SIZE_BYTES) {
      setPhotoError("Foto harus JPEG/PNG/WebP dan maksimal 5MB.");
      return;
    }

    setPhotoError("");
    setPhoto({ kind: "new", file, previewUrl: URL.createObjectURL(file) });
  }

  function removePhoto() {
    if (photo?.kind === "new") URL.revokeObjectURL(photo.previewUrl);
    setPhoto(null);
  }

  async function resolveFotoUrl(): Promise<string | null> {
    if (!photo) return null;
    if (photo.kind === "existing") return photo.url;

    const formData = new FormData();
    formData.append("file", photo.file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Gagal mengunggah foto.");
    }
    return data.url as string;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setUploading(true);
    setPhotoError("");
    try {
      const fotoUrl = await resolveFotoUrl();
      onSubmit({
        providerName: providerName.trim(),
        serviceType,
        contactWa: contactWa.trim(),
        baseRate: Number(baseRate),
        kapasitasPenumpang: kapasitasPenumpang.trim() === "" ? null : Number(kapasitasPenumpang),
        fotoUrl,
      });
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setUploading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    border: "1px solid var(--blusukan-outline-variant)",
    borderRadius: "8px",
    background: "var(--blusukan-surface-container-lowest)",
    color: "var(--blusukan-on-surface)",
  };

  const busy = submitting || uploading;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-5 space-y-3"
      style={{ background: "var(--blusukan-primary-container)", border: "1px solid var(--blusukan-outline-variant)" }}
    >
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Nama Penyedia Jasa
        </label>
        <input
          required
          value={providerName}
          onChange={(e) => setProviderName(e.target.value)}
          placeholder="Contoh: Pak Joko Ojek"
          className="w-full px-3 py-2 text-sm"
          style={inputStyle}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Jenis Jasa
          </label>
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="w-full px-3 py-2 text-sm"
            style={inputStyle}
          >
            {SERVICE_TYPE_VALUES.map((v) => (
              <option key={v} value={v}>
                {SERVICE_TYPE_LABEL[v]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Tarif Dasar
          </label>
          <RupiahInput
            id="baseRate"
            required
            value={baseRate}
            onChange={setBaseRate}
            className="w-full pl-9 pr-3 py-2 text-sm"
            style={inputStyle}
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Nomor WhatsApp
        </label>
        <input
          required
          type="tel"
          value={contactWa}
          onChange={(e) => setContactWa(e.target.value)}
          placeholder="08xxxxxxxxxx"
          className="w-full px-3 py-2 text-sm"
          style={inputStyle}
        />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Kapasitas Penumpang (opsional)
        </label>
        <input
          type="number"
          min={1}
          value={kapasitasPenumpang}
          onChange={(e) => setKapasitasPenumpang(e.target.value)}
          placeholder="Contoh: 4"
          className="w-full px-3 py-2 text-sm"
          style={inputStyle}
        />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Foto Kendaraan (opsional)
        </label>
        {photo ? (
          <div className="relative w-24 h-24 rounded-lg overflow-hidden" style={{ border: "1px solid var(--blusukan-outline-variant)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.kind === "existing" ? photo.url : photo.previewUrl}
              alt="Preview foto kendaraan"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={removePhoto}
              aria-label="Hapus foto"
              className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.6)", color: "var(--blusukan-surface-container-lowest)" }}
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            className="w-full text-sm"
            style={{ color: "var(--blusukan-on-surface-variant)" }}
          />
        )}
        {photoError && (
          <p className="text-xs mt-1.5" style={{ color: "var(--blusukan-error)" }}>
            {photoError}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={busy}
          className="text-sm font-bold px-4 py-2 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
        >
          {uploading ? "Mengunggah..." : submitting ? "Menyimpan..." : "Simpan"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="text-sm font-medium px-4 py-2 rounded-lg"
          style={{ color: "var(--blusukan-on-surface-variant)" }}
        >
          Batal
        </button>
      </div>
    </form>
  );
}
