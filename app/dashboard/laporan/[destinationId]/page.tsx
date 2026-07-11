import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Wifi, WifiOff, Users, MessageCircle, CheckCircle2, XCircle } from "lucide-react";
import { requireAdminPage } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { getLaporanByDestinasi } from "@/lib/laporan";

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

const ROAD_LABEL: Record<string, string> = {
  MUDAH: "Mudah",
  SEDANG: "Sedang",
  SULIT: "Sulit",
  RUSAK: "Rusak",
  BELUM_ADA_DATA: "Belum ada data",
};

const ROAD_STYLE: Record<string, { bg: string; color: string }> = {
  MUDAH: { bg: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" },
  SEDANG: { bg: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" },
  SULIT: { bg: "#fef3e7", color: "#805533" },
  RUSAK: { bg: "var(--blusukan-error-container)", color: "var(--blusukan-error)" },
  BELUM_ADA_DATA: { bg: "#eeeeee", color: "var(--blusukan-on-surface-variant)" },
};

const SIGNAL_LABEL: Record<string, { label: string; icon: React.ReactNode }> = {
  KUAT: { label: "Sinyal Kuat", icon: <Wifi size={13} /> },
  SEDANG: { label: "Sinyal Sedang", icon: <Wifi size={13} /> },
  LEMAH: { label: "Sinyal Lemah", icon: <WifiOff size={13} /> },
};

const CROWD_LABEL: Record<string, string> = {
  SEPI: "Sepi",
  SEDANG: "Sedang",
  PADAT: "Padat",
};

const FASILITAS_FIELDS: { key: "toiletLayak" | "parkirLayak" | "tempatIbadahLayak" | "tempatDudukLayak" | "penitipanBarangLayak"; label: string }[] = [
  { key: "toiletLayak", label: "Toilet" },
  { key: "parkirLayak", label: "Parkir" },
  { key: "tempatIbadahLayak", label: "Tempat Ibadah" },
  { key: "tempatDudukLayak", label: "Tempat Duduk" },
  { key: "penitipanBarangLayak", label: "Penitipan Barang" },
];

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function formatTanggal(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" }).format(new Date(iso));
}

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
          <div className="space-y-3">
            {reports.map((r) => {
              const roadStyle = ROAD_STYLE[r.roadCondition] ?? ROAD_STYLE.BELUM_ADA_DATA;
              const signalInfo = SIGNAL_LABEL[r.signalStrength];
              const fasilitasReported = FASILITAS_FIELDS.filter((f) => r[f.key] != null);

              return (
                <div
                  key={r.id}
                  className="rounded-2xl p-5"
                  style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-sm font-bold" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}>
                        {r.userName}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                        {formatTanggal(r.createdAt)}
                      </p>
                    </div>
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                      style={{ background: roadStyle.bg, color: roadStyle.color }}
                    >
                      Jalan: {ROAD_LABEL[r.roadCondition] ?? r.roadCondition}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {signalInfo && (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ background: "#f0f0f0", color: "#4b4f45" }}
                      >
                        {signalInfo.icon}
                        {signalInfo.label}
                      </span>
                    )}
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ background: "#f0f0f0", color: "#4b4f45" }}
                    >
                      <Users size={13} />
                      Keramaian: {CROWD_LABEL[r.crowdLevel] ?? r.crowdLevel}
                    </span>
                    {r.reportedFee != null && (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ background: "#f0f0f0", color: "#4b4f45" }}
                      >
                        Biaya dilaporkan: {formatRupiah(r.reportedFee)}
                      </span>
                    )}
                  </div>

                  {fasilitasReported.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {fasilitasReported.map((f) => {
                        const layak = r[f.key];
                        return (
                          <span
                            key={f.key}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{
                              background: layak ? "var(--blusukan-primary-container)" : "var(--blusukan-error-container)",
                              color: layak ? "var(--blusukan-primary)" : "var(--blusukan-error)",
                            }}
                          >
                            {layak ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                            {f.label}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {r.notes && (
                    <p
                      className="text-xs italic pt-3"
                      style={{ borderTop: "1px dashed var(--blusukan-outline-variant)", color: "var(--blusukan-on-surface-variant)" }}
                    >
                      &ldquo;{r.notes}&rdquo;
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
