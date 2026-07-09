"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DateTimePicker from "@/components/ui/datetime-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ArrowLeft,
  Clock,
  Ticket,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  CheckCircle,
  Droplets,
  Wifi,
  WifiOff,
  Users,
  Car,
  Armchair,
  Package,
  Utensils,
  MessageCircle,
  MapPin,
  ExternalLink,
  Star,
  Cross,
  Plus,
  Minus,
  TrendingUp,
  ImageOff,
  User,
  X,
} from "lucide-react";
import type { MapDestination } from "@/components/DestinationMap";
import { getPopularityBadge } from "@/lib/popularity";
import { formatJamOperasionalLabel, isJamBukaValid, type JamOperasionalDestination } from "@/lib/jam-operasional";

// Leaflet browser-only
const DestinationMap = dynamic(() => import("@/components/DestinationMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center" style={{ background: "#f0f0f0" }}>
      <span className="text-sm" style={{ color: "#72796e" }}>Memuat peta…</span>
    </div>
  ),
});

// ── Types ────────────────────────────────────────────────────────
type Report = {
  id: string;
  userName: string;
  roadCondition: string | null;
  signalStrength: string | null;
  crowdLevel: string | null;
  reportedFee: number | null;
  notes: string | null;
  createdAt: string;
};

type LocalService = {
  id: string;
  providerName: string;
  serviceType: string;
  contactWa: string;
  baseRate: number | null;
};

type MenuItem = { id: string; name: string; price: number };
type Warung = {
  id: string;
  name: string;
  location: string | null;
  kategori: string;
  namaPemilik: string | null;
  photoUrls: string[];
  bisaBooking: boolean;
  menuItems: MenuItem[];
};

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

type SewaFasilitas = {
  id: string;
  nama: string;
  hargaSewa: number;
  satuanWaktu: string;
  jumlahUnit: number;
};

type Review = {
  id: string;
  userName: string;
  rating: number;
  komentar: string | null;
  createdAt: string;
};

type MyReview = { rating: number; komentar: string | null } | null;

export type DestinasiDetail = {
  id: string;
  name: string;
  kabupaten: string;
  kategori: string;
  latitude: number;
  longitude: number;
  routeStatus: string;
  jamOperasional: string | null;
  jamBuka: string | null;
  jamTutup: string | null;
  buka24Jam: boolean;
  htmResmi: number | null;
  htmAnak: number | null;
  hasToilet: boolean;
  hasParkir: boolean;
  hasTempatIbadah: boolean;
  hasTempatDuduk: boolean;
  hasPenitipanBarang: boolean;
  vibeTags: string[];
  photoUrls: string[];
  totalUpvotes: number;
  verifiedReportsCount: number;
  populerMingguIni: boolean;
  reports: Report[];
  localServices: LocalService[];
  warungs: Warung[];
  fasilitas: SewaFasilitas[];
  reviews: Review[];
  rataRataRating: number;
  totalReview: number;
  isLoggedIn: boolean;
  myReview: MyReview;
};

interface Props {
  destination: DestinasiDetail;
}

// ── Label maps ──────────────────────────────────────────────────
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

const ROAD_LABEL: Record<string, string> = {
  MUDAH: "Mudah",
  SEDANG: "Sedang",
  SULIT: "Sulit",
  RUSAK: "Rusak",
};

const SIGNAL_LABEL: Record<string, { label: string; icon: React.ReactNode }> = {
  KUAT: { label: "Sinyal Kuat", icon: <Wifi size={12} /> },
  SEDANG: { label: "Sinyal Sedang", icon: <Wifi size={12} /> },
  LEMAH: { label: "Sinyal Lemah", icon: <WifiOff size={12} /> },
};

const CROWD_LABEL: Record<string, string> = {
  SEPI: "Sepi",
  SEDANG: "Sedang",
  PADAT: "Padat",
};

// ── Route badge ─────────────────────────────────────────────────
function getRouteBadge(routeStatus: string) {
  switch (routeStatus) {
    case "MUDAH":
    case "SEDANG":
      return { label: "Kondisi Aman", bg: "#2d5a27", textColor: "#ffffff", icon: <CheckCircle size={14} /> };
    case "SULIT":
      return { label: "Berlumpur / Sulit", bg: "#44372a", textColor: "#ffffff", icon: <Droplets size={14} /> };
    case "RUSAK":
      return { label: "Perlu Perhatian", bg: "#ba1a1a", textColor: "#ffffff", icon: <AlertTriangle size={14} /> };
    default:
      return null;
  }
}

// ── Utilities ───────────────────────────────────────────────────
function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  return `${Math.floor(days / 30)} bulan lalu`;
}

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ── Sub-components ──────────────────────────────────────────────

