import Link from "next/link";
import { ReceiptText } from "lucide-react";

export type RiwayatTransaksiItem = {
  kind: "transaksi";
  id: string;
  kodeTransaksi: string;
  type: string;
  status: string;
  totalHarga: number;
  jadwal: string | null;
  createdAt: string;
  destination: { name: string };
  items: { namaItem: string; kuantitas: number }[];
};

export type RiwayatBookingItem = {
  kind: "booking";
  id: string;
  status: string;
  travelDate: string;
  createdAt: string;
  destination: { name: string };
  service: { providerName: string; serviceType: string };
};

export type RiwayatItem = RiwayatTransaksiItem | RiwayatBookingItem;

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

function formatTanggalWaktu(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu Konfirmasi",
  DIKONFIRMASI: "Dikonfirmasi",
  SELESAI: "Selesai",
  DIBATALKAN: "Dibatalkan",
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: "#fef3e7", color: "#805533" },
  DIKONFIRMASI: { bg: "#e3efe0", color: "#1d4ed8" },
  SELESAI: { bg: "#e3efe0", color: "#1f4d2c" },
  DIBATALKAN: { bg: "#eeeeee", color: "#4b4f45" },
};

const TYPE_BADGE_LABEL: Record<string, string> = {
  TIKET_MASUK: "Tiket",
  FASILITAS: "Fasilitas",
  UMKM: "UMKM",
};

const BOOKING_STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu Konfirmasi",
  CONFIRMED: "Dikonfirmasi",
  COMPLETED: "Selesai",
  EXPIRED: "Ditolak",
};

const BOOKING_STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: "#fef3e7", color: "#805533" },
  CONFIRMED: { bg: "#e0ecfd", color: "#1d4ed8" },
  COMPLETED: { bg: "#e3efe0", color: "#1f4d2c" },
  EXPIRED: { bg: "#eeeeee", color: "#4b4f45" },
};

const SERVICE_TYPE_LABEL: Record<string, string> = {
  OJEK: "Ojek Lokal",
  JEEP: "Sewa Jeep",
  GUIDE: "Pemandu Wisata",
};

function TypeBadge({ label }: { label: string }) {
  return (
    <span
      className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }}
    >
      {label}
    </span>
  );
}

function BookingCard({ b }: { b: RiwayatBookingItem }) {
  const statusStyle = BOOKING_STATUS_STYLE[b.status] ?? BOOKING_STATUS_STYLE.PENDING;

  return (
    <Link
      href={`/booking/${b.id}`}
      id={`riwayat-item-${b.id}`}
      className="block rounded-2xl p-5 transition-opacity hover:opacity-90"
      style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p
            className="text-sm font-bold"
            style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
          >
            {b.destination.name}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            {formatTanggal(b.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TypeBadge label="Transport" />
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
            style={{ background: statusStyle.bg, color: statusStyle.color }}
          >
            {BOOKING_STATUS_LABEL[b.status] ?? b.status}
          </span>
        </div>
      </div>

      <div
        className="flex items-center justify-between pt-3"
        style={{ borderTop: "1px dashed var(--blusukan-outline-variant)" }}
      >
        <div>
          <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Layanan
          </p>
          <p className="text-sm font-semibold" style={{ color: "var(--blusukan-on-surface)" }}>
            {b.service.providerName} · {SERVICE_TYPE_LABEL[b.service.serviceType] ?? b.service.serviceType}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Tanggal Perjalanan
          </p>
          <p className="text-sm font-semibold" style={{ color: "var(--blusukan-on-surface)" }}>
            {formatTanggal(b.travelDate)}
          </p>
        </div>
      </div>
    </Link>
  );
}

/** List riwayat transaksi + booking milik user — dipakai di tab Riwayat Transaksi halaman /notifikasi */
export default function RiwayatTransaksiList({ transaksis }: { transaksis: RiwayatItem[] }) {
  if (transaksis.length === 0) {
    return (
      <div
        className="rounded-2xl p-10 flex flex-col items-center text-center"
        style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
      >
        <ReceiptText size={40} style={{ color: "var(--blusukan-outline)" }} className="mb-3" />
        <p className="text-sm font-medium" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Belum ada transaksi
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transaksis.map((entry) => {
        if (entry.kind === "booking") {
          return <BookingCard key={entry.id} b={entry} />;
        }

        const t = entry;
        const totalTiket = t.items.reduce((sum, item) => sum + item.kuantitas, 0);
        const statusStyle = STATUS_STYLE[t.status] ?? STATUS_STYLE.PENDING;
        const isFasilitas = t.type === "FASILITAS";
        const namaItem = t.items[0]?.namaItem;

        return (
          <Link
            key={t.id}
            href={`/transaksi/${t.id}`}
            id={`riwayat-item-${t.id}`}
            className="block rounded-2xl p-5 transition-opacity hover:opacity-90"
            style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p
                  className="text-sm font-bold"
                  style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
                >
                  {t.destination.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                  {formatTanggal(t.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <TypeBadge label={TYPE_BADGE_LABEL[t.type] ?? t.type} />
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                  style={{ background: statusStyle.bg, color: statusStyle.color }}
                >
                  {STATUS_LABEL[t.status] ?? t.status}
                </span>
              </div>
            </div>

            {isFasilitas && (
              <div
                className="flex items-center justify-between mb-3 pb-3"
                style={{ borderBottom: "1px dashed var(--blusukan-outline-variant)" }}
              >
                <div>
                  <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                    Fasilitas
                  </p>
                  <p className="text-sm font-semibold" style={{ color: "var(--blusukan-on-surface)" }}>
                    {namaItem}
                  </p>
                </div>
                {t.jadwal && (
                  <div className="text-right">
                    <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                      Jadwal Booking
                    </p>
                    <p className="text-sm font-semibold" style={{ color: "var(--blusukan-on-surface)" }}>
                      {formatTanggalWaktu(t.jadwal)}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div
              className="flex items-center justify-between pt-3"
              style={{ borderTop: "1px dashed var(--blusukan-outline-variant)" }}
            >
              <div>
                <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                  Kode Pesanan
                </p>
                <p
                  className="text-sm font-semibold tracking-wide"
                  style={{ fontFamily: "monospace", color: "var(--blusukan-on-surface)" }}
                >
                  {t.kodeTransaksi}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                  {isFasilitas ? `${totalTiket} unit` : `${totalTiket} tiket`}
                </p>
                <p className="text-sm font-bold" style={{ color: "var(--blusukan-primary)" }}>
                  {formatRupiah(t.totalHarga)}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
