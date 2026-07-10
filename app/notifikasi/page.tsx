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

  const [transaksis, bookings] = isPengelola
    ? [[], []]
    : await Promise.all([
        prisma.transaksi.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          include: {
            destination: { select: { name: true } },
            items: true,
          },
        }),
        prisma.booking.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          include: {
            destination: { select: { name: true } },
            service: { select: { providerName: true, serviceType: true } },
          },
        }),
      ]);

  const serializedTransaksis = transaksis.map((t) => ({
    kind: "transaksi" as const,
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

  const serializedBookings = bookings.map((b) => ({
    kind: "booking" as const,
    id: b.id,
    status: b.status,
    travelDate: b.travelDate.toISOString(),
    createdAt: b.createdAt.toISOString(),
    destination: { name: b.destination.name },
    service: { providerName: b.service.providerName, serviceType: b.service.serviceType },
  }));

  const riwayat = [...serializedTransaksis, ...serializedBookings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <Suspense>
      <NotifikasiPageClient riwayat={riwayat} role={user?.role ?? null} />
    </Suspense>
  );
}
