"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Ticket, Pencil, Trash2, Plus, X, ImageOff, User } from "lucide-react";
import RupiahInput from "@/components/ui/rupiah-input";

type TransaksiRow = {
  id: string;
  type: string;
  totalHarga: number;
  status: string;
  kodeTransaksi: string;
  createdAt: string;
  namaPemesan: string;
};

type FasilitasRow = {
  id: string;
  destinationId: string;
  nama: string;
  hargaSewa: number;
  satuanWaktu: string;
  jumlahUnit: number;
};

type MenuItemRow = {
  id: string;
  warungId: string;
  name: string;
  price: number;
};

type WarungRow = {
  id: string;
  destinationId: string;
  name: string;
  location: string | null;
  kategori: string;
  namaPemilik: string | null;
  fotoUrl: string | null;
  menuItems: MenuItemRow[];
};

const KATEGORI_UMKM_VALUES = ["KULINER", "KERAJINAN", "FASHION", "JASA", "LAINNYA"] as const;

const KATEGORI_UMKM_LABEL: Record<string, string> = {
  KULINER: "Kuliner",
  KERAJINAN: "Kerajinan",
  FASHION: "Fashion",
  JASA: "Jasa",
  LAINNYA: "Lainnya",
};

const KATEGORI_UMKM_STYLE: Record<string, { bg: string; color: string }> = {
  KULINER: { bg: "#fef3e7", color: "#805533" },
  KERAJINAN: { bg: "rgba(45,90,39,0.1)", color: "#154212" },
  FASHION: { bg: "#f3e8fd", color: "#6b21a8" },
  JASA: { bg: "#e3f2fd", color: "#1565c0" },
  LAINNYA: { bg: "#f0f0f0", color: "#72796e" },
};

function KategoriUmkmBadge({ kategori }: { kategori: string }) {
  const style = KATEGORI_UMKM_STYLE[kategori] ?? KATEGORI_UMKM_STYLE.LAINNYA;
  return (
    <span
      className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ background: style.bg, color: style.color }}
    >
      {KATEGORI_UMKM_LABEL[kategori] ?? kategori}
    </span>
  );
}

interface Props {
  destination: { id: string; name: string; status: string };
  initialTransaksis: TransaksiRow[];
  initialFasilitas: FasilitasRow[];
  initialWarungs: WarungRow[];
}

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

const TYPE_LABEL: Record<string, string> = {
  TIKET_MASUK: "Tiket Masuk",
  FASILITAS: "Fasilitas",
  UMKM: "UMKM",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu Konfirmasi",
  DIKONFIRMASI: "Dikonfirmasi",
  SELESAI: "Selesai",
  DIBATALKAN: "Dibatalkan",
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: "#fef3e7", color: "#805533" },
  DIKONFIRMASI: { bg: "var(--blusukan-primary-container)", color: "#1d4ed8" },
  SELESAI: { bg: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" },
  DIBATALKAN: { bg: "#eeeeee", color: "var(--blusukan-on-surface-variant)" },
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLE[status] ?? STATUS_STYLE.PENDING;
  return (
    <span
      className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ background: style.bg, color: style.color }}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

