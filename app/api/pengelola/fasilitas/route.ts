import { NextResponse } from "next/server";
import { requirePengelolaApi, findOwnedDestination } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

const SATUAN_WAKTU_VALUES = ["per menit", "per jam", "per hari"] as const;

function serializeFasilitas(f: {
  id: string;
  destinationId: string;
  nama: string;
  hargaSewa: unknown;
  satuanWaktu: string;
  jumlahUnit: number;
  lokasiDalamDestinasi: string | null;
  deskripsiManfaat: string | null;
  fotoUrl: string | null;
}) {
  return {
    id: f.id,
    destinationId: f.destinationId,
    nama: f.nama,
    hargaSewa: Number(f.hargaSewa),
    satuanWaktu: f.satuanWaktu,
    jumlahUnit: f.jumlahUnit,
    lokasiDalamDestinasi: f.lokasiDalamDestinasi,
    deskripsiManfaat: f.deskripsiManfaat,
    fotoUrl: f.fotoUrl,
  };
}

function isValidHargaSewa(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isValidSatuanWaktu(value: unknown): value is (typeof SATUAN_WAKTU_VALUES)[number] {
  return typeof value === "string" && (SATUAN_WAKTU_VALUES as readonly string[]).includes(value);
}

export async function POST(req: Request) {
  const authResult = await requirePengelolaApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { destinationId, nama, hargaSewa, satuanWaktu, jumlahUnit, lokasiDalamDestinasi, deskripsiManfaat, fotoUrl } =
    await req.json();

  if (typeof destinationId !== "string" || !destinationId) {
    return NextResponse.json({ message: "destinationId wajib diisi." }, { status: 400 });
  }
  if (typeof nama !== "string" || !nama.trim()) {
    return NextResponse.json({ message: "Nama fasilitas wajib diisi." }, { status: 400 });
  }
  if (!isValidHargaSewa(hargaSewa)) {
    return NextResponse.json({ message: "Harga sewa tidak valid." }, { status: 400 });
  }
  if (satuanWaktu !== undefined && !isValidSatuanWaktu(satuanWaktu)) {
    return NextResponse.json({ message: "Satuan waktu tidak valid." }, { status: 400 });
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
      satuanWaktu: isValidSatuanWaktu(satuanWaktu) ? satuanWaktu : "per jam",
      jumlahUnit: jumlah,
      lokasiDalamDestinasi:
        typeof lokasiDalamDestinasi === "string" && lokasiDalamDestinasi.trim() ? lokasiDalamDestinasi.trim() : null,
      deskripsiManfaat:
        typeof deskripsiManfaat === "string" && deskripsiManfaat.trim() ? deskripsiManfaat.trim() : null,
      fotoUrl: typeof fotoUrl === "string" && fotoUrl.trim() ? fotoUrl.trim() : null,
    },
  });

  return NextResponse.json(serializeFasilitas(fasilitas), { status: 201 });
}

export async function PATCH(req: Request) {
  const authResult = await requirePengelolaApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { id, nama, hargaSewa, satuanWaktu, jumlahUnit, lokasiDalamDestinasi, deskripsiManfaat, fotoUrl } =
    await req.json();

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
    lokasiDalamDestinasi?: string | null;
    deskripsiManfaat?: string | null;
    fotoUrl?: string | null;
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
    if (!isValidSatuanWaktu(satuanWaktu)) {
      return NextResponse.json({ message: "Satuan waktu tidak valid." }, { status: 400 });
    }
    data.satuanWaktu = satuanWaktu;
  }
  if (jumlahUnit !== undefined) {
    const jumlah = Number(jumlahUnit);
    if (!Number.isInteger(jumlah) || jumlah < 1) {
      return NextResponse.json({ message: "Jumlah unit tidak valid." }, { status: 400 });
    }
    data.jumlahUnit = jumlah;
  }
  if (lokasiDalamDestinasi !== undefined) {
    data.lokasiDalamDestinasi =
      typeof lokasiDalamDestinasi === "string" && lokasiDalamDestinasi.trim() ? lokasiDalamDestinasi.trim() : null;
  }
  if (deskripsiManfaat !== undefined) {
    data.deskripsiManfaat =
      typeof deskripsiManfaat === "string" && deskripsiManfaat.trim() ? deskripsiManfaat.trim() : null;
  }
  if (fotoUrl !== undefined) {
    data.fotoUrl = typeof fotoUrl === "string" && fotoUrl.trim() ? fotoUrl.trim() : null;
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
