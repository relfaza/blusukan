import { NextResponse } from "next/server";
import { requirePengelolaApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ id: string }>;
}

const KATEGORI_UMKM_VALUES = ["KULINER", "KERAJINAN", "FASHION", "JASA", "LAINNYA"] as const;

function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

function serializeWarung(w: {
  id: string;
  destinationId: string;
  name: string;
  location: string | null;
  kategori: string;
  namaPemilik: string | null;
  photoUrls: string[];
  bisaBooking: boolean;
}) {
  return {
    id: w.id,
    destinationId: w.destinationId,
    name: w.name,
    location: w.location,
    kategori: w.kategori,
    namaPemilik: w.namaPemilik,
    photoUrls: w.photoUrls,
    bisaBooking: w.bisaBooking,
  };
}

export async function PATCH(req: Request, { params }: Props) {
  const authResult = await requirePengelolaApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { id } = await params;
  const { name, location, kategori, namaPemilik, photoUrls, bisaBooking } = await req.json();

  const existing = await prisma.localWarung.findUnique({
    where: { id },
    include: { destination: { select: { submittedById: true } } },
  });

  if (!existing) {
    return NextResponse.json({ message: "UMKM tidak ditemukan." }, { status: 404 });
  }
  if (existing.destination.submittedById !== authResult.userId) {
    return NextResponse.json({ message: "Anda tidak memiliki akses ke UMKM ini." }, { status: 403 });
  }

  const data: {
    name?: string;
    location?: string | null;
    kategori?: (typeof KATEGORI_UMKM_VALUES)[number];
    namaPemilik?: string | null;
    photoUrls?: string[];
    bisaBooking?: boolean;
  } = {};

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ message: "Nama UMKM tidak valid." }, { status: 400 });
    }
    data.name = name.trim();
  }
  if (location !== undefined) {
    if (location !== null && typeof location !== "string") {
      return NextResponse.json({ message: "Lokasi tidak valid." }, { status: 400 });
    }
    data.location = typeof location === "string" && location.trim() ? location.trim() : null;
  }
  if (kategori !== undefined) {
    if (!isOneOf(kategori, KATEGORI_UMKM_VALUES)) {
      return NextResponse.json({ message: "Kategori tidak valid." }, { status: 400 });
    }
    data.kategori = kategori;
  }
  if (namaPemilik !== undefined) {
    if (namaPemilik !== null && typeof namaPemilik !== "string") {
      return NextResponse.json({ message: "Nama pemilik tidak valid." }, { status: 400 });
    }
    data.namaPemilik = typeof namaPemilik === "string" && namaPemilik.trim() ? namaPemilik.trim() : null;
  }
  if (photoUrls !== undefined) {
    if (!Array.isArray(photoUrls)) {
      return NextResponse.json({ message: "Foto tidak valid." }, { status: 400 });
    }
    const photoUrlsInput = photoUrls.filter((url): url is string => typeof url === "string" && url.trim() !== "");
    if (photoUrlsInput.length > 5) {
      return NextResponse.json({ message: "Maksimal 5 foto." }, { status: 400 });
    }
    data.photoUrls = photoUrlsInput;
  }
  if (bisaBooking !== undefined) {
    if (typeof bisaBooking !== "boolean") {
      return NextResponse.json({ message: "bisaBooking tidak valid." }, { status: 400 });
    }
    data.bisaBooking = bisaBooking;
  }

  const updated = await prisma.localWarung.update({ where: { id }, data });

  return NextResponse.json(serializeWarung(updated));
}

export async function DELETE(_req: Request, { params }: Props) {
  const authResult = await requirePengelolaApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { id } = await params;

  const existing = await prisma.localWarung.findUnique({
    where: { id },
    include: { destination: { select: { submittedById: true } } },
  });

  if (!existing) {
    return NextResponse.json({ message: "UMKM tidak ditemukan." }, { status: 404 });
  }
  if (existing.destination.submittedById !== authResult.userId) {
    return NextResponse.json({ message: "Anda tidak memiliki akses ke UMKM ini." }, { status: 403 });
  }

  // Skema belum punya onDelete: Cascade untuk MenuItem->LocalWarung, jadi hapus manual dalam satu transaksi
  await prisma.$transaction([
    prisma.menuItem.deleteMany({ where: { warungId: id } }),
    prisma.localWarung.delete({ where: { id } }),
  ]);

  return NextResponse.json({ success: true });
}
