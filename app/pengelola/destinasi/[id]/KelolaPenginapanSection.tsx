"use client";

import { useEffect, useState } from "react";
import { BedDouble, Plus, Trash2, Loader2, MapPin, Phone } from "lucide-react";

type Penginapan = {
  id: string;
  nama: string;
  jarakKm: number;
  estimasiHarga: number;
  kontak: string;
  createdAt: string;
};

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

const inputStyle: React.CSSProperties = {
  border: "1px solid var(--blusukan-outline-variant)",
  borderRadius: "8px",
  background: "var(--blusukan-surface)",
  color: "var(--blusukan-on-surface)",
  fontFamily: "Inter, sans-serif",
};

/** Section "Kelola Data Penginapan Sekitar" — CRUD data penginapan manual (representasi data Pokdarwis). */
export default function KelolaPenginapanSection({ destinationId }: { destinationId: string }) {
  const [items, setItems] = useState<Penginapan[] | null>(null);
  const [loadError, setLoadError] = useState("");

  const [nama, setNama] = useState("");
  const [jarakKm, setJarakKm] = useState("");
  const [estimasiHarga, setEstimasiHarga] = useState("");
  const [kontak, setKontak] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/pengelola/penginapan?destinationId=${encodeURIComponent(destinationId)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error())))
      .then((data) => {
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Gagal memuat data penginapan.");
      });
    return () => {
      cancelled = true;
    };
  }, [destinationId]);

  async function handleAdd() {
    setFormError("");
    const jarak = Number(jarakKm);
    const harga = Number(estimasiHarga);
    if (!nama.trim()) return setFormError("Nama penginapan wajib diisi.");
    if (!kontak.trim()) return setFormError("Kontak wajib diisi.");
    if (!Number.isFinite(jarak) || jarak < 0) return setFormError("Jarak (km) harus angka ≥ 0.");
    if (!Number.isFinite(harga) || harga < 0) return setFormError("Estimasi harga harus angka ≥ 0.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/pengelola/penginapan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinationId, nama: nama.trim(), jarakKm: jarak, estimasiHarga: harga, kontak: kontak.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.message || "Gagal menyimpan. Coba lagi.");
        return;
      }
      setItems((prev) => [data as Penginapan, ...(prev ?? [])]);
      setNama("");
      setJarakKm("");
      setEstimasiHarga("");
      setKontak("");
    } catch {
      setFormError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Hapus data penginapan ini?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/pengelola/penginapan?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) setItems((prev) => (prev ?? []).filter((p) => p.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: "var(--blusukan-surface-container-lowest)", border: "1px solid var(--blusukan-outline-variant)" }}
    >
      <h2
        className="flex items-center gap-2 text-base font-extrabold mb-1"
        style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
      >
        <BedDouble size={18} />
        Kelola Data Penginapan Sekitar
      </h2>
      <p className="text-sm mb-5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
        Data penginapan/homestay di sekitar destinasi (input manual Pokdarwis). Dipakai untuk rekomendasi AI ke wisatawan.
      </p>

      {/* Form tambah */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div className="sm:col-span-2">
          <label htmlFor="penginapan-nama" className="block text-xs font-medium mb-1" style={{ color: "var(--blusukan-outline)" }}>
            Nama Penginapan
          </label>
          <input
            id="penginapan-nama"
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Homestay Melati"
            className="w-full px-3 py-2 text-sm focus:outline-none"
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="penginapan-jarak" className="block text-xs font-medium mb-1" style={{ color: "var(--blusukan-outline)" }}>
            Jarak (km)
          </label>
          <input
            id="penginapan-jarak"
            type="number"
            min={0}
            step="0.1"
            value={jarakKm}
            onChange={(e) => setJarakKm(e.target.value)}
            placeholder="1.5"
            className="w-full px-3 py-2 text-sm focus:outline-none"
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="penginapan-harga" className="block text-xs font-medium mb-1" style={{ color: "var(--blusukan-outline)" }}>
            Estimasi Harga / malam (Rp)
          </label>
          <input
            id="penginapan-harga"
            type="number"
            min={0}
            step="1000"
            value={estimasiHarga}
            onChange={(e) => setEstimasiHarga(e.target.value)}
            placeholder="150000"
            className="w-full px-3 py-2 text-sm focus:outline-none"
            style={inputStyle}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="penginapan-kontak" className="block text-xs font-medium mb-1" style={{ color: "var(--blusukan-outline)" }}>
            Kontak (WA / telepon)
          </label>
          <input
            id="penginapan-kontak"
            type="text"
            value={kontak}
            onChange={(e) => setKontak(e.target.value)}
            placeholder="08123456789"
            className="w-full px-3 py-2 text-sm focus:outline-none"
            style={inputStyle}
          />
        </div>
      </div>

      {formError && (
        <p className="text-xs mb-3" style={{ color: "var(--blusukan-error)" }}>
          {formError}
        </p>
      )}

      <button
        type="button"
        id="btn-tambah-penginapan"
        onClick={handleAdd}
        disabled={submitting}
        className="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
      >
        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
        Tambah Penginapan
      </button>

      {/* Daftar */}
      <div className="mt-6">
        {loadError ? (
          <p className="text-sm" style={{ color: "var(--blusukan-error)" }}>
            {loadError}
          </p>
        ) : items === null ? (
          <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Memuat…
          </p>
        ) : items.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Belum ada data penginapan. Tambahkan minimal satu agar rekomendasi AI bisa muncul di halaman wisatawan.
          </p>
        ) : (
          <div className="space-y-2">
            {items.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-xl p-3"
                style={{ border: "1px solid var(--blusukan-outline-variant)", background: "var(--blusukan-surface-low)" }}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold truncate" style={{ color: "var(--blusukan-on-surface)" }}>
                    {p.nama}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-0.5 text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} /> {p.jarakKm} km
                    </span>
                    <span className="font-semibold" style={{ color: "var(--blusukan-primary)" }}>
                      {formatRupiah(p.estimasiHarga)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Phone size={12} /> {p.kontak}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id)}
                  disabled={deletingId === p.id}
                  aria-label={`Hapus ${p.nama}`}
                  className="w-9 h-9 flex items-center justify-center rounded-lg shrink-0 transition-colors hover:bg-[var(--blusukan-error-container)] disabled:opacity-50"
                  style={{ color: "var(--blusukan-error)" }}
                >
                  {deletingId === p.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
