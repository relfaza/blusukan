import Link from "next/link";
import { MapPin, Inbox } from "lucide-react";
import { requirePengelolaPage } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const KABUPATEN_LABEL: Record<string, string> = {
  SLEMAN: "Sleman",
  GUNUNGKIDUL: "Gunungkidul",
  BANTUL: "Bantul",
  KULON_PROGO: "Kulon Progo",
  KOTA_YOGYAKARTA: "Kota Yogyakarta",
};

const STATUS_LABEL: Record<string, string> = {
  APPROVED: "Disetujui",
  PENDING: "Menunggu Validasi",
  REJECTED: "Ditolak",
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  APPROVED: { bg: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" },
  PENDING: { bg: "#fef3e7", color: "#805533" },
  REJECTED: { bg: "var(--blusukan-error-container)", color: "var(--blusukan-error)" },
};

export default async function PengelolaPage() {
  const userId = await requirePengelolaPage();

  const destinations = await prisma.destination.findMany({
    where: { submittedById: userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          transaksis: { where: { status: "PENDING" } },
        },
      },
    },
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
        >
          Dashboard Pengelola
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Destinasi yang Anda kelola
        </p>

        {destinations.length === 0 ? (
          <div
            className="rounded-2xl p-10 flex flex-col items-center text-center"
            style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
          >
            <Inbox size={40} style={{ color: "var(--blusukan-outline)" }} className="mb-3" />
            <p className="text-sm font-medium" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Anda belum mengelola destinasi apa pun.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {destinations.map((d) => {
              const statusStyle = STATUS_STYLE[d.status] ?? STATUS_STYLE.PENDING;
              const pendingCount = d._count.transaksis;

              return (
                <Link
                  key={d.id}
                  href={`/pengelola/destinasi/${d.id}`}
                  id={`card-destinasi-${d.id}`}
                  className="relative rounded-2xl p-5 transition-shadow hover:shadow-md"
                  style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
                >
                  {pendingCount > 0 && (
                    <span
                      className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: "var(--blusukan-error)", color: "#ffffff" }}
                    >
                      {pendingCount}
                    </span>
                  )}

                  <div className="flex items-center gap-1.5 mb-2">
                    <MapPin size={14} style={{ color: "var(--blusukan-on-surface-variant)" }} />
                    <span className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                      {KABUPATEN_LABEL[d.kabupaten] ?? d.kabupaten}
                    </span>
                  </div>

                  <p
                    className="text-base font-bold mb-3"
                    style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
                  >
                    {d.name}
                  </p>

                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: statusStyle.bg, color: statusStyle.color }}
                    >
                      {STATUS_LABEL[d.status] ?? d.status}
                    </span>
                    {pendingCount > 0 && (
                      <span className="text-xs font-semibold" style={{ color: "var(--blusukan-error)" }}>
                        {pendingCount} perlu dikonfirmasi
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
