import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import { parseAdminFilters } from "@/lib/admin-filters";
import { getKondisiJalanTerakhirMap } from "@/lib/kondisi-jalan";

const VALID_KABUPATEN = ["SLEMAN", "GUNUNGKIDUL", "BANTUL", "KULON_PROGO", "KOTA_YOGYAKARTA"];

export async function GET(request: Request) {
  const authResult = await requireAdminApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { searchParams } = new URL(request.url);
  const filters = parseAdminFilters({
    kabupaten: searchParams.get("kabupaten"),
    kondisiJalan: searchParams.get("kondisiJalan"),
  });

  // Kabupaten difilter di query; kondisi jalan difilter dari laporan warga (di bawah).
  const where: Prisma.DestinationWhereInput = {
    status: "APPROVED",
    ...(filters.kabupaten ? { kabupaten: filters.kabupaten } : {}),
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

  // routeStatus yang dikembalikan = kondisi jalan terakhir dilaporkan warga (fallback ke field resmi).
  const kondisiMap = await getKondisiJalanTerakhirMap(destinations.map((d) => d.id));
  const denganKondisi = destinations
    .map((d) => ({ ...d, routeStatus: kondisiMap.get(d.id) ?? d.routeStatus }))
    .filter((d) => !filters.kondisiJalan || d.routeStatus === filters.kondisiJalan);

  // Kelompokkan per kabupaten dengan urutan tetap.
  const groupsMap = new Map<string, typeof denganKondisi>();
  for (const kab of VALID_KABUPATEN) groupsMap.set(kab, []);
  for (const d of denganKondisi) {
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
