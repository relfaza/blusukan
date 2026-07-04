import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authResult = await requireAdminApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const transaksis = await prisma.transaksi.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { name: true } },
      destination: { select: { name: true } },
      items: { select: { namaItem: true, kuantitas: true, subtotal: true } },
    },
  });

  return NextResponse.json(
    transaksis.map((t) => ({
      id: t.id,
      kodeTransaksi: t.kodeTransaksi,
      userName: t.user.name,
      destinationName: t.destination.name,
      type: t.type,
      totalHarga: Number(t.totalHarga),
      status: t.status,
      createdAt: t.createdAt.toISOString(),
      items: t.items.map((i) => ({
        namaItem: i.namaItem,
        kuantitas: i.kuantitas,
        subtotal: Number(i.subtotal),
      })),
    }))
  );
}
