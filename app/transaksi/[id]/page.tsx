import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { CheckCircle2, Circle, XCircle } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatTanggalWaktu(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

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

export default async function TransaksiDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    redirect("/login");
  }

  const transaksi = await prisma.transaksi.findFirst({
    where: { id, userId },
    include: {
      destination: { select: { name: true } },
      items: true,
    },
  });

  if (!transaksi) notFound();

  const totalTiket = transaksi.items.reduce((sum, item) => sum + item.kuantitas, 0);
  const isFasilitas = transaksi.type === "FASILITAS";
  const isUmkm = transaksi.type === "UMKM";
  const namaItem = transaksi.items[0]?.namaItem;
  const menuItems = transaksi.items.filter((item) => !item.namaItem.startsWith("Reservasi Tempat"));

  const isDibatalkan = transaksi.status === "DIBATALKAN";

  type TimelineStep = { label: string; at: Date; final?: boolean };
  const timelineSteps: TimelineStep[] = [{ label: "Dipesan", at: transaksi.createdAt }];
  if (transaksi.dikonfirmasiAt) {
    timelineSteps.push({ label: "Dikonfirmasi", at: transaksi.dikonfirmasiAt });
  }
  if (isDibatalkan && transaksi.dibatalkanAt) {
    timelineSteps.push({ label: "Dibatalkan", at: transaksi.dibatalkanAt, final: true });
  } else if (transaksi.selesaiAt) {
    timelineSteps.push({ label: "Selesai", at: transaksi.selesaiAt, final: true });
  }
  const isTimelineFinal = timelineSteps[timelineSteps.length - 1]?.final ?? false;
  const pendingLabel = transaksi.dikonfirmasiAt ? "Menunggu Penyelesaian" : "Menunggu Konfirmasi";

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 py-16"
      style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
        style={{ background: "var(--blusukan-primary-container)" }}
      >
        <CheckCircle2 size={36} style={{ color: "var(--blusukan-primary)" }} />
      </div>

      <h1
        className="text-2xl font-bold text-center mb-1"
        style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
      >
        Pesanan Berhasil Dibuat
      </h1>
      <p className="text-sm text-center mb-8" style={{ color: "var(--blusukan-on-surface-variant)" }}>
        Simpan kode pesanan berikut untuk ditunjukkan ke petugas
      </p>

      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{
          background: "var(--blusukan-surface-container-lowest)",
          border: "1px solid var(--blusukan-outline-variant)",
        }}
      >
        <div className="text-center mb-5 pb-5" style={{ borderBottom: "1px dashed var(--blusukan-outline-variant)" }}>
          <p className="text-xs mb-1.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Kode Pesanan
          </p>
          <p
            className="text-2xl font-bold tracking-wider"
            style={{ fontFamily: "monospace", color: "var(--blusukan-primary)" }}
          >
            {transaksi.kodeTransaksi}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Destinasi
            </span>
            <span className="text-sm font-semibold" style={{ color: "var(--blusukan-on-surface)" }}>
              {transaksi.destination.name}
            </span>
          </div>
          {isUmkm ? (
            <>
              {menuItems.length > 0 && (
                <div>
                  <span
                    className="text-sm block mb-2"
                    style={{ color: "var(--blusukan-on-surface-variant)" }}
                  >
                    Menu Dipesan
                  </span>
                  <div className="space-y-1.5">
                    {menuItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <span className="text-sm" style={{ color: "var(--blusukan-on-surface)" }}>
                          {item.namaItem} x{item.kuantitas}
                        </span>
                        <span
                          className="text-sm font-semibold"
                          style={{ color: "var(--blusukan-on-surface)" }}
                        >
                          {formatRupiah(Number(item.subtotal))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {transaksi.jadwal && (
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                    Jadwal Kedatangan
                  </span>
                  <span className="text-sm font-semibold" style={{ color: "var(--blusukan-on-surface)" }}>
                    {formatTanggalWaktu(transaksi.jadwal)}
                  </span>
                </div>
              )}
            </>
          ) : isFasilitas ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                  Fasilitas
                </span>
                <span className="text-sm font-semibold" style={{ color: "var(--blusukan-on-surface)" }}>
                  {namaItem} ({totalTiket} unit)
                </span>
              </div>
              {transaksi.jadwal && (
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                    Jadwal Booking
                  </span>
                  <span className="text-sm font-semibold" style={{ color: "var(--blusukan-on-surface)" }}>
                    {formatTanggalWaktu(transaksi.jadwal)}
                  </span>
                </div>
              )}
            </>
          ) : transaksi.items.length > 1 ? (
            <div>
              <span className="text-sm block mb-2" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                Tiket Dipesan
              </span>
              <div className="space-y-1.5">
                {transaksi.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: "var(--blusukan-on-surface)" }}>
                      {item.namaItem} x{item.kuantitas}
                    </span>
                    <span className="text-sm font-semibold" style={{ color: "var(--blusukan-on-surface)" }}>
                      {formatRupiah(Number(item.subtotal))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                Jumlah Tiket
              </span>
              <span className="text-sm font-semibold" style={{ color: "var(--blusukan-on-surface)" }}>
                {totalTiket} tiket
              </span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Total Harga
            </span>
            <span className="text-sm font-bold" style={{ color: "var(--blusukan-on-surface)" }}>
              {formatRupiah(Number(transaksi.totalHarga))}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Status
            </span>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={STATUS_STYLE[transaksi.status] ?? STATUS_STYLE.PENDING}
            >
              {STATUS_LABEL[transaksi.status] ?? transaksi.status}
            </span>
          </div>
        </div>
      </div>

      <div
        className="w-full max-w-md rounded-2xl p-6 mt-4"
        style={{
          background: "var(--blusukan-surface-container-lowest)",
          border: "1px solid var(--blusukan-outline-variant)",
        }}
      >
        <p
          className="text-sm font-bold mb-4"
          style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
        >
          Riwayat Status
        </p>
        <div className="space-y-0">
          {timelineSteps.map((step, index) => {
            const isCancelled = isDibatalkan && step.label === "Dibatalkan";
            const isLastStep = index === timelineSteps.length - 1;
            const showConnector = !(isLastStep && isTimelineFinal);
            const dotColor = isCancelled ? "var(--blusukan-error)" : "var(--blusukan-primary)";
            return (
              <div key={step.label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  {isCancelled ? (
                    <XCircle size={20} style={{ color: dotColor }} />
                  ) : (
                    <CheckCircle2 size={20} style={{ color: dotColor }} />
                  )}
                  {showConnector && (
                    <span
                      className="w-0.5 flex-1 my-0.5"
                      style={{
                        background: isCancelled ? "var(--blusukan-error)" : "var(--blusukan-outline-variant)",
                        minHeight: "1.5rem",
                      }}
                    />
                  )}
                </div>
                <div className="pb-4">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: isCancelled ? "var(--blusukan-error)" : "var(--blusukan-on-surface)" }}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                    {formatTanggalWaktu(step.at)}
                  </p>
                </div>
              </div>
            );
          })}
          {!isTimelineFinal && (
            <div className="flex gap-3">
              <Circle size={20} style={{ color: "var(--blusukan-outline)" }} />
              <p className="text-sm font-medium" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                {pendingLabel}
              </p>
            </div>
          )}
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
          href="/notifikasi?tab=notifikasi"
          id="btn-lihat-notifikasi"
          className="w-full text-center py-2.5 rounded-lg text-sm font-bold transition-opacity hover:opacity-90"
          style={{
            background: "var(--blusukan-surface-container-lowest)",
            color: "var(--blusukan-primary)",
            border: "1px solid var(--blusukan-primary)",
          }}
        >
          Lihat Notifikasi
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
