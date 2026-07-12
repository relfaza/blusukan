"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ImageOff, MapPin, Pencil, Plus, Trash2, X } from "lucide-react";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import FasilitasForm, { type FasilitasFormValues } from "@/components/pengelola/fasilitas-form";

type FasilitasRow = {
  id: string;
  destinationId: string;
  nama: string;
  hargaSewa: number;
  satuanWaktu: string;
  jumlahUnit: number;
  lokasiDalamDestinasi: string | null;
  deskripsiManfaat: string | null;
  fotoUrl: string | null;
};

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

/** Modal generik — overlay + card putih, dipakai untuk form tambah/edit fasilitas */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-surface-container-lowest)" }}>
            {title}
          </h2>
          <button
            type="button"
            id="btn-tutup-modal-fasilitas"
            onClick={onClose}
            aria-label="Tutup"
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.15)", color: "var(--blusukan-surface-container-lowest)" }}
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Card satu fasilitas — foto, info, tombol edit/hapus */
function FasilitasCard({
  fasilitas,
  onEdit,
  onDelete,
}: {
  fasilitas: FasilitasRow;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--blusukan-surface-container-lowest)", border: "1px solid var(--blusukan-outline-variant)" }}
    >
      <div className="w-full aspect-video" style={{ background: "var(--blusukan-surface-container-highest)" }}>
        {fasilitas.fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={fasilitas.fotoUrl} alt={fasilitas.nama} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(45,90,39,0.15) 0%, rgba(21,66,18,0.25) 100%)" }}
          >
            <ImageOff size={28} style={{ color: "rgba(21,66,18,0.35)" }} />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <p className="text-sm font-bold" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}>
            {fasilitas.nama}
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              id={`btn-edit-fasilitas-${fasilitas.id}`}
              onClick={onEdit}
              aria-label={`Edit ${fasilitas.nama}`}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--blusukan-surface-container)]"
              style={{ border: "1px solid var(--blusukan-outline-variant)", color: "var(--blusukan-on-surface-variant)" }}
            >
              <Pencil size={12} />
            </button>
            <button
              type="button"
              id={`btn-hapus-fasilitas-${fasilitas.id}`}
              onClick={onDelete}
              aria-label={`Hapus ${fasilitas.nama}`}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--blusukan-error-container)]"
              style={{ border: "1px solid var(--blusukan-error)", color: "var(--blusukan-error)" }}
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        <p className="text-sm font-bold mb-1" style={{ color: "var(--blusukan-primary)" }}>
          {formatRupiah(fasilitas.hargaSewa)} <span className="font-normal" style={{ color: "var(--blusukan-on-surface-variant)" }}>/ {fasilitas.satuanWaktu}</span>
        </p>
        <p className="text-xs mb-2" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          {fasilitas.jumlahUnit} unit tersedia
        </p>

        {fasilitas.lokasiDalamDestinasi && (
          <p className="text-xs flex items-center gap-1 mb-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            <MapPin size={11} />
            {fasilitas.lokasiDalamDestinasi}
          </p>
        )}
        {fasilitas.deskripsiManfaat && (
          <p className="text-xs italic" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            &ldquo;{fasilitas.deskripsiManfaat}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}

interface Props {
  destinationId: string;
  destinationName: string;
  initialFasilitas: FasilitasRow[];
}

export default function FasilitasLengkapClient({ destinationId, destinationName, initialFasilitas }: Props) {
  const [items, setItems] = useState(initialFasilitas);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const totalFasilitas = items.length;
  const totalNilaiSewa = items.reduce((sum, f) => sum + f.hargaSewa, 0);
  const editingItem = editingId ? items.find((f) => f.id === editingId) ?? null : null;

  async function handleAdd(values: FasilitasFormValues) {
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
      setShowAddModal(false);
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(id: string, values: FasilitasFormValues) {
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

  async function confirmDelete() {
    const id = deleteTargetId;
    if (!id) return;
    setDeleteTargetId(null);
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
    <div className="min-h-screen" style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10">
        <Link
          href={`/pengelola/destinasi/${destinationId}`}
          id="btn-kembali-fasilitas-lengkap"
          className="flex items-center gap-1.5 text-sm font-semibold mb-4 hover:opacity-70 transition-opacity"
          style={{ color: "var(--blusukan-primary)" }}
        >
          <ArrowLeft size={16} />
          Kembali ke Detail Destinasi
        </Link>

        <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
            >
              Kelola Fasilitas
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              {destinationName}
            </p>
          </div>
          <button
            type="button"
            id="btn-tambah-fasilitas-baru"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-lg transition-opacity hover:opacity-90"
            style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
          >
            <Plus size={16} />
            Tambah Fasilitas Baru
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 max-w-md">
          <div
            className="rounded-2xl p-5"
            style={{ background: "var(--blusukan-surface-container-lowest)", border: "1px solid var(--blusukan-outline-variant)" }}
          >
            <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Total Fasilitas
            </p>
            <p
              className="text-xl font-bold mt-0.5"
              style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
            >
              {totalFasilitas}
            </p>
          </div>
          <div
            className="rounded-2xl p-5"
            style={{ background: "var(--blusukan-surface-container-lowest)", border: "1px solid var(--blusukan-outline-variant)" }}
          >
            <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Total Nilai Sewa
            </p>
            <p
              className="text-xl font-bold mt-0.5"
              style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-primary)" }}
            >
              {formatRupiah(totalNilaiSewa)}
            </p>
          </div>
        </div>

        {error && (
          <p
            className="text-sm px-4 py-2.5 rounded-lg mb-4"
            style={{ background: "var(--blusukan-error-container)", color: "var(--blusukan-error)" }}
          >
            {error}
          </p>
        )}

        {items.length === 0 ? (
          <div
            className="rounded-2xl p-10 flex flex-col items-center text-center"
            style={{ background: "var(--blusukan-surface-container-lowest)", border: "1px solid var(--blusukan-outline-variant)" }}
          >
            <p className="text-sm font-medium" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Belum ada fasilitas yang ditambahkan.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((f) => (
              <FasilitasCard
                key={f.id}
                fasilitas={f}
                onEdit={() => setEditingId(f.id)}
                onDelete={() => setDeleteTargetId(f.id)}
              />
            ))}
          </div>
        )}

        {showAddModal && (
          <Modal title="Tambah Fasilitas Baru" onClose={() => setShowAddModal(false)}>
            <FasilitasForm onCancel={() => setShowAddModal(false)} onSubmit={handleAdd} submitting={submitting} />
          </Modal>
        )}

        {editingItem && (
          <Modal title={`Edit ${editingItem.nama}`} onClose={() => setEditingId(null)}>
            <FasilitasForm
              initial={editingItem}
              onCancel={() => setEditingId(null)}
              onSubmit={(values) => handleEdit(editingItem.id, values)}
              submitting={submitting}
            />
          </Modal>
        )}

        <ConfirmDialog
          open={deleteTargetId !== null}
          title="Hapus Fasilitas"
          message="Hapus fasilitas ini? Tindakan ini tidak bisa dibatalkan."
          confirmLabel="Ya, Hapus"
          isDestructive
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTargetId(null)}
        />
      </div>
    </div>
  );
}
