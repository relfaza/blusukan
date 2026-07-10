"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Ticket, Pencil, Trash2, Plus, X, ImageOff, User, Power, PowerOff } from "lucide-react";
import ConfirmDialog from "@/components/ui/confirm-dialog";
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

type BookingRow = {
  id: string;
  status: string;
  travelDate: string;
  createdAt: string;
  contactNumber: string;
  namaPemesan: string | null;
  service: { providerName: string; serviceType: string };
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
  photoUrls: string[];
  bisaBooking: boolean;
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

const DESTINASI_STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu Persetujuan",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
  NONAKTIF: "Nonaktif",
};

const DESTINASI_STATUS_STYLE: Record<string, { background: string; color: string }> = {
  PENDING: { background: "#fef3e7", color: "#805533" },
  APPROVED: { background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" },
  REJECTED: { background: "var(--blusukan-error-container)", color: "var(--blusukan-error)" },
  NONAKTIF: { background: "#eeeeee", color: "var(--blusukan-on-surface-variant)" },
};

interface Props {
  destination: { id: string; name: string; status: string };
  initialTransaksis: TransaksiRow[];
  initialFasilitas: FasilitasRow[];
  initialWarungs: WarungRow[];
  initialBookings: BookingRow[];
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

const SERVICE_TYPE_LABEL: Record<string, string> = {
  OJEK: "Ojek Lokal",
  JEEP: "Sewa Jeep",
  GUIDE: "Pemandu Wisata",
};

const BOOKING_STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu Konfirmasi",
  CONFIRMED: "Dikonfirmasi",
  COMPLETED: "Selesai",
  EXPIRED: "Ditolak",
};

const BOOKING_STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: "#fef3e7", color: "#805533" },
  CONFIRMED: { bg: "var(--blusukan-primary-container)", color: "#1d4ed8" },
  COMPLETED: { bg: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" },
  EXPIRED: { bg: "#eeeeee", color: "var(--blusukan-on-surface-variant)" },
};

function BookingStatusBadge({ status }: { status: string }) {
  const style = BOOKING_STATUS_STYLE[status] ?? BOOKING_STATUS_STYLE.PENDING;
  return (
    <span
      className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ background: style.bg, color: style.color }}
    >
      {BOOKING_STATUS_LABEL[status] ?? status}
    </span>
  );
}

function formatTanggal(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(iso));
}

