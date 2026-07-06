import { NextResponse } from "next/server";
import { requirePengelolaApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ id: string }>;
}

function serializeWarung(w: { id: string; destinationId: string; name: string; location: string | null }) {
  return { id: w.id, destinationId: w.destinationId, name: w.name, location: w.location };
}

export async function PATCH(req: Request, { params }: Props) {
  const authResult = await requirePengelolaApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { id } = await params;
  const { name, location } = await req.json();

  const existing = await prisma.localWarung.findUnique({
    where: { id },
    include: { destination: { select: { submittedById: true } } },
  });

  if (!existing) {
    return NextResponse.json({ message: "Warung tidak ditemukan." }, { status: 404 });
  }
  if (existing.destination.submittedById !== authResult.userId) {
    return NextResponse.json({ message: "Anda tidak memiliki akses ke warung ini." }, { status: 403 });
  }

  const data: { name?: string; location?: string | null } = {};

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ message: "Nama warung tidak valid." }, { status: 400 });
    }
    data.name = name.trim();
  }
  if (location !== undefined) {
    if (location !== null && typeof location !== "string") {
      return NextResponse.json({ message: "Lokasi tidak valid." }, { status: 400 });
    }
    data.location = typeof location === "string" && location.trim() ? location.trim() : null;
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
    return NextResponse.json({ message: "Warung tidak ditemukan." }, { status: 404 });
  }
  if (existing.destination.submittedById !== authResult.userId) {
    return NextResponse.json({ message: "Anda tidak memiliki akses ke warung ini." }, { status: 403 });
  }

  // Skema belum punya onDelete: Cascade untuk MenuItem->LocalWarung, jadi hapus manual dalam satu transaksi
  await prisma.$transaction([
    prisma.menuItem.deleteMany({ where: { warungId: id } }),
    prisma.localWarung.delete({ where: { id } }),
  ]);

  return NextResponse.json({ success: true });
}
