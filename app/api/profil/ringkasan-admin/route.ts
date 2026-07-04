import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authResult = await requireAdminApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { userId } = authResult;

  const [totalDisetujui, totalDitolak, totalMenungguKeseluruhan] = await Promise.all([
    prisma.destination.count({ where: { approvedById: userId, status: "APPROVED" } }),
    prisma.destination.count({ where: { approvedById: userId, status: "REJECTED" } }),
    prisma.destination.count({ where: { status: "PENDING" } }),
  ]);

  return NextResponse.json({
    totalDisetujui,
    totalDitolak,
    totalMenungguKeseluruhan,
  });
}
