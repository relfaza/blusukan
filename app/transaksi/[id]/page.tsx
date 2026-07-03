import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
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
  const namaItem = transaksi.items[0]?.namaItem;

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
          background: "#ffffff",
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
          {isFasilitas ? (
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
              style={{ background: "#fef3e7", color: "#805533" }}
            >
              Menunggu Konfirmasi
            </span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md mt-8 flex flex-col items-center gap-4">
        <Link
          href="/riwayat"
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
