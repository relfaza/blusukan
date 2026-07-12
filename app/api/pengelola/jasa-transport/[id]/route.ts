import { NextResponse } from "next/server";
import { requirePengelolaApi } from "@/lib/auth-helpers";
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

interface Props {
  params: Promise<{ id: string }>;
}

async function findOwnedService(id: string, userId: string) {
  const service = await prisma.localService.findUnique({
    where: { id },
    include: { destination: { select: { submittedById: true } } },
  });
  if (!service || service.destination.submittedById !== userId) return null;
  return service;
}

export async function PATCH(req: Request, { params }: Props) {
  const authResult = await requirePengelolaApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { id } = await params;
  const existing = await findOwnedService(id, authResult.userId);
  if (!existing) {
    return NextResponse.json({ message: "Jasa transport tidak ditemukan atau bukan milik Anda." }, { status: 404 });
  }

  const { providerName, serviceType, contactWa, baseRate, kapasitasPenumpang, fotoUrl } = await req.json();

  const data: {
    providerName?: string;
    serviceType?: (typeof SERVICE_TYPE_VALUES)[number];
    contactWa?: string;
    baseRate?: number;
    kapasitasPenumpang?: number | null;
    fotoUrl?: string | null;
  } = {};

  if (providerName !== undefined) {
    if (typeof providerName !== "string" || !providerName.trim()) {
      return NextResponse.json({ message: "Nama penyedia jasa tidak valid." }, { status: 400 });
    }
    data.providerName = providerName.trim();
  }
  if (serviceType !== undefined) {
    if (!isOneOf(serviceType, SERVICE_TYPE_VALUES)) {
      return NextResponse.json({ message: "Jenis jasa tidak valid." }, { status: 400 });
    }
    data.serviceType = serviceType;
  }
  if (contactWa !== undefined) {
    if (typeof contactWa !== "string" || !contactWa.trim()) {
      return NextResponse.json({ message: "Nomor WhatsApp tidak valid." }, { status: 400 });
    }
    data.contactWa = contactWa.trim();
  }
  if (baseRate !== undefined) {
    if (!isValidBaseRate(baseRate)) {
      return NextResponse.json({ message: "Tarif dasar tidak valid." }, { status: 400 });
    }
    data.baseRate = baseRate;
  }
  if (kapasitasPenumpang !== undefined) {
    if (kapasitasPenumpang === null) {
      data.kapasitasPenumpang = null;
    } else {
      const kap = Number(kapasitasPenumpang);
      if (!Number.isInteger(kap) || kap < 1) {
        return NextResponse.json({ message: "Kapasitas penumpang tidak valid." }, { status: 400 });
      }
      data.kapasitasPenumpang = kap;
    }
  }
  if (fotoUrl !== undefined) {
    data.fotoUrl = typeof fotoUrl === "string" && fotoUrl.trim() ? fotoUrl.trim() : null;
  }

  const updated = await prisma.localService.update({ where: { id }, data, include: { titikJemput: true } });

  return NextResponse.json(serializeJasaTransport(updated));
}

export async function DELETE(_req: Request, { params }: Props) {
  const authResult = await requirePengelolaApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { id } = await params;
  const existing = await findOwnedService(id, authResult.userId);
  if (!existing) {
    return NextResponse.json({ message: "Jasa transport tidak ditemukan atau bukan milik Anda." }, { status: 404 });
  }

  const bookingCount = await prisma.booking.count({ where: { serviceId: id } });
  if (bookingCount > 0) {
    return NextResponse.json(
      { message: "Tidak bisa menghapus jasa yang masih memiliki riwayat booking." },
      { status: 409 }
    );
  }

  await prisma.localService.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
