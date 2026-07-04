import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authResult = await requireAdminApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const reports = await prisma.userReport.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { name: true } },
      destination: { select: { name: true } },
    },
  });

  return NextResponse.json(
    reports.map((r) => ({
      id: r.id,
      userName: r.user.name,
      destinationName: r.destination.name,
      roadCondition: r.roadCondition,
      signalStrength: r.signalStrength,
      crowdLevel: r.crowdLevel,
      createdAt: r.createdAt.toISOString(),
    }))
  );
}
