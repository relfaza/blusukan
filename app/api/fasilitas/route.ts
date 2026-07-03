import { NextResponse } from "next/server";
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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const destinationId = searchParams.get("destinationId");

  if (!destinationId) {
    return NextResponse.json({ message: "destinationId wajib diisi." }, { status: 400 });
  }

  const list = await prisma.fasilitas.findMany({
    where: { destinationId },
    orderBy: { nama: "asc" },
  });

  return NextResponse.json(list.map(serializeFasilitas));
}
