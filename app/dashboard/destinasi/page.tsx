import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { requireAdminPage } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const KABUPATEN_LABEL: Record<string, string> = {
  SLEMAN: "Sleman",
  GUNUNGKIDUL: "Gunungkidul",
  BANTUL: "Bantul",
  KULON_PROGO: "Kulon Progo",
  KOTA_YOGYAKARTA: "Kota Yogyakarta",
};

const KATEGORI_LABEL: Record<string, string> = {
  PANTAI: "Pantai",
  AIR_TERJUN: "Air Terjun",
  GUNUNG: "Gunung",
  BUKIT: "Bukit",
  TEBING: "Tebing",
};

export default async function DashboardDestinasiPage() {
  await requireAdminPage();

  const destinations = await prisma.destination.findMany({
    where: { status: "APPROVED" },
    orderBy: { name: "asc" },
    include: { submittedBy: { select: { name: true } } },
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10">
        <Link
          href="/dashboard"
          id="destinasi-back"
          className="flex items-center gap-1.5 text-sm font-semibold mb-6 hover:opacity-70 transition-opacity"
          style={{ color: "var(--blusukan-primary)" }}
        >
          <ArrowLeft size={16} />
          Kembali ke Dashboard
        </Link>

        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
        >
          Destinasi Aktif
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          {destinations.length} destinasi berstatus disetujui
        </p>

        {destinations.length === 0 ? (
          <div
            className="rounded-2xl p-10 flex flex-col items-center text-center"
            style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
          >
            <MapPin size={40} style={{ color: "var(--blusukan-outline)" }} className="mb-3" />
            <p className="text-sm font-medium" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Belum ada destinasi yang disetujui
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {destinations.map((d) => (
              <div
                key={d.id}
                className="rounded-2xl p-5"
                style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <MapPin size={14} style={{ color: "var(--blusukan-on-surface-variant)" }} />
                  <span className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                    {KABUPATEN_LABEL[d.kabupaten] ?? d.kabupaten}
                  </span>
                </div>

                <p
                  className="text-base font-bold mb-1"
                  style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
                >
                  {d.name}
                </p>
                <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                  {KATEGORI_LABEL[d.kategori] ?? d.kategori} · Dikelola oleh {d.submittedBy.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
