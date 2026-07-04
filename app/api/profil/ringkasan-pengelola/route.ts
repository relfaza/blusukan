import { NextResponse } from "next/server";
import { requirePengelolaApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authResult = await requirePengelolaApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { userId } = authResult;

  const [totalDestinasiDikelola, totalDisetujui, totalMenunggu, totalTransaksiSelesai] = await Promise.all([
    prisma.destination.count({ where: { submittedById: userId } }),
    prisma.destination.count({ where: { submittedById: userId, status: "APPROVED" } }),
    prisma.destination.count({ where: { submittedById: userId, status: "PENDING" } }),
    prisma.transaksi.count({ where: { status: "SELESAI", destination: { submittedById: userId } } }),
  ]);

  return NextResponse.json({
    totalDestinasiDikelola,
    totalDisetujui,
    totalMenunggu,
    totalTransaksiSelesai,
  });
}
