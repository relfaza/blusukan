import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { requirePengelolaPage } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import TransportLengkapClient from "./TransportLengkapClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

function TidakDiizinkan() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}
    >
      <ShieldAlert size={40} style={{ color: "var(--blusukan-error)" }} className="mb-4" />
      <h1
        className="text-xl font-bold mb-2"
        style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
      >
        Tidak Diizinkan
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--blusukan-on-surface-variant)" }}>
        Anda tidak memiliki akses untuk mengelola transportasi destinasi ini.
      </p>
      <Link
        href="/pengelola"
        className="text-sm font-bold px-5 py-2.5 rounded-lg"
        style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
      >
        Kembali ke Dashboard
      </Link>
    </div>
  );
}

export default async function TransportLengkapPage({ params }: Props) {
  const { id } = await params;
  const userId = await requirePengelolaPage();

  const destination = await prisma.destination.findUnique({ where: { id } });

  if (!destination || destination.submittedById !== userId) {
    return <TidakDiizinkan />;
  }

  const services = await prisma.localService.findMany({
    where: { destinationId: id },
    include: {
      titikJemput: true,
      bookings: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      },
    },
    orderBy: { providerName: "asc" },
  });

  const initialServices = services.map((s) => ({
    id: s.id,
    destinationId: s.destinationId,
    providerName: s.providerName,
    serviceType: s.serviceType,
    contactWa: s.contactWa,
    baseRate: Number(s.baseRate),
    kapasitasPenumpang: s.kapasitasPenumpang,
    fotoUrl: s.fotoUrl,
    isValidated: s.isValidated,
    titikJemput: s.titikJemput.map((t) => ({
      id: t.id,
      serviceId: t.serviceId,
      namaLokasi: t.namaLokasi,
      hargaTambahan: Number(t.hargaTambahan),
      estimasiWaktu: t.estimasiWaktu,
    })),
    bookings: s.bookings.map((b) => ({
      id: b.id,
      status: b.status,
      travelDate: b.travelDate.toISOString(),
      createdAt: b.createdAt.toISOString(),
      contactNumber: b.contactNumber,
      namaPemesan: b.user.name,
    })),
  }));

  return (
    <TransportLengkapClient
      destinationId={destination.id}
      destinationName={destination.name}
      initialServices={initialServices}
    />
  );
}
