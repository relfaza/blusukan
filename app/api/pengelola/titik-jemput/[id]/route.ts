import { NextResponse } from "next/server";
import { requirePengelolaApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ id: string }>;
}

function serializeTitikJemput(t: { id: string; serviceId: string; namaLokasi: string; hargaTambahan: unknown; estimasiWaktu: string | null }) {
  return {
    id: t.id,
    serviceId: t.serviceId,
    namaLokasi: t.namaLokasi,
    hargaTambahan: Number(t.hargaTambahan),
    estimasiWaktu: t.estimasiWaktu,
  };
}

function isValidHargaTambahan(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

async function findOwnedTitikJemput(id: string, userId: string) {
  const titikJemput = await prisma.titikJemput.findUnique({
    where: { id },
    include: { service: { include: { destination: { select: { submittedById: true } } } } },
  });
  if (!titikJemput || titikJemput.service.destination.submittedById !== userId) return null;
  return titikJemput;
}

export async function PATCH(req: Request, { params }: Props) {
  const authResult = await requirePengelolaApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { id } = await params;
  const existing = await findOwnedTitikJemput(id, authResult.userId);
  if (!existing) {
    return NextResponse.json({ message: "Titik jemput tidak ditemukan atau bukan milik Anda." }, { status: 404 });
  }

  const { namaLokasi, hargaTambahan, estimasiWaktu } = await req.json();

  const data: { namaLokasi?: string; hargaTambahan?: number; estimasiWaktu?: string | null } = {};

  if (namaLokasi !== undefined) {
    if (typeof namaLokasi !== "string" || !namaLokasi.trim()) {
      return NextResponse.json({ message: "Nama lokasi tidak valid." }, { status: 400 });
    }
    data.namaLokasi = namaLokasi.trim();
  }
  if (hargaTambahan !== undefined) {
    if (!isValidHargaTambahan(hargaTambahan)) {
      return NextResponse.json({ message: "Harga tambahan tidak valid." }, { status: 400 });
    }
    data.hargaTambahan = hargaTambahan;
  }
  if (estimasiWaktu !== undefined) {
    data.estimasiWaktu = typeof estimasiWaktu === "string" && estimasiWaktu.trim() ? estimasiWaktu.trim() : null;
  }

  const updated = await prisma.titikJemput.update({ where: { id }, data });

  return NextResponse.json(serializeTitikJemput(updated));
}

export async function DELETE(_req: Request, { params }: Props) {
  const authResult = await requirePengelolaApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { id } = await params;
  const existing = await findOwnedTitikJemput(id, authResult.userId);
  if (!existing) {
    return NextResponse.json({ message: "Titik jemput tidak ditemukan atau bukan milik Anda." }, { status: 404 });
  }

  await prisma.titikJemput.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
