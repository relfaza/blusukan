import { redirect } from "next/navigation";
import { ReceiptText } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatTanggal(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
  }).format(date);
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

export default async function RiwayatPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    redirect("/login");
  }

  const transaksis = await prisma.transaksi.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      destination: { select: { name: true } },
      items: true,
    },
  });

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}
    >
      <div className="max-w-3xl mx-auto px-4 lg:px-8 py-10">
        <h1
          className="text-2xl font-bold mb-6"
          style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
        >
          Riwayat Transaksi
        </h1>

        {transaksis.length === 0 ? (
          <div
            className="rounded-2xl p-10 flex flex-col items-center text-center"
            style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
          >
            <ReceiptText size={40} style={{ color: "var(--blusukan-outline)" }} className="mb-3" />
            <p className="text-sm font-medium" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Belum ada transaksi
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {transaksis.map((t) => {
              const totalTiket = t.items.reduce((sum, item) => sum + item.kuantitas, 0);
              const statusStyle = STATUS_STYLE[t.status] ?? STATUS_STYLE.PENDING;

              return (
                <div
                  key={t.id}
                  className="rounded-2xl p-5"
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
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                      style={{ background: statusStyle.bg, color: statusStyle.color }}
                    >
                      {STATUS_LABEL[t.status] ?? t.status}
                    </span>
                  </div>

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
                        {totalTiket} tiket
                      </p>
                      <p className="text-sm font-bold" style={{ color: "var(--blusukan-primary)" }}>
                        {formatRupiah(Number(t.totalHarga))}
                      </p>
                    </div>
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
