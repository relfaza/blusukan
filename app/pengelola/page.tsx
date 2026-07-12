import Link from "next/link";
import { Plus } from "lucide-react";
import { requirePengelolaPage } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import PengelolaClient from "./PengelolaClient";

export const dynamic = "force-dynamic";

export default async function PengelolaPage() {
  const userId = await requirePengelolaPage();

  const destinations = await prisma.destination.findMany({
    where: { submittedById: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      kabupaten: true,
      status: true,
      createdAt: true,
      _count: {
        select: {
          transaksis: { where: { status: "PENDING" } },
        },
      },
    },
  });

  const items = destinations.map((d) => ({
    id: d.id,
    name: d.name,
    kabupaten: d.kabupaten,
    status: d.status,
    createdAt: d.createdAt.toISOString(),
    pendingCount: d._count.transaksis,
  }));

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}
    >
      {/* ── Header — panel gradient brand, menegaskan area kerja pengelola ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, var(--blusukan-primary) 0%, color-mix(in srgb, var(--blusukan-primary) 62%, var(--blusukan-tertiary) 38%) 100%)",
        }}
      >
        {/* Bentuk dekoratif — turunan token, bukan warna baru */}
        <div
          className="absolute -top-20 -right-10 w-64 h-64 rounded-full blur-3xl opacity-25 pointer-events-none"
          style={{ background: "var(--blusukan-primary-fixed-dim)" }}
        />

        <div className="relative max-w-5xl mx-auto px-4 lg:px-8 pt-12 pb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span
                className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] mb-4"
                style={{
                  background: "color-mix(in srgb, var(--blusukan-on-primary) 16%, transparent)",
                  color: "var(--blusukan-on-primary)",
                  border:
                    "1px solid color-mix(in srgb, var(--blusukan-on-primary) 28%, transparent)",
                }}
              >
                Area Pengelola
              </span>
              <h1
                className="text-3xl sm:text-4xl font-black tracking-tight"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  color: "var(--blusukan-on-primary)",
                }}
              >
                Dashboard Pengelola
              </h1>
              <p
                className="text-sm mt-2"
                style={{ color: "var(--blusukan-primary-container)" }}
              >
                Destinasi yang Anda kelola
              </p>
            </div>

            <Link
              href="/pengelola/destinasi/baru"
              id="btn-ajukan-destinasi"
              className="flex items-center justify-center gap-1.5 text-sm font-bold px-5 py-3 rounded-full transition-all hover:shadow-lg active:scale-95 shrink-0"
              style={{
                background: "var(--blusukan-surface-container-lowest)",
                color: "var(--blusukan-primary)",
                boxShadow: "0 8px 24px -8px rgba(0,0,0,0.35)",
              }}
            >
              <Plus size={16} />
              Ajukan Destinasi Baru
            </Link>
          </div>
        </div>
      </div>

      {/* Konten diangkat sedikit menimpa header supaya terasa menyatu.
          relative z-10 wajib: header di atas ber-position:relative, tanpa ini konten
          static akan tertimpa header dan kartu statistik ikut terpotong. */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 lg:px-8 -mt-8 pb-16">
        <PengelolaClient destinations={items} />
      </div>
    </div>
  );
}