/** Section: Booking Transport — list booking jasa lokal + tombol konfirmasi/tolak/selesai */
function BookingTransportSection({ initialBookings }: { initialBookings: BookingRow[] }) {
  const [items, setItems] = useState(initialBookings);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    setError("");
    try {
      const res = await fetch(`/api/pengelola/booking/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal memperbarui status.");
        return;
      }
      setItems((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
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
        <User size={36} style={{ color: "var(--blusukan-outline)" }} className="mb-3" />
        <p className="text-sm font-medium" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Belum ada booking transport untuk destinasi ini.
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
      {items.map((b) => {
        const busy = updatingId === b.id;
        return (
          <div
            key={b.id}
            className="rounded-2xl p-5"
            style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p
                  className="text-sm font-bold"
                  style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
                >
                  {b.namaPemesan ?? "Wisatawan"}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                  {b.service.providerName} · {SERVICE_TYPE_LABEL[b.service.serviceType] ?? b.service.serviceType}
                </p>
              </div>
              <BookingStatusBadge status={b.status} />
            </div>

            <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px dashed var(--blusukan-outline-variant)" }}>
              <div>
                <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                  Tanggal Perjalanan
                </p>
                <p className="text-sm font-semibold" style={{ color: "var(--blusukan-on-surface)" }}>
                  {formatTanggal(b.travelDate)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {b.status === "PENDING" && (
                  <>
                    <button
                      type="button"
                      id={`btn-booking-konfirmasi-${b.id}`}
                      disabled={busy}
                      onClick={() => updateStatus(b.id, "CONFIRMED")}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
                    >
                      Konfirmasi
                    </button>
                    <button
                      type="button"
                      id={`btn-booking-tolak-${b.id}`}
                      disabled={busy}
                      onClick={() => updateStatus(b.id, "EXPIRED")}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ border: "1px solid var(--blusukan-error)", color: "var(--blusukan-error)", background: "#ffffff" }}
                    >
                      Tolak
                    </button>
                  </>
                )}
                {b.status === "CONFIRMED" && (
                  <button
                    type="button"
                    id={`btn-booking-selesai-${b.id}`}
                    disabled={busy}
                    onClick={() => updateStatus(b.id, "COMPLETED")}
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

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  function handleDelete(id: string) {
    setDeleteTargetId(id);
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
  );
}

const UMKM_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const UMKM_PHOTO_MAX_BYTES = 5 * 1024 * 1024; // 5MB
const UMKM_MAX_PHOTOS = 5;

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

type PhotoSlot = { kind: "existing"; url: string } | { kind: "new"; file: File; previewUrl: string };

/**
 * Input upload multi-foto (maks 5) dengan preview + hapus per foto — pola sama persis
 * dengan form Ajukan Destinasi Baru: file dipilih & di-preview lokal dulu, upload sungguhan
 * ke Cloudinary baru terjadi saat form displit (lihat uploadAllPhotos di pemanggil).
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
                style={{ background: "rgba(0,0,0,0.6)", color: "#ffffff" }}
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

/** Upload semua foto baru (File) ke Cloudinary, gabungkan dengan foto lama yang dipertahankan → array URL final */
async function uploadAllPhotos(
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

type WarungFormValues = {
  name: string;
  location: string;
  kategori: string;
  namaPemilik: string;
  photoUrls: string[];
  bisaBooking: boolean;
};

type ProdukDraft = { key: number; nama: string; harga: number | "" };

/**
 * Form UMKM terpadu — dipakai untuk tambah UMKM baru (menyertakan minimal 1 produk sekaligus)
 * maupun edit UMKM yang sudah ada (produk dikelola terpisah lewat "Tambah Menu" di card).
 */
function UmkmForm({
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
    background: "#ffffff",
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
      <UmkmForm
        mode="edit"
        initial={{
          name: warung.name,
          location: warung.location,
          kategori: warung.kategori,
          namaPemilik: warung.namaPemilik,
          photoUrls: warung.photoUrls,
          bisaBooking: warung.bisaBooking,
        }}
        onCancel={() => setIsEditingWarung(false)}
        onSubmit={({ items: _items, ...values }) => {
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
            {warung.photoUrls[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={warung.photoUrls[0]} alt={warung.name} className="w-full h-full object-cover" />
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
  const [deleteWarungTargetId, setDeleteWarungTargetId] = useState<string | null>(null);
  const [deleteMenuTarget, setDeleteMenuTarget] = useState<{ warungId: string; menuItemId: string } | null>(null);

  async function handleAddWarung(values: {
    name: string;
    location: string;
    kategori: string;
    namaPemilik: string;
    photoUrls: string[];
    bisaBooking: boolean;
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
                photoUrls: data.photoUrls,
                bisaBooking: data.bisaBooking,
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

  function handleDeleteWarung(id: string) {
    setDeleteWarungTargetId(id);
  }

  async function confirmDeleteWarung() {
    const id = deleteWarungTargetId;
    if (!id) return;
    setDeleteWarungTargetId(null);
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

  function handleDeleteMenuItem(warungId: string, menuItemId: string) {
    setDeleteMenuTarget({ warungId, menuItemId });
  }

  async function confirmDeleteMenuItem() {
    const target = deleteMenuTarget;
    if (!target) return;
    const { warungId, menuItemId } = target;
    setDeleteMenuTarget(null);
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
        <UmkmForm mode="create" onCancel={() => setShowAddForm(false)} onSubmit={handleAddWarung} submitting={submitting} />
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

      <ConfirmDialog
        open={deleteWarungTargetId !== null}
        title="Hapus UMKM"
        message="Hapus UMKM ini beserta semua produknya? Tindakan ini tidak bisa dibatalkan."
        confirmLabel="Ya, Hapus"
        isDestructive
        onConfirm={confirmDeleteWarung}
        onCancel={() => setDeleteWarungTargetId(null)}
      />
      <ConfirmDialog
        open={deleteMenuTarget !== null}
        title="Hapus Menu"
        message="Hapus menu ini? Tindakan ini tidak bisa dibatalkan."
        confirmLabel="Ya, Hapus"
        isDestructive
        onConfirm={confirmDeleteMenuItem}
        onCancel={() => setDeleteMenuTarget(null)}
      />
    </div>
  );
}

/** Tombol Edit Destinasi + toggle Aktifkan/Nonaktifkan — hanya untuk destinasi APPROVED/NONAKTIF (PENDING/REJECTED murni wewenang Admin) */
function DestinasiStatusActions({ destinationId, status }: { destinationId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const isNonaktif = status === "NONAKTIF";
  const canToggle = status === "APPROVED" || status === "NONAKTIF";
  const [confirmOpen, setConfirmOpen] = useState(false);

  const confirmMessage = isNonaktif
    ? "Yakin ingin mengaktifkan kembali destinasi ini? Destinasi akan tampil lagi di pencarian publik."
    : "Yakin ingin menonaktifkan? Destinasi tidak akan tampil di pencarian publik sampai diaktifkan kembali.";

  async function performToggleStatus() {
    setConfirmOpen(false);
    const nextStatus = isNonaktif ? "APPROVED" : "NONAKTIF";

    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/pengelola/destinasi/${destinationId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal memperbarui status destinasi.");
        return;
      }
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2 shrink-0">
      <div className="flex items-center gap-2">
        <Link
          href={`/pengelola/destinasi/${destinationId}/edit`}
          id="btn-edit-destinasi"
          className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
          style={{ background: "#ffffff", color: "var(--blusukan-on-surface-variant)", border: "1px solid var(--blusukan-outline-variant)" }}
        >
          <Pencil size={14} />
          Edit Destinasi
        </Link>
        {canToggle && (
          <button
            type="button"
            id="btn-toggle-status-destinasi"
            onClick={() => setConfirmOpen(true)}
            disabled={busy}
            className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50"
            style={
              isNonaktif
                ? { background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }
                : { border: "1px solid var(--blusukan-error)", color: "var(--blusukan-error)", background: "#ffffff" }
            }
          >
            {isNonaktif ? <Power size={14} /> : <PowerOff size={14} />}
            {isNonaktif ? "Aktifkan Kembali" : "Nonaktifkan Destinasi"}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs" style={{ color: "var(--blusukan-error)" }}>
          {error}
        </p>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={isNonaktif ? "Aktifkan Kembali Destinasi" : "Nonaktifkan Destinasi"}
        message={confirmMessage}
        confirmLabel={isNonaktif ? "Ya, Aktifkan" : "Ya, Nonaktifkan"}
        isDestructive={false}
        onConfirm={performToggleStatus}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

export default function PengelolaDestinasiClient({ destination, initialTransaksis, initialFasilitas, initialWarungs, initialBookings }: Props) {
  const [activeTab, setActiveTab] = useState<"transaksi" | "fasilitas" | "umkm" | "booking">("transaksi");

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

        <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
            >
              {destination.name}
            </h1>
            <span
              className="inline-block text-xs font-bold px-2.5 py-1 rounded-full mt-2"
              style={DESTINASI_STATUS_STYLE[destination.status] ?? DESTINASI_STATUS_STYLE.PENDING}
            >
              {DESTINASI_STATUS_LABEL[destination.status] ?? destination.status}
            </span>
          </div>
          <DestinasiStatusActions destinationId={destination.id} status={destination.status} />
        </div>

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
          <button
            type="button"
            id="tab-booking"
            onClick={() => setActiveTab("booking")}
            className="text-sm font-bold px-4 py-2 rounded-lg transition-colors"
            style={
              activeTab === "booking"
                ? { background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }
                : { background: "#ffffff", color: "var(--blusukan-on-surface-variant)", border: "1px solid var(--blusukan-outline-variant)" }
            }
          >
            Booking Transport
          </button>
        </div>

        {activeTab === "transaksi" && <TransaksiMasukSection initialTransaksis={initialTransaksis} />}
        {activeTab === "fasilitas" && (
          <KelolaFasilitasSection destinationId={destination.id} initialFasilitas={initialFasilitas} />
        )}
        {activeTab === "umkm" && (
          <KelolaUmkmSection destinationId={destination.id} initialWarungs={initialWarungs} />
        )}
        {activeTab === "booking" && <BookingTransportSection initialBookings={initialBookings} />}
      </div>
    </div>
  );
}
