import Image from "next/image";
import Link from "next/link";
import { Sparkles, TrendingUp, Star, ImageOff } from "lucide-react";
import { getHiddenGemBaru, getPopulerMingguIni, type HiddenGemDestinasi, type PopulerDestinasi } from "@/lib/info-update";

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

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  return `${Math.floor(days / 30)} bulan lalu`;
}

function populerBadgeLabel(d: PopulerDestinasi): string {
  if (d.transaksiCountMinggu > 0 && d.transaksiCountMinggu >= d.reviewCountMinggu) {
    return `${d.transaksiCountMinggu} transaksi minggu ini`;
  }
  if (d.reviewCountMinggu > 0) {
    return `${d.reviewCountMinggu} ulasan baru`;
  }
  return "Sedang naik daun";
}

/** Kartu destinasi ringkas — gaya sama seperti grid card di Beranda, dengan badge kontekstual di pojok foto. */
function InfoDestinationCard({
  id,
  name,
  kabupaten,
  kategori,
  photoUrls,
  badge,
}: {
  id: string;
  name: string;
  kabupaten: string;
  kategori: string;
  photoUrls: string[];
  badge: { label: string; icon: React.ReactNode; bg: string; color: string };
}) {
  return (
    <Link href={`/destinasi/${id}`} id={`info-card-${id}`} className="block">
      <article
        className="rounded-2xl overflow-hidden flex flex-col transition-all shadow-sm hover:shadow-lg hover:scale-[1.02]"
        style={{ background: "var(--blusukan-surface-container-lowest)", border: "1px solid var(--blusukan-tertiary)" }}
      >
        <div className="h-40 relative w-full">
          {photoUrls[0] ? (
            <Image
              src={photoUrls[0]}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, rgba(45,90,39,0.15) 0%, rgba(21,66,18,0.25) 100%)" }}
            >
              <ImageOff size={28} style={{ color: "rgba(21,66,18,0.35)" }} />
            </div>
          )}
          <div className="absolute top-2 left-2">
            <span
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-bold shadow-sm"
              style={{ background: badge.bg, color: badge.color, fontFamily: "Inter, sans-serif" }}
            >
              {badge.icon}
              {badge.label}
            </span>
          </div>
        </div>

        <div className="p-4">
          <p
            className="text-xs font-bold uppercase tracking-wider mb-1"
            style={{ color: "var(--blusukan-secondary)", fontFamily: "Inter, sans-serif" }}
          >
            {KATEGORI_LABEL[kategori] ?? kategori}
            {" · "}
            {KABUPATEN_LABEL[kabupaten] ?? kabupaten}
          </p>
          <h3
            className="text-base font-bold leading-tight"
            style={{ color: "var(--blusukan-on-surface)", fontFamily: "Montserrat, sans-serif" }}
          >
            {name}
          </h3>
        </div>
      </article>
    </Link>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      className="rounded-2xl p-10 text-center"
      style={{ background: "var(--blusukan-surface-container-lowest)", border: "1px solid var(--blusukan-outline-variant)" }}
    >
      <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
        {message}
      </p>
    </div>
  );
}

export default async function InfoPage() {
  const [hiddenGemBaru, populerMingguIni] = await Promise.all([getHiddenGemBaru(), getPopulerMingguIni()]);

  return (
    <div className="min-h-screen" style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}>
      {/* ── Header — panel gradient brand ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, var(--blusukan-primary) 0%, color-mix(in srgb, var(--blusukan-primary) 62%, var(--blusukan-tertiary) 38%) 100%)",
        }}
      >
        <div
          className="absolute -top-20 -right-10 w-64 h-64 rounded-full blur-3xl opacity-25 pointer-events-none"
          style={{ background: "var(--blusukan-primary-fixed-dim)" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 lg:px-8 pt-12 pb-14">
          <span
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] mb-4"
            style={{
              background: "color-mix(in srgb, var(--blusukan-on-primary) 16%, transparent)",
              color: "var(--blusukan-on-primary)",
              border: "1px solid color-mix(in srgb, var(--blusukan-on-primary) 28%, transparent)",
            }}
          >
            <Sparkles size={12} />
            Terkini
          </span>
          <h1
            className="text-3xl sm:text-4xl font-black tracking-tight"
            style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-primary)" }}
          >
            Info &amp; Update
          </h1>
          <p className="text-sm mt-2 max-w-xl" style={{ color: "var(--blusukan-primary-container)" }}>
            Destinasi baru dan yang sedang ramai dikunjungi minggu ini.
          </p>
        </div>
      </div>

      {/* relative z-10 wajib: header di atas ber-position:relative, tanpa ini konten tertimpa */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 pt-10 pb-12 space-y-10">

        {/* ── Hidden Gem Baru ── */}
        <section>
          <h2
            className="text-lg font-bold mb-4 flex items-center gap-2"
            style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
          >
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }}
            >
              <Sparkles size={15} />
            </span>
            Hidden Gem Baru
          </h2>
          {hiddenGemBaru.length === 0 ? (
            <EmptyState message="Belum ada destinasi baru yang disetujui." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {hiddenGemBaru.map((d: HiddenGemDestinasi) => (
                <InfoDestinationCard
                  key={d.id}
                  id={d.id}
                  name={d.name}
                  kabupaten={d.kabupaten}
                  kategori={d.kategori}
                  photoUrls={d.photoUrls}
                  badge={{
                    label: `Baru Disetujui · ${timeAgo(d.approvedAt)}`,
                    icon: <Sparkles size={12} />,
                    bg: "var(--blusukan-primary)",
                    color: "var(--blusukan-surface-container-lowest)",
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Populer Minggu Ini ── */}
        <section>
          <h2
            className="text-lg font-bold mb-4 flex items-center gap-2"
            style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
          >
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "var(--blusukan-secondary-container)", color: "var(--blusukan-secondary)" }}
            >
              <TrendingUp size={15} />
            </span>
            Populer Minggu Ini
          </h2>
          {populerMingguIni.length === 0 ? (
            <EmptyState message="Belum ada destinasi baru minggu ini." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {populerMingguIni.map((d: PopulerDestinasi) => (
                <div key={d.id}>
                  <InfoDestinationCard
                    id={d.id}
                    name={d.name}
                    kabupaten={d.kabupaten}
                    kategori={d.kategori}
                    photoUrls={d.photoUrls}
                    badge={{
                      label: populerBadgeLabel(d),
                      icon: <TrendingUp size={12} />,
                      bg: "var(--blusukan-secondary)",
                      color: "var(--blusukan-surface-container-lowest)",
                    }}
                  />
                  {d.rataRataRating > 0 && (
                    <p className="text-xs mt-1.5 flex items-center gap-1 px-1" style={{ color: "var(--blusukan-outline)" }}>
                      <Star size={12} fill="var(--blusukan-rating)" style={{ color: "var(--blusukan-rating)" }} />
                      {d.rataRataRating.toFixed(1)} rata-rata rating
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
