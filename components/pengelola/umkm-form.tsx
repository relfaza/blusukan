"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import RupiahInput from "@/components/ui/rupiah-input";

export const KATEGORI_UMKM_VALUES = ["KULINER", "KERAJINAN", "FASHION", "JASA", "LAINNYA"] as const;

export const KATEGORI_UMKM_LABEL: Record<string, string> = {
  KULINER: "Kuliner",
  KERAJINAN: "Kerajinan",
  FASHION: "Fashion",
  JASA: "Jasa",
  LAINNYA: "Lainnya",
};

const UMKM_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const UMKM_PHOTO_MAX_BYTES = 5 * 1024 * 1024; // 5MB
const UMKM_MAX_PHOTOS = 5;

export type PhotoSlot = { kind: "existing"; url: string } | { kind: "new"; file: File; previewUrl: string };

export type WarungFormValues = {
  name: string;
  location: string;
  kategori: string;
  namaPemilik: string;
  photoUrls: string[];
  bisaBooking: boolean;
};

type ProdukDraft = { key: number; nama: string; harga: number | "" };

/** Upload satu foto UMKM lewat endpoint upload yang sama dipakai foto destinasi */
async function uploadFotoUmkm(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Gagal mengunggah foto.");
  }
  return data.url as string;
}

/** Upload semua foto baru (File) ke Cloudinary, gabungkan dengan foto lama yang dipertahankan → array URL final */
export async function uploadAllPhotos(
  photos: PhotoSlot[],
  onProgress?: (done: number, total: number) => void
): Promise<string[]> {
  const newCount = photos.filter((p) => p.kind === "new").length;
  let done = 0;
  const urls: string[] = [];
  for (const p of photos) {
    if (p.kind === "existing") {
      urls.push(p.url);
    } else {
      const url = await uploadFotoUmkm(p.file);
      urls.push(url);
      done += 1;
      onProgress?.(done, newCount);
    }
  }
  return urls;
}

/**
 * Input upload multi-foto (maks 5) dengan preview + hapus per foto — pola sama persis
 * dengan form Ajukan Destinasi Baru: file dipilih & di-preview lokal dulu, upload sungguhan
 * ke Cloudinary baru terjadi saat form disubmit (lihat uploadAllPhotos di pemanggil).
 */
