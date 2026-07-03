import { redirect } from "next/navigation";
import { Bike, Car, CalendarClock, Compass, MapPin, Phone } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
  EXPIRED: "Kedaluwarsa",
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

export default async function RiwayatBookingPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    redirect("/login");
  }

  const bookings = await prisma.booking.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      service: { select: { providerName: true, serviceType: true, baseRate: true } },
      destination: { select: { name: true } },
    },
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-3xl mx-auto px-4 lg:px-8 py-10">
        <h1
          className="text-2xl font-bold mb-6"
          style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
        >
          Riwayat Booking
        </h1>

        {bookings.length === 0 ? (
          <div
            className="rounded-2xl p-10 flex flex-col items-center text-center"
            style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
          >
            <CalendarClock size={40} style={{ color: "var(--blusukan-outline)" }} className="mb-3" />
            <p className="text-sm font-medium" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Belum ada booking
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => {
              const statusStyle = STATUS_STYLE[b.status] ?? STATUS_STYLE.PENDING;

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
                        {b.service.providerName}
                      </p>
                      <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                        <MapPin size={12} />
                        {b.destination.name}
                      </p>
                    </div>
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                      style={{ background: statusStyle.bg, color: statusStyle.color }}
                    >
                      {STATUS_LABEL[b.status] ?? b.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }}
                    >
                      {SERVICE_TYPE_ICON[b.service.serviceType]}
                      {SERVICE_TYPE_LABEL[b.service.serviceType] ?? b.service.serviceType}
                    </span>
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ background: "#f0f0f0", color: "#4b4f45" }}
                    >
                      <CalendarClock size={12} />
                      {formatTanggal(b.travelDate)}
                    </span>
                  </div>

                  <div
                    className="flex items-center justify-between pt-3"
                    style={{ borderTop: "1px dashed var(--blusukan-outline-variant)" }}
                  >
                    <div>
                      {b.meetingPoint && (
                        <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                          Titik jemput: {b.meetingPoint}
                        </p>
                      )}
                      <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                        <Phone size={11} />
                        {b.contactNumber}
                      </p>
                    </div>
                    <span className="text-sm font-bold" style={{ color: "var(--blusukan-primary)" }}>
                      {formatRupiah(Number(b.service.baseRate))}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
