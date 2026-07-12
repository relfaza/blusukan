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
      {/* ── Header — heading sederhana di atas background cream ── */}
      <div className="max-w-5xl mx-auto px-4 lg:px-8 pt-10 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1
              className="text-2xl font-bold mb-1"
              style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
            >
              Dashboard Pengelola
            </h1>
            <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Destinasi yang Anda kelola
            </p>
          </div>

          <Link
            href="/pengelola/destinasi/baru"
            id="btn-ajukan-destinasi"
            className="flex items-center justify-center gap-1.5 text-sm font-bold px-5 py-3 rounded-full transition-all hover:shadow-lg active:scale-95 shrink-0"
            style={{
              background: "var(--blusukan-primary)",
              color: "var(--blusukan-on-primary)",
              boxShadow: "0 8px 24px -8px rgba(0,0,0,0.35)",
            }}
          >
            <Plus size={16} />
            Ajukan Destinasi Baru
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 lg:px-8 pb-16">
        <PengelolaClient destinations={items} />
      </div>
    </div>
  );
}
