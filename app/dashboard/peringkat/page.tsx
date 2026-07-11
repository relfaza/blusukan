import Link from "next/link";
import { Star, TrendingUp } from "lucide-react";
import { requireAdminPage } from "@/lib/auth-helpers";
import { getPeringkatDestinasi } from "@/lib/peringkat";

export const dynamic = "force-dynamic";

const KABUPATEN_LABEL: Record<string, string> = {
  SLEMAN: "Sleman",
  GUNUNGKIDUL: "Gunungkidul",
  BANTUL: "Bantul",
  KULON_PROGO: "Kulon Progo",
  KOTA_YOGYAKARTA: "Kota Yogyakarta",
};

const TOP_BADGE: Record<number, { label: string; bg: string; color: string }> = {
  1: { label: "🔥 Paling Ramai", bg: "#fef3e7", color: "#805533" },
  2: { label: "🥈 Ramai", bg: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" },
  3: { label: "🥉 Cukup Ramai", bg: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" },
};

const BACK_TARGET: Record<string, { href: string; label: string }> = {
  dashboard: { href: "/dashboard", label: "← Kembali ke Dashboard" },
  destinasi: { href: "/dashboard/destinasi", label: "← Kembali ke Destinasi Aktif" },
  keuangan: { href: "/dashboard/keuangan", label: "← Kembali ke Dashboard Keuangan" },
};
const DEFAULT_BACK = { href: "/dashboard", label: "← Kembali ke Dashboard" };

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating ${rating} dari 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          fill={rating >= n ? "#f5a623" : "none"}
          style={{ color: rating >= n ? "#f5a623" : "var(--blusukan-outline-variant)" }}
        />
      ))}
    </div>
  );
}

export default async function PeringkatKeramaianPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  await requireAdminPage();
  const { from } = await searchParams;
  const back = (from && BACK_TARGET[from]) || DEFAULT_BACK;

  const peringkat = await getPeringkatDestinasi();

  return (
    <div className="min-h-screen" style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-10">
        <Link
          href={back.href}
          id="peringkat-back"
          className="flex items-center gap-1.5 text-sm font-semibold mb-6 hover:opacity-70 transition-opacity"
          style={{ color: "var(--blusukan-primary)" }}
        >
          {back.label}
        </Link>

        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={22} style={{ color: "var(--blusukan-primary)" }} />
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
          >
            Peringkat Keramaian Destinasi
          </h1>
        </div>
        <p className="text-sm mb-8" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Diurutkan dari jumlah kunjungan terbanyak
        </p>

        {peringkat.length === 0 ? (
          <div
            className="rounded-2xl p-10 flex flex-col items-center text-center"
            style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
          >
            <TrendingUp size={40} style={{ color: "var(--blusukan-outline)" }} className="mb-3" />
            <p className="text-sm font-medium" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Belum ada destinasi yang disetujui
            </p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}>
            {peringkat.map((d, idx) => {
              const rank = idx + 1;
              const badge = TOP_BADGE[rank];
              return (
                <Link
                  key={d.id}
                  href={`/dashboard/destinasi/${d.id}`}
                  id={`row-peringkat-${d.id}`}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[#f7f8f5]"
                  style={{ borderTop: idx === 0 ? "none" : "1px solid var(--blusukan-outline-variant)" }}
                >
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold"
                    style={{
                      background: rank <= 3 ? "var(--blusukan-primary)" : "var(--blusukan-surface)",
                      color: rank <= 3 ? "#ffffff" : "var(--blusukan-on-surface-variant)",
                    }}
                  >
                    #{rank}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p
                        className="text-sm font-bold truncate"
                        style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
                      >
                        {d.name}
                      </p>
                      {badge && (
                        <span
                          className="text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap"
                          style={{ background: badge.bg, color: badge.color }}
                        >
                          {badge.label}
                        </span>
                      )}
                    </div>
                    <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                      {KABUPATEN_LABEL[d.kabupaten] ?? d.kabupaten}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold" style={{ color: "var(--blusukan-primary)" }}>
                      {d.jumlahKunjungan} kunjungan
                    </p>
                    <div className="flex items-center justify-end gap-1.5 mt-1">
                      <StarRow rating={Math.round(d.rataRataRating)} />
                      <span className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                        {d.rataRataRating > 0 ? d.rataRataRating.toFixed(1) : "–"} ({d.totalReview})
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