function FotoUmkmMultiField({
  photos,
  onChange,
  disabled,
}: {
  photos: PhotoSlot[];
  onChange: (photos: PhotoSlot[]) => void;
  disabled?: boolean;
}) {
  const [error, setError] = useState("");

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (selected.length === 0) return;

    const invalid = selected.find(
      (file) => !UMKM_PHOTO_TYPES.includes(file.type) || file.size > UMKM_PHOTO_MAX_BYTES
    );
    if (invalid) {
      setError("Foto harus JPEG/PNG/WebP dan maksimal 5MB per foto.");
      return;
    }
    if (photos.length + selected.length > UMKM_MAX_PHOTOS) {
      setError(`Maksimal ${UMKM_MAX_PHOTOS} foto.`);
      return;
    }

    setError("");
    onChange([
      ...photos,
      ...selected.map((file): PhotoSlot => ({ kind: "new", file, previewUrl: URL.createObjectURL(file) })),
    ]);
  }

  function removePhoto(index: number) {
    const target = photos[index];
    if (target?.kind === "new") URL.revokeObjectURL(target.previewUrl);
    onChange(photos.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
        Foto UMKM (opsional, maksimal {UMKM_MAX_PHOTOS} foto)
      </label>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFilesChange}
        disabled={disabled || photos.length >= UMKM_MAX_PHOTOS}
        className="w-full text-sm"
        style={{ color: "var(--blusukan-on-surface-variant)" }}
      />
      {error && (
        <p className="text-xs mt-1.5" style={{ color: "var(--blusukan-error)" }}>
          {error}
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
                disabled={disabled}
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
  );
}

/**
 * Form UMKM terpadu — dipakai untuk tambah UMKM baru (menyertakan minimal 1 produk sekaligus)
 * maupun edit UMKM yang sudah ada (produk dikelola terpisah lewat "Tambah Menu" di card), dan
 * dipakai ulang di step opsional wizard Ajukan Destinasi (mode "create").
 */
export default function UmkmForm({
  mode,
  initial,
  onCancel,
  onSubmit,
  submitting,
}: {
  mode: "create" | "edit";
  initial?: {
    name: string;
    location: string | null;
    kategori: string;
    namaPemilik: string | null;
    photoUrls: string[];
    bisaBooking: boolean;
  };
  onCancel: () => void;
  onSubmit: (values: WarungFormValues & { items: { nama: string; harga: number }[] }) => void;
  submitting: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [namaPemilik, setNamaPemilik] = useState(initial?.namaPemilik ?? "");
  const [kategori, setKategori] = useState(initial?.kategori ?? "LAINNYA");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [bisaBooking, setBisaBooking] = useState(initial?.bisaBooking ?? true);
  const [photos, setPhotos] = useState<PhotoSlot[]>(
    () => initial?.photoUrls.map((url): PhotoSlot => ({ kind: "existing", url })) ?? []
  );
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [produk, setProduk] = useState<ProdukDraft[]>([{ key: 0, nama: "", harga: "" }]);
  const [nextKey, setNextKey] = useState(1);
  const [produkError, setProdukError] = useState("");
  const [photoError, setPhotoError] = useState("");

  function updateProduk(key: number, patch: Partial<ProdukDraft>) {
    setProduk((prev) => prev.map((p) => (p.key === key ? { ...p, ...patch } : p)));
  }

  function addProdukRow() {
    setProduk((prev) => [...prev, { key: nextKey, nama: "", harga: "" }]);
    setNextKey((k) => k + 1);
  }

  function removeProdukRow(key: number) {
    setProduk((prev) => (prev.length > 1 ? prev.filter((p) => p.key !== key) : prev));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    let items: { nama: string; harga: number }[] = [];
    if (mode === "create") {
      items = produk
        .filter((p) => p.nama.trim() !== "" || p.harga !== "")
        .map((p) => ({ nama: p.nama.trim(), harga: Number(p.harga) }));

      if (items.length === 0 || items.some((it) => !it.nama || !Number.isFinite(it.harga) || it.harga < 0)) {
        setProdukError("Minimal 1 produk dengan nama dan harga yang valid wajib diisi.");
        return;
      }
      setProdukError("");
    }

    setPhotoError("");
    let photoUrls: string[];
    try {
      const newCount = photos.filter((p) => p.kind === "new").length;
      if (newCount > 0) setUploadProgress({ done: 0, total: newCount });
      photoUrls = await uploadAllPhotos(photos, (done, total) => setUploadProgress({ done, total }));
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Gagal mengunggah salah satu foto.");
      setUploadProgress(null);
      return;
    }
    setUploadProgress(null);

    onSubmit({ name, location, kategori, namaPemilik, photoUrls, bisaBooking, items });
  }

  const inputStyle: React.CSSProperties = {
    border: "1px solid var(--blusukan-outline-variant)",
    borderRadius: "8px",
    background: "var(--blusukan-surface-container-lowest)",
    color: "var(--blusukan-on-surface)",
  };

  const busy = submitting || uploadProgress !== null;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-5 space-y-4"
      style={{ background: "var(--blusukan-primary-container)", border: "1px solid var(--blusukan-outline-variant)" }}
    >
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Nama UMKM
        </label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Warung Bu Sri"
          className="w-full px-3 py-2 text-sm"
          style={inputStyle}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Nama Pemilik
          </label>
          <input
            value={namaPemilik}
            onChange={(e) => setNamaPemilik(e.target.value)}
            placeholder="Contoh: Bu Sri"
            className="w-full px-3 py-2 text-sm"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Kategori
          </label>
          <select
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            className="w-full px-3 py-2 text-sm"
            style={inputStyle}
          >
            {KATEGORI_UMKM_VALUES.map((k) => (
              <option key={k} value={k}>
                {KATEGORI_UMKM_LABEL[k]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Lokasi
        </label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Contoh: Dekat pintu masuk"
          className="w-full px-3 py-2 text-sm"
          style={inputStyle}
        />
      </div>

      <FotoUmkmMultiField photos={photos} onChange={setPhotos} disabled={busy} />
      {photoError && (
        <p className="text-xs" style={{ color: "var(--blusukan-error)" }}>
          {photoError}
        </p>
      )}

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={bisaBooking}
          onChange={(e) => setBisaBooking(e.target.checked)}
          className="w-4 h-4"
          style={{ accentColor: "var(--blusukan-primary)" }}
        />
        <span className="text-sm" style={{ color: "var(--blusukan-on-surface)" }}>
          UMKM ini menyediakan reservasi tempat duduk
        </span>
      </label>

      {mode === "create" && (
        <div className="pt-2" style={{ borderTop: "1px dashed var(--blusukan-outline-variant)" }}>
          <p className="text-sm font-bold mb-2" style={{ color: "var(--blusukan-on-surface)" }}>
            Daftar Produk/Menu
          </p>
          <div className="space-y-2">
            {produk.map((p, idx) => (
              <div key={p.key} className="grid grid-cols-2 gap-2 items-start">
                <input
                  required
                  value={p.nama}
                  onChange={(e) => updateProduk(p.key, { nama: e.target.value })}
                  placeholder="Nama Produk"
                  className="w-full px-3 py-2 text-sm"
                  style={inputStyle}
                />
                <div className="flex items-center gap-1.5">
                  <RupiahInput
                    value={p.harga}
                    onChange={(harga) => updateProduk(p.key, { harga })}
                    className="w-full pl-9 pr-3 py-2 text-sm"
                    style={inputStyle}
                  />
                  {produk.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProdukRow(p.key)}
                      aria-label={`Hapus produk ${idx + 1}`}
                      className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--blusukan-error-container)]"
                      style={{ color: "var(--blusukan-error)" }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {produkError && (
            <p className="text-xs mt-2" style={{ color: "var(--blusukan-error)" }}>
              {produkError}
            </p>
          )}
          <button
            type="button"
            onClick={addProdukRow}
            className="flex items-center gap-1 text-xs font-bold mt-2 hover:opacity-80 transition-opacity"
            style={{ color: "var(--blusukan-primary)" }}
          >
            <Plus size={14} />
            Tambah Produk Lain
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={busy}
          className="text-sm font-bold px-4 py-2 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
        >
          {uploadProgress
            ? `Mengunggah foto (${uploadProgress.done}/${uploadProgress.total})...`
            : submitting
              ? "Menyimpan..."
              : "Simpan"}
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
