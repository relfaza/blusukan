import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { destinationRelationWhere, parseAdminFilters } from "@/lib/admin-filters";

export async function GET(request: Request) {
  const authResult = await requireAdminApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { searchParams } = new URL(request.url);
  const filters = parseAdminFilters({ kabupaten: searchParams.get("kabupaten") });

  const roadConditionGroups = await prisma.userReport.groupBy({
    by: ["roadCondition"],
    where: { ...destinationRelationWhere(filters) },
    _count: { _all: true },
  });

  return NextResponse.json({
    distribusiKondisiJalan: roadConditionGroups.map((g) => ({ kondisi: g.roadCondition, jumlah: g._count._all })),
  });
}
