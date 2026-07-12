import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { requirePengelolaPage } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import FasilitasLengkapClient from "./FasilitasLengkapClient";

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
        Anda tidak memiliki akses untuk mengelola fasilitas destinasi ini.
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

export default async function FasilitasLengkapPage({ params }: Props) {
  const { id } = await params;
  const userId = await requirePengelolaPage();

  const destination = await prisma.destination.findUnique({ where: { id } });

  if (!destination || destination.submittedById !== userId) {
    return <TidakDiizinkan />;
  }

  const fasilitasList = await prisma.fasilitas.findMany({
    where: { destinationId: id },
    orderBy: { nama: "asc" },
  });

  const initialFasilitas = fasilitasList.map((f) => ({
    id: f.id,
    destinationId: f.destinationId,
    nama: f.nama,
    hargaSewa: Number(f.hargaSewa),
    satuanWaktu: f.satuanWaktu,
    jumlahUnit: f.jumlahUnit,
    lokasiDalamDestinasi: f.lokasiDalamDestinasi,
    deskripsiManfaat: f.deskripsiManfaat,
    fotoUrl: f.fotoUrl,
  }));

  return (
    <FasilitasLengkapClient
      destinationId={destination.id}
      destinationName={destination.name}
      initialFasilitas={initialFasilitas}
    />
  );
}
