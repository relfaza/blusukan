import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { Kabupaten } from "@/lib/generated/prisma/enums";

const VALID_KABUPATEN = ["SLEMAN", "GUNUNGKIDUL", "BANTUL", "KULON_PROGO", "KOTA_YOGYAKARTA"];

export async function GET(request: Request) {
  const authResult = await requireAdminApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { searchParams } = new URL(request.url);
  const kabupatenFilter = searchParams.get("kabupaten");

  const where: Prisma.DestinationWhereInput = {
    status: "APPROVED",
    ...(kabupatenFilter && VALID_KABUPATEN.includes(kabupatenFilter)
      ? { kabupaten: kabupatenFilter as Kabupaten }
      : {}),
  };

  const destinations = await prisma.destination.findMany({
    where,
    orderBy: [{ kabupaten: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      kabupaten: true,
      routeStatus: true,
      latitude: true,
      longitude: true,
      hasToilet: true,
      hasParkir: true,
      hasTempatIbadah: true,
      hasTempatDuduk: true,
      hasPenitipanBarang: true,
    },
  });

  // Kelompokkan per kabupaten dengan urutan tetap.
  const groupsMap = new Map<string, typeof destinations>();
  for (const kab of VALID_KABUPATEN) groupsMap.set(kab, []);
  for (const d of destinations) {
    const arr = groupsMap.get(d.kabupaten) ?? [];
    arr.push(d);
    groupsMap.set(d.kabupaten, arr);
  }

  const groups = VALID_KABUPATEN.map((kabupaten) => ({
    kabupaten,
    destinasi: groupsMap.get(kabupaten) ?? [],
  })).filter((g) => g.destinasi.length > 0);

  return NextResponse.json({ groups });
}
