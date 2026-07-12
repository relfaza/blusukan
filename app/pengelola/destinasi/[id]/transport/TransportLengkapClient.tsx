"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bike, Car, Compass, ImageOff, Pencil, Plus, Trash2, User, X } from "lucide-react";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import RupiahInput from "@/components/ui/rupiah-input";
import JasaTransportForm, {
  SERVICE_TYPE_LABEL,
  type JasaTransportFormValues,
} from "@/components/pengelola/jasa-transport-form";

type TitikJemputRow = {
  id: string;
  serviceId: string;
  namaLokasi: string;
  hargaTambahan: number;
  estimasiWaktu: string | null;
};

type BookingRow = {
  id: string;
  status: string;
  travelDate: string;
  createdAt: string;
  contactNumber: string;
  namaPemesan: string;
};

type ServiceRow = {
  id: string;
  destinationId: string;
  providerName: string;
  serviceType: string;
  contactWa: string;
  baseRate: number;
  kapasitasPenumpang: number | null;
  fotoUrl: string | null;
  isValidated: boolean;
  titikJemput: TitikJemputRow[];
  bookings: BookingRow[];
};

const SERVICE_TYPE_ICON: Record<string, React.ReactNode> = {
  OJEK: <Bike size={13} />,
  JEEP: <Car size={13} />,
  GUIDE: <Compass size={13} />,
};

const BOOKING_STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu Konfirmasi",
  CONFIRMED: "Dikonfirmasi",
  COMPLETED: "Selesai",
  EXPIRED: "Ditolak",
};

const BOOKING_STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: "var(--blusukan-secondary-container)", color: "var(--blusukan-secondary)" },
  CONFIRMED: { bg: "var(--blusukan-primary-container)", color: "#1d4ed8" },
  COMPLETED: { bg: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" },
  EXPIRED: { bg: "var(--blusukan-surface-container)", color: "var(--blusukan-on-surface-variant)" },
};

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatTanggal(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(iso));
}

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

