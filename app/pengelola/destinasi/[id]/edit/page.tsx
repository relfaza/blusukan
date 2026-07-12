import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { requirePengelolaPage } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import DestinasiFormClient from "../../DestinasiFormClient";

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
        Anda tidak memiliki akses untuk mengedit destinasi ini.
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

export default async function EditDestinasiPage({ params }: Props) {
  const { id } = await params;
  const userId = await requirePengelolaPage();

  const destination = await prisma.destination.findUnique({ where: { id } });

  if (!destination || destination.submittedById !== userId) {
    return <TidakDiizinkan />;
  }

  return (
    <DestinasiFormClient
      destinationId={destination.id}
      initial={{
        name: destination.name,
        kabupaten: destination.kabupaten,
        kategori: destination.kategori,
        latitude: destination.latitude,
        longitude: destination.longitude,
        buka24Jam: destination.buka24Jam,
        jamBuka: destination.jamBuka,
        jamTutup: destination.jamTutup,
        htmResmi: Number(destination.htmResmi),
        htmAnak: destination.htmAnak != null ? Number(destination.htmAnak) : null,
        hasToilet: destination.hasToilet,
        hasParkir: destination.hasParkir,
        hasTempatIbadah: destination.hasTempatIbadah,
        hasTempatDuduk: destination.hasTempatDuduk,
        hasPenitipanBarang: destination.hasPenitipanBarang,
        aksesibilitas: destination.aksesibilitas,
        vibeTags: destination.vibeTags,
        photoUrls: destination.photoUrls,
      }}
    />
  );
}
