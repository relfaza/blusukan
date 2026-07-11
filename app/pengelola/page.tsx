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
    <div className="min-h-screen" style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
          >
            Dashboard Pengelola
          </h1>
          <Link
            href="/pengelola/destinasi/baru"
            id="btn-ajukan-destinasi"
            className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-lg transition-opacity hover:opacity-90 shrink-0"
            style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
          >
            <Plus size={16} />
            Ajukan Destinasi Baru
          </Link>
        </div>
        <p className="text-sm mb-8" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Destinasi yang Anda kelola
        </p>

        <PengelolaClient destinations={items} />
      </div>
    </div>
  );
}
