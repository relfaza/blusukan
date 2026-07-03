import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authResult = await requireAdminApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const destinations = await prisma.destination.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      submittedBy: { select: { name: true } },
    },
  });

  return NextResponse.json(
    destinations.map((d) => ({
      id: d.id,
      name: d.name,
      kabupaten: d.kabupaten,
      kategori: d.kategori,
      submittedByName: d.submittedBy.name,
      createdAt: d.createdAt.toISOString(),
    }))
  );
}
