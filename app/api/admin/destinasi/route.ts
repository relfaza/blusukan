import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { DestinationStatus, Kabupaten, Kategori } from "@/lib/generated/prisma/enums";
import { sanitizeKondisiJalan } from "@/lib/admin-filters";

const VALID_KABUPATEN = ["SLEMAN", "GUNUNGKIDUL", "BANTUL", "KULON_PROGO", "KOTA_YOGYAKARTA"];
const VALID_KATEGORI = ["PANTAI", "AIR_TERJUN", "GUNUNG", "BUKIT", "TEBING"];

export async function GET(request: Request) {
  const authResult = await requireAdminApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "PENDING";
  const search = searchParams.get("search")?.trim();
  const kabupaten = searchParams.get("kabupaten");
  const kategori = searchParams.get("kategori");
  const sortBy = searchParams.get("sortBy");
  const kondisiJalan = sanitizeKondisiJalan(searchParams.get("kondisiJalan"));

  const where: Prisma.DestinationWhereInput = {
    status: status as DestinationStatus,
    ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    ...(kabupaten && VALID_KABUPATEN.includes(kabupaten) ? { kabupaten: kabupaten as Kabupaten } : {}),
    ...(kategori && VALID_KATEGORI.includes(kategori) ? { kategori: kategori as Kategori } : {}),
    ...(kondisiJalan ? { routeStatus: kondisiJalan } : {}),
  };

  // Default createdAt asc dipertahankan supaya perilaku halaman Persetujuan (tanpa query param) tidak berubah
  const orderBy: Prisma.DestinationOrderByWithRelationInput =
    sortBy === "terbaru" ? { createdAt: "desc" } : { createdAt: "asc" };

  const destinations = await prisma.destination.findMany({
    where,
    orderBy,
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
      latitude: d.latitude,
      longitude: d.longitude,
      submittedByName: d.submittedBy.name,
      createdAt: d.createdAt.toISOString(),
    }))
  );
}