/** Modal generik — overlay + card, dipakai untuk form tambah/edit jasa transport */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md my-auto rounded-2xl p-6"
        style={{ background: "var(--blusukan-surface)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--blusukan-surface-container)]"
            style={{ color: "var(--blusukan-on-surface-variant)" }}
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Form tambah/edit satu titik jemput — dipakai inline di dalam card jasa transport */
function TitikJemputForm({
  initial,
  onCancel,
  onSubmit,
  submitting,
}: {
  initial?: { namaLokasi: string; hargaTambahan: number; estimasiWaktu: string | null };
  onCancel: () => void;
  onSubmit: (values: { namaLokasi: string; hargaTambahan: number; estimasiWaktu: string | null }) => void;
  submitting: boolean;
}) {
  const [namaLokasi, setNamaLokasi] = useState(initial?.namaLokasi ?? "");
  const [hargaTambahan, setHargaTambahan] = useState<number | "">(initial ? initial.hargaTambahan : "");
  const [estimasiWaktu, setEstimasiWaktu] = useState(initial?.estimasiWaktu ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      namaLokasi: namaLokasi.trim(),
      hargaTambahan: hargaTambahan === "" ? 0 : Number(hargaTambahan),
      estimasiWaktu: estimasiWaktu.trim() === "" ? null : estimasiWaktu.trim(),
    });
  }

  const inputStyle: React.CSSProperties = {
    border: "1px solid var(--blusukan-outline-variant)",
    borderRadius: "8px",
    background: "var(--blusukan-surface-container-lowest)",
    color: "var(--blusukan-on-surface)",
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl p-3 space-y-2"
      style={{ background: "var(--blusukan-surface)", border: "1px solid var(--blusukan-outline-variant)" }}
    >
      <input
        required
        value={namaLokasi}
        onChange={(e) => setNamaLokasi(e.target.value)}
        placeholder="Contoh: Bandara Adisutjipto"
        className="w-full px-3 py-2 text-sm"
        style={inputStyle}
      />
      <div className="grid grid-cols-2 gap-2">
        <RupiahInput
          value={hargaTambahan}
          onChange={setHargaTambahan}
          placeholder="Harga tambahan"
          className="w-full pl-9 pr-3 py-2 text-sm"
          style={inputStyle}
        />
        <input
          value={estimasiWaktu}
          onChange={(e) => setEstimasiWaktu(e.target.value)}
          placeholder="Estimasi waktu (opsional)"
          className="w-full px-3 py-2 text-sm"
          style={inputStyle}
        />
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

/** Sub-section: Titik Jemput — list + tambah/edit/hapus, di dalam card jasa transport */
function TitikJemputSection({
  serviceId,
  titikJemput,
  submitting,
  onAdd,
  onEdit,
  onDelete,
}: {
  serviceId: string;
  titikJemput: TitikJemputRow[];
  submitting: boolean;
  onAdd: (values: { namaLokasi: string; hargaTambahan: number; estimasiWaktu: string | null }) => void;
  onEdit: (id: string, values: { namaLokasi: string; hargaTambahan: number; estimasiWaktu: string | null }) => void;
  onDelete: (id: string) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="pt-3 mt-3" style={{ borderTop: "1px dashed var(--blusukan-outline-variant)" }}>
      <p className="text-xs font-bold mb-2" style={{ color: "var(--blusukan-on-surface)" }}>
        Titik Jemput
      </p>

      {titikJemput.length === 0 && !showAdd && (
        <p className="text-xs mb-2" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Belum ada titik jemput terdaftar.
        </p>
      )}

      <div className="space-y-2 mb-2">
        {titikJemput.map((t) =>
          editingId === t.id ? (
            <TitikJemputForm
              key={t.id}
              initial={t}
              onCancel={() => setEditingId(null)}
              onSubmit={(values) => {
                onEdit(t.id, values);
                setEditingId(null);
              }}
              submitting={submitting}
            />
          ) : (
            <div key={t.id} className="flex items-center justify-between gap-2 px-1">
              <div className="min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: "var(--blusukan-on-surface)" }}>
                  {t.namaLokasi}
                  {t.hargaTambahan > 0 && (
                    <span style={{ color: "var(--blusukan-primary)" }}> · +{formatRupiah(t.hargaTambahan)}</span>
                  )}
                </p>
                {t.estimasiWaktu && (
                  <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                    {t.estimasiWaktu}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingId(t.id)}
                  aria-label={`Edit ${t.namaLokasi}`}
                  className="w-6 h-6 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--blusukan-surface-container)]"
                  style={{ color: "var(--blusukan-on-surface-variant)" }}
                >
                  <Pencil size={11} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(t.id)}
                  disabled={submitting}
                  aria-label={`Hapus ${t.namaLokasi}`}
                  className="w-6 h-6 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--blusukan-error-container)] disabled:opacity-50"
                  style={{ color: "var(--blusukan-error)" }}
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {showAdd ? (
        <TitikJemputForm
          onCancel={() => setShowAdd(false)}
          onSubmit={(values) => {
            onAdd(values);
            setShowAdd(false);
          }}
          submitting={submitting}
        />
      ) : (
        <button
          type="button"
          id={`btn-tambah-titik-jemput-${serviceId}`}
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1 text-xs font-bold hover:opacity-80 transition-opacity"
          style={{ color: "var(--blusukan-primary)" }}
        >
          <Plus size={13} />
          Tambah Titik Jemput
        </button>
      )}
    </div>
  );
}

/** Sub-section: Booking Masuk — list booking wisatawan untuk jasa ini + tombol konfirmasi/tolak/selesai */
function BookingMasukSection({
  bookings,
  submitting,
  onUpdateStatus,
}: {
  bookings: BookingRow[];
  submitting: boolean;
  onUpdateStatus: (id: string, status: string) => void;
}) {
  if (bookings.length === 0) return null;

  return (
    <div className="pt-3 mt-3" style={{ borderTop: "1px dashed var(--blusukan-outline-variant)" }}>
      <p className="text-xs font-bold mb-2" style={{ color: "var(--blusukan-on-surface)" }}>
        Booking Masuk ({bookings.length})
      </p>
      <div className="space-y-2">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="rounded-xl p-3"
            style={{ background: "var(--blusukan-surface)", border: "1px solid var(--blusukan-outline-variant)" }}
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div>
                <p className="text-xs font-bold" style={{ color: "var(--blusukan-on-surface)" }}>
                  {b.namaPemesan}
                </p>
                <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                  {formatTanggal(b.travelDate)}
                </p>
              </div>
              <BookingStatusBadge status={b.status} />
            </div>
            <div className="flex items-center gap-2">
              {b.status === "PENDING" && (
                <>
                  <button
                    type="button"
                    id={`btn-booking-konfirmasi-${b.id}`}
                    disabled={submitting}
                    onClick={() => onUpdateStatus(b.id, "CONFIRMED")}
                    className="text-xs font-bold px-2.5 py-1 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
                  >
                    Konfirmasi
                  </button>
                  <button
                    type="button"
                    id={`btn-booking-tolak-${b.id}`}
                    disabled={submitting}
                    onClick={() => onUpdateStatus(b.id, "EXPIRED")}
                    className="text-xs font-bold px-2.5 py-1 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ border: "1px solid var(--blusukan-error)", color: "var(--blusukan-error)", background: "var(--blusukan-surface-container-lowest)" }}
                  >
                    Tolak
                  </button>
                </>
              )}
              {b.status === "CONFIRMED" && (
                <button
                  type="button"
                  id={`btn-booking-selesai-${b.id}`}
                  disabled={submitting}
                  onClick={() => onUpdateStatus(b.id, "COMPLETED")}
                  className="text-xs font-bold px-2.5 py-1 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
                >
                  Tandai Selesai
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Card satu jasa transport: info lengkap + titik jemput + booking masuk */
function ServiceCard({
  service,
  submitting,
  onEdit,
  onDelete,
  onAddTitikJemput,
  onEditTitikJemput,
  onDeleteTitikJemput,
  onUpdateBookingStatus,
}: {
  service: ServiceRow;
  submitting: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAddTitikJemput: (values: { namaLokasi: string; hargaTambahan: number; estimasiWaktu: string | null }) => void;
  onEditTitikJemput: (id: string, values: { namaLokasi: string; hargaTambahan: number; estimasiWaktu: string | null }) => void;
  onDeleteTitikJemput: (id: string) => void;
  onUpdateBookingStatus: (id: string, status: string) => void;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--blusukan-surface-container-lowest)", border: "1px solid var(--blusukan-outline-variant)" }}
    >
      <div className="w-full aspect-video" style={{ background: "var(--blusukan-surface-container-highest)" }}>
        {service.fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={service.fotoUrl} alt={service.providerName} className="w-full h-full object-cover" />
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
            {service.providerName}
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              id={`btn-edit-transport-${service.id}`}
              onClick={onEdit}
              aria-label={`Edit ${service.providerName}`}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--blusukan-surface-container)]"
              style={{ border: "1px solid var(--blusukan-outline-variant)", color: "var(--blusukan-on-surface-variant)" }}
            >
              <Pencil size={12} />
            </button>
            <button
              type="button"
              id={`btn-hapus-transport-${service.id}`}
              onClick={onDelete}
              disabled={submitting}
              aria-label={`Hapus ${service.providerName}`}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--blusukan-error-container)] disabled:opacity-50"
              style={{ border: "1px solid var(--blusukan-error)", color: "var(--blusukan-error)" }}
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap"
            style={{ background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }}
          >
            {SERVICE_TYPE_ICON[service.serviceType]}
            {SERVICE_TYPE_LABEL[service.serviceType] ?? service.serviceType}
          </span>
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
            style={
              service.isValidated
                ? { background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }
                : { background: "var(--blusukan-secondary-container)", color: "var(--blusukan-secondary)" }
            }
          >
            {service.isValidated ? "Tervalidasi" : "Menunggu Validasi Admin"}
          </span>
        </div>

        <p className="text-sm font-bold mb-1" style={{ color: "var(--blusukan-primary)" }}>
          {formatRupiah(service.baseRate)} <span className="font-normal" style={{ color: "var(--blusukan-on-surface-variant)" }}>tarif dasar</span>
        </p>
        <p className="text-xs mb-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          WA: {service.contactWa}
        </p>
        {service.kapasitasPenumpang != null && (
          <p className="text-xs flex items-center gap-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            <User size={11} />
            Kapasitas {service.kapasitasPenumpang} penumpang
          </p>
        )}

        <TitikJemputSection
          serviceId={service.id}
          titikJemput={service.titikJemput}
          submitting={submitting}
          onAdd={onAddTitikJemput}
          onEdit={onEditTitikJemput}
          onDelete={onDeleteTitikJemput}
        />

        <BookingMasukSection
          bookings={service.bookings}
          submitting={submitting}
          onUpdateStatus={onUpdateBookingStatus}
        />
      </div>
    </div>
  );
}

interface Props {
  destinationId: string;
  destinationName: string;
  initialServices: ServiceRow[];
}

export default function TransportLengkapClient({ destinationId, destinationName, initialServices }: Props) {
  const [services, setServices] = useState(initialServices);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const editingService = editingId ? services.find((s) => s.id === editingId) ?? null : null;

  async function handleAdd(values: JasaTransportFormValues) {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/pengelola/jasa-transport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinationId, ...values }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal menambah jasa transport.");
        return;
      }
      setServices((prev) => [...prev, { ...data, bookings: [] }]);
      setShowAddModal(false);
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(id: string, values: JasaTransportFormValues) {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/pengelola/jasa-transport/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal memperbarui jasa transport.");
        return;
      }
      setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...data, bookings: s.bookings } : s)));
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
      const res = await fetch(`/api/pengelola/jasa-transport/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal menghapus jasa transport.");
        return;
      }
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddTitikJemput(
    serviceId: string,
    values: { namaLokasi: string; hargaTambahan: number; estimasiWaktu: string | null }
  ) {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/pengelola/titik-jemput", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, ...values }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal menambah titik jemput.");
        return;
      }
      setServices((prev) =>
        prev.map((s) => (s.id === serviceId ? { ...s, titikJemput: [...s.titikJemput, data] } : s))
      );
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditTitikJemput(
    serviceId: string,
    id: string,
    values: { namaLokasi: string; hargaTambahan: number; estimasiWaktu: string | null }
  ) {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/pengelola/titik-jemput/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal memperbarui titik jemput.");
        return;
      }
      setServices((prev) =>
        prev.map((s) =>
          s.id === serviceId
            ? { ...s, titikJemput: s.titikJemput.map((t) => (t.id === id ? data : t)) }
            : s
        )
      );
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteTitikJemput(serviceId: string, id: string) {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/pengelola/titik-jemput/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal menghapus titik jemput.");
        return;
      }
      setServices((prev) =>
        prev.map((s) => (s.id === serviceId ? { ...s, titikJemput: s.titikJemput.filter((t) => t.id !== id) } : s))
      );
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateBookingStatus(serviceId: string, id: string, status: string) {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/pengelola/booking/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal memperbarui status booking.");
        return;
      }
      setServices((prev) =>
        prev.map((s) =>
          s.id === serviceId ? { ...s, bookings: s.bookings.map((b) => (b.id === id ? { ...b, status } : b)) } : s
        )
      );
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
          id="btn-kembali-transport-lengkap"
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
              Kelola Transportasi
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              {destinationName}
            </p>
          </div>
          <button
            type="button"
            id="btn-tambah-transport-baru"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-lg transition-opacity hover:opacity-90"
            style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
          >
            <Plus size={16} />
            Tambah Jasa Transport Baru
          </button>
        </div>

        <div className="mb-6 max-w-xs">
          <div
            className="rounded-2xl p-5"
            style={{ background: "var(--blusukan-surface-container-lowest)", border: "1px solid var(--blusukan-outline-variant)" }}
          >
            <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Total Jasa Transport
            </p>
            <p
              className="text-xl font-bold mt-0.5"
              style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
            >
              {services.length}
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

        {services.length === 0 ? (
          <div
            className="rounded-2xl p-10 flex flex-col items-center text-center"
            style={{ background: "var(--blusukan-surface-container-lowest)", border: "1px solid var(--blusukan-outline-variant)" }}
          >
            <p className="text-sm font-medium" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Belum ada jasa transport yang ditambahkan.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((s) => (
              <ServiceCard
                key={s.id}
                service={s}
                submitting={submitting}
                onEdit={() => setEditingId(s.id)}
                onDelete={() => setDeleteTargetId(s.id)}
                onAddTitikJemput={(values) => handleAddTitikJemput(s.id, values)}
                onEditTitikJemput={(id, values) => handleEditTitikJemput(s.id, id, values)}
                onDeleteTitikJemput={(id) => handleDeleteTitikJemput(s.id, id)}
                onUpdateBookingStatus={(id, status) => handleUpdateBookingStatus(s.id, id, status)}
              />
            ))}
          </div>
        )}

        {showAddModal && (
          <Modal title="Tambah Jasa Transport Baru" onClose={() => setShowAddModal(false)}>
            <JasaTransportForm onCancel={() => setShowAddModal(false)} onSubmit={handleAdd} submitting={submitting} />
          </Modal>
        )}

        {editingService && (
          <Modal title={`Edit ${editingService.providerName}`} onClose={() => setEditingId(null)}>
            <JasaTransportForm
              initial={editingService}
              onCancel={() => setEditingId(null)}
              onSubmit={(values) => handleEdit(editingService.id, values)}
              submitting={submitting}
            />
          </Modal>
        )}

        <ConfirmDialog
          open={deleteTargetId !== null}
          title="Hapus Jasa Transport"
          message="Hapus jasa transport ini beserta semua titik jemputnya? Tindakan ini tidak bisa dibatalkan."
          confirmLabel="Ya, Hapus"
          isDestructive
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTargetId(null)}
        />
      </div>
    </div>
  );
}
