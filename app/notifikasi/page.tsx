import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import NotifikasiPageClient from "@/components/NotifikasiPageClient";

export const dynamic = "force-dynamic";

export default async function NotifikasiPage() {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  const userId = user?.id;

  if (!userId) {
    redirect("/login");
  }

  // Pengelola tidak punya tab Riwayat Transaksi — tidak perlu query ini untuk mereka
  const isPengelola = user?.role === "PENGELOLA";

  const transaksis = isPengelola
    ? []
    : await prisma.transaksi.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          destination: { select: { name: true } },
          items: true,
        },
      });

  const serialized = transaksis.map((t) => ({
    id: t.id,
    kodeTransaksi: t.kodeTransaksi,
    type: t.type,
    status: t.status,
    totalHarga: Number(t.totalHarga),
    jadwal: t.jadwal ? t.jadwal.toISOString() : null,
    createdAt: t.createdAt.toISOString(),
    destination: { name: t.destination.name },
    items: t.items.map((item) => ({ namaItem: item.namaItem, kuantitas: item.kuantitas })),
  }));

  return (
    <Suspense>
      <NotifikasiPageClient transaksis={serialized} role={user?.role ?? null} />
    </Suspense>
  );
}
