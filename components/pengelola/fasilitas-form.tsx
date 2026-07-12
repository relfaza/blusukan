"use client";

import { useState } from "react";
import { X } from "lucide-react";
import RupiahInput from "@/components/ui/rupiah-input";

export type FasilitasFormValues = {
  nama: string;
  hargaSewa: number;
  satuanWaktu: string;
  jumlahUnit: number;
  lokasiDalamDestinasi: string | null;
  deskripsiManfaat: string | null;
  fotoUrl: string | null;
};

export const SATUAN_WAKTU_OPTIONS = ["per menit", "per jam", "per hari"] as const;

const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

type PhotoSlot = { kind: "existing"; url: string } | { kind: "new"; file: File; previewUrl: string };

/** Form tambah/edit fasilitas — dipakai di halaman Kelola Fasilitas maupun step opsional wizard Ajukan Destinasi */
export default function FasilitasForm({
  initial,
  onCancel,
  onSubmit,
  submitting,
}: {
  initial?: FasilitasFormValues;
  onCancel: () => void;
  onSubmit: (values: FasilitasFormValues) => void;
  submitting: boolean;
}) {
  const [nama, setNama] = useState(initial?.nama ?? "");
  const [hargaSewa, setHargaSewa] = useState<number | "">(initial ? initial.hargaSewa : "");
  const [satuanWaktu, setSatuanWaktu] = useState(initial?.satuanWaktu ?? "per jam");
  const [jumlahUnit, setJumlahUnit] = useState(initial ? String(initial.jumlahUnit) : "1");
  const [lokasiDalamDestinasi, setLokasiDalamDestinasi] = useState(initial?.lokasiDalamDestinasi ?? "");
  const [deskripsiManfaat, setDeskripsiManfaat] = useState(initial?.deskripsiManfaat ?? "");
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
        nama,
        hargaSewa: Number(hargaSewa),
        satuanWaktu,
        jumlahUnit: Number(jumlahUnit),
        lokasiDalamDestinasi: lokasiDalamDestinasi.trim() === "" ? null : lokasiDalamDestinasi.trim(),
        deskripsiManfaat: deskripsiManfaat.trim() === "" ? null : deskripsiManfaat.trim(),
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
          Nama Fasilitas
        </label>
        <input
          required
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Contoh: Sewa Tikar"
          className="w-full px-3 py-2 text-sm"
          style={inputStyle}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Harga Sewa
          </label>
          <RupiahInput
            id="hargaSewa"
            required
            value={hargaSewa}
            onChange={setHargaSewa}
            className="w-full pl-9 pr-3 py-2 text-sm"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Satuan Waktu
          </label>
          <select
            required
            value={satuanWaktu}
            onChange={(e) => setSatuanWaktu(e.target.value)}
            className="w-full px-3 py-2 text-sm"
            style={inputStyle}
          >
            {SATUAN_WAKTU_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Jumlah Unit Tersedia
        </label>
        <input
          required
          type="number"
          min={1}
          value={jumlahUnit}
          onChange={(e) => setJumlahUnit(e.target.value)}
          className="w-full px-3 py-2 text-sm"
          style={inputStyle}
        />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Lokasi dalam Destinasi (opsional)
        </label>
        <input
          value={lokasiDalamDestinasi}
          onChange={(e) => setLokasiDalamDestinasi(e.target.value)}
          placeholder="Contoh: Dekat pintu masuk"
          className="w-full px-3 py-2 text-sm"
          style={inputStyle}
        />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Deskripsi Manfaat (opsional)
        </label>
        <textarea
          value={deskripsiManfaat}
          onChange={(e) => setDeskripsiManfaat(e.target.value)}
          rows={2}
          placeholder="Contoh: Cocok untuk piknik keluarga"
          className="w-full px-3 py-2 text-sm resize-none"
          style={inputStyle}
        />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Foto Fasilitas (opsional)
        </label>
        {photo ? (
          <div className="relative w-24 h-24 rounded-lg overflow-hidden" style={{ border: "1px solid var(--blusukan-outline-variant)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.kind === "existing" ? photo.url : photo.previewUrl}
              alt="Preview foto fasilitas"
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
