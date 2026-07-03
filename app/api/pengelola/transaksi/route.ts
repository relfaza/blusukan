import { NextResponse } from "next/server";
import { requirePengelolaApi, findOwnedDestination } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

const STATUS_RANK: Record<string, number> = {
  PENDING: 0,
  DIKONFIRMASI: 1,
  SELESAI: 1,
  DIBATALKAN: 1,
};

function serializeTransaksi(t: {
  id: string;
  type: string;
  totalHarga: unknown;
  status: string;
  paymentMethod: string;
  kodeTransaksi: string;
  createdAt: Date;
  user: { name: string };
  items: { id: string; namaItem: string; hargaSatuan: unknown; kuantitas: number; subtotal: unknown }[];
}) {
  return {
    id: t.id,
    type: t.type,
    totalHarga: Number(t.totalHarga),
    status: t.status,
    paymentMethod: t.paymentMethod,
    kodeTransaksi: t.kodeTransaksi,
    createdAt: t.createdAt.toISOString(),
    namaPemesan: t.user.name,
    items: t.items.map((item) => ({
      id: item.id,
      namaItem: item.namaItem,
      hargaSatuan: Number(item.hargaSatuan),
      kuantitas: item.kuantitas,
      subtotal: Number(item.subtotal),
    })),
  };
}

export async function GET(req: Request) {
  const authResult = await requirePengelolaApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { searchParams } = new URL(req.url);
  const destinationId = searchParams.get("destinationId");

  if (!destinationId) {
    return NextResponse.json({ message: "destinationId wajib diisi." }, { status: 400 });
  }

  const destination = await findOwnedDestination(destinationId, authResult.userId);
  if (!destination) {
    return NextResponse.json({ message: "Anda tidak memiliki akses ke destinasi ini." }, { status: 403 });
  }

  const transaksis = await prisma.transaksi.findMany({
    where: { destinationId },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      user: { select: { name: true } },
    },
  });

  const sorted = [...transaksis].sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status]);

  return NextResponse.json(sorted.map(serializeTransaksi));
}