/** Section: Transaksi Masuk — list + tombol aksi konfirmasi/tolak/selesai */
function TransaksiMasukSection({
  initialTransaksis,
}: {
  initialTransaksis: TransaksiRow[];
}) {
  const [items, setItems] = useState(initialTransaksis);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    setError("");
    try {
      const res = await fetch(`/api/pengelola/transaksi/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal memperbarui status.");
        return;
      }
      setItems((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (items.length === 0) {
    return (
      <div
        className="rounded-2xl p-10 flex flex-col items-center text-center"
        style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
      >
        <Ticket size={36} style={{ color: "var(--blusukan-outline)" }} className="mb-3" />
        <p className="text-sm font-medium" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Belum ada transaksi masuk untuk destinasi ini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm px-4 py-2.5 rounded-lg" style={{ background: "var(--blusukan-error-container)", color: "var(--blusukan-error)" }}>
          {error}
        </p>
      )}
      {items.map((t) => {
        const busy = updatingId === t.id;
        return (
          <div
            key={t.id}
            className="rounded-2xl p-5"
            style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p
                  className="text-sm font-bold tracking-wide"
                  style={{ fontFamily: "monospace", color: "var(--blusukan-on-surface)" }}
                >
                  {t.kodeTransaksi}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                  {t.namaPemesan} · {TYPE_LABEL[t.type] ?? t.type}
                </p>
              </div>
              <StatusBadge status={t.status} />
            </div>

            <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px dashed var(--blusukan-outline-variant)" }}>
              <p className="text-sm font-bold" style={{ color: "var(--blusukan-primary)" }}>
                {formatRupiah(t.totalHarga)}
              </p>

              <div className="flex items-center gap-2">
                {t.status === "PENDING" && (
                  <>
                    <button
                      type="button"
                      id={`btn-konfirmasi-${t.id}`}
                      disabled={busy}
                      onClick={() => updateStatus(t.id, "DIKONFIRMASI")}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
                    >
                      Konfirmasi
                    </button>
                    <button
                      type="button"
                      id={`btn-tolak-${t.id}`}
                      disabled={busy}
                      onClick={() => updateStatus(t.id, "DIBATALKAN")}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ border: "1px solid var(--blusukan-error)", color: "var(--blusukan-error)", background: "#ffffff" }}
                    >
                      Tolak
                    </button>
                  </>
                )}
                {t.status === "DIKONFIRMASI" && (
                  <button
                    type="button"
                    id={`btn-selesai-${t.id}`}
                    disabled={busy}
                    onClick={() => updateStatus(t.id, "SELESAI")}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
                  >
                    Tandai Selesai
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Form tambah/edit fasilitas — dipakai untuk create maupun update */
function FasilitasForm({
  initial,
  onCancel,
  onSubmit,
  submitting,
}: {
  initial?: FasilitasRow;
  onCancel: () => void;
  onSubmit: (values: { nama: string; hargaSewa: number; satuanWaktu: string; jumlahUnit: number }) => void;
  submitting: boolean;
}) {
  const [nama, setNama] = useState(initial?.nama ?? "");
  const [hargaSewa, setHargaSewa] = useState<number | "">(initial ? initial.hargaSewa : "");
  const [satuanWaktu, setSatuanWaktu] = useState(initial?.satuanWaktu ?? "per jam");
  const [jumlahUnit, setJumlahUnit] = useState(initial ? String(initial.jumlahUnit) : "1");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      nama,
      hargaSewa: Number(hargaSewa),
      satuanWaktu,
      jumlahUnit: Number(jumlahUnit),
    });
  }

  const inputStyle: React.CSSProperties = {
    border: "1px solid var(--blusukan-outline-variant)",
    borderRadius: "8px",
    background: "#ffffff",
    color: "var(--blusukan-on-surface)",
  };

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
          <input
            required
            value={satuanWaktu}
            onChange={(e) => setSatuanWaktu(e.target.value)}
            placeholder="per jam"
            className="w-full px-3 py-2 text-sm"
            style={inputStyle}
          />
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

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="text-sm font-bold px-4 py-2 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
        >
          {submitting ? "Menyimpan..." : "Simpan"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="text-sm font-medium px-4 py-2 rounded-lg"
          style={{ color: "var(--blusukan-on-surface-variant)" }}
        >
          Batal
        </button>
      </div>
    </form>
  );
}

/** Section: Kelola Fasilitas — CRUD lewat /api/pengelola/fasilitas */
function KelolaFasilitasSection({
  destinationId,
  initialFasilitas,
}: {
  destinationId: string;
  initialFasilitas: FasilitasRow[];
}) {
  const [items, setItems] = useState(initialFasilitas);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd(values: { nama: string; hargaSewa: number; satuanWaktu: string; jumlahUnit: number }) {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/pengelola/fasilitas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinationId, ...values }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal menambah fasilitas.");
        return;
      }
      setItems((prev) => [...prev, data]);
      setShowAddForm(false);
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(id: string, values: { nama: string; hargaSewa: number; satuanWaktu: string; jumlahUnit: number }) {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/pengelola/fasilitas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...values }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal memperbarui fasilitas.");
        return;
      }
      setItems((prev) => prev.map((f) => (f.id === id ? data : f)));
      setEditingId(null);
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Hapus fasilitas ini?")) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/pengelola/fasilitas", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal menghapus fasilitas.");
        return;
      }
      setItems((prev) => prev.filter((f) => f.id !== id));
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm px-4 py-2.5 rounded-lg" style={{ background: "var(--blusukan-error-container)", color: "var(--blusukan-error)" }}>
          {error}
        </p>
      )}

      {!showAddForm && (
        <button
          type="button"
          id="btn-tambah-fasilitas"
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
          style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
        >
          <Plus size={16} />
          Tambah Fasilitas
        </button>
      )}

      {showAddForm && (
        <FasilitasForm onCancel={() => setShowAddForm(false)} onSubmit={handleAdd} submitting={submitting} />
      )}

      {items.length === 0 && !showAddForm ? (
        <div
          className="rounded-2xl p-10 flex flex-col items-center text-center"
          style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
        >
          <p className="text-sm font-medium" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Belum ada fasilitas yang ditambahkan.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((f) =>
            editingId === f.id ? (
              <FasilitasForm
                key={f.id}
                initial={f}
                onCancel={() => setEditingId(null)}
                onSubmit={(values) => handleEdit(f.id, values)}
                submitting={submitting}
              />
            ) : (
              <div
                key={f.id}
                className="rounded-2xl p-5 flex items-center justify-between gap-3"
                style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
              >
                <div>
                  <p className="text-sm font-bold" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}>
                    {f.nama}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                    {formatRupiah(f.hargaSewa)} / {f.satuanWaktu} · {f.jumlahUnit} unit tersedia
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    id={`btn-edit-fasilitas-${f.id}`}
                    onClick={() => setEditingId(f.id)}
                    aria-label={`Edit ${f.nama}`}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[#f0f0f0]"
                    style={{ border: "1px solid var(--blusukan-outline-variant)", color: "var(--blusukan-on-surface-variant)" }}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    id={`btn-hapus-fasilitas-${f.id}`}
                    onClick={() => handleDelete(f.id)}
                    disabled={submitting}
                    aria-label={`Hapus ${f.nama}`}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[#fde8e8] disabled:opacity-50"
                    style={{ border: "1px solid var(--blusukan-error)", color: "var(--blusukan-error)" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

const UMKM_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const UMKM_PHOTO_MAX_BYTES = 5 * 1024 * 1024; // 5MB

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

/** Input upload 1 foto dengan preview — dipakai form tambah maupun edit UMKM */
function FotoUmkmField({
  fotoUrl,
  onChange,
  error,
  disabled,
}: {
  fotoUrl: string | null;
  onChange: (url: string | null) => void;
  error?: string;
  disabled?: boolean;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!UMKM_PHOTO_TYPES.includes(file.type) || file.size > UMKM_PHOTO_MAX_BYTES) {
      onChange(null);
      return;
    }

    setUploading(true);
    try {
      const url = await uploadFotoUmkm(file);
      onChange(url);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
        Foto UMKM (opsional)
      </label>
      {fotoUrl ? (
        <div className="relative w-24 h-24 rounded-lg overflow-hidden" style={{ border: "1px solid var(--blusukan-outline-variant)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotoUrl} alt="Preview foto UMKM" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            disabled={disabled}
            aria-label="Hapus foto"
            className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.6)", color: "#ffffff" }}
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={disabled || uploading}
          className="w-full text-sm"
          style={{ color: "var(--blusukan-on-surface-variant)" }}
        />
      )}
      {uploading && (
        <p className="text-xs mt-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Mengunggah foto...
        </p>
      )}
      {error && (
        <p className="text-xs mt-1" style={{ color: "var(--blusukan-error)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

type WarungFormValues = {
  name: string;
  location: string;
  kategori: string;
  namaPemilik: string;
  fotoUrl: string | null;
};

/** Form edit UMKM — nama/lokasi/kategori/pemilik/foto milik UMKM yang sudah ada (produk dikelola terpisah) */
function WarungForm({
  initial,
  onCancel,
  onSubmit,
  submitting,
}: {
  initial?: { name: string; location: string | null; kategori: string; namaPemilik: string | null; fotoUrl: string | null };
  onCancel: () => void;
  onSubmit: (values: WarungFormValues) => void;
  submitting: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [kategori, setKategori] = useState(initial?.kategori ?? "LAINNYA");
  const [namaPemilik, setNamaPemilik] = useState(initial?.namaPemilik ?? "");
  const [fotoUrl, setFotoUrl] = useState<string | null>(initial?.fotoUrl ?? null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ name, location, kategori, namaPemilik, fotoUrl });
  }

  const inputStyle: React.CSSProperties = {
    border: "1px solid var(--blusukan-outline-variant)",
    borderRadius: "8px",
    background: "#ffffff",
    color: "var(--blusukan-on-surface)",
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-5 space-y-3"
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
      <FotoUmkmField fotoUrl={fotoUrl} onChange={setFotoUrl} disabled={submitting} />
      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="text-sm font-bold px-4 py-2 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
        >
          {submitting ? "Menyimpan..." : "Simpan"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="text-sm font-medium px-4 py-2 rounded-lg"
          style={{ color: "var(--blusukan-on-surface-variant)" }}
        >
          Batal
        </button>
      </div>
    </form>
  );
}

type ProdukDraft = { key: number; nama: string; harga: number | "" };

/** Form tambah UMKM baru — data UMKM + minimal 1 produk sekaligus, dikirim satu kali ke API */
function TambahUmkmForm({
  onCancel,
  onSubmit,
  submitting,
}: {
  onCancel: () => void;
  onSubmit: (values: {
    name: string;
    location: string;
    kategori: string;
    namaPemilik: string;
    fotoUrl: string | null;
    items: { nama: string; harga: number }[];
  }) => void;
  submitting: boolean;
}) {
  const [name, setName] = useState("");
  const [namaPemilik, setNamaPemilik] = useState("");
  const [kategori, setKategori] = useState("LAINNYA");
  const [location, setLocation] = useState("");
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [produk, setProduk] = useState<ProdukDraft[]>([{ key: 0, nama: "", harga: "" }]);
  const [nextKey, setNextKey] = useState(1);
  const [produkError, setProdukError] = useState("");

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const items = produk
      .filter((p) => p.nama.trim() !== "" || p.harga !== "")
      .map((p) => ({ nama: p.nama.trim(), harga: Number(p.harga) }));

    if (items.length === 0 || items.some((it) => !it.nama || !Number.isFinite(it.harga) || it.harga < 0)) {
      setProdukError("Minimal 1 produk dengan nama dan harga yang valid wajib diisi.");
      return;
    }
    setProdukError("");

    onSubmit({ name, location, kategori, namaPemilik, fotoUrl, items });
  }

  const inputStyle: React.CSSProperties = {
    border: "1px solid var(--blusukan-outline-variant)",
    borderRadius: "8px",
    background: "#ffffff",
    color: "var(--blusukan-on-surface)",
  };

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

      <FotoUmkmField fotoUrl={fotoUrl} onChange={setFotoUrl} disabled={submitting} />

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
                    className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center transition-colors hover:bg-[#fde8e8]"
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

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="text-sm font-bold px-4 py-2 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
        >
          {submitting ? "Menyimpan..." : "Simpan"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="text-sm font-medium px-4 py-2 rounded-lg"
          style={{ color: "var(--blusukan-on-surface-variant)" }}
        >
          Batal
        </button>
      </div>
    </form>
  );
}

/** Form tambah/edit menu item — dipakai di dalam card warung */
function MenuItemForm({
  initial,
  onCancel,
  onSubmit,
  submitting,
}: {
  initial?: { name: string; price: number };
  onCancel: () => void;
  onSubmit: (values: { name: string; price: number }) => void;
  submitting: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState<number | "">(initial ? initial.price : "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ name, price: Number(price) });
  }

  const inputStyle: React.CSSProperties = {
    border: "1px solid var(--blusukan-outline-variant)",
    borderRadius: "8px",
    background: "#ffffff",
    color: "var(--blusukan-on-surface)",
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl p-4 space-y-3"
      style={{ background: "var(--blusukan-surface)", border: "1px solid var(--blusukan-outline-variant)" }}
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Nama Menu
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Mie Ayam"
            className="w-full px-3 py-2 text-sm"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Harga
          </label>
          <RupiahInput
            id="menuPrice"
            required
            value={price}
            onChange={setPrice}
            className="w-full pl-9 pr-3 py-2 text-sm"
            style={inputStyle}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="text-xs font-bold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
        >
          {submitting ? "Menyimpan..." : "Simpan"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="text-xs font-medium px-3 py-1.5 rounded-lg"
          style={{ color: "var(--blusukan-on-surface-variant)" }}
        >
          Batal
        </button>
      </div>
    </form>
  );
}

/** Card satu warung: info + daftar menu, dengan aksi edit/hapus untuk warung maupun tiap menu item */
function WarungCard({
  warung,
  submitting,
  onEditWarung,
  onDeleteWarung,
  onAddMenuItem,
  onEditMenuItem,
  onDeleteMenuItem,
}: {
  warung: WarungRow;
  submitting: boolean;
  onEditWarung: (values: WarungFormValues) => void;
  onDeleteWarung: () => void;
  onAddMenuItem: (values: { name: string; price: number }) => void;
  onEditMenuItem: (menuItemId: string, values: { name: string; price: number }) => void;
  onDeleteMenuItem: (menuItemId: string) => void;
}) {
  const [isEditingWarung, setIsEditingWarung] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);

  if (isEditingWarung) {
    return (
      <WarungForm
        initial={{
          name: warung.name,
          location: warung.location,
          kategori: warung.kategori,
          namaPemilik: warung.namaPemilik,
          fotoUrl: warung.fotoUrl,
        }}
        onCancel={() => setIsEditingWarung(false)}
        onSubmit={(values) => {
          onEditWarung(values);
          setIsEditingWarung(false);
        }}
        submitting={submitting}
      />
    );
  }

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="w-14 h-14 rounded-xl overflow-hidden shrink-0"
            style={{ background: "#e0e0e0" }}
          >
            {warung.fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={warung.fotoUrl} alt={warung.name} className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, rgba(45,90,39,0.15) 0%, rgba(21,66,18,0.25) 100%)" }}
              >
                <ImageOff size={18} style={{ color: "rgba(21,66,18,0.35)" }} />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <p className="text-sm font-bold" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}>
                {warung.name}
              </p>
              <KategoriUmkmBadge kategori={warung.kategori} />
            </div>
            {warung.namaPemilik && (
              <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                <User size={11} />
                {warung.namaPemilik}
              </p>
            )}
            {warung.location && (
              <p className="text-xs mt-0.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                {warung.location}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            id={`btn-edit-warung-${warung.id}`}
            onClick={() => setIsEditingWarung(true)}
            aria-label={`Edit ${warung.name}`}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[#f0f0f0]"
            style={{ border: "1px solid var(--blusukan-outline-variant)", color: "var(--blusukan-on-surface-variant)" }}
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            id={`btn-hapus-warung-${warung.id}`}
            onClick={onDeleteWarung}
            disabled={submitting}
            aria-label={`Hapus ${warung.name}`}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[#fde8e8] disabled:opacity-50"
            style={{ border: "1px solid var(--blusukan-error)", color: "var(--blusukan-error)" }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="space-y-2 pt-3" style={{ borderTop: "1px dashed var(--blusukan-outline-variant)" }}>
        {warung.menuItems.length === 0 && !showAddMenu && (
          <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Belum ada menu.
          </p>
        )}
        {warung.menuItems.map((m) =>
          editingMenuId === m.id ? (
            <MenuItemForm
              key={m.id}
              initial={{ name: m.name, price: m.price }}
              onCancel={() => setEditingMenuId(null)}
              onSubmit={(values) => {
                onEditMenuItem(m.id, values);
                setEditingMenuId(null);
              }}
              submitting={submitting}
            />
          ) : (
            <div key={m.id} className="flex items-center justify-between gap-3 px-1">
              <p className="text-sm" style={{ color: "var(--blusukan-on-surface)" }}>
                {m.name}{" "}
                <span style={{ color: "var(--blusukan-on-surface-variant)" }}>· {formatRupiah(m.price)}</span>
              </p>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  id={`btn-edit-menu-${m.id}`}
                  onClick={() => setEditingMenuId(m.id)}
                  aria-label={`Edit ${m.name}`}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-[#f0f0f0]"
                  style={{ color: "var(--blusukan-on-surface-variant)" }}
                >
                  <Pencil size={12} />
                </button>
                <button
                  type="button"
                  id={`btn-hapus-menu-${m.id}`}
                  onClick={() => onDeleteMenuItem(m.id)}
                  disabled={submitting}
                  aria-label={`Hapus ${m.name}`}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-[#fde8e8] disabled:opacity-50"
                  style={{ color: "var(--blusukan-error)" }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          )
        )}

        {showAddMenu ? (
          <MenuItemForm
            onCancel={() => setShowAddMenu(false)}
            onSubmit={(values) => {
              onAddMenuItem(values);
              setShowAddMenu(false);
            }}
            submitting={submitting}
          />
        ) : (
          <button
            type="button"
            id={`btn-tambah-menu-${warung.id}`}
            onClick={() => setShowAddMenu(true)}
            className="flex items-center gap-1 text-xs font-bold mt-1 hover:opacity-80 transition-opacity"
            style={{ color: "var(--blusukan-primary)" }}
          >
            <Plus size={14} />
            Tambah Menu
          </button>
        )}
      </div>
    </div>
  );
}

/** Section: Kelola UMKM — CRUD warung lewat /api/pengelola/warung, menu item lewat /api/pengelola/menu-item */
function KelolaUmkmSection({
  destinationId,
  initialWarungs,
}: {
  destinationId: string;
  initialWarungs: WarungRow[];
}) {
  const [warungs, setWarungs] = useState(initialWarungs);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleAddWarung(values: {
    name: string;
    location: string;
    kategori: string;
    namaPemilik: string;
    fotoUrl: string | null;
    items: { nama: string; harga: number }[];
  }) {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/pengelola/warung", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinationId, ...values }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal menambah UMKM.");
        return;
      }
      setWarungs((prev) => [...prev, data]);
      setShowAddForm(false);
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditWarung(id: string, values: WarungFormValues) {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/pengelola/warung/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal memperbarui UMKM.");
        return;
      }
      setWarungs((prev) =>
        prev.map((w) =>
          w.id === id
            ? {
                ...w,
                name: data.name,
                location: data.location,
                kategori: data.kategori,
                namaPemilik: data.namaPemilik,
                fotoUrl: data.fotoUrl,
              }
            : w
        )
      );
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteWarung(id: string) {
    if (!window.confirm("Hapus UMKM ini beserta semua produknya?")) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/pengelola/warung/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal menghapus UMKM.");
        return;
      }
      setWarungs((prev) => prev.filter((w) => w.id !== id));
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddMenuItem(warungId: string, values: { name: string; price: number }) {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/pengelola/menu-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ warungId, ...values }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal menambah menu.");
        return;
      }
      setWarungs((prev) => prev.map((w) => (w.id === warungId ? { ...w, menuItems: [...w.menuItems, data] } : w)));
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditMenuItem(warungId: string, menuItemId: string, values: { name: string; price: number }) {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/pengelola/menu-item/${menuItemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal memperbarui menu.");
        return;
      }
      setWarungs((prev) =>
        prev.map((w) =>
          w.id === warungId ? { ...w, menuItems: w.menuItems.map((m) => (m.id === menuItemId ? data : m)) } : w
        )
      );
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteMenuItem(warungId: string, menuItemId: string) {
    if (!window.confirm("Hapus menu ini?")) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/pengelola/menu-item/${menuItemId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal menghapus menu.");
        return;
      }
      setWarungs((prev) =>
        prev.map((w) => (w.id === warungId ? { ...w, menuItems: w.menuItems.filter((m) => m.id !== menuItemId) } : w))
      );
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm px-4 py-2.5 rounded-lg" style={{ background: "var(--blusukan-error-container)", color: "var(--blusukan-error)" }}>
          {error}
        </p>
      )}

      {!showAddForm && (
        <button
          type="button"
          id="btn-tambah-warung"
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
          style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
        >
          <Plus size={16} />
          Tambah UMKM Baru
        </button>
      )}

      {showAddForm && (
        <TambahUmkmForm onCancel={() => setShowAddForm(false)} onSubmit={handleAddWarung} submitting={submitting} />
      )}

      {warungs.length === 0 && !showAddForm ? (
        <div
          className="rounded-2xl p-10 flex flex-col items-center text-center"
          style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
        >
          <p className="text-sm font-medium" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Belum ada UMKM yang ditambahkan.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {warungs.map((w) => (
            <WarungCard
              key={w.id}
              warung={w}
              submitting={submitting}
              onEditWarung={(values) => handleEditWarung(w.id, values)}
              onDeleteWarung={() => handleDeleteWarung(w.id)}
              onAddMenuItem={(values) => handleAddMenuItem(w.id, values)}
              onEditMenuItem={(menuItemId, values) => handleEditMenuItem(w.id, menuItemId, values)}
              onDeleteMenuItem={(menuItemId) => handleDeleteMenuItem(w.id, menuItemId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PengelolaDestinasiClient({ destination, initialTransaksis, initialFasilitas, initialWarungs }: Props) {
  const [activeTab, setActiveTab] = useState<"transaksi" | "fasilitas" | "umkm">("transaksi");

  return (
    <div className="min-h-screen" style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-3xl mx-auto px-4 lg:px-8 py-10">
        <Link
          href="/pengelola"
          className="flex items-center gap-1.5 text-sm font-semibold mb-4 hover:opacity-70 transition-opacity"
          style={{ color: "var(--blusukan-primary)" }}
        >
          <ArrowLeft size={16} />
          Kembali ke Dashboard
        </Link>

        <h1
          className="text-2xl font-bold mb-6"
          style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
        >
          {destination.name}
        </h1>

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            id="tab-transaksi"
            onClick={() => setActiveTab("transaksi")}
            className="text-sm font-bold px-4 py-2 rounded-lg transition-colors"
            style={
              activeTab === "transaksi"
                ? { background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }
                : { background: "#ffffff", color: "var(--blusukan-on-surface-variant)", border: "1px solid var(--blusukan-outline-variant)" }
            }
          >
            Transaksi Masuk
          </button>
          <button
            type="button"
            id="tab-fasilitas"
            onClick={() => setActiveTab("fasilitas")}
            className="text-sm font-bold px-4 py-2 rounded-lg transition-colors"
            style={
              activeTab === "fasilitas"
                ? { background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }
                : { background: "#ffffff", color: "var(--blusukan-on-surface-variant)", border: "1px solid var(--blusukan-outline-variant)" }
            }
          >
            Kelola Fasilitas
          </button>
          <button
            type="button"
            id="tab-umkm"
            onClick={() => setActiveTab("umkm")}
            className="text-sm font-bold px-4 py-2 rounded-lg transition-colors"
            style={
              activeTab === "umkm"
                ? { background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }
                : { background: "#ffffff", color: "var(--blusukan-on-surface-variant)", border: "1px solid var(--blusukan-outline-variant)" }
            }
          >
            Kelola UMKM
          </button>
        </div>

        {activeTab === "transaksi" && <TransaksiMasukSection initialTransaksis={initialTransaksis} />}
        {activeTab === "fasilitas" && (
          <KelolaFasilitasSection destinationId={destination.id} initialFasilitas={initialFasilitas} />
        )}
        {activeTab === "umkm" && (
          <KelolaUmkmSection destinationId={destination.id} initialWarungs={initialWarungs} />
        )}
      </div>
    </div>
  );
}
