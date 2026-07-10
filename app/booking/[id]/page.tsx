import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Bike, Car, Compass, MapPin, Phone } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

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

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu Konfirmasi",
  CONFIRMED: "Dikonfirmasi",
  COMPLETED: "Selesai",
  EXPIRED: "Ditolak",
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: "#fef3e7", color: "#805533" },
  CONFIRMED: { bg: "#e0ecfd", color: "#1d4ed8" },
  COMPLETED: { bg: "#e3efe0", color: "#1f4d2c" },
  EXPIRED: { bg: "#eeeeee", color: "#4b4f45" },
};

function formatTanggal(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(date);
}

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function BookingDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    redirect("/login");
  }

  const booking = await prisma.booking.findFirst({
    where: { id, userId },
    include: {
      service: { select: { providerName: true, serviceType: true, baseRate: true, contactWa: true } },
      destination: { select: { name: true } },
    },
  });

  if (!booking) notFound();

  const statusStyle = STATUS_STYLE[booking.status] ?? STATUS_STYLE.PENDING;

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 py-16"
      style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}
    >
      <h1
        className="text-2xl font-bold text-center mb-1"
        style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
      >
        Detail Booking Transport
      </h1>
      <p className="text-sm text-center mb-8" style={{ color: "var(--blusukan-on-surface-variant)" }}>
        {booking.destination.name}
      </p>

      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
      >
        <div className="flex items-start justify-between gap-3 mb-5 pb-5" style={{ borderBottom: "1px dashed var(--blusukan-outline-variant)" }}>
          <div>
            <p
              className="text-sm font-bold"
              style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
            >
              {booking.service.providerName}
            </p>
            <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              <MapPin size={12} />
              {booking.destination.name}
            </p>
          </div>
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
            style={{ background: statusStyle.bg, color: statusStyle.color }}
          >
            {STATUS_LABEL[booking.status] ?? booking.status}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Jenis Layanan
            </span>
            <span
              className="inline-flex items-center gap-1.5 text-sm font-semibold"
              style={{ color: "var(--blusukan-on-surface)" }}
            >
              {SERVICE_TYPE_ICON[booking.service.serviceType]}
              {SERVICE_TYPE_LABEL[booking.service.serviceType] ?? booking.service.serviceType}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Tanggal Perjalanan
            </span>
            <span className="text-sm font-semibold" style={{ color: "var(--blusukan-on-surface)" }}>
              {formatTanggal(booking.travelDate)}
            </span>
          </div>
          {booking.meetingPoint && (
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                Titik Jemput
              </span>
              <span className="text-sm font-semibold" style={{ color: "var(--blusukan-on-surface)" }}>
                {booking.meetingPoint}
              </span>
            </div>
          )}
          {booking.estimatedArrivalTime && (
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                Estimasi Kedatangan
              </span>
              <span className="text-sm font-semibold" style={{ color: "var(--blusukan-on-surface)" }}>
                {booking.estimatedArrivalTime}
              </span>
            </div>
          )}
          {booking.notes && (
            <div className="flex justify-between items-center gap-4">
              <span className="text-sm shrink-0" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                Catatan
              </span>
              <span className="text-sm font-semibold text-right" style={{ color: "var(--blusukan-on-surface)" }}>
                {booking.notes}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Nomor Kontak
            </span>
            <span
              className="inline-flex items-center gap-1.5 text-sm font-semibold"
              style={{ color: "var(--blusukan-on-surface)" }}
            >
              <Phone size={13} />
              {booking.contactNumber}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Tarif Dasar
            </span>
            <span className="text-sm font-bold" style={{ color: "var(--blusukan-primary)" }}>
              {formatRupiah(Number(booking.service.baseRate))}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md mt-8 flex flex-col items-center gap-4">
        <Link
          href="/notifikasi?tab=riwayat"
          id="btn-lihat-riwayat"
          className="w-full text-center py-2.5 rounded-lg text-sm font-bold transition-opacity hover:opacity-90"
          style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
        >
          Lihat Riwayat Transaksi
        </Link>
        <Link
          href="/"
          id="btn-kembali-beranda"
          className="text-sm font-medium hover:underline"
          style={{ color: "var(--blusukan-on-surface-variant)" }}
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
