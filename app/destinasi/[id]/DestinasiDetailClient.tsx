"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DateTimePicker from "@/components/ui/datetime-picker";
import RupiahInput from "@/components/ui/rupiah-input";
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
  Bike,
  Compass,
  Loader2,
} from "lucide-react";
import type { MapDestination } from "@/components/DestinationMap";
import { getPopularityBadge } from "@/lib/popularity";
import { formatJamOperasionalLabel, isJamBukaValid, type JamOperasionalDestination } from "@/lib/jam-operasional";

// Leaflet browser-only
const DestinationMap = dynamic(() => import("@/components/DestinationMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center" style={{ background: "var(--blusukan-surface-container)" }}>
      <span className="text-sm" style={{ color: "var(--blusukan-outline)" }}>Memuat peta…</span>
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

type TitikJemput = {
  id: string;
  namaLokasi: string;
  hargaTambahan: number;
  estimasiWaktu: string | null;
};

type LocalService = {
  id: string;
  providerName: string;
  serviceType: string;
  contactWa: string;
  baseRate: number | null;
  kapasitasPenumpang: number | null;
  fotoUrl: string | null;
  titikJemput: TitikJemput[];
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

type SewaFasilitas = {
  id: string;
  nama: string;
  hargaSewa: number;
  satuanWaktu: string;
  jumlahUnit: number;
  lokasiDalamDestinasi: string | null;
  deskripsiManfaat: string | null;
  fotoUrl: string | null;
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
  userPhone: string | null;
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

// Label vibe tag — samakan dengan beranda supaya tidak menampilkan enum mentah (SPOT_FOTO)
const VIBE_LABEL: Record<string, string> = {
  SUNSET: "Sunset Spot",
  SUNRISE: "Sunrise Spot",
  SPOT_FOTO: "Spot Foto",
  QUIET_PLACE: "Quiet Place",
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
      return { label: "Kondisi Aman", bg: "var(--blusukan-primary)", textColor: "#ffffff", icon: <CheckCircle size={14} /> };
    case "SULIT":
      return { label: "Berlumpur / Sulit", bg: "var(--blusukan-tertiary)", textColor: "#ffffff", icon: <Droplets size={14} /> };
    case "RUSAK":
      return { label: "Perlu Perhatian", bg: "var(--blusukan-error)", textColor: "#ffffff", icon: <AlertTriangle size={14} /> };
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

/** Card wrapper dengan shadow dan sudut membulat */
function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl p-6 ${className}`}
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

/** Judul section dengan garis aksen di kiri */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="flex items-center gap-2.5 text-base font-extrabold mb-5"
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

/** Chip kecil info (kondisi jalan, sinyal, dll) */
function InfoChip({
  icon,
  label,
  color = "var(--blusukan-on-surface-variant)",
  bg = "var(--blusukan-surface-container)",
}: {
  icon?: React.ReactNode;
  label: string;
  color?: string;
  bg?: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
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
  iconBg = "var(--blusukan-primary-container)",
  iconColor = "var(--blusukan-primary)",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconBg?: string;
  iconColor?: string;
}) {
  return (
    <div
      className="flex items-center gap-3.5 p-3 rounded-2xl transition-colors"
      style={{ background: "var(--blusukan-surface-low)" }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: iconBg, color: iconColor }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--blusukan-outline)", fontFamily: "Inter, sans-serif" }}
        >
          {label}
        </p>
        <p
          className="text-sm font-bold mt-0.5"
          style={{ color: "var(--blusukan-on-surface)", fontFamily: "Inter, sans-serif" }}
        >
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
      className="flex items-center gap-2.5 py-2.5 px-3.5 rounded-xl transition-colors"
      style={{
        background: value
          ? "color-mix(in srgb, var(--blusukan-primary-container) 55%, transparent)"
          : "var(--blusukan-surface-low)",
        border: `1px solid ${
          value
            ? "color-mix(in srgb, var(--blusukan-primary) 22%, transparent)"
            : "var(--blusukan-outline-variant)"
        }`,
      }}
    >
      <span style={{ color: value ? "var(--blusukan-primary)" : "var(--blusukan-outline)" }}>
        {icon}
      </span>
      <span
        className="text-sm flex-1 font-medium"
        style={{
          color: value ? "var(--blusukan-on-surface)" : "var(--blusukan-outline)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {label}
      </span>
      {value ? (
        <CheckCircle2 size={15} style={{ color: "var(--blusukan-primary)" }} />
      ) : (
        <XCircle size={15} style={{ color: "var(--blusukan-outline)" }} />
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
        <p className="text-sm font-semibold" style={{ color: "var(--blusukan-on-surface)", fontFamily: "Inter, sans-serif" }}>
          {label}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--blusukan-outline)" }}>
          {formatRupiah(harga)} / orang
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, jumlah - 1))}
          disabled={jumlah <= min}
          aria-label={`Kurangi jumlah ${label}`}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--blusukan-surface-container)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          style={{ border: "1px solid var(--blusukan-outline-variant)", color: "var(--blusukan-primary)" }}
        >
          <Minus size={14} />
        </button>
        <span className="w-6 text-center text-sm font-bold" style={{ color: "var(--blusukan-on-surface)", fontFamily: "Inter, sans-serif" }}>
          {jumlah}
        </span>
        <button
          type="button"
          onClick={() => onChange(jumlah + 1)}
          aria-label={`Tambah jumlah ${label}`}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--blusukan-surface-container)]"
          style={{ border: "1px solid var(--blusukan-outline-variant)", color: "var(--blusukan-primary)" }}
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
          style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
        >
          Beli Tiket Masuk
        </h2>
        {isGratis && (
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }}
          >
            Gratis
          </span>
        )}
      </div>

      {isTidakTersedia ? (
        <p className="text-sm" style={{ color: "var(--blusukan-outline)" }}>
          Informasi harga tiket belum tersedia untuk destinasi ini.
        </p>
      ) : isGratis ? (
        <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Tidak ada biaya masuk untuk destinasi ini.
        </p>
      ) : adaHargaAnak ? (
        <>
          <TiketStepperRow label="Tiket Dewasa" harga={htmResmi ?? 0} jumlah={jumlahDewasa} onChange={setJumlahDewasa} />
          <TiketStepperRow label="Tiket Anak-anak" harga={htmAnak ?? 0} jumlah={jumlahAnak} onChange={setJumlahAnak} />

          {/* Live price breakdown */}
          <div className="rounded-xl p-4 mb-3 space-y-1" style={{ background: "var(--blusukan-primary-container)" }}>
            {jumlahDewasa > 0 && (
              <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)", fontFamily: "Inter, sans-serif" }}>
                {jumlahDewasa} x {formatRupiah(htmResmi ?? 0)} (Dewasa) = {formatRupiah(totalDewasa)}
              </p>
            )}
            {jumlahAnak > 0 && (
              <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)", fontFamily: "Inter, sans-serif" }}>
                {jumlahAnak} x {formatRupiah(htmAnak ?? 0)} (Anak-anak) = {formatRupiah(totalAnak)}
              </p>
            )}
            <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)", fontFamily: "Inter, sans-serif" }}>
              Total: <strong style={{ color: "var(--blusukan-primary)" }}>{formatRupiah(totalGabungan)}</strong>
            </p>
          </div>

          {error && (
            <p className="text-xs mb-3" style={{ color: "var(--blusukan-error)" }}>
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
            <p className="text-xs mt-2 text-center" style={{ color: "var(--blusukan-outline)" }}>
              Pilih minimal 1 tiket Dewasa atau Anak-anak
            </p>
          )}

          <p className="text-xs mt-3" style={{ color: "var(--blusukan-outline)" }}>
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
                style={{ color: "var(--blusukan-on-surface)", fontFamily: "Inter, sans-serif" }}
              >
                Tiket Masuk Dewasa
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--blusukan-outline)" }}>
                {formatRupiah(htmResmi)} / orang
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setJumlah((j) => Math.max(1, j - 1))}
                disabled={jumlah <= 1}
                aria-label="Kurangi jumlah tiket"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--blusukan-surface-container)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                style={{ border: "1px solid var(--blusukan-outline-variant)", color: "var(--blusukan-primary)" }}
              >
                <Minus size={14} />
              </button>
              <span
                className="w-6 text-center text-sm font-bold"
                style={{ color: "var(--blusukan-on-surface)", fontFamily: "Inter, sans-serif" }}
              >
                {jumlah}
              </span>
              <button
                type="button"
                onClick={() => setJumlah((j) => j + 1)}
                aria-label="Tambah jumlah tiket"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--blusukan-surface-container)]"
                style={{ border: "1px solid var(--blusukan-outline-variant)", color: "var(--blusukan-primary)" }}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Live price breakdown */}
          <div className="rounded-xl p-4 mb-3" style={{ background: "var(--blusukan-primary-container)" }}>
            <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)", fontFamily: "Inter, sans-serif" }}>
              {jumlah} x {formatRupiah(htmResmi)} ={" "}
              <strong style={{ color: "var(--blusukan-primary)" }}>{formatRupiah(total)}</strong>
            </p>
          </div>

          {error && (
            <p className="text-xs mb-3" style={{ color: "var(--blusukan-error)" }}>
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

          <p className="text-xs mt-3" style={{ color: "var(--blusukan-outline)" }}>
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
    <div className="rounded-xl p-4" style={{ border: "1px solid var(--blusukan-outline-variant)" }}>
      {fasilitas.fotoUrl && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-3">
          <Image src={fasilitas.fotoUrl} alt={fasilitas.nama} fill className="object-cover" sizes="(max-width: 640px) 100vw, 400px" />
        </div>
      )}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--blusukan-on-surface)", fontFamily: "Inter, sans-serif" }}>
            {fasilitas.nama}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--blusukan-outline)" }}>
            {formatRupiah(fasilitas.hargaSewa)} / {fasilitas.satuanWaktu}
          </p>
          {fasilitas.lokasiDalamDestinasi && (
            <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--blusukan-outline)" }}>
              <MapPin size={11} />
              {fasilitas.lokasiDalamDestinasi}
            </p>
          )}
          {fasilitas.deskripsiManfaat && (
            <p className="text-xs italic mt-1" style={{ color: "var(--blusukan-outline)" }}>
              &ldquo;{fasilitas.deskripsiManfaat}&rdquo;
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setJumlah((j) => Math.max(1, j - 1))}
            disabled={jumlah <= 1}
            aria-label={`Kurangi jumlah ${fasilitas.nama}`}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--blusukan-surface-container)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            style={{ border: "1px solid var(--blusukan-outline-variant)", color: "var(--blusukan-primary)" }}
          >
            <Minus size={14} />
          </button>
          <span className="w-6 text-center text-sm font-bold" style={{ color: "var(--blusukan-on-surface)", fontFamily: "Inter, sans-serif" }}>
            {jumlah}
          </span>
          <button
            type="button"
            onClick={() => setJumlah((j) => Math.min(fasilitas.jumlahUnit, j + 1))}
            disabled={jumlah >= fasilitas.jumlahUnit}
            aria-label={`Tambah jumlah ${fasilitas.nama}`}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--blusukan-surface-container)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            style={{ border: "1px solid var(--blusukan-outline-variant)", color: "var(--blusukan-primary)" }}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="mb-3">
        <label
          htmlFor={`jadwal-${fasilitas.id}`}
          className="block text-xs font-medium mb-1"
          style={{ color: "var(--blusukan-outline)" }}
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

      <div className="rounded-xl p-3 mb-3" style={{ background: "var(--blusukan-primary-container)" }}>
        <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)", fontFamily: "Inter, sans-serif" }}>
          {jumlah} x {formatRupiah(fasilitas.hargaSewa)} ={" "}
          <strong style={{ color: "var(--blusukan-primary)" }}>{formatRupiah(total)}</strong>
        </p>
      </div>

      {error && (
        <p className="text-xs mb-3" style={{ color: "var(--blusukan-error)" }}>
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
      style={{ borderColor: "var(--blusukan-surface-container)" }}
    >
      <div>
        <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)", fontFamily: "Inter, sans-serif" }}>
          {item.name}
        </p>
        <p className="text-xs" style={{ color: "var(--blusukan-outline)" }}>
          {formatRupiah(item.price)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, kuantitas - 1))}
          disabled={kuantitas <= 0}
          aria-label={`Kurangi jumlah ${item.name}`}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--blusukan-surface-container)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          style={{ border: "1px solid var(--blusukan-outline-variant)", color: "var(--blusukan-primary)" }}
        >
          <Minus size={12} />
        </button>
        <span className="w-5 text-center text-sm font-bold" style={{ color: "var(--blusukan-on-surface)", fontFamily: "Inter, sans-serif" }}>
          {kuantitas}
        </span>
        <button
          type="button"
          onClick={() => onChange(kuantitas + 1)}
          aria-label={`Tambah jumlah ${item.name}`}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--blusukan-surface-container)]"
          style={{ border: "1px solid var(--blusukan-outline-variant)", color: "var(--blusukan-primary)" }}
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
      style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
    >
      <div className="h-28 relative w-full" style={{ background: "var(--blusukan-surface-container-highest)" }}>
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
          style={{ color: "var(--blusukan-on-surface)", fontFamily: "Montserrat, sans-serif" }}
        >
          {warung.name}
        </p>
        {warung.namaPemilik && (
          <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "var(--blusukan-outline)" }}>
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
        <DialogHeader className="flex flex-row items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor: "var(--blusukan-outline-variant)" }}>
          <DialogTitle className="text-sm font-bold" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}>
            {warung.name}
          </DialogTitle>
          <button
            type="button"
            id="btn-tutup-detail-umkm"
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-[var(--blusukan-surface-low)]"
            style={{ color: "var(--blusukan-on-surface-variant)" }}
            aria-label="Tutup detail UMKM"
          >
            <X size={16} />
          </button>
        </DialogHeader>

        <div className="overflow-y-auto p-4">
          {/* Galeri foto */}
          <div className="h-40 rounded-xl overflow-hidden mb-2" style={{ background: "var(--blusukan-surface-container-highest)" }}>
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
                    border: idx === activePhotoIdx ? "2px solid var(--blusukan-primary)" : "1px solid var(--blusukan-outline-variant)",
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
            <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--blusukan-outline)" }}>
              <User size={11} />
              {warung.namaPemilik}
            </p>
          )}
          {warung.location && (
            <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "var(--blusukan-outline)" }}>
              <MapPin size={12} />
              {warung.location}
            </p>
          )}

          <div className="mt-3 pt-3" style={{ borderTop: "1px dashed var(--blusukan-outline-variant)" }}>
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
              <p className="text-sm mb-3" style={{ color: "var(--blusukan-outline)" }}>
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
                  <span className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)", fontFamily: "Inter, sans-serif" }}>
                    Reservasi tempat duduk
                  </span>
                </label>

                {reservasiTempat && (
                  <div className="mb-3">
                    <label
                      htmlFor={`jadwal-umkm-${warung.id}`}
                      className="block text-xs font-medium mb-1"
                      style={{ color: "var(--blusukan-outline)" }}
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
              <div className="rounded-xl p-3 mb-3" style={{ background: "var(--blusukan-primary-container)" }}>
                <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)", fontFamily: "Inter, sans-serif" }}>
                  Total Menu: <strong style={{ color: "var(--blusukan-primary)" }}>{formatRupiah(total)}</strong>
                </p>
              </div>
            )}

            {error && (
              <p className="text-xs mb-3" style={{ color: "var(--blusukan-error)" }}>
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
              <p className="text-xs mt-2 text-center" style={{ color: "var(--blusukan-outline)" }}>
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
          fill={rating >= n ? "var(--blusukan-rating)" : "none"}
          style={{ color: rating >= n ? "var(--blusukan-rating)" : "var(--blusukan-outline-variant)" }}
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
              fill={filled ? "var(--blusukan-rating)" : "none"}
              style={{ color: filled ? "var(--blusukan-rating)" : "var(--blusukan-outline-variant)" }}
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
        style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
      >
        Ulasan Wisatawan
      </h2>
      <div className="space-y-4">
        <ReviewFormCard destinationId={destinationId} isLoggedIn={isLoggedIn} myReview={myReview} />

        {reviews.length === 0 ? (
          <SectionCard>
            <div className="text-center py-6">
              <Star size={36} className="mx-auto mb-3" style={{ color: "var(--blusukan-outline-variant)" }} />
              <p className="text-sm font-medium" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                Belum ada ulasan
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--blusukan-outline)" }}>
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
                  style={{ background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }}
                >
                  {getInitials(r.userName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--blusukan-on-surface)", fontFamily: "Montserrat, sans-serif" }}
                  >
                    {r.userName}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StarRow rating={r.rating} size={13} />
                    <span className="text-xs" style={{ color: "var(--blusukan-outline)" }}>
                      {timeAgo(r.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              {r.komentar && (
                <p className="text-sm leading-relaxed" style={{ color: "var(--blusukan-on-surface-variant)" }}>
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

// ── Booking Transportasi Lokal ──────────────────────────────────
const SERVICE_TYPE_LABEL: Record<string, string> = {
  OJEK: "Ojek Lokal",
  JEEP: "Sewa Jeep",
  GUIDE: "Pemandu Wisata",
};

const SERVICE_TYPE_ICON: Record<string, React.ReactNode> = {
  OJEK: <Bike size={13} />,
  JEEP: <Car size={13} />,
  GUIDE: <Compass size={13} />,
};

function formatTanggalBooking(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(year, month - 1, day));
}

function todayISODate(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function BookingSummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-xs shrink-0" style={{ color: "var(--blusukan-outline)" }}>
        {label}
      </span>
      <span className="text-xs font-semibold text-right" style={{ color: "var(--blusukan-on-surface)" }}>
        {value}
      </span>
    </div>
  );
}

/** Kartu ringkas jasa transport — foto, nama provider, badge jenis layanan, tarif dasar, kapasitas. Klik untuk buka form booking. */
function TransportServiceCard({ service, onClick }: { service: LocalService; onClick: () => void }) {
  return (
    <button
      type="button"
      id={`card-transport-${service.id}`}
      onClick={onClick}
      className="text-left rounded-xl overflow-hidden transition-all hover:shadow-md"
      style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
    >
      {service.fotoUrl && (
        <div className="relative w-full aspect-video">
          <Image src={service.fotoUrl} alt={service.providerName} fill className="object-cover" sizes="(max-width: 640px) 100vw, 300px" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-sm font-bold" style={{ color: "var(--blusukan-on-surface)", fontFamily: "Montserrat, sans-serif" }}>
            {service.providerName}
          </p>
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap"
            style={{ background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }}
          >
            {SERVICE_TYPE_ICON[service.serviceType]}
            {SERVICE_TYPE_LABEL[service.serviceType] ?? service.serviceType}
          </span>
        </div>
        {service.baseRate != null && (
          <p className="text-sm font-bold" style={{ color: "var(--blusukan-primary)" }}>
            {formatRupiah(service.baseRate)}{" "}
            <span className="text-xs font-normal" style={{ color: "var(--blusukan-outline)" }}>
              tarif dasar
            </span>
          </p>
        )}
        {service.kapasitasPenumpang != null && (
          <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--blusukan-outline)" }}>
            <User size={11} />
            Kapasitas {service.kapasitasPenumpang} penumpang
          </p>
        )}
      </div>
    </button>
  );
}

type ConfirmedTransportBooking = {
  travelDate: string;
  meetingPoint: string;
  contactNumber: string;
  notes: string;
};

/** Dialog form booking inline — tanggal, titik jemput, kontak, catatan. Submit ke /api/booking, konfirmasi WA inline (bukan navigasi halaman). */
function TransportBookingDialog({
  destinationId,
  destinationName,
  service,
  defaultContactNumber,
  isLoggedIn,
  open,
  onOpenChange,
}: {
  destinationId: string;
  destinationName: string;
  service: LocalService;
  defaultContactNumber: string;
  isLoggedIn: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [travelDate, setTravelDate] = useState("");
  const [titikJemputChoice, setTitikJemputChoice] = useState("");
  const [meetingPointManual, setMeetingPointManual] = useState("");
  const [contactNumber, setContactNumber] = useState(defaultContactNumber);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState<ConfirmedTransportBooking | null>(null);

  const hasTitikJemput = service.titikJemput.length > 0;
  const selectedTitikJemput = hasTitikJemput
    ? service.titikJemput.find((t) => t.id === titikJemputChoice) ?? null
    : null;
  const resolvedMeetingPoint = selectedTitikJemput ? selectedTitikJemput.namaLokasi : meetingPointManual.trim();
  const hargaTambahan = selectedTitikJemput?.hargaTambahan ?? 0;
  const totalHarga = (service.baseRate ?? 0) + hargaTambahan;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!travelDate) {
      setError("Pilih tanggal perjalanan terlebih dahulu.");
      return;
    }
    if (!contactNumber.trim()) {
      setError("Nomor kontak wajib diisi.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          destinationId,
          travelDate,
          meetingPoint: resolvedMeetingPoint || undefined,
          notes: notes.trim() || undefined,
          contactNumber: contactNumber.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal membuat booking. Coba lagi.");
        setLoading(false);
        return;
      }

      setConfirmed({
        travelDate,
        meetingPoint: resolvedMeetingPoint,
        contactNumber: contactNumber.trim(),
        notes: notes.trim(),
      });
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  }

  if (!isLoggedIn) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent showCloseButton={false} className="!max-w-sm !w-[calc(100vw-2rem)] !p-6">
          <DialogHeader>
            <DialogTitle
              className="text-sm font-bold"
              style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
            >
              {service.providerName}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm" style={{ color: "var(--blusukan-outline)" }}>
            <Link
              href="/login"
              id="link-login-booking-transport"
              className="font-semibold hover:underline"
              style={{ color: "var(--blusukan-primary)" }}
            >
              Login
            </Link>{" "}
            untuk booking jasa transport ini.
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  if (confirmed) {
    const waMessage =
      `Halo ${service.providerName}, saya baru saja melakukan reservasi *${
        SERVICE_TYPE_LABEL[service.serviceType] ?? service.serviceType
      }* melalui Blusukan.\n\n` +
      `Destinasi: ${destinationName}\n` +
      `Tanggal: ${formatTanggalBooking(confirmed.travelDate)}\n` +
      `Titik Jemput: ${confirmed.meetingPoint || "-"}\n` +
      `Nomor Kontak: ${confirmed.contactNumber}` +
      (confirmed.notes ? `\nCatatan: ${confirmed.notes}` : "") +
      `\n\nMohon konfirmasi ketersediaannya. Terima kasih.`;
    const waHref = `https://wa.me/${service.contactWa.replace(/\D/g, "")}?text=${encodeURIComponent(waMessage)}`;

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent showCloseButton={false} className="!max-w-sm !w-[calc(100vw-2rem)] !p-6">
          <div className="flex flex-col items-center text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
              style={{ background: "var(--blusukan-primary-container)" }}
            >
              <CheckCircle2 size={30} style={{ color: "var(--blusukan-primary)" }} />
            </div>
            <h3
              className="text-base font-bold mb-1"
              style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
            >
              Booking Berhasil Dibuat
            </h3>
            <p className="text-xs mb-5" style={{ color: "var(--blusukan-outline)" }}>
              Reservasi tersimpan. Hubungi penyedia jasa via WhatsApp untuk konfirmasi ketersediaan.
            </p>
            <div className="w-full space-y-2 mb-5 text-left">
              <BookingSummaryRow label="Tanggal" value={formatTanggalBooking(confirmed.travelDate)} />
              {confirmed.meetingPoint && <BookingSummaryRow label="Titik Jemput" value={confirmed.meetingPoint} />}
              <BookingSummaryRow label="Nomor Kontak" value={confirmed.contactNumber} />
              {confirmed.notes && <BookingSummaryRow label="Catatan" value={confirmed.notes} />}
            </div>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              id={`btn-wa-booking-${service.id}`}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-bold transition-opacity hover:opacity-90 mb-2"
              style={{ background: "#25D366", color: "#ffffff" }}
            >
              <MessageCircle size={16} />
              Hubungi via WhatsApp
            </a>
            <button
              type="button"
              id={`btn-tutup-konfirmasi-booking-${service.id}`}
              onClick={() => onOpenChange(false)}
              className="w-full py-2.5 rounded-lg text-sm font-bold transition-opacity hover:opacity-80"
              style={{ border: "1px solid var(--blusukan-outline-variant)", color: "var(--blusukan-on-surface)" }}
            >
              Tutup
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="!max-w-sm !w-[calc(100vw-2rem)] !max-h-[85vh] !p-0 overflow-hidden flex flex-col"
      >
        <DialogHeader
          className="flex flex-row items-center justify-between px-4 py-3 border-b shrink-0"
          style={{ borderColor: "var(--blusukan-outline-variant)" }}
        >
          <DialogTitle className="text-sm font-bold" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}>
            Booking {service.providerName}
          </DialogTitle>
          <button
            type="button"
            id="btn-tutup-booking-transport"
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-[var(--blusukan-surface-low)]"
            style={{ color: "var(--blusukan-on-surface-variant)" }}
            aria-label="Tutup form booking"
          >
            <X size={16} />
          </button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 space-y-4">
          {service.baseRate != null && (
            <div>
              <p className="text-sm font-bold" style={{ color: "var(--blusukan-primary)" }}>
                {formatRupiah(service.baseRate)}{" "}
                <span className="text-xs font-normal" style={{ color: "var(--blusukan-outline)" }}>
                  tarif dasar
                </span>
              </p>
              {hargaTambahan > 0 && (
                <>
                  <p className="text-xs mt-0.5" style={{ color: "var(--blusukan-outline)" }}>
                    + {formatRupiah(hargaTambahan)} titik jemput ({selectedTitikJemput?.namaLokasi})
                  </p>
                  <p className="text-sm font-bold mt-1" style={{ color: "var(--blusukan-primary)" }}>
                    Total: {formatRupiah(totalHarga)}
                  </p>
                </>
              )}
            </div>
          )}

          <div>
            <label
              htmlFor={`travelDate-${service.id}`}
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--blusukan-outline)" }}
            >
              Tanggal Perjalanan <span style={{ color: "var(--blusukan-error)" }}>*</span>
            </label>
            <input
              id={`travelDate-${service.id}`}
              type="date"
              required
              min={todayISODate()}
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              className="w-full px-3 py-2.5 text-sm"
              style={{ border: "1px solid var(--blusukan-outline-variant)", borderRadius: "8px", color: "var(--blusukan-on-surface)" }}
            />
          </div>

          {hasTitikJemput ? (
            <div>
              <label
                htmlFor={`titikJemput-${service.id}`}
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--blusukan-outline)" }}
              >
                Titik Jemput
              </label>
              <select
                id={`titikJemput-${service.id}`}
                value={titikJemputChoice}
                onChange={(e) => setTitikJemputChoice(e.target.value)}
                className="w-full px-3 py-2.5 text-sm"
                style={{ border: "1px solid var(--blusukan-outline-variant)", borderRadius: "8px", color: "var(--blusukan-on-surface)" }}
              >
                <option value="">-- Pilih titik jemput --</option>
                {service.titikJemput.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.namaLokasi}
                    {t.hargaTambahan > 0 ? ` (+${formatRupiah(t.hargaTambahan)})` : ""}
                    {t.estimasiWaktu ? ` · ${t.estimasiWaktu}` : ""}
                  </option>
                ))}
                <option value="LAINNYA">Lainnya (isi manual)</option>
              </select>

              {titikJemputChoice === "LAINNYA" && (
                <input
                  type="text"
                  placeholder="misal: Terminal Giwangan, Yogyakarta"
                  value={meetingPointManual}
                  onChange={(e) => setMeetingPointManual(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm mt-2"
                  style={{ border: "1px solid var(--blusukan-outline-variant)", borderRadius: "8px", color: "var(--blusukan-on-surface)" }}
                />
              )}
            </div>
          ) : (
            <div>
              <label
                htmlFor={`meetingPoint-${service.id}`}
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--blusukan-outline)" }}
              >
                Titik Jemput
              </label>
              <input
                id={`meetingPoint-${service.id}`}
                type="text"
                placeholder="misal: Terminal Giwangan, Yogyakarta"
                value={meetingPointManual}
                onChange={(e) => setMeetingPointManual(e.target.value)}
                className="w-full px-3 py-2.5 text-sm"
                style={{ border: "1px solid var(--blusukan-outline-variant)", borderRadius: "8px", color: "var(--blusukan-on-surface)" }}
              />
            </div>
          )}

          <div>
            <label
              htmlFor={`contactNumber-${service.id}`}
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--blusukan-outline)" }}
            >
              Nomor Kontak <span style={{ color: "var(--blusukan-error)" }}>*</span>
            </label>
            <input
              id={`contactNumber-${service.id}`}
              type="tel"
              required
              placeholder="08xxxxxxxxxx"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="w-full px-3 py-2.5 text-sm"
              style={{ border: "1px solid var(--blusukan-outline-variant)", borderRadius: "8px", color: "var(--blusukan-on-surface)" }}
            />
          </div>

          <div>
            <label
              htmlFor={`notes-${service.id}`}
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--blusukan-outline)" }}
            >
              Catatan Tambahan
            </label>
            <textarea
              id={`notes-${service.id}`}
              rows={3}
              placeholder="misal: rombongan 4 orang, bawa anak kecil"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 text-sm resize-none"
              style={{ border: "1px solid var(--blusukan-outline-variant)", borderRadius: "8px", color: "var(--blusukan-on-surface)" }}
            />
          </div>

          {error && (
            <p className="text-xs" style={{ color: "var(--blusukan-error)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            id={`btn-submit-booking-${service.id}`}
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
          >
            {loading ? "Memproses..." : "Ajukan Booking"}
          </button>

          <p className="text-xs text-center" style={{ color: "var(--blusukan-outline)" }}>
            Ini bukan transaksi pembayaran. Konfirmasi akhir dilakukan langsung dengan penyedia jasa via WhatsApp.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Section Booking Transportasi Lokal — grid card jasa tervalidasi milik destinasi ini, klik untuk buka form booking inline. Disembunyikan kalau belum ada jasa. */
function BookingTransportSection({
  destinationId,
  destinationName,
  services,
  isLoggedIn,
  defaultContactNumber,
}: {
  destinationId: string;
  destinationName: string;
  services: LocalService[];
  isLoggedIn: boolean;
  defaultContactNumber: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedService = services.find((s) => s.id === selectedId) ?? null;

  if (services.length === 0) return null;

  return (
    <SectionCard>
      <SectionTitle>
        <span className="flex items-center gap-2">
          <Car size={18} />
          Booking Transportasi Lokal
        </span>
      </SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {services.map((s) => (
          <TransportServiceCard key={s.id} service={s} onClick={() => setSelectedId(s.id)} />
        ))}
      </div>

      {selectedService && (
        <TransportBookingDialog
          destinationId={destinationId}
          destinationName={destinationName}
          service={selectedService}
          defaultContactNumber={defaultContactNumber}
          isLoggedIn={isLoggedIn}
          open={selectedId !== null}
          onOpenChange={(open) => {
            if (!open) setSelectedId(null);
          }}
        />
      )}
    </SectionCard>
  );
}

// ── Laporkan Kondisi / Usulan Perbaikan ─────────────────────────
const ROAD_CONDITION_OPTIONS = [
  { value: "MUDAH", label: "Mudah" },
  { value: "SEDANG", label: "Sedang" },
  { value: "SULIT", label: "Sulit" },
  { value: "RUSAK", label: "Rusak" },
] as const;

const SIGNAL_STRENGTH_OPTIONS = [
  { value: "LEMAH", label: "Lemah" },
  { value: "SEDANG", label: "Sedang" },
  { value: "KUAT", label: "Kuat" },
] as const;

const CROWD_LEVEL_OPTIONS = [
  { value: "SEPI", label: "Sepi" },
  { value: "SEDANG", label: "Sedang" },
  { value: "PADAT", label: "Padat" },
] as const;

const LAPORAN_FASILITAS_FIELDS = [
  { key: "toiletLayak", label: "Toilet layak" },
  { key: "parkirLayak", label: "Parkir layak" },
  { key: "tempatIbadahLayak", label: "Tempat ibadah layak" },
  { key: "tempatDudukLayak", label: "Tempat duduk layak" },
  { key: "penitipanBarangLayak", label: "Penitipan barang layak" },
] as const;

function LaporanPillGroup({
  label,
  options,
  value,
  onChange,
  error,
}: {
  label: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--blusukan-outline)" }}>
        {label}
      </label>
      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className="py-2.5 text-xs font-semibold text-center transition-colors rounded-lg"
              style={{
                border: `1.5px solid ${selected ? "var(--blusukan-primary)" : "var(--blusukan-outline-variant)"}`,
                background: selected ? "var(--blusukan-primary-container)" : "#ffffff",
                color: selected ? "var(--blusukan-primary)" : "var(--blusukan-on-surface)",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {error && (
        <p className="text-xs mt-1.5" style={{ color: "var(--blusukan-error)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

type GeoStatus = "loading" | "granted" | "denied" | "error";

/** Section laporan kondisi lapangan — form sama seperti /laporan, tapi destinationId sudah otomatis terisi dari halaman ini. Sukses ditampilkan inline, tidak redirect. */
function LaporKondisiSection({
  destinationId,
  fallbackLatitude,
  fallbackLongitude,
  isLoggedIn,
}: {
  destinationId: string;
  fallbackLatitude: number;
  fallbackLongitude: number;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [roadCondition, setRoadCondition] = useState("");
  const [signalStrength, setSignalStrength] = useState("");
  const [crowdLevel, setCrowdLevel] = useState("");
  const [fasilitas, setFasilitas] = useState<Record<string, boolean>>({});
  const [reportedFee, setReportedFee] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("loading");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus("error");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setGeoStatus("granted");
      },
      (err) => {
        setGeoStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  function toggleFasilitas(key: string) {
    setFasilitas((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!roadCondition) next.roadCondition = "Pilih kondisi jalan.";
    if (!signalStrength) next.signalStrength = "Pilih kekuatan sinyal.";
    if (!crowdLevel) next.crowdLevel = "Pilih tingkat keramaian.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function resetForm() {
    setRoadCondition("");
    setSignalStrength("");
    setCrowdLevel("");
    setFasilitas({});
    setReportedFee("");
    setNotes("");
    setErrors({});
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/laporan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationId,
          roadCondition,
          signalStrength,
          crowdLevel,
          latitude: coords?.latitude ?? fallbackLatitude,
          longitude: coords?.longitude ?? fallbackLongitude,
          toiletLayak: fasilitas.toiletLayak ?? false,
          parkirLayak: fasilitas.parkirLayak ?? false,
          tempatIbadahLayak: fasilitas.tempatIbadahLayak ?? false,
          tempatDudukLayak: fasilitas.tempatDudukLayak ?? false,
          penitipanBarangLayak: fasilitas.penitipanBarangLayak ?? false,
          reportedFee: reportedFee === "" ? null : reportedFee,
          notes: notes.trim() === "" ? null : notes.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.message || "Gagal mengirim laporan. Coba lagi.");
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setSubmitting(false);
      router.refresh();
    } catch {
      setSubmitError("Terjadi kesalahan jaringan. Coba lagi.");
      setSubmitting(false);
    }
  }

  if (!isLoggedIn) {
    return (
      <SectionCard>
        <SectionTitle>
          <span className="flex items-center gap-2">
            <AlertTriangle size={18} />
            Laporkan Kondisi / Usulan Perbaikan
          </span>
        </SectionTitle>
        <p className="text-sm" style={{ color: "var(--blusukan-outline)" }}>
          <Link
            href="/login"
            id="link-login-laporan"
            className="font-semibold hover:underline"
            style={{ color: "var(--blusukan-primary)" }}
          >
            Login
          </Link>{" "}
          untuk melaporkan kondisi lapangan destinasi ini.
        </p>
      </SectionCard>
    );
  }

  return (
    <SectionCard>
      <SectionTitle>
        <span className="flex items-center gap-2">
          <AlertTriangle size={18} />
          Laporkan Kondisi / Usulan Perbaikan
        </span>
      </SectionTitle>

      {success ? (
        <div>
          <div
            className="flex items-start gap-2.5 text-sm rounded-xl px-4 py-3 mb-4"
            style={{ background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }}
          >
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <span>Terima kasih! Laporan Anda berhasil dikirim.</span>
          </div>
          <button
            type="button"
            id="btn-laporan-baru"
            onClick={resetForm}
            className="text-sm font-semibold hover:underline"
            style={{ color: "var(--blusukan-primary)" }}
          >
            Kirim laporan baru
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div
            className="flex items-start gap-2.5 text-xs rounded-xl px-3.5 py-2.5"
            style={{
              background: geoStatus === "granted" ? "var(--blusukan-primary-container)" : "var(--blusukan-secondary-container)",
              color: geoStatus === "granted" ? "var(--blusukan-primary)" : "var(--blusukan-secondary)",
            }}
          >
            {geoStatus === "loading" && (
              <>
                <Loader2 size={15} className="mt-0.5 animate-spin shrink-0" />
                <span>Mengambil lokasi Anda...</span>
              </>
            )}
            {geoStatus === "granted" && (
              <>
                <MapPin size={15} className="mt-0.5 shrink-0" />
                <span>Lokasi berhasil diambil.</span>
              </>
            )}
            {(geoStatus === "denied" || geoStatus === "error") && (
              <>
                <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                <span>
                  {geoStatus === "denied" ? "Izin lokasi ditolak." : "Lokasi tidak dapat diambil."} Laporan tetap
                  bisa dikirim menggunakan lokasi perkiraan destinasi.
                </span>
              </>
            )}
          </div>

          {submitError && (
            <p className="text-xs" style={{ color: "var(--blusukan-error)" }}>
              {submitError}
            </p>
          )}

          <LaporanPillGroup
            label="Kondisi Jalan"
            options={ROAD_CONDITION_OPTIONS}
            value={roadCondition}
            onChange={setRoadCondition}
            error={errors.roadCondition}
          />
          <LaporanPillGroup
            label="Kekuatan Sinyal"
            options={SIGNAL_STRENGTH_OPTIONS}
            value={signalStrength}
            onChange={setSignalStrength}
            error={errors.signalStrength}
          />
          <LaporanPillGroup
            label="Tingkat Keramaian"
            options={CROWD_LEVEL_OPTIONS}
            value={crowdLevel}
            onChange={setCrowdLevel}
            error={errors.crowdLevel}
          />

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--blusukan-outline)" }}>
              Fasilitas yang layak (centang jika kondisinya baik)
            </label>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--blusukan-outline-variant)" }}>
              {LAPORAN_FASILITAS_FIELDS.map((f, idx) => (
                <label
                  key={f.key}
                  className="flex items-center gap-3 px-3.5 py-3 cursor-pointer"
                  style={{ borderTop: idx === 0 ? "none" : "1px solid var(--blusukan-outline-variant)", background: "#ffffff" }}
                >
                  <input
                    type="checkbox"
                    checked={!!fasilitas[f.key]}
                    onChange={() => toggleFasilitas(f.key)}
                    className="w-5 h-5 shrink-0"
                    style={{ accentColor: "var(--blusukan-primary)" }}
                  />
                  <span className="text-sm" style={{ color: "var(--blusukan-on-surface)" }}>
                    {f.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="laporan-reportedFee"
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--blusukan-outline)" }}
            >
              Biaya yang dikeluarkan (opsional)
            </label>
            <RupiahInput id="laporan-reportedFee" value={reportedFee} onChange={setReportedFee} placeholder="0" />
          </div>

          <div>
            <label htmlFor="laporan-notes" className="block text-xs font-medium mb-1.5" style={{ color: "var(--blusukan-outline)" }}>
              Catatan tambahan (opsional)
            </label>
            <textarea
              id="laporan-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Ceritakan kondisi lapangan lainnya..."
              className="w-full px-3 py-2.5 text-sm resize-none"
              style={{ border: "1px solid var(--blusukan-outline-variant)", borderRadius: "8px", color: "var(--blusukan-on-surface)" }}
            />
          </div>

          <button
            type="submit"
            id="btn-submit-laporan"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
          >
            {submitting ? "Mengirim..." : "Kirim Laporan"}
          </button>
        </form>
      )}
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
      style={{
        background: "var(--blusukan-surface)",
        color: "var(--blusukan-on-surface)",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* ── Sticky breadcrumb header — offset mengikuti tinggi navbar pill mengambang ── */}
      <header
        className="sticky top-[72px] sm:top-[76px] z-30 flex items-center gap-3 px-4 lg:px-8 py-3 border-b"
        style={{
          background: "color-mix(in srgb, var(--blusukan-surface) 88%, transparent)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderColor: "var(--blusukan-outline-variant)",
        }}
      >
        <Link
          href="/"
          id="detail-back"
          className="flex items-center gap-1.5 text-sm font-bold hover:opacity-70 transition-opacity shrink-0"
          style={{ color: "var(--blusukan-primary)" }}
        >
          <ArrowLeft size={16} />
          Kembali ke Beranda
        </Link>
        <span style={{ color: "var(--blusukan-outline-variant)" }}>/</span>
        <span className="text-sm truncate" style={{ color: "var(--blusukan-outline)" }}>
          {d.name}
        </span>
      </header>

      {/* ── Hero — foto besar dengan judul menumpang di atasnya (editorial) ──
          -mt menarik foto sampai mentok ke ujung atas viewport, menembus "ruang kosong" yang
          ditinggalkan navbar (sticky, in-flow) + breadcrumb (sticky, in-flow) di atasnya.
          Breadcrumb tidak diubah — ia tetap sticky di top-[72px]/[76px] dan otomatis melayang
          di atas foto ini berkat z-30-nya. ── */}
      <section className="relative w-full -mt-[120px] sm:-mt-[128px]">
        {/* Lebar foto disamakan dengan container konten di bawahnya (max-w-7xl px-4 lg:px-8) */}
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div
            className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl"
            style={{
              height: "clamp(360px, 52vh, 560px)",
              background: "var(--blusukan-surface-container-highest)",
            }}
          >
            {d.photoUrls[activePhotoIdx] ? (
              <Image
                src={d.photoUrls[activePhotoIdx]}
                alt={d.name}
                fill
                className="object-cover"
                style={{ objectPosition: "center 30%" }}
                priority
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, var(--blusukan-primary-container) 0%, var(--blusukan-tertiary-container) 100%)",
                }}
              >
                <ImageOff
                  size={40}
                  style={{ color: "color-mix(in srgb, var(--blusukan-tertiary) 45%, transparent)" }}
                />
              </div>
            )}

            {/* Overlay gradient — menjaga teks tetap terbaca di atas foto apa pun */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.45) 38%, rgba(0,0,0,0.06) 70%)",
              }}
            />

            {/* Badge status jalan — pojok kiri atas */}
            {badge && (
              <div className="absolute top-5 left-4 sm:left-5">
                <span
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{
                    background: badge.bg,
                    color: badge.textColor,
                    boxShadow: "0 4px 14px rgba(0,0,0,0.28)",
                  }}
                >
                  {badge.icon}
                  {badge.label}
                </span>
              </div>
            )}

            {/* Judul & meta — menumpang di bagian bawah foto */}
            <div className="absolute inset-x-0 bottom-0">
              <div className="px-5 sm:px-7 lg:px-8 pb-6 sm:pb-7">
                <div className="flex flex-wrap gap-2 items-center mb-3">
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.18em] px-2.5 py-1 rounded-full"
                  style={{
                    background: "var(--blusukan-secondary-container)",
                    color: "var(--blusukan-secondary)",
                  }}
                >
                  {KATEGORI_LABEL[d.kategori] ?? d.kategori}
                </span>
                {d.vibeTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm"
                    style={{
                      background: "color-mix(in srgb, var(--blusukan-on-primary) 20%, transparent)",
                      color: "var(--blusukan-on-primary)",
                    }}
                  >
                    {VIBE_LABEL[tag] ?? tag}
                  </span>
                ))}
                {popularityBadge && (
                  <span
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
                    style={{
                      background: "var(--blusukan-secondary-container)",
                      color: "var(--blusukan-secondary)",
                    }}
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
                className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.05] tracking-tight"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  color: "var(--blusukan-on-primary)",
                  textShadow: "0 2px 24px rgba(0,0,0,0.35)",
                }}
              >
                {d.name}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
                <div className="flex items-center gap-1.5">
                  <MapPin
                    size={15}
                    style={{ color: "var(--blusukan-primary-fixed-dim)" }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--blusukan-on-primary)" }}
                  >
                    {KABUPATEN_LABEL[d.kabupaten] ?? d.kabupaten}, Daerah Istimewa Yogyakarta
                  </span>
                </div>
                {d.totalReview > 0 && (
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-sm"
                    id="rating-ringkasan"
                    style={{
                      background: "color-mix(in srgb, var(--blusukan-on-primary) 18%, transparent)",
                    }}
                  >
                    <Star
                      size={15}
                      fill="var(--blusukan-rating)"
                      style={{ color: "var(--blusukan-rating)" }}
                    />
                    <span
                      className="text-sm font-bold"
                      style={{ color: "var(--blusukan-on-primary)" }}
                    >
                      {d.rataRataRating.toFixed(1)}
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: "var(--blusukan-primary-container)" }}
                    >
                      ({d.totalReview} ulasan)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-20">

        {/* ── Galeri foto — hanya tampil kalau destinasi punya lebih dari 1 foto ── */}
        {d.photoUrls.length > 1 && (
          <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pt-5 pb-1">
            {d.photoUrls.map((url, idx) => {
              const isActive = idx === activePhotoIdx;
              return (
                <button
                  key={url}
                  type="button"
                  onClick={() => setActivePhotoIdx(idx)}
                  aria-label={`Tampilkan foto ${idx + 1}`}
                  aria-current={isActive}
                  className="relative shrink-0 rounded-2xl overflow-hidden transition-all hover:opacity-95"
                  style={{
                    width: 120,
                    height: 90,
                    outline: isActive
                      ? "2.5px solid var(--blusukan-primary)"
                      : "1px solid var(--blusukan-outline-variant)",
                    outlineOffset: isActive ? "2px" : "0px",
                    opacity: isActive ? 1 : 0.72,
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

        <div className="pt-8" />

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
                  iconBg="var(--blusukan-secondary-container)"
                  iconColor="var(--blusukan-secondary)"
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

            {/* Section Booking Transportasi Lokal — jasa tervalidasi milik destinasi ini, booking inline lewat dialog. Disembunyikan kalau belum ada jasa. */}
            <BookingTransportSection
              destinationId={d.id}
              destinationName={d.name}
              services={d.localServices}
              isLoggedIn={d.isLoggedIn}
              defaultContactNumber={d.userPhone ?? ""}
            />

            {/* Section Laporkan Kondisi / Usulan Perbaikan — form laporan sama seperti /laporan, destinationId otomatis terisi */}
            <LaporKondisiSection
              destinationId={d.id}
              fallbackLatitude={d.latitude}
              fallbackLongitude={d.longitude}
              isLoggedIn={d.isLoggedIn}
            />

            {/* Section Laporan Wisatawan */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-base font-bold"
                  style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
                >
                  Ulasan & Laporan Wisatawan
                </h2>
                {d.reports.length > 0 && (
                  <span className="text-xs" style={{ color: "var(--blusukan-outline)" }}>
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
                      style={{ color: "var(--blusukan-outline-variant)" }}
                    />
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--blusukan-on-surface-variant)" }}
                    >
                      Belum ada laporan
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--blusukan-outline)" }}>
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
                            style={{ background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }}
                          >
                            {getInitials(r.userName)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm font-semibold"
                              style={{ color: "var(--blusukan-on-surface)", fontFamily: "Montserrat, sans-serif" }}
                            >
                              {r.userName}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: "var(--blusukan-outline)" }}>
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
                                  ? "var(--blusukan-error-container)"
                                  : r.roadCondition === "SULIT"
                                  ? "var(--blusukan-secondary-container)"
                                  : "var(--blusukan-primary-container)"
                              }
                              color={
                                r.roadCondition === "RUSAK"
                                  ? "var(--blusukan-error)"
                                  : r.roadCondition === "SULIT"
                                  ? "var(--blusukan-secondary)"
                                  : "var(--blusukan-primary)"
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
                              bg="var(--blusukan-primary-container)"
                              color="var(--blusukan-primary)"
                            />
                          )}
                        </div>

                        {/* Catatan / notes */}
                        {r.notes && (
                          <p
                            className="text-sm leading-relaxed italic"
                            style={{ color: "var(--blusukan-on-surface-variant)", borderLeft: "3px solid var(--blusukan-primary-container)", paddingLeft: "12px" }}
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
                    style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
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
                      border: "1px solid var(--blusukan-outline-variant)",
                      color: "var(--blusukan-on-surface)",
                      background: "var(--blusukan-surface-low)",
                    }}
                  >
                    <ExternalLink size={15} style={{ color: "var(--blusukan-primary)" }} />
                    Buka di Google Maps
                  </a>
                </div>
              </SectionCard>

              {/* Card Butuh Bantuan Akses */}
              {needsHelp && d.localServices.length > 0 && (
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    border: `2px solid ${d.routeStatus === "RUSAK" ? "var(--blusukan-error)" : "var(--blusukan-tertiary)"}`,
                    boxShadow: `0 0 0 4px ${d.routeStatus === "RUSAK" ? "rgba(186,26,26,0.08)" : "rgba(68,55,42,0.08)"}`,
                  }}
                >
                  {/* Header warning */}
                  <div
                    className="px-5 py-4"
                    style={{
                      background: d.routeStatus === "RUSAK" ? "var(--blusukan-error-container)" : "var(--blusukan-secondary-container)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle
                        size={16}
                        style={{ color: d.routeStatus === "RUSAK" ? "var(--blusukan-error)" : "var(--blusukan-secondary)" }}
                      />
                      <h3
                        className="text-sm font-bold"
                        style={{
                          fontFamily: "Montserrat, sans-serif",
                          color: d.routeStatus === "RUSAK" ? "var(--blusukan-error)" : "var(--blusukan-tertiary)",
                        }}
                      >
                        Perlu Perhatian — Usulan Perbaikan Akses
                      </h3>
                    </div>
                    <p className="text-xs" style={{ color: "var(--blusukan-outline)" }}>
                      Jalan menuju sini berstatus{" "}
                      <strong>{ROAD_LABEL[d.routeStatus]?.toLowerCase()}</strong>. Warga
                      mengusulkan perbaikan akses ke destinasi ini — sementara itu, hubungi jasa
                      lokal berikut untuk bantuan:
                    </p>
                  </div>

                  {/* List jasa */}
                  <div
                    className="divide-y"
                    style={{ background: "#ffffff", borderColor: "var(--blusukan-surface-container)" }}
                  >
                    {d.localServices.map((s) => (
                      <div key={s.id} className="px-5 py-4">
                        <p
                          className="text-sm font-semibold"
                          style={{ color: "var(--blusukan-on-surface)", fontFamily: "Montserrat, sans-serif" }}
                        >
                          {s.providerName}
                        </p>
                        <p className="text-xs mt-0.5 mb-2" style={{ color: "var(--blusukan-outline)" }}>
                          {s.serviceType}
                        </p>
                        {s.baseRate != null && (
                          <p
                            className="text-sm font-bold mb-3"
                            style={{ color: "var(--blusukan-primary)" }}
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
