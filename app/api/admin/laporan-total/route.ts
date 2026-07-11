import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authResult = await requireAdminApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const roadConditionGroups = await prisma.userReport.groupBy({
    by: ["roadCondition"],
    _count: { _all: true },
  });

  return NextResponse.json({
    distribusiKondisiJalan: roadConditionGroups.map((g) => ({ kondisi: g.roadCondition, jumlah: g._count._all })),
  });
}
