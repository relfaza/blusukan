import { NextResponse } from "next/server";
import { requirePengelolaApi, findOwnedDestination } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

const SERVICE_TYPE_VALUES = ["OJEK", "JEEP", "GUIDE"] as const;

function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

function isValidBaseRate(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
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

function serializeJasaTransport(s: {
  id: string;
  destinationId: string;
  providerName: string;
  serviceType: string;
  contactWa: string;
  baseRate: unknown;
  kapasitasPenumpang: number | null;
  fotoUrl: string | null;
  isValidated: boolean;
  titikJemput?: { id: string; serviceId: string; namaLokasi: string; hargaTambahan: unknown; estimasiWaktu: string | null }[];
}) {
  return {
    id: s.id,
    destinationId: s.destinationId,
    providerName: s.providerName,
    serviceType: s.serviceType,
    contactWa: s.contactWa,
    baseRate: Number(s.baseRate),
    kapasitasPenumpang: s.kapasitasPenumpang,
    fotoUrl: s.fotoUrl,
    isValidated: s.isValidated,
    titikJemput: (s.titikJemput ?? []).map(serializeTitikJemput),
  };
}

export async function GET(req: Request) {
  const authResult = await requirePengelolaApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { searchParams } = new URL(req.url);
  const destinationId = searchParams.get("destinationId");

  if (!destinationId) {
    return NextResponse.json({ message: "destinationId wajib diisi." }, { status: 400 });
  }

  const destination = await findOwnedDestination(destinationId, authResult.userId);
  if (!destination) {
    return NextResponse.json({ message: "Anda tidak memiliki akses ke destinasi ini." }, { status: 403 });
  }

  const services = await prisma.localService.findMany({
    where: { destinationId },
    include: { titikJemput: true },
    orderBy: { providerName: "asc" },
  });

  return NextResponse.json(services.map(serializeJasaTransport));
}

export async function POST(req: Request) {
  const authResult = await requirePengelolaApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { destinationId, providerName, serviceType, contactWa, baseRate, kapasitasPenumpang, fotoUrl } =
    await req.json();

  if (typeof destinationId !== "string" || !destinationId) {
    return NextResponse.json({ message: "destinationId wajib diisi." }, { status: 400 });
  }
  if (typeof providerName !== "string" || !providerName.trim()) {
    return NextResponse.json({ message: "Nama penyedia jasa wajib diisi." }, { status: 400 });
  }
  if (!isOneOf(serviceType, SERVICE_TYPE_VALUES)) {
    return NextResponse.json({ message: "Jenis jasa tidak valid." }, { status: 400 });
  }
  if (typeof contactWa !== "string" || !contactWa.trim()) {
    return NextResponse.json({ message: "Nomor WhatsApp wajib diisi." }, { status: 400 });
  }
  if (!isValidBaseRate(baseRate)) {
    return NextResponse.json({ message: "Tarif dasar tidak valid." }, { status: 400 });
  }
  if (kapasitasPenumpang !== undefined && kapasitasPenumpang !== null) {
    const kap = Number(kapasitasPenumpang);
    if (!Number.isInteger(kap) || kap < 1) {
      return NextResponse.json({ message: "Kapasitas penumpang tidak valid." }, { status: 400 });
    }
  }

  const destination = await findOwnedDestination(destinationId, authResult.userId);
  if (!destination) {
    return NextResponse.json({ message: "Anda tidak memiliki akses ke destinasi ini." }, { status: 403 });
  }

  const service = await prisma.localService.create({
    data: {
      destinationId,
      providerName: providerName.trim(),
      serviceType,
      contactWa: contactWa.trim(),
      baseRate,
      kapasitasPenumpang:
        kapasitasPenumpang !== undefined && kapasitasPenumpang !== null ? Number(kapasitasPenumpang) : null,
      fotoUrl: typeof fotoUrl === "string" && fotoUrl.trim() ? fotoUrl.trim() : null,
    },
    include: { titikJemput: true },
  });

  return NextResponse.json(serializeJasaTransport(service), { status: 201 });
}
