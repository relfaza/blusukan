import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, MessageCircle } from "lucide-react";
import { requireAdminPage } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { computeLaporanDistribusi, getLaporanByDestinasi } from "@/lib/laporan";
import LaporanChartsClient from "./LaporanChartsClient";
import LaporanListClient from "./LaporanListClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ destinationId: string }>;
}

const KABUPATEN_LABEL: Record<string, string> = {
  SLEMAN: "Sleman",
  GUNUNGKIDUL: "Gunungkidul",
  BANTUL: "Bantul",
  KULON_PROGO: "Kulon Progo",
  KOTA_YOGYAKARTA: "Kota Yogyakarta",
};

export default async function LaporanDestinasiDetailPage({ params }: Props) {
  await requireAdminPage();
  const { destinationId } = await params;

  const destination = await prisma.destination.findUnique({
    where: { id: destinationId },
    select: { id: true, name: true, kabupaten: true },
  });

  if (!destination) notFound();

  const reports = await getLaporanByDestinasi(destinationId);

  return (
    <div className="min-h-screen" style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-3xl mx-auto px-4 lg:px-8 py-10">
        <Link
          href="/dashboard/laporan"
          id="laporan-detail-back"
          className="flex items-center gap-1.5 text-sm font-semibold mb-6 hover:opacity-70 transition-opacity"
          style={{ color: "var(--blusukan-primary)" }}
        >
          <ArrowLeft size={16} />
          Kembali ke Daftar Laporan
        </Link>

        <div className="flex items-center gap-1.5 mb-1.5">
          <MapPin size={14} style={{ color: "var(--blusukan-on-surface-variant)" }} />
          <span className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            {KABUPATEN_LABEL[destination.kabupaten] ?? destination.kabupaten}
          </span>
        </div>
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
        >
          {destination.name}
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          {reports.length} laporan kondisi lapangan dari wisatawan
        </p>

        {reports.length === 0 ? (
          <div
            className="rounded-2xl p-10 flex flex-col items-center text-center"
            style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
          >
            <MessageCircle size={40} style={{ color: "var(--blusukan-outline)" }} className="mb-3" />
            <p className="text-sm font-medium" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Belum ada laporan untuk destinasi ini
            </p>
          </div>
        ) : (
          <>
            <LaporanChartsClient destinationId={destination.id} distribusi={computeLaporanDistribusi(reports)} />
            <LaporanListClient reports={reports} />
          </>
        )}
      </div>
    </div>
  );
}
