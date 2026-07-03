import { NextResponse } from "next/server";
import { requirePengelolaApi, findOwnedDestination } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

function serializeFasilitas(f: {
  id: string;
  destinationId: string;
  nama: string;
  hargaSewa: unknown;
  satuanWaktu: string;
  jumlahUnit: number;
}) {
  return {
    id: f.id,
    destinationId: f.destinationId,
    nama: f.nama,
    hargaSewa: Number(f.hargaSewa),
    satuanWaktu: f.satuanWaktu,
    jumlahUnit: f.jumlahUnit,
  };
}

function isValidHargaSewa(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

export async function POST(req: Request) {
  const authResult = await requirePengelolaApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { destinationId, nama, hargaSewa, satuanWaktu, jumlahUnit } = await req.json();

  if (typeof destinationId !== "string" || !destinationId) {
    return NextResponse.json({ message: "destinationId wajib diisi." }, { status: 400 });
  }
  if (typeof nama !== "string" || !nama.trim()) {
    return NextResponse.json({ message: "Nama fasilitas wajib diisi." }, { status: 400 });
  }
  if (!isValidHargaSewa(hargaSewa)) {
    return NextResponse.json({ message: "Harga sewa tidak valid." }, { status: 400 });
  }

  const jumlah = jumlahUnit != null ? Number(jumlahUnit) : 1;
  if (!Number.isInteger(jumlah) || jumlah < 1) {
    return NextResponse.json({ message: "Jumlah unit tidak valid." }, { status: 400 });
  }

  const destination = await findOwnedDestination(destinationId, authResult.userId);
  if (!destination) {
    return NextResponse.json({ message: "Anda tidak memiliki akses ke destinasi ini." }, { status: 403 });
  }

  const fasilitas = await prisma.fasilitas.create({
    data: {
      destinationId,
      nama: nama.trim(),
      hargaSewa,
      satuanWaktu: typeof satuanWaktu === "string" && satuanWaktu.trim() ? satuanWaktu.trim() : "per jam",
      jumlahUnit: jumlah,
    },
  });

  return NextResponse.json(serializeFasilitas(fasilitas), { status: 201 });
}

export async function PATCH(req: Request) {
  const authResult = await requirePengelolaApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { id, nama, hargaSewa, satuanWaktu, jumlahUnit } = await req.json();

  if (typeof id !== "string" || !id) {
    return NextResponse.json({ message: "id wajib diisi." }, { status: 400 });
  }

  const existing = await prisma.fasilitas.findUnique({
    where: { id },
    include: { destination: { select: { submittedById: true } } },
  });

  if (!existing) {
    return NextResponse.json({ message: "Fasilitas tidak ditemukan." }, { status: 404 });
  }
  if (existing.destination.submittedById !== authResult.userId) {
    return NextResponse.json({ message: "Anda tidak memiliki akses ke fasilitas ini." }, { status: 403 });
  }

  const data: {
    nama?: string;
    hargaSewa?: number;
    satuanWaktu?: string;
    jumlahUnit?: number;
  } = {};

  if (nama !== undefined) {
    if (typeof nama !== "string" || !nama.trim()) {
      return NextResponse.json({ message: "Nama fasilitas tidak valid." }, { status: 400 });
    }
    data.nama = nama.trim();
  }
  if (hargaSewa !== undefined) {
    if (!isValidHargaSewa(hargaSewa)) {
      return NextResponse.json({ message: "Harga sewa tidak valid." }, { status: 400 });
    }
    data.hargaSewa = hargaSewa;
  }
  if (satuanWaktu !== undefined) {
    if (typeof satuanWaktu !== "string" || !satuanWaktu.trim()) {
      return NextResponse.json({ message: "Satuan waktu tidak valid." }, { status: 400 });
    }
    data.satuanWaktu = satuanWaktu.trim();
  }
  if (jumlahUnit !== undefined) {
    const jumlah = Number(jumlahUnit);
    if (!Number.isInteger(jumlah) || jumlah < 1) {
      return NextResponse.json({ message: "Jumlah unit tidak valid." }, { status: 400 });
    }
    data.jumlahUnit = jumlah;
  }

  const updated = await prisma.fasilitas.update({ where: { id }, data });

  return NextResponse.json(serializeFasilitas(updated));
}

export async function DELETE(req: Request) {
  const authResult = await requirePengelolaApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { id } = await req.json();

  if (typeof id !== "string" || !id) {
    return NextResponse.json({ message: "id wajib diisi." }, { status: 400 });
  }

  const existing = await prisma.fasilitas.findUnique({
    where: { id },
    include: { destination: { select: { submittedById: true } } },
  });

  if (!existing) {
    return NextResponse.json({ message: "Fasilitas tidak ditemukan." }, { status: 404 });
  }
  if (existing.destination.submittedById !== authResult.userId) {
    return NextResponse.json({ message: "Anda tidak memiliki akses ke fasilitas ini." }, { status: 403 });
  }

  await prisma.fasilitas.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
