import { NextResponse } from "next/server";
import { requirePengelolaApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

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

export async function POST(req: Request) {
  const authResult = await requirePengelolaApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { serviceId, namaLokasi, hargaTambahan, estimasiWaktu } = await req.json();

  if (typeof serviceId !== "string" || !serviceId) {
    return NextResponse.json({ message: "serviceId wajib diisi." }, { status: 400 });
  }
  if (typeof namaLokasi !== "string" || !namaLokasi.trim()) {
    return NextResponse.json({ message: "Nama lokasi wajib diisi." }, { status: 400 });
  }
  const harga = hargaTambahan === undefined || hargaTambahan === null || hargaTambahan === "" ? 0 : hargaTambahan;
  if (!isValidHargaTambahan(harga)) {
    return NextResponse.json({ message: "Harga tambahan tidak valid." }, { status: 400 });
  }

  const service = await prisma.localService.findUnique({
    where: { id: serviceId },
    include: { destination: { select: { submittedById: true } } },
  });

  if (!service) {
    return NextResponse.json({ message: "Jasa transport tidak ditemukan." }, { status: 404 });
  }
  if (service.destination.submittedById !== authResult.userId) {
    return NextResponse.json({ message: "Anda tidak memiliki akses ke jasa transport ini." }, { status: 403 });
  }

  const titikJemput = await prisma.titikJemput.create({
    data: {
      serviceId,
      namaLokasi: namaLokasi.trim(),
      hargaTambahan: harga,
      estimasiWaktu: typeof estimasiWaktu === "string" && estimasiWaktu.trim() ? estimasiWaktu.trim() : null,
    },
  });

  return NextResponse.json(serializeTitikJemput(titikJemput), { status: 201 });
}