/** Card wrapper dengan shadow dan rounded-2xl */
function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl p-6 ${className}`}
      style={{
        background: "#ffffff",
        border: "1px solid #e8e8e8",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      {children}
    </div>
  );
}

/** Judul section dengan garis aksen */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-base font-bold mb-5"
      style={{ fontFamily: "Montserrat, sans-serif", color: "#1a1c1c" }}
    >
      {children}
    </h2>
  );
}

/** Chip kecil info (kondisi jalan, sinyal, dll) */
function InfoChip({
  icon,
  label,
  color = "#42493e",
  bg = "#f0f0f0",
}: {
  icon?: React.ReactNode;
  label: string;
  color?: string;
  bg?: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: bg, color }}
    >
      {icon}
      {label}
    </span>
  );
}

/** Item info dengan ikon di kotak warna */
function InfoItem({
  icon,
  label,
  value,
  iconBg = "#e8f4e8",
  iconColor = "#2d5a27",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconBg?: string;
  iconColor?: string;
}) {
  return (
    <div className="flex items-center gap-3.5">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: iconBg, color: iconColor }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs" style={{ color: "#72796e", fontFamily: "Inter, sans-serif" }}>
          {label}
        </p>
        <p className="text-sm font-semibold" style={{ color: "#1a1c1c", fontFamily: "Inter, sans-serif" }}>
          {value}
        </p>
      </div>
    </div>
  );
}

/** Item fasilitas dalam grid 2 kolom */
function FasilitasItem({ label, value, icon }: { label: string; value: boolean; icon: React.ReactNode }) {
  return (
    <div
      className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl"
      style={{ background: value ? "#f0f8f0" : "#fafafa", border: `1px solid ${value ? "#c8e6c9" : "#eeeeee"}` }}
    >
      <span style={{ color: value ? "#2d5a27" : "#c2c9bb" }}>{icon}</span>
      <span
        className="text-sm flex-1"
        style={{
          color: value ? "#1a1c1c" : "#9e9e9e",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {label}
      </span>
      {value ? (
        <CheckCircle2 size={15} style={{ color: "#2d5a27" }} />
      ) : (
        <XCircle size={15} style={{ color: "#c2c9bb" }} />
      )}
    </div>
  );
}

/** Satu baris tiket dengan quantity stepper — dipakai untuk baris Dewasa maupun Anak-anak */
function TiketStepperRow({
  label,
  harga,
  jumlah,
  onChange,
  min = 0,
}: {
  label: string;
  harga: number;
  jumlah: number;
  onChange: (next: number) => void;
  min?: number;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <p className="text-sm font-semibold" style={{ color: "#1a1c1c", fontFamily: "Inter, sans-serif" }}>
          {label}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "#72796e" }}>
          {formatRupiah(harga)} / orang
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, jumlah - 1))}
          disabled={jumlah <= min}
          aria-label={`Kurangi jumlah ${label}`}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[#f0f0f0] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          style={{ border: "1px solid #c2c9bb", color: "#2d5a27" }}
        >
          <Minus size={14} />
        </button>
        <span className="w-6 text-center text-sm font-bold" style={{ color: "#1a1c1c", fontFamily: "Inter, sans-serif" }}>
          {jumlah}
        </span>
        <button
          type="button"
          onClick={() => onChange(jumlah + 1)}
          aria-label={`Tambah jumlah ${label}`}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[#f0f0f0]"
          style={{ border: "1px solid #c2c9bb", color: "#2d5a27" }}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

/** Checkout tiket masuk — buat transaksi COD sungguhan lewat /api/transaksi */
function CheckoutTiketCard({
  destinationId,
  htmResmi,
  htmAnak,
}: {
  destinationId: string;
  htmResmi: number | null;
  htmAnak: number | null;
}) {
  const router = useRouter();
  const [jumlah, setJumlah] = useState(1);
  const [jumlahDewasa, setJumlahDewasa] = useState(0);
  const [jumlahAnak, setJumlahAnak] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const adaHargaAnak = htmAnak !== null;
  const isGratis = htmResmi === 0 && (htmAnak == null || htmAnak === 0);
  const isTidakTersedia = htmResmi == null;

  const total = (htmResmi ?? 0) * jumlah;
  const totalDewasa = (htmResmi ?? 0) * jumlahDewasa;
  const totalAnak = (htmAnak ?? 0) * jumlahAnak;
  const totalGabungan = totalDewasa + totalAnak;
  const bisaCheckoutGabungan = jumlahDewasa > 0 || jumlahAnak > 0;

  async function handleKonfirmasi() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/transaksi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          adaHargaAnak
            ? { destinationId, kuantitasDewasa: jumlahDewasa, kuantitasAnak: jumlahAnak }
            : { destinationId, kuantitasDewasa: jumlah }
        ),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal membuat pesanan. Coba lagi.");
        setLoading(false);
        return;
      }

      router.push(`/transaksi/${data.id}`);
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  }

  return (
    <SectionCard>
      <div className="flex items-center justify-between mb-5">
        <h2
          className="text-base font-bold"
          style={{ fontFamily: "Montserrat, sans-serif", color: "#1a1c1c" }}
        >
          Beli Tiket Masuk
        </h2>
        {isGratis && (
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: "#e8f4e8", color: "#2d5a27" }}
          >
            Gratis
          </span>
        )}
      </div>

      {isTidakTersedia ? (
        <p className="text-sm" style={{ color: "#72796e" }}>
          Informasi harga tiket belum tersedia untuk destinasi ini.
        </p>
      ) : isGratis ? (
        <p className="text-sm" style={{ color: "#42493e" }}>
          Tidak ada biaya masuk untuk destinasi ini.
        </p>
      ) : adaHargaAnak ? (
        <>
          <TiketStepperRow label="Tiket Dewasa" harga={htmResmi ?? 0} jumlah={jumlahDewasa} onChange={setJumlahDewasa} />
          <TiketStepperRow label="Tiket Anak-anak" harga={htmAnak ?? 0} jumlah={jumlahAnak} onChange={setJumlahAnak} />

          {/* Live price breakdown */}
          <div className="rounded-xl p-4 mb-3 space-y-1" style={{ background: "#f0f8f0" }}>
            {jumlahDewasa > 0 && (
              <p className="text-sm" style={{ color: "#42493e", fontFamily: "Inter, sans-serif" }}>
                {jumlahDewasa} x {formatRupiah(htmResmi ?? 0)} (Dewasa) = {formatRupiah(totalDewasa)}
              </p>
            )}
            {jumlahAnak > 0 && (
              <p className="text-sm" style={{ color: "#42493e", fontFamily: "Inter, sans-serif" }}>
                {jumlahAnak} x {formatRupiah(htmAnak ?? 0)} (Anak-anak) = {formatRupiah(totalAnak)}
              </p>
            )}
            <p className="text-sm" style={{ color: "#42493e", fontFamily: "Inter, sans-serif" }}>
              Total: <strong style={{ color: "#2d5a27" }}>{formatRupiah(totalGabungan)}</strong>
            </p>
          </div>

          {error && (
            <p className="text-xs mb-3" style={{ color: "#b3261e" }}>
              {error}
            </p>
          )}

          <button
            type="button"
            id="btn-konfirmasi-pesanan"
            onClick={handleKonfirmasi}
            disabled={loading || !bisaCheckoutGabungan}
            className="w-full py-2.5 rounded-lg text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
          >
            {loading ? "Memproses..." : "Konfirmasi Pesanan"}
          </button>
          {!bisaCheckoutGabungan && (
            <p className="text-xs mt-2 text-center" style={{ color: "#72796e" }}>
              Pilih minimal 1 tiket Dewasa atau Anak-anak
            </p>
          )}

          <p className="text-xs mt-3" style={{ color: "#72796e" }}>
            Pembayaran dilakukan tunai di lokasi (COD). Tunjukkan kode pesanan ke petugas.
          </p>
        </>
      ) : (
        <>
          {/* Baris item + stepper */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: "#1a1c1c", fontFamily: "Inter, sans-serif" }}
              >
                Tiket Masuk Dewasa
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#72796e" }}>
                {formatRupiah(htmResmi)} / orang
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setJumlah((j) => Math.max(1, j - 1))}
                disabled={jumlah <= 1}
                aria-label="Kurangi jumlah tiket"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[#f0f0f0] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                style={{ border: "1px solid #c2c9bb", color: "#2d5a27" }}
              >
                <Minus size={14} />
              </button>
              <span
                className="w-6 text-center text-sm font-bold"
                style={{ color: "#1a1c1c", fontFamily: "Inter, sans-serif" }}
              >
                {jumlah}
              </span>
              <button
                type="button"
                onClick={() => setJumlah((j) => j + 1)}
                aria-label="Tambah jumlah tiket"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[#f0f0f0]"
                style={{ border: "1px solid #c2c9bb", color: "#2d5a27" }}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Live price breakdown */}
          <div className="rounded-xl p-4 mb-3" style={{ background: "#f0f8f0" }}>
            <p className="text-sm" style={{ color: "#42493e", fontFamily: "Inter, sans-serif" }}>
              {jumlah} x {formatRupiah(htmResmi)} ={" "}
              <strong style={{ color: "#2d5a27" }}>{formatRupiah(total)}</strong>
            </p>
          </div>

          {error && (
            <p className="text-xs mb-3" style={{ color: "#b3261e" }}>
              {error}
            </p>
          )}

          <button
            type="button"
            id="btn-konfirmasi-pesanan"
            onClick={handleKonfirmasi}
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
          >
            {loading ? "Memproses..." : "Konfirmasi Pesanan"}
          </button>

          <p className="text-xs mt-3" style={{ color: "#72796e" }}>
            Pembayaran dilakukan tunai di lokasi (COD). Tunjukkan kode pesanan ke petugas.
          </p>
        </>
      )}
    </SectionCard>
  );
}

/** Format Date jadi string "YYYY-MM-DDTHH:mm" untuk value awal <input type="datetime-local"> */
function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Satu kartu booking untuk satu fasilitas — quantity stepper + jadwal + konfirmasi */
function FasilitasBookingRow({
  destinationId,
  fasilitas,
  jamOperasional,
}: {
  destinationId: string;
  fasilitas: SewaFasilitas;
  jamOperasional: JamOperasionalDestination;
}) {
  const router = useRouter();
  const [jumlah, setJumlah] = useState(1);
  const [jadwal, setJadwal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = fasilitas.hargaSewa * jumlah;
  const minJadwal = toLocalInputValue(new Date());
  const jamLabel = formatJamOperasionalLabel(jamOperasional);

  async function handleKonfirmasi() {
    if (!jadwal) {
      setError("Pilih jadwal booking terlebih dahulu.");
      return;
    }
    if (!isJamBukaValid(jamOperasional, new Date(jadwal))) {
      setError(
        `Destinasi tutup pada jam yang dipilih. Jam operasional: ${jamOperasional.jamBuka} - ${jamOperasional.jamTutup}`
      );
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/transaksi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "FASILITAS",
          destinationId,
          fasilitasId: fasilitas.id,
          kuantitas: jumlah,
          jadwal: new Date(jadwal).toISOString(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal membuat booking. Coba lagi.");
        setLoading(false);
        return;
      }

      router.push(`/transaksi/${data.id}`);
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl p-4" style={{ border: "1px solid #e8e8e8" }}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold" style={{ color: "#1a1c1c", fontFamily: "Inter, sans-serif" }}>
            {fasilitas.nama}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#72796e" }}>
            {formatRupiah(fasilitas.hargaSewa)} / {fasilitas.satuanWaktu}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setJumlah((j) => Math.max(1, j - 1))}
            disabled={jumlah <= 1}
            aria-label={`Kurangi jumlah ${fasilitas.nama}`}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[#f0f0f0] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            style={{ border: "1px solid #c2c9bb", color: "#2d5a27" }}
          >
            <Minus size={14} />
          </button>
          <span className="w-6 text-center text-sm font-bold" style={{ color: "#1a1c1c", fontFamily: "Inter, sans-serif" }}>
            {jumlah}
          </span>
          <button
            type="button"
            onClick={() => setJumlah((j) => Math.min(fasilitas.jumlahUnit, j + 1))}
            disabled={jumlah >= fasilitas.jumlahUnit}
            aria-label={`Tambah jumlah ${fasilitas.nama}`}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[#f0f0f0] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            style={{ border: "1px solid #c2c9bb", color: "#2d5a27" }}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="mb-3">
        <label
          htmlFor={`jadwal-${fasilitas.id}`}
          className="block text-xs font-medium mb-1"
          style={{ color: "#72796e" }}
        >
          Jadwal Booking
        </label>
        <DateTimePicker
          id={`jadwal-${fasilitas.id}`}
          value={jadwal}
          min={minJadwal}
          onChange={setJadwal}
        />
        {jamLabel && (
          <p className="text-xs mt-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            {jamLabel}
          </p>
        )}
      </div>

      <div className="rounded-xl p-3 mb-3" style={{ background: "#f0f8f0" }}>
        <p className="text-sm" style={{ color: "#42493e", fontFamily: "Inter, sans-serif" }}>
          {jumlah} x {formatRupiah(fasilitas.hargaSewa)} ={" "}
          <strong style={{ color: "#2d5a27" }}>{formatRupiah(total)}</strong>
        </p>
      </div>

      {error && (
        <p className="text-xs mb-3" style={{ color: "#b3261e" }}>
          {error}
        </p>
      )}

      <button
        type="button"
        id={`btn-konfirmasi-booking-${fasilitas.id}`}
        onClick={handleKonfirmasi}
        disabled={loading}
        className="w-full py-2.5 rounded-lg text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
      >
        {loading ? "Memproses..." : "Konfirmasi Booking"}
      </button>
    </div>
  );
}

/** Satu baris menu dengan quantity stepper kecil, dipakai dalam WarungOrderCard */
function MenuItemRow({
  item,
  kuantitas,
  onChange,
}: {
  item: MenuItem;
  kuantitas: number;
  onChange: (q: number) => void;
}) {
  return (
    <div
      className="flex items-center justify-between py-1.5 border-b last:border-0"
      style={{ borderColor: "#f0f0f0" }}
    >
      <div>
        <p className="text-sm" style={{ color: "#42493e", fontFamily: "Inter, sans-serif" }}>
          {item.name}
        </p>
        <p className="text-xs" style={{ color: "#72796e" }}>
          {formatRupiah(item.price)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, kuantitas - 1))}
          disabled={kuantitas <= 0}
          aria-label={`Kurangi jumlah ${item.name}`}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-[#f0f0f0] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          style={{ border: "1px solid #c2c9bb", color: "#2d5a27" }}
        >
          <Minus size={12} />
        </button>
        <span className="w-5 text-center text-sm font-bold" style={{ color: "#1a1c1c", fontFamily: "Inter, sans-serif" }}>
          {kuantitas}
        </span>
        <button
          type="button"
          onClick={() => onChange(kuantitas + 1)}
          aria-label={`Tambah jumlah ${item.name}`}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-[#f0f0f0]"
          style={{ border: "1px solid #c2c9bb", color: "#2d5a27" }}
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
}

/** Kartu ringkas UMKM dalam grid — foto, nama, pemilik, badge kategori saja. Klik untuk buka detail. */
function UmkmCard({ warung, onClick }: { warung: Warung; onClick: () => void }) {
  return (
    <button
      type="button"
      id={`card-umkm-${warung.id}`}
      onClick={onClick}
      className="text-left rounded-2xl overflow-hidden flex flex-col transition-all hover:shadow-md"
      style={{ background: "#ffffff", border: "1px solid #e8e8e8" }}
    >
      <div className="h-28 relative w-full" style={{ background: "#e0e0e0" }}>
        {warung.photoUrls[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={warung.photoUrls[0]} alt={warung.name} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(45,90,39,0.15) 0%, rgba(21,66,18,0.25) 100%)" }}
          >
            <ImageOff size={24} style={{ color: "rgba(21,66,18,0.35)" }} />
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="mb-1">
          <KategoriUmkmBadge kategori={warung.kategori} />
        </div>
        <p
          className="text-sm font-bold leading-tight"
          style={{ color: "#1a1c1c", fontFamily: "Montserrat, sans-serif" }}
        >
          {warung.name}
        </p>
        {warung.namaPemilik && (
          <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "#72796e" }}>
            <User size={11} />
            {warung.namaPemilik}
          </p>
        )}
      </div>
    </button>
  );
}

/** Dialog detail UMKM — galeri foto, lokasi, daftar produk dengan stepper, reservasi tempat (kalau bisaBooking), tombol Pesan */
function UmkmDetailDialog({
  destinationId,
  warung,
  jamOperasional,
  open,
  onOpenChange,
}: {
  destinationId: string;
  warung: Warung;
  jamOperasional: JamOperasionalDestination;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [reservasiTempat, setReservasiTempat] = useState(false);
  const [jadwal, setJadwal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const minJadwal = toLocalInputValue(new Date());
  const jamLabel = formatJamOperasionalLabel(jamOperasional);

  const selectedItems = warung.menuItems
    .map((m) => ({ menuItem: m, kuantitas: quantities[m.id] ?? 0 }))
    .filter((x) => x.kuantitas > 0);

  const total = selectedItems.reduce((sum, x) => sum + x.menuItem.price * x.kuantitas, 0);

  const hasSelection = selectedItems.length > 0;
  const reservasiSiap = warung.bisaBooking && reservasiTempat && jadwal.trim() !== "";
  const bisaPesan = hasSelection || reservasiSiap;

  function setQuantity(menuItemId: string, q: number) {
    setQuantities((prev) => ({ ...prev, [menuItemId]: q }));
  }

  async function handlePesan() {
    if (!bisaPesan) return;
    const reservasiAktif = warung.bisaBooking && reservasiTempat;
    if (reservasiAktif && !isJamBukaValid(jamOperasional, new Date(jadwal))) {
      setError(
        `Destinasi tutup pada jam yang dipilih. Jam operasional: ${jamOperasional.jamBuka} - ${jamOperasional.jamTutup}`
      );
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/transaksi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "UMKM",
          destinationId,
          warungId: warung.id,
          items: selectedItems.map((x) => ({ menuItemId: x.menuItem.id, kuantitas: x.kuantitas })),
          reservasiTempat: reservasiAktif,
          jadwal: reservasiAktif ? new Date(jadwal).toISOString() : null,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal membuat pesanan. Coba lagi.");
        setLoading(false);
        return;
      }

      router.push(`/transaksi/${data.id}`);
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="!max-w-lg !w-[calc(100vw-2rem)] !max-h-[85vh] !p-0 overflow-hidden flex flex-col"
      >
        <DialogHeader className="flex flex-row items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor: "#e8e8e8" }}>
          <DialogTitle className="text-sm font-bold" style={{ fontFamily: "Montserrat, sans-serif", color: "#1a1c1c" }}>
            {warung.name}
          </DialogTitle>
          <button
            type="button"
            id="btn-tutup-detail-umkm"
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-[#f3f3f3]"
            style={{ color: "#42493e" }}
            aria-label="Tutup detail UMKM"
          >
            <X size={16} />
          </button>
        </DialogHeader>

        <div className="overflow-y-auto p-4">
          {/* Galeri foto */}
          <div className="h-40 rounded-xl overflow-hidden mb-2" style={{ background: "#e0e0e0" }}>
            {warung.photoUrls[activePhotoIdx] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={warung.photoUrls[activePhotoIdx]}
                alt={`${warung.name} — foto ${activePhotoIdx + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, rgba(45,90,39,0.15) 0%, rgba(21,66,18,0.25) 100%)" }}
              >
                <ImageOff size={28} style={{ color: "rgba(21,66,18,0.35)" }} />
              </div>
            )}
          </div>
          {warung.photoUrls.length > 1 && (
            <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-3 pb-1">
              {warung.photoUrls.map((url, idx) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setActivePhotoIdx(idx)}
                  aria-label={`Tampilkan foto ${idx + 1}`}
                  aria-current={idx === activePhotoIdx}
                  className="relative shrink-0 rounded-lg overflow-hidden"
                  style={{
                    width: 56,
                    height: 42,
                    border: idx === activePhotoIdx ? "2px solid var(--blusukan-primary)" : "1px solid #e8e8e8",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`${warung.name} — thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap mb-1">
            <KategoriUmkmBadge kategori={warung.kategori} />
          </div>
          {warung.namaPemilik && (
            <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#72796e" }}>
              <User size={11} />
              {warung.namaPemilik}
            </p>
          )}
          {warung.location && (
            <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "#72796e" }}>
              <MapPin size={12} />
              {warung.location}
            </p>
          )}

          <div className="mt-3 pt-3" style={{ borderTop: "1px dashed #e8e8e8" }}>
            {warung.menuItems.length > 0 ? (
              <div className="mb-3">
                {warung.menuItems.map((m) => (
                  <MenuItemRow
                    key={m.id}
                    item={m}
                    kuantitas={quantities[m.id] ?? 0}
                    onChange={(q) => setQuantity(m.id, q)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm mb-3" style={{ color: "#72796e" }}>
                Menu belum tersedia
              </p>
            )}

            {warung.bisaBooking && (
              <>
                <label
                  htmlFor={`reservasi-${warung.id}`}
                  className="flex items-center gap-2 mb-3 cursor-pointer"
                >
                  <input
                    id={`reservasi-${warung.id}`}
                    type="checkbox"
                    checked={reservasiTempat}
                    onChange={(e) => setReservasiTempat(e.target.checked)}
                    className="w-4 h-4"
                    style={{ accentColor: "var(--blusukan-primary)" }}
                  />
                  <span className="text-sm" style={{ color: "#42493e", fontFamily: "Inter, sans-serif" }}>
                    Reservasi tempat duduk
                  </span>
                </label>

                {reservasiTempat && (
                  <div className="mb-3">
                    <label
                      htmlFor={`jadwal-umkm-${warung.id}`}
                      className="block text-xs font-medium mb-1"
                      style={{ color: "#72796e" }}
                    >
                      Jadwal Kedatangan
                    </label>
                    <DateTimePicker
                      id={`jadwal-umkm-${warung.id}`}
                      value={jadwal}
                      min={minJadwal}
                      onChange={setJadwal}
                    />
                    {jamLabel && (
                      <p className="text-xs mt-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                        {jamLabel}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            {hasSelection && (
              <div className="rounded-xl p-3 mb-3" style={{ background: "#f0f8f0" }}>
                <p className="text-sm" style={{ color: "#42493e", fontFamily: "Inter, sans-serif" }}>
                  Total Menu: <strong style={{ color: "#2d5a27" }}>{formatRupiah(total)}</strong>
                </p>
              </div>
            )}

            {error && (
              <p className="text-xs mb-3" style={{ color: "#b3261e" }}>
                {error}
              </p>
            )}

            <button
              type="button"
              id={`btn-pesan-umkm-${warung.id}`}
              onClick={handlePesan}
              disabled={!bisaPesan || loading}
              className="w-full py-2.5 rounded-lg text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
            >
              {loading ? "Memproses..." : "Pesan"}
            </button>
            {!bisaPesan && (
              <p className="text-xs mt-2 text-center" style={{ color: "#72796e" }}>
                {warung.bisaBooking ? "Pilih menu atau centang reservasi tempat" : "Pilih menu terlebih dahulu"}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Section UMKM & Kuliner Lokal — grid card ringkas, klik untuk buka detail lengkap + pemesanan. Disembunyikan kalau belum ada UMKM. */
function UmkmKulinerSection({
  destinationId,
  warungs,
  jamOperasional,
}: {
  destinationId: string;
  warungs: Warung[];
  jamOperasional: JamOperasionalDestination;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedWarung = warungs.find((w) => w.id === selectedId) ?? null;

  if (warungs.length === 0) return null;

  return (
    <SectionCard>
      <SectionTitle>
        <span className="flex items-center gap-2">
          <Utensils size={18} />
          UMKM & Kuliner Lokal
        </span>
      </SectionTitle>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {warungs.map((w) => (
          <UmkmCard key={w.id} warung={w} onClick={() => setSelectedId(w.id)} />
        ))}
      </div>

      {selectedWarung && (
        <UmkmDetailDialog
          destinationId={destinationId}
          warung={selectedWarung}
          jamOperasional={jamOperasional}
          open={selectedId !== null}
          onOpenChange={(open) => {
            if (!open) setSelectedId(null);
          }}
        />
      )}
    </SectionCard>
  );
}

/** Baris bintang untuk menampilkan rating (read-only) */
function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating ${rating} dari 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          fill={rating >= n ? "#f5a623" : "none"}
          style={{ color: rating >= n ? "#f5a623" : "var(--blusukan-outline-variant)" }}
        />
      ))}
    </div>
  );
}

/** Star picker interaktif untuk form ulasan — klik bintang ke-n untuk memilih rating n */
function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Pilih rating bintang">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = (hover || value) >= n;
        return (
          <button
            key={n}
            type="button"
            id={`star-${n}`}
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            aria-label={`Beri rating ${n} bintang`}
            aria-pressed={value === n}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              size={28}
              fill={filled ? "#f5a623" : "none"}
              style={{ color: filled ? "#f5a623" : "var(--blusukan-outline-variant)" }}
            />
          </button>
        );
      })}
    </div>
  );
}

/** Form tambah/perbarui ulasan — hanya untuk user yang sudah login */
function ReviewFormCard({
  destinationId,
  isLoggedIn,
  myReview,
}: {
  destinationId: string;
  isLoggedIn: boolean;
  myReview: MyReview;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(myReview?.rating ?? 0);
  const [komentar, setKomentar] = useState(myReview?.komentar ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isLoggedIn) {
    return (
      <SectionCard>
        <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          <Link
            href="/login"
            id="link-login-review"
            className="font-semibold hover:underline"
            style={{ color: "var(--blusukan-primary)" }}
          >
            Login
          </Link>{" "}
          untuk memberi ulasan destinasi ini.
        </p>
      </SectionCard>
    );
  }

  async function handleSubmit() {
    if (rating < 1) {
      setError("Pilih rating bintang terlebih dahulu.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinationId, rating, komentar }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal mengirim ulasan. Coba lagi.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
      setLoading(false);
    }
  }

  return (
    <SectionCard>
      <SectionTitle>{myReview ? "Perbarui Ulasan Anda" : "Beri Ulasan"}</SectionTitle>
      <div className="mb-4">
        <StarPicker value={rating} onChange={setRating} />
      </div>
      <textarea
        id="input-komentar-review"
        value={komentar ?? ""}
        onChange={(e) => setKomentar(e.target.value)}
        placeholder="Bagikan pengalaman Anda di destinasi ini (opsional)"
        rows={3}
        className="w-full px-3 py-2 text-sm mb-3 resize-none focus:outline-none"
        style={{
          border: "1px solid var(--blusukan-outline-variant)",
          borderRadius: "8px",
          color: "var(--blusukan-on-surface)",
          background: "var(--blusukan-surface)",
          fontFamily: "Inter, sans-serif",
        }}
      />
      {error && (
        <p className="text-xs mb-3" style={{ color: "var(--blusukan-error)" }}>
          {error}
        </p>
      )}
      {success && (
        <p className="text-xs mb-3" style={{ color: "var(--blusukan-primary)" }}>
          Ulasan berhasil disimpan.
        </p>
      )}
      <button
        type="button"
        id="btn-submit-review"
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-2.5 rounded-lg text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
      >
        {loading ? "Mengirim..." : myReview ? "Perbarui Ulasan" : "Kirim Ulasan"}
      </button>
    </SectionCard>
  );
}

/** Section "Ulasan Wisatawan" — form + daftar review, terpisah dari laporan kondisi lapangan */
function UlasanWisatawanSection({
  destinationId,
  reviews,
  isLoggedIn,
  myReview,
}: {
  destinationId: string;
  reviews: Review[];
  isLoggedIn: boolean;
  myReview: MyReview;
}) {
  return (
    <div>
      <h2
        className="text-base font-bold mb-4"
        style={{ fontFamily: "Montserrat, sans-serif", color: "#1a1c1c" }}
      >
        Ulasan Wisatawan
      </h2>
      <div className="space-y-4">
        <ReviewFormCard destinationId={destinationId} isLoggedIn={isLoggedIn} myReview={myReview} />

        {reviews.length === 0 ? (
          <SectionCard>
            <div className="text-center py-6">
              <Star size={36} className="mx-auto mb-3" style={{ color: "#c2c9bb" }} />
              <p className="text-sm font-medium" style={{ color: "#42493e" }}>
                Belum ada ulasan
              </p>
              <p className="text-xs mt-1" style={{ color: "#72796e" }}>
                Jadilah wisatawan pertama yang memberi ulasan untuk destinasi ini
              </p>
            </div>
          </SectionCard>
        ) : (
          reviews.map((r) => (
            <SectionCard key={r.id}>
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: "#e3efe0", color: "#2d5a27" }}
                >
                  {getInitials(r.userName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "#1a1c1c", fontFamily: "Montserrat, sans-serif" }}
                  >
                    {r.userName}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StarRow rating={r.rating} size={13} />
                    <span className="text-xs" style={{ color: "#72796e" }}>
                      {timeAgo(r.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              {r.komentar && (
                <p className="text-sm leading-relaxed" style={{ color: "#42493e" }}>
                  {r.komentar}
                </p>
              )}
            </SectionCard>
          ))
        )}
      </div>
    </div>
  );
}

/** Section sewa fasilitas — disembunyikan total kalau destinasi belum punya Fasilitas */
function SewaFasilitasSection({
  destinationId,
  fasilitasList,
  jamOperasional,
}: {
  destinationId: string;
  fasilitasList: SewaFasilitas[];
  jamOperasional: JamOperasionalDestination;
}) {
  if (fasilitasList.length === 0) return null;

  return (
    <SectionCard>
      <SectionTitle>Sewa Fasilitas</SectionTitle>
      <div className="space-y-4">
        {fasilitasList.map((f) => (
          <FasilitasBookingRow
            key={f.id}
            destinationId={destinationId}
            fasilitas={f}
            jamOperasional={jamOperasional}
          />
        ))}
      </div>
    </SectionCard>
  );
}

// ── Main Component ───────────────────────────────────────────────
export default function DestinasiDetailClient({ destination: d }: Props) {
  const badge = getRouteBadge(d.routeStatus);
  const needsHelp = d.routeStatus === "SULIT" || d.routeStatus === "RUSAK";
  const popularityBadge = getPopularityBadge(d);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const mapPoint: MapDestination[] = [
    { id: d.id, name: d.name, latitude: d.latitude, longitude: d.longitude, routeStatus: d.routeStatus },
  ];

  return (
    <div
      className="min-h-screen"
      style={{ background: "#f9f9f9", color: "#1a1c1c", fontFamily: "Inter, sans-serif" }}
    >
      {/* ── Sticky breadcrumb header ── */}
      <header
        className="sticky top-14 z-30 flex items-center gap-3 px-4 lg:px-8 py-3 border-b"
        style={{
          background: "rgba(249,249,249,0.95)",
          backdropFilter: "blur(10px)",
          borderColor: "#e8e8e8",
        }}
      >
        <Link
          href="/"
          id="detail-back"
          className="flex items-center gap-1.5 text-sm font-semibold hover:opacity-70 transition-opacity"
          style={{ color: "#2d5a27" }}
        >
          <ArrowLeft size={16} />
          Kembali ke Beranda
        </Link>
        <span style={{ color: "#c2c9bb" }}>/</span>
        <span className="text-sm truncate" style={{ color: "#72796e" }}>
          {d.name}
        </span>
      </header>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-20">

        {/* ── Hero Section ── */}
        <section className="pt-6 pb-8">
          {/* Hero image — 21:9 aspect ratio */}
          <div
            className="relative w-full rounded-2xl overflow-hidden mb-6"
            style={{ aspectRatio: "21/9", background: "#e0e0e0", minHeight: 200 }}
          >
            {d.photoUrls[activePhotoIdx] ? (
              <Image
                src={d.photoUrls[activePhotoIdx]}
                alt={d.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(45,90,39,0.15) 0%, rgba(21,66,18,0.25) 100%)",
                }}
              >
                <ImageOff size={40} style={{ color: "rgba(21,66,18,0.35)" }} />
              </div>
            )}
            {/* Gradient overlay bawah */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)",
              }}
            />
            {/* Badge status jalan — pojok kiri atas */}
            {badge && (
              <div className="absolute top-4 left-4">
                <span
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{
                    background: badge.bg,
                    color: badge.textColor,
                    backdropFilter: "blur(8px)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  }}
                >
                  {badge.icon}
                  {badge.label}
                </span>
              </div>
            )}
          </div>

          {/* Galeri foto — hanya tampil kalau destinasi punya lebih dari 1 foto */}
          {d.photoUrls.length > 1 && (
            <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6 pb-1">
              {d.photoUrls.map((url, idx) => {
                const isActive = idx === activePhotoIdx;
                return (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setActivePhotoIdx(idx)}
                    aria-label={`Tampilkan foto ${idx + 1}`}
                    aria-current={isActive}
                    className="relative shrink-0 rounded-xl overflow-hidden transition-opacity hover:opacity-90"
                    style={{
                      width: 120,
                      height: 90,
                      border: isActive ? "2px solid var(--blusukan-primary)" : "1px solid #e8e8e8",
                    }}
                  >
                    <Image
                      src={url}
                      alt={`${d.name} — foto ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="120px"
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Judul & subtitle */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2 items-center">
              <span
                className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ background: "#fef3e7", color: "#805533" }}
              >
                {KATEGORI_LABEL[d.kategori] ?? d.kategori}
              </span>
              {d.vibeTags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(45,90,39,0.1)", color: "#154212" }}
                >
                  {tag}
                </span>
              ))}
              {popularityBadge && (
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: "#fef3e7", color: "#805533" }}
                >
                  {popularityBadge.kind === "trending" ? (
                    <TrendingUp size={13} />
                  ) : (
                    <Star size={13} />
                  )}
                  {popularityBadge.label}
                </span>
              )}
            </div>
            <h1
              className="text-3xl lg:text-4xl font-bold leading-tight"
              style={{ fontFamily: "Montserrat, sans-serif", color: "#1a1c1c" }}
            >
              {d.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <div className="flex items-center gap-1.5">
                <MapPin size={15} style={{ color: "#72796e" }} />
                <span className="text-sm" style={{ color: "#72796e" }}>
                  {KABUPATEN_LABEL[d.kabupaten] ?? d.kabupaten}, Daerah Istimewa Yogyakarta
                </span>
              </div>
              {d.totalReview > 0 && (
                <div className="flex items-center gap-1.5" id="rating-ringkasan">
                  <Star size={15} fill="#f5a623" style={{ color: "#f5a623" }} />
                  <span className="text-sm font-bold" style={{ color: "#1a1c1c" }}>
                    {d.rataRataRating.toFixed(1)}
                  </span>
                  <span className="text-sm" style={{ color: "#72796e" }}>
                    ({d.totalReview} ulasan)
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Layout 2 kolom ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ══ KOLOM KIRI (lg:col-span-2) ══ */}
          <div className="lg:col-span-2 space-y-6">

            {/* Card Informasi */}
            <SectionCard>
              <SectionTitle>Informasi Destinasi</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {d.jamOperasional && (
                  <InfoItem
                    icon={<Clock size={18} />}
                    label="Jam Operasional"
                    value={d.jamOperasional}
                  />
                )}
                <InfoItem
                  icon={<Ticket size={18} />}
                  label="Harga Tiket Masuk"
                  value={
                    d.htmResmi != null
                      ? d.htmResmi === 0
                        ? "Gratis"
                        : formatRupiah(d.htmResmi)
                      : "Informasi tidak tersedia"
                  }
                />
                <InfoItem
                  icon={<MapPin size={18} />}
                  label="Wilayah"
                  value={`${KABUPATEN_LABEL[d.kabupaten] ?? d.kabupaten}, DIY`}
                />
                <InfoItem
                  icon={<Star size={18} />}
                  label="Kategori"
                  value={KATEGORI_LABEL[d.kategori] ?? d.kategori}
                  iconBg="#fef3e7"
                  iconColor="#805533"
                />
              </div>
            </SectionCard>

            {/* Card Fasilitas */}
            <SectionCard>
              <SectionTitle>Fasilitas Umum (Gratis)</SectionTitle>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <FasilitasItem label="Toilet" value={d.hasToilet} icon={<CheckCircle2 size={16} />} />
                <FasilitasItem label="Parkir" value={d.hasParkir} icon={<Car size={16} />} />
                <FasilitasItem label="Tempat Ibadah" value={d.hasTempatIbadah} icon={<Cross size={16} />} />
                <FasilitasItem label="Tempat Duduk" value={d.hasTempatDuduk} icon={<Armchair size={16} />} />
                <FasilitasItem label="Penitipan Barang" value={d.hasPenitipanBarang} icon={<Package size={16} />} />
              </div>
            </SectionCard>

            {/* Section UMKM & Kuliner Lokal — pre-order menu dan/atau reservasi tempat, disembunyikan kalau belum ada warung */}
            <UmkmKulinerSection
              destinationId={d.id}
              warungs={d.warungs}
              jamOperasional={{ jamBuka: d.jamBuka, jamTutup: d.jamTutup, buka24Jam: d.buka24Jam }}
            />

            {/* Section Laporan Wisatawan */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-base font-bold"
                  style={{ fontFamily: "Montserrat, sans-serif", color: "#1a1c1c" }}
                >
                  Ulasan & Laporan Wisatawan
                </h2>
                {d.reports.length > 0 && (
                  <span className="text-xs" style={{ color: "#72796e" }}>
                    {d.reports.length} laporan terbaru
                  </span>
                )}
              </div>

              {d.reports.length === 0 ? (
                <SectionCard>
                  <div className="text-center py-6">
                    <MessageCircle
                      size={36}
                      className="mx-auto mb-3"
                      style={{ color: "#c2c9bb" }}
                    />
                    <p
                      className="text-sm font-medium"
                      style={{ color: "#42493e" }}
                    >
                      Belum ada laporan
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#72796e" }}>
                      Bantu usulkan perbaikan untuk destinasi ini — jadilah pelapor lapangan pertama
                    </p>
                  </div>
                </SectionCard>
              ) : (
                <div className="space-y-4">
                  {d.reports.map((r) => {
                    const signalInfo = r.signalStrength ? SIGNAL_LABEL[r.signalStrength] : null;
                    const crowdLabel = r.crowdLevel ? CROWD_LABEL[r.crowdLevel] : null;
                    const roadLabel = r.roadCondition ? ROAD_LABEL[r.roadCondition] : null;

                    return (
                      <SectionCard key={r.id} className="hover:shadow-md transition-shadow">
                        {/* Header reviewer */}
                        <div className="flex items-start gap-3 mb-4">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                            style={{ background: "#e3efe0", color: "#2d5a27" }}
                          >
                            {getInitials(r.userName)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm font-semibold"
                              style={{ color: "#1a1c1c", fontFamily: "Montserrat, sans-serif" }}
                            >
                              {r.userName}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: "#72796e" }}>
                              {timeAgo(r.createdAt)}
                            </p>
                          </div>
                        </div>

                        {/* Kondisi chips */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {roadLabel && (
                            <InfoChip
                              label={`Jalan: ${roadLabel}`}
                              bg={
                                r.roadCondition === "RUSAK"
                                  ? "#fde8e8"
                                  : r.roadCondition === "SULIT"
                                  ? "#fef3e7"
                                  : "#e8f4e8"
                              }
                              color={
                                r.roadCondition === "RUSAK"
                                  ? "#ba1a1a"
                                  : r.roadCondition === "SULIT"
                                  ? "#805533"
                                  : "#2d5a27"
                              }
                            />
                          )}
                          {signalInfo && (
                            <InfoChip icon={signalInfo.icon} label={signalInfo.label} />
                          )}
                          {crowdLabel && (
                            <InfoChip icon={<Users size={12} />} label={crowdLabel} />
                          )}
                          {r.reportedFee != null && (
                            <InfoChip
                              icon={<Ticket size={12} />}
                              label={r.reportedFee === 0 ? "Gratis" : formatRupiah(r.reportedFee)}
                              bg="#e8f4e8"
                              color="#2d5a27"
                            />
                          )}
                        </div>

                        {/* Catatan / notes */}
                        {r.notes && (
                          <p
                            className="text-sm leading-relaxed italic"
                            style={{ color: "#42493e", borderLeft: "3px solid #e3efe0", paddingLeft: "12px" }}
                          >
                            &ldquo;{r.notes}&rdquo;
                          </p>
                        )}
                      </SectionCard>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section Ulasan Wisatawan — rating bintang & komentar, terpisah dari laporan lapangan */}
            <UlasanWisatawanSection
              destinationId={d.id}
              reviews={d.reviews}
              isLoggedIn={d.isLoggedIn}
              myReview={d.myReview}
            />
          </div>

          {/* ══ KOLOM KANAN — sidebar sticky ══ */}
          <div className="lg:col-span-1">
            <div className="space-y-5 lg:sticky lg:top-28">

              {/* Card Checkout Tiket Masuk */}
              <CheckoutTiketCard destinationId={d.id} htmResmi={d.htmResmi} htmAnak={d.htmAnak} />

              {/* Card Sewa Fasilitas — disembunyikan otomatis kalau belum ada Fasilitas */}
              <SewaFasilitasSection
                destinationId={d.id}
                fasilitasList={d.fasilitas}
                jamOperasional={{ jamBuka: d.jamBuka, jamTutup: d.jamTutup, buka24Jam: d.buka24Jam }}
              />

              {/* Card Peta Lokasi */}
              <SectionCard className="!p-0 overflow-hidden">
                {/* Peta */}
                <div style={{ height: 250 }}>
                  <DestinationMap destinations={mapPoint} />
                </div>
                {/* Tombol Google Maps */}
                <div className="p-4">
                  <p
                    className="text-sm font-bold mb-3"
                    style={{ fontFamily: "Montserrat, sans-serif", color: "#1a1c1c" }}
                  >
                    Peta Lokasi
                  </p>
                  <a
                    href={`https://www.google.com/maps?q=${d.latitude},${d.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    id="btn-google-maps"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
                    style={{
                      border: "1px solid #c2c9bb",
                      color: "#1a1c1c",
                      background: "#fafafa",
                    }}
                  >
                    <ExternalLink size={15} style={{ color: "#2d5a27" }} />
                    Buka di Google Maps
                  </a>
                </div>
              </SectionCard>

              {/* Card Butuh Bantuan Akses */}
              {needsHelp && d.localServices.length > 0 && (
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    border: `2px solid ${d.routeStatus === "RUSAK" ? "#ba1a1a" : "#44372a"}`,
                    boxShadow: `0 0 0 4px ${d.routeStatus === "RUSAK" ? "rgba(186,26,26,0.08)" : "rgba(68,55,42,0.08)"}`,
                  }}
                >
                  {/* Header warning */}
                  <div
                    className="px-5 py-4"
                    style={{
                      background: d.routeStatus === "RUSAK" ? "#fde8e8" : "#fdf0e0",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle
                        size={16}
                        style={{ color: d.routeStatus === "RUSAK" ? "#ba1a1a" : "#805533" }}
                      />
                      <h3
                        className="text-sm font-bold"
                        style={{
                          fontFamily: "Montserrat, sans-serif",
                          color: d.routeStatus === "RUSAK" ? "#ba1a1a" : "#44372a",
                        }}
                      >
                        Perlu Perhatian — Usulan Perbaikan Akses
                      </h3>
                    </div>
                    <p className="text-xs" style={{ color: "#72796e" }}>
                      Jalan menuju sini berstatus{" "}
                      <strong>{ROAD_LABEL[d.routeStatus]?.toLowerCase()}</strong>. Warga
                      mengusulkan perbaikan akses ke destinasi ini — sementara itu, hubungi jasa
                      lokal berikut untuk bantuan:
                    </p>
                  </div>

                  {/* List jasa */}
                  <div
                    className="divide-y"
                    style={{ background: "#ffffff", borderColor: "#f0f0f0" }}
                  >
                    {d.localServices.map((s) => (
                      <div key={s.id} className="px-5 py-4">
                        <p
                          className="text-sm font-semibold"
                          style={{ color: "#1a1c1c", fontFamily: "Montserrat, sans-serif" }}
                        >
                          {s.providerName}
                        </p>
                        <p className="text-xs mt-0.5 mb-2" style={{ color: "#72796e" }}>
                          {s.serviceType}
                        </p>
                        {s.baseRate != null && (
                          <p
                            className="text-sm font-bold mb-3"
                            style={{ color: "#2d5a27" }}
                          >
                            {formatRupiah(s.baseRate)}
                          </p>
                        )}
                        <a
                          href={`https://wa.me/${s.contactWa.replace(/\D/g, "")}?text=${encodeURIComponent(
                            `Halo ${s.providerName}, saya butuh bantuan akses ke destinasi *${d.name}*. Apakah tersedia?`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          id={`wa-${s.id}`}
                          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-85"
                          style={{ background: "#25D366", color: "#ffffff" }}
                        >
                          <MessageCircle size={15} />
                          Pesan via WhatsApp
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
