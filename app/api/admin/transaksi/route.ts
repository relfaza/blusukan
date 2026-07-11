import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { TransaksiStatus } from "@/lib/generated/prisma/enums";

const VALID_STATUS = ["PENDING", "DIKONFIRMASI", "SELESAI", "DIBATALKAN"];
const MAX_ROWS = 100;

export async function GET(request: Request) {
  const authResult = await requireAdminApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { searchParams } = new URL(request.url);
  const destinationId = searchParams.get("destinationId");
  const status = searchParams.get("status");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const createdAt: Prisma.DateTimeFilter = {};
  if (dateFrom) createdAt.gte = new Date(`${dateFrom}T00:00:00`);
  if (dateTo) createdAt.lte = new Date(`${dateTo}T23:59:59.999`);

  const where: Prisma.TransaksiWhereInput = {
    ...(destinationId ? { destinationId } : {}),
    ...(status && VALID_STATUS.includes(status) ? { status: status as TransaksiStatus } : {}),
    ...(Object.keys(createdAt).length > 0 ? { createdAt } : {}),
  };

  const transaksis = await prisma.transaksi.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: MAX_ROWS,
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
