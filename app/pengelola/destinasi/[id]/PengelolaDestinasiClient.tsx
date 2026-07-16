"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Ticket,
  Pencil,
  Trash2,
  Plus,
  ImageOff,
  User,
  Power,
  PowerOff,
  Droplets,
  Car,
  Cross,
  Armchair,
  Package,
  CheckCircle2,
  XCircle,
  ArrowRight,
  X,
  ChevronRight,
} from "lucide-react";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import RupiahInput from "@/components/ui/rupiah-input";
import UmkmForm, { KATEGORI_UMKM_LABEL, type WarungFormValues } from "@/components/pengelola/umkm-form";
import KelolaPenginapanSection from "./KelolaPenginapanSection";
import SaranAiDestinasi from "@/components/pengelola/saran-ai-destinasi";
import PetaLokasi from "./PetaLokasi";

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
  photoUrls: string[];
  bisaBooking: boolean;
  menuItems: MenuItemRow[];
};

const KATEGORI_UMKM_STYLE: Record<string, { bg: string; color: string }> = {
  KULINER: { bg: "var(--blusukan-secondary-container)", color: "var(--blusukan-secondary)" },
  KERAJINAN: { bg: "rgba(45,90,39,0.1)", color: "var(--blusukan-primary)" },
  FASHION: { bg: "#f3e8fd", color: "#6b21a8" },
  JASA: { bg: "#e3f2fd", color: "#1565c0" },
  LAINNYA: { bg: "var(--blusukan-surface-container)", color: "var(--blusukan-outline)" },
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
  PENDING: { background: "var(--blusukan-secondary-container)", color: "var(--blusukan-secondary)" },
  APPROVED: { background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" },
  REJECTED: { background: "var(--blusukan-error-container)", color: "var(--blusukan-error)" },
  NONAKTIF: { background: "var(--blusukan-surface-container)", color: "var(--blusukan-on-surface-variant)" },
};

const KABUPATEN_LABEL: Record<string, string> = {
  SLEMAN: "Sleman",
  GUNUNGKIDUL: "Gunungkidul",
  BANTUL: "Bantul",
  KULON_PROGO: "Kulon Progo",
  KOTA_YOGYAKARTA: "Kota Yogyakarta",
};

const KATEGORI_LABEL: Record<string, string> = {
  PANTAI: "Pantai",
  AIR_TERJUN: "Air Terjun",
  GUNUNG: "Gunung",
  BUKIT: "Bukit",
  TEBING: "Tebing",
};

type DestinationDetail = {
  id: string;
  name: string;
  status: string;
  kabupaten: string;
  kategori: string;
  latitude: number;
  longitude: number;
  jamOperasional: string | null;
  htmResmi: number;
  htmAnak: number | null;
  hasToilet: boolean;
  hasParkir: boolean;
  hasTempatIbadah: boolean;
  hasTempatDuduk: boolean;
  hasPenitipanBarang: boolean;
  createdAt: string;
  approvedAt: string | null;
};

interface Props {
  destination: DestinationDetail;
  initialTransaksis: TransaksiRow[];
  transaksiCount: number;
  initialFasilitas: FasilitasRow[];
  initialWarungs: WarungRow[];
  localServiceCount: number;
}

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatTanggalLengkap(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" }).format(new Date(iso));
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-3xl p-6"
      style={{
        background: "var(--blusukan-surface-container-lowest)",
        border: "1px solid var(--blusukan-outline-variant)",
        boxShadow: "0 2px 10px -4px rgba(0,0,0,0.08)",
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="flex items-center gap-2.5 text-base font-extrabold mb-4"
      style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
    >
      <span
        className="w-1 h-5 rounded-full shrink-0"
        style={{ background: "var(--blusukan-primary)" }}
      />
      {children}
    </h2>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="p-3 rounded-2xl"
      style={{ background: "var(--blusukan-surface-low)" }}
    >
      <p
        className="text-[11px] font-semibold uppercase tracking-wider"
        style={{ color: "var(--blusukan-outline)" }}
      >
        {label}
      </p>
      <p className="text-sm font-bold mt-0.5" style={{ color: "var(--blusukan-on-surface)" }}>
        {value}
      </p>
    </div>
  );
}

function FasilitasGratisItem({
  label,
  available,
  icon,
}: {
  label: string;
  available: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center gap-2.5 py-2.5 px-3.5 rounded-xl"
      style={{
        background: available ? "var(--blusukan-primary-container)" : "var(--blusukan-surface)",
        border: `1px solid ${available ? "var(--blusukan-primary)" : "var(--blusukan-outline-variant)"}`,
      }}
    >
      <span style={{ color: available ? "var(--blusukan-primary)" : "var(--blusukan-outline)" }}>{icon}</span>
      <span
        className="text-sm font-medium flex-1"
        style={{ color: available ? "var(--blusukan-on-surface)" : "var(--blusukan-on-surface-variant)" }}
      >
        {label}
      </span>
      {available ? (
        <CheckCircle2 size={15} style={{ color: "var(--blusukan-primary)" }} />
      ) : (
        <XCircle size={15} style={{ color: "var(--blusukan-outline)" }} />
      )}
    </div>
  );
}

/** Section: Informasi Destinasi — info dasar read-only, sama lengkapnya dengan versi Admin */
function InformasiDestinasiSection({ destination }: { destination: DestinationDetail }) {
  return (
    <div className="space-y-6 mb-6">
      <SectionCard>
        <SectionTitle>Informasi Destinasi</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoItem label="Kabupaten" value={KABUPATEN_LABEL[destination.kabupaten] ?? destination.kabupaten} />
          <InfoItem label="Kategori" value={KATEGORI_LABEL[destination.kategori] ?? destination.kategori} />
          <InfoItem label="Jam Operasional" value={destination.jamOperasional || "Tidak ada data"} />
          <InfoItem
            label="Harga Tiket Dewasa"
            value={destination.htmResmi === 0 ? "Gratis" : formatRupiah(destination.htmResmi)}
          />
          <InfoItem
            label="Harga Tiket Anak-anak"
            value={
              destination.htmAnak == null
                ? "Tidak dibedakan (1 harga untuk semua)"
                : destination.htmAnak === 0
                  ? "Gratis"
                  : formatRupiah(destination.htmAnak)
            }
          />
          <InfoItem label="Tanggal Diajukan" value={formatTanggalLengkap(destination.createdAt)} />
          <InfoItem
            label="Tanggal Disetujui"
            value={destination.approvedAt ? formatTanggalLengkap(destination.approvedAt) : "Belum disetujui"}
          />
        </div>

        <div className="mt-4">
          <p className="text-xs mb-2" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Koordinat
          </p>
          <PetaLokasi latitude={destination.latitude} longitude={destination.longitude} />
          <p className="text-xs mt-2" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            {destination.latitude}, {destination.longitude}
          </p>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Fasilitas Umum (Gratis)</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <FasilitasGratisItem label="Toilet" available={destination.hasToilet} icon={<Droplets size={16} />} />
          <FasilitasGratisItem label="Parkir" available={destination.hasParkir} icon={<Car size={16} />} />
          <FasilitasGratisItem
            label="Tempat Ibadah"
            available={destination.hasTempatIbadah}
            icon={<Cross size={16} />}
          />
          <FasilitasGratisItem
            label="Tempat Duduk"
            available={destination.hasTempatDuduk}
            icon={<Armchair size={16} />}
          />
          <FasilitasGratisItem
            label="Penitipan Barang"
            available={destination.hasPenitipanBarang}
            icon={<Package size={16} />}
          />
        </div>
      </SectionCard>
    </div>
  );
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
  PENDING: { bg: "var(--blusukan-secondary-container)", color: "var(--blusukan-secondary)" },
  DIKONFIRMASI: { bg: "var(--blusukan-primary-container)", color: "#1d4ed8" },
  SELESAI: { bg: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" },
  DIBATALKAN: { bg: "var(--blusukan-surface-container)", color: "var(--blusukan-on-surface-variant)" },
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

/** Section: Transaksi Masuk — preview transaksi terbaru + tombol aksi konfirmasi/tolak/selesai */
function TransaksiMasukSection({
  destinationId,
  initialTransaksis,
  transaksiCount,
}: {
  destinationId: string;
  initialTransaksis: TransaksiRow[];
  transaksiCount: number;
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
        style={{ background: "var(--blusukan-surface-container-lowest)", border: "1px solid var(--blusukan-outline-variant)" }}
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
            style={{ background: "var(--blusukan-surface-container-lowest)", border: "1px solid var(--blusukan-outline-variant)" }}
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
                      style={{ border: "1px solid var(--blusukan-error)", color: "var(--blusukan-error)", background: "var(--blusukan-surface-container-lowest)" }}
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

      <div className="flex flex-col items-center gap-1.5 pt-2">
        <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Menampilkan {items.length} dari {transaksiCount} transaksi terbaru
        </p>
        <Link
          href={`/pengelola/destinasi/${destinationId}/transaksi`}
          id="btn-lihat-semua-transaksi"
          className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
          style={{ background: "var(--blusukan-surface-container-lowest)", color: "var(--blusukan-primary)", border: "1px solid var(--blusukan-primary)" }}
        >
          Lihat Semua Transaksi Masuk
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

/** Section: Booking Transport — ringkasan singkat, kelola jasa/titik jemput/booking masuk dipindah ke halaman /transport tersendiri */
function KelolaTransportSection({ destinationId, localServiceCount }: { destinationId: string; localServiceCount: number }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: "var(--blusukan-surface-container-lowest)", border: "1px solid var(--blusukan-outline-variant)" }}
    >
      <div className="mb-5">
        <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Jasa Transport Terdaftar
        </p>
        <p
          className="text-xl font-bold mt-0.5"
          style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
        >
          {localServiceCount}
        </p>
      </div>

      <Link
        href={`/pengelola/destinasi/${destinationId}/transport`}
        id="btn-kelola-transportasi"
        className="flex items-center justify-center gap-1.5 w-full text-sm font-bold px-4 py-3 rounded-lg transition-opacity hover:opacity-90"
        style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
      >
        Kelola Transportasi
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}

/** Section: Kelola Fasilitas — ringkasan singkat, CRUD lengkap dipindah ke halaman /fasilitas tersendiri */
function KelolaFasilitasSection({
  destinationId,
  initialFasilitas,
}: {
  destinationId: string;
  initialFasilitas: FasilitasRow[];
}) {
  const totalFasilitas = initialFasilitas.length;
  const totalNilaiSewa = initialFasilitas.reduce((sum, f) => sum + f.hargaSewa, 0);

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: "var(--blusukan-surface-container-lowest)", border: "1px solid var(--blusukan-outline-variant)" }}
    >
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
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
        <div>
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

      <Link
        href={`/pengelola/destinasi/${destinationId}/fasilitas`}
        id="btn-kelola-fasilitas"
        className="flex items-center justify-center gap-1.5 w-full text-sm font-bold px-4 py-3 rounded-lg transition-opacity hover:opacity-90"
        style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
      >
        Kelola Fasilitas
        <ArrowRight size={16} />
      </Link>
    </div>
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
    background: "var(--blusukan-surface-container-lowest)",
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

/** Modal generik — overlay + card putih, dipakai untuk detail/edit UMKM */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg my-auto rounded-2xl p-6"
        style={{ background: "var(--blusukan-surface)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}>
            {title}
          </h2>
          <button
            type="button"
            id="btn-tutup-modal-warung"
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

/** Card ringkasan UMKM di list — hanya foto, nama, kategori, jumlah produk, badge bisaBooking. Klik untuk buka detail. */
function WarungSummaryCard({ warung, onOpen }: { warung: WarungRow; onOpen: () => void }) {
  return (
    <button
      type="button"
      id={`card-warung-${warung.id}`}
      onClick={onOpen}
      className="w-full text-left rounded-2xl p-5 flex items-center gap-3 transition-shadow hover:shadow-md"
      style={{ background: "var(--blusukan-surface-container-lowest)", border: "1px solid var(--blusukan-outline-variant)" }}
    >
      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0" style={{ background: "var(--blusukan-surface-container-highest)" }}>
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
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <p className="text-sm font-bold" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}>
            {warung.name}
          </p>
          <KategoriUmkmBadge kategori={warung.kategori} />
        </div>
        <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          {warung.menuItems.length} produk
        </p>
        {warung.bisaBooking && (
          <span
            className="inline-block text-xs font-bold px-2 py-0.5 rounded-full mt-1"
            style={{ background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }}
          >
            Bisa reservasi tempat
          </span>
        )}
      </div>
      <ChevronRight size={18} className="shrink-0" style={{ color: "var(--blusukan-on-surface-variant)" }} />
    </button>
  );
}

type ProdukDraft = { key: number; nama: string; harga: number | "" };

/** Form batch tambah produk ke UMKM yang sudah ada — beberapa baris sekaligus, 1x "Simpan Semua" kirim semuanya bersamaan */
function TambahProdukBatchForm({
  onCancel,
  onSubmit,
  submitting,
}: {
  onCancel: () => void;
  onSubmit: (items: { nama: string; harga: number }[]) => void;
  submitting: boolean;
}) {
  const [rows, setRows] = useState<ProdukDraft[]>([{ key: 0, nama: "", harga: "" }]);
  const [nextKey, setNextKey] = useState(1);
  const [error, setError] = useState("");

  function updateRow(key: number, patch: Partial<ProdukDraft>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { key: nextKey, nama: "", harga: "" }]);
    setNextKey((k) => k + 1);
  }

  function removeRow(key: number) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const items = rows
      .filter((r) => r.nama.trim() !== "" || r.harga !== "")
      .map((r) => ({ nama: r.nama.trim(), harga: Number(r.harga) }));

    if (items.length === 0 || items.some((it) => !it.nama || !Number.isFinite(it.harga) || it.harga < 0)) {
      setError("Minimal 1 produk dengan nama dan harga yang valid wajib diisi.");
      return;
    }
    setError("");
    onSubmit(items);
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
      className="rounded-xl p-4 space-y-3"
      style={{ background: "var(--blusukan-primary-container)", border: "1px solid var(--blusukan-outline-variant)" }}
    >
      <div className="space-y-2">
        {rows.map((r, idx) => (
          <div key={r.key} className="grid grid-cols-2 gap-2 items-start">
            <input
              required
              value={r.nama}
              onChange={(e) => updateRow(r.key, { nama: e.target.value })}
              placeholder="Nama Produk"
              className="w-full px-3 py-2 text-sm"
              style={inputStyle}
            />
            <div className="flex items-center gap-1.5">
              <RupiahInput
                value={r.harga}
                onChange={(harga) => updateRow(r.key, { harga })}
                className="w-full pl-9 pr-3 py-2 text-sm"
                style={inputStyle}
              />
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(r.key)}
                  aria-label={`Hapus baris produk ${idx + 1}`}
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

      {error && (
        <p className="text-xs" style={{ color: "var(--blusukan-error)" }}>
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1 text-xs font-bold hover:opacity-80 transition-opacity"
        style={{ color: "var(--blusukan-primary)" }}
      >
        <Plus size={14} />
        Tambah Produk Lain
      </button>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="text-sm font-bold px-4 py-2 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
        >
          {submitting ? "Menyimpan..." : "Simpan Semua"}
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

type ProdukEditDraft = { id: string; name: string; price: number | "" };

/** Form batch edit semua produk existing sekaligus — 1x "Simpan Semua Perubahan" kirim semua perubahan bersamaan */
function EditProdukBatchForm({
  menuItems,
  onCancel,
  onSubmit,
  submitting,
}: {
  menuItems: MenuItemRow[];
  onCancel: () => void;
  onSubmit: (edits: { id: string; name: string; price: number }[]) => void;
  submitting: boolean;
}) {
  const [rows, setRows] = useState<ProdukEditDraft[]>(
    menuItems.map((m) => ({ id: m.id, name: m.name, price: m.price }))
  );
  const [error, setError] = useState("");

  function updateRow(id: string, patch: Partial<ProdukEditDraft>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const edits = rows.map((r) => ({ id: r.id, name: r.name.trim(), price: Number(r.price) }));

    if (edits.some((it) => !it.name || !Number.isFinite(it.price) || it.price < 0)) {
      setError("Nama dan harga semua produk wajib diisi dengan valid.");
      return;
    }
    setError("");
    onSubmit(edits);
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
      className="rounded-xl p-4 space-y-3"
      style={{ background: "var(--blusukan-primary-container)", border: "1px solid var(--blusukan-outline-variant)" }}
    >
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="grid grid-cols-2 gap-2 items-start">
            <input
              required
              value={r.name}
              onChange={(e) => updateRow(r.id, { name: e.target.value })}
              placeholder="Nama Produk"
              className="w-full px-3 py-2 text-sm"
              style={inputStyle}
            />
            <RupiahInput
              value={r.price}
              onChange={(price) => updateRow(r.id, { price })}
              className="w-full pl-9 pr-3 py-2 text-sm"
              style={inputStyle}
            />
          </div>
        ))}
      </div>

      {error && (
        <p className="text-xs" style={{ color: "var(--blusukan-error)" }}>
          {error}
        </p>
      )}

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="text-sm font-bold px-4 py-2 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
        >
          {submitting ? "Menyimpan..." : "Simpan Semua Perubahan"}
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

/** Modal detail satu warung: info lengkap + daftar menu, aksi edit/hapus warung, tambah/edit produk (single & batch) */
function WarungDetailModal({
  warung,
  submitting,
  onClose,
  onEditWarung,
  onDeleteWarung,
  onAddProdukBatch,
  onEditProdukBatch,
  onEditMenuItem,
  onDeleteMenuItem,
}: {
  warung: WarungRow;
  submitting: boolean;
  onClose: () => void;
  onEditWarung: (values: WarungFormValues) => void;
  onDeleteWarung: () => void;
  onAddProdukBatch: (items: { nama: string; harga: number }[]) => void;
  onEditProdukBatch: (edits: { id: string; name: string; price: number }[]) => void;
  onEditMenuItem: (menuItemId: string, values: { name: string; price: number }) => void;
  onDeleteMenuItem: (menuItemId: string) => void;
}) {
  const [isEditingWarung, setIsEditingWarung] = useState(false);
  const [showAddProduk, setShowAddProduk] = useState(false);
  const [isBulkEditingProduk, setIsBulkEditingProduk] = useState(false);
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);

  if (isEditingWarung) {
    return (
      <Modal title={`Edit ${warung.name}`} onClose={onClose}>
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
      </Modal>
    );
  }

  return (
    <Modal title={warung.name} onClose={onClose}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0" style={{ background: "var(--blusukan-surface-container-highest)" }}>
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
            <KategoriUmkmBadge kategori={warung.kategori} />
            {warung.namaPemilik && (
              <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                <User size={11} />
                {warung.namaPemilik}
              </p>
            )}
            {warung.location && (
              <p className="text-xs mt-0.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                {warung.location}
              </p>
            )}
            {warung.bisaBooking && (
              <span
                className="inline-block text-xs font-bold px-2 py-0.5 rounded-full mt-1"
                style={{ background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }}
              >
                Bisa reservasi tempat
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            id={`btn-edit-warung-${warung.id}`}
            onClick={() => setIsEditingWarung(true)}
            aria-label={`Edit ${warung.name}`}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--blusukan-surface-container)]"
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
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--blusukan-error-container)] disabled:opacity-50"
            style={{ border: "1px solid var(--blusukan-error)", color: "var(--blusukan-error)" }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="pt-3" style={{ borderTop: "1px dashed var(--blusukan-outline-variant)" }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold" style={{ color: "var(--blusukan-on-surface)" }}>
            Daftar Produk/Menu
          </p>
          {!isBulkEditingProduk && warung.menuItems.length > 0 && (
            <button
              type="button"
              id={`btn-edit-semua-produk-${warung.id}`}
              onClick={() => setIsBulkEditingProduk(true)}
              className="text-xs font-bold hover:opacity-80 transition-opacity"
              style={{ color: "var(--blusukan-primary)" }}
            >
              Edit Semua Produk
            </button>
          )}
        </div>

        {isBulkEditingProduk ? (
          <EditProdukBatchForm
            menuItems={warung.menuItems}
            onCancel={() => setIsBulkEditingProduk(false)}
            onSubmit={(edits) => {
              onEditProdukBatch(edits);
              setIsBulkEditingProduk(false);
            }}
            submitting={submitting}
          />
        ) : (
          <div className="space-y-2">
            {warung.menuItems.length === 0 && (
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
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--blusukan-surface-container)]"
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
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--blusukan-error-container)] disabled:opacity-50"
                      style={{ color: "var(--blusukan-error)" }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {!isBulkEditingProduk && (
          <div className="mt-3 pt-3" style={{ borderTop: "1px dashed var(--blusukan-outline-variant)" }}>
            {showAddProduk ? (
              <TambahProdukBatchForm
                onCancel={() => setShowAddProduk(false)}
                onSubmit={(items) => {
                  onAddProdukBatch(items);
                  setShowAddProduk(false);
                }}
                submitting={submitting}
              />
            ) : (
              <button
                type="button"
                id={`btn-tambah-produk-${warung.id}`}
                onClick={() => setShowAddProduk(true)}
                className="flex items-center gap-1 text-xs font-bold hover:opacity-80 transition-opacity"
                style={{ color: "var(--blusukan-primary)" }}
              >
                <Plus size={14} />
                Tambah Produk Baru
              </button>
            )}
          </div>
        )}
      </div>
    </Modal>
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
  const [expandedWarungId, setExpandedWarungId] = useState<string | null>(null);

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
      setExpandedWarungId((prev) => (prev === id ? null : prev));
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddProdukBatch(warungId: string, items: { nama: string; harga: number }[]) {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/pengelola/menu-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ warungId, items }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal menambah produk.");
        return;
      }
      setWarungs((prev) =>
        prev.map((w) => (w.id === warungId ? { ...w, menuItems: [...w.menuItems, ...data] } : w))
      );
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditProdukBatch(warungId: string, edits: { id: string; name: string; price: number }[]) {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/pengelola/menu-item", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: edits }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal memperbarui produk.");
        return;
      }
      const updated = data as MenuItemRow[];
      setWarungs((prev) =>
        prev.map((w) =>
          w.id === warungId
            ? { ...w, menuItems: w.menuItems.map((m) => updated.find((d) => d.id === m.id) ?? m) }
            : w
        )
      );
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
          style={{ background: "var(--blusukan-surface-container-lowest)", border: "1px solid var(--blusukan-outline-variant)" }}
        >
          <p className="text-sm font-medium" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Belum ada UMKM yang ditambahkan.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {warungs.map((w) => (
            <WarungSummaryCard key={w.id} warung={w} onOpen={() => setExpandedWarungId(w.id)} />
          ))}
        </div>
      )}

      {(() => {
        const expanded = warungs.find((w) => w.id === expandedWarungId);
        if (!expanded) return null;
        return (
          <WarungDetailModal
            warung={expanded}
            submitting={submitting}
            onClose={() => setExpandedWarungId(null)}
            onEditWarung={(values) => handleEditWarung(expanded.id, values)}
            onDeleteWarung={() => handleDeleteWarung(expanded.id)}
            onAddProdukBatch={(items) => handleAddProdukBatch(expanded.id, items)}
            onEditProdukBatch={(edits) => handleEditProdukBatch(expanded.id, edits)}
            onEditMenuItem={(menuItemId, values) => handleEditMenuItem(expanded.id, menuItemId, values)}
            onDeleteMenuItem={(menuItemId) => handleDeleteMenuItem(expanded.id, menuItemId)}
          />
        );
      })()}

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
          style={{ background: "var(--blusukan-surface-container-lowest)", color: "var(--blusukan-on-surface-variant)", border: "1px solid var(--blusukan-outline-variant)" }}
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
                : { border: "1px solid var(--blusukan-error)", color: "var(--blusukan-error)", background: "var(--blusukan-surface-container-lowest)" }
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

export default function PengelolaDestinasiClient({
  destination,
  initialTransaksis,
  transaksiCount,
  initialFasilitas,
  initialWarungs,
  localServiceCount,
}: Props) {
  const [activeTab, setActiveTab] = useState<"transaksi" | "fasilitas" | "umkm" | "booking" | "penginapan">("transaksi");

  return (
    <div className="min-h-screen" style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}>
      {/* ── Header — heading sederhana di atas background cream ── */}
      <div className="max-w-3xl mx-auto px-4 lg:px-8 pt-8">
        <Link
          href="/pengelola"
          className="inline-flex items-center gap-1.5 text-sm font-semibold mb-4 hover:opacity-70 transition-opacity"
          style={{ color: "var(--blusukan-primary)" }}
        >
          <ArrowLeft size={16} />
          Kembali ke Dashboard
        </Link>

        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
            >
              {destination.name}
            </h1>
            <span
              className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full mt-3"
              style={DESTINASI_STATUS_STYLE[destination.status] ?? DESTINASI_STATUS_STYLE.PENDING}
            >
              {DESTINASI_STATUS_LABEL[destination.status] ?? destination.status}
            </span>
          </div>
          <DestinasiStatusActions destinationId={destination.id} status={destination.status} />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 lg:px-8 pt-6 pb-12">
        <InformasiDestinasiSection destination={destination} />

        <div className="mt-6">
          <SaranAiDestinasi destinationId={destination.id} />
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-1">
          <button
            type="button"
            id="tab-transaksi"
            onClick={() => setActiveTab("transaksi")}
            className="text-sm font-bold px-4 py-2.5 rounded-full transition-all active:scale-95"
            style={
              activeTab === "transaksi"
                ? {
                    background: "var(--blusukan-primary)",
                    color: "var(--blusukan-on-primary)",
                    boxShadow: "0 6px 16px -6px color-mix(in srgb, var(--blusukan-primary) 65%, transparent)",
                  }
                : {
                    background: "var(--blusukan-surface-container-lowest)",
                    color: "var(--blusukan-on-surface-variant)",
                    border: "1px solid var(--blusukan-outline-variant)",
                  }
            }
          >
            Transaksi Masuk
          </button>
          <button
            type="button"
            id="tab-fasilitas"
            onClick={() => setActiveTab("fasilitas")}
            className="text-sm font-bold px-4 py-2.5 rounded-full transition-all active:scale-95"
            style={
              activeTab === "fasilitas"
                ? {
                    background: "var(--blusukan-primary)",
                    color: "var(--blusukan-on-primary)",
                    boxShadow: "0 6px 16px -6px color-mix(in srgb, var(--blusukan-primary) 65%, transparent)",
                  }
                : {
                    background: "var(--blusukan-surface-container-lowest)",
                    color: "var(--blusukan-on-surface-variant)",
                    border: "1px solid var(--blusukan-outline-variant)",
                  }
            }
          >
            Kelola Fasilitas
          </button>
          <button
            type="button"
            id="tab-umkm"
            onClick={() => setActiveTab("umkm")}
            className="text-sm font-bold px-4 py-2.5 rounded-full transition-all active:scale-95"
            style={
              activeTab === "umkm"
                ? {
                    background: "var(--blusukan-primary)",
                    color: "var(--blusukan-on-primary)",
                    boxShadow: "0 6px 16px -6px color-mix(in srgb, var(--blusukan-primary) 65%, transparent)",
                  }
                : {
                    background: "var(--blusukan-surface-container-lowest)",
                    color: "var(--blusukan-on-surface-variant)",
                    border: "1px solid var(--blusukan-outline-variant)",
                  }
            }
          >
            Kelola UMKM
          </button>
          <button
            type="button"
            id="tab-booking"
            onClick={() => setActiveTab("booking")}
            className="text-sm font-bold px-4 py-2.5 rounded-full transition-all active:scale-95"
            style={
              activeTab === "booking"
                ? {
                    background: "var(--blusukan-primary)",
                    color: "var(--blusukan-on-primary)",
                    boxShadow: "0 6px 16px -6px color-mix(in srgb, var(--blusukan-primary) 65%, transparent)",
                  }
                : {
                    background: "var(--blusukan-surface-container-lowest)",
                    color: "var(--blusukan-on-surface-variant)",
                    border: "1px solid var(--blusukan-outline-variant)",
                  }
            }
          >
            Booking Transport
          </button>
          <button
            type="button"
            id="tab-penginapan"
            onClick={() => setActiveTab("penginapan")}
            className="text-sm font-bold px-4 py-2.5 rounded-full transition-all active:scale-95"
            style={
              activeTab === "penginapan"
                ? {
                    background: "var(--blusukan-primary)",
                    color: "var(--blusukan-on-primary)",
                    boxShadow: "0 6px 16px -6px color-mix(in srgb, var(--blusukan-primary) 65%, transparent)",
                  }
                : {
                    background: "var(--blusukan-surface-container-lowest)",
                    color: "var(--blusukan-on-surface-variant)",
                    border: "1px solid var(--blusukan-outline-variant)",
                  }
            }
          >
            Penginapan
          </button>
        </div>

        {activeTab === "transaksi" && (
          <TransaksiMasukSection
            destinationId={destination.id}
            initialTransaksis={initialTransaksis}
            transaksiCount={transaksiCount}
          />
        )}
        {activeTab === "fasilitas" && (
          <KelolaFasilitasSection destinationId={destination.id} initialFasilitas={initialFasilitas} />
        )}
        {activeTab === "umkm" && (
          <KelolaUmkmSection destinationId={destination.id} initialWarungs={initialWarungs} />
        )}
        {activeTab === "booking" && (
          <KelolaTransportSection destinationId={destination.id} localServiceCount={localServiceCount} />
        )}
        {activeTab === "penginapan" && <KelolaPenginapanSection destinationId={destination.id} />}
      </div>
    </div>
  );
}
