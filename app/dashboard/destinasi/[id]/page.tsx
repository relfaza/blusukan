import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  UserCircle,
  ShieldCheck,
  ImageOff,
  MessageCircle,
  Package,
  Droplets,
  Car,
  Cross,
  Armchair,
  CheckCircle2,
  XCircle,
  Store,
  Bike,
  Compass,
  Star,
  Phone,
} from "lucide-react";
import { requireAdminPage } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import ApprovalActions from "./ApprovalActions";
import HapusPermanenAction from "./HapusPermanenAction";
import PetaLokasi from "./PetaLokasi";
import TrenKunjunganSection from "../../TrenKunjunganSection";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

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

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu Persetujuan",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: "#fef3e7", color: "#805533" },
  APPROVED: { bg: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" },
  REJECTED: { bg: "var(--blusukan-error-container)", color: "var(--blusukan-error)" },
};

const ROAD_LABEL: Record<string, string> = {
  MUDAH: "Mudah",
  SEDANG: "Sedang",
  SULIT: "Sulit",
  RUSAK: "Rusak",
  BELUM_ADA_DATA: "Belum ada data",
};

const SIGNAL_LABEL: Record<string, string> = {
  KUAT: "Sinyal Kuat",
  SEDANG: "Sinyal Sedang",
  LEMAH: "Sinyal Lemah",
};

const CROWD_LABEL: Record<string, string> = {
  SEPI: "Sepi",
  SEDANG: "Sedang",
  PADAT: "Padat",
};

const KATEGORI_UMKM_LABEL: Record<string, string> = {
  KULINER: "Kuliner",
  KERAJINAN: "Kerajinan",
  FASHION: "Fashion",
  JASA: "Jasa",
  LAINNYA: "Lainnya",
};

const SERVICE_TYPE_LABEL: Record<string, string> = {
  OJEK: "Ojek Lokal",
  JEEP: "Sewa Jeep",
  GUIDE: "Pemandu Wisata",
};

const SERVICE_TYPE_ICON: Record<string, React.ReactNode> = {
  OJEK: <Bike size={13} />,
  JEEP: <Car size={13} />,
  GUIDE: <Compass size={13} />,
};

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatTanggal(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" }).format(date);
}

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl p-6 ${className}`}
      style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-base font-bold mb-4"
      style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
    >
      {children}
    </h2>
  );
}

function FasilitasGratisItem({
  label,
  available,
  icon,
}: {
  label: string;
  available: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center gap-2.5 py-2.5 px-3.5 rounded-xl"
      style={{
        background: available ? "var(--blusukan-primary-container)" : "var(--blusukan-surface)",
        border: `1px solid ${available ? "var(--blusukan-primary)" : "var(--blusukan-outline-variant)"}`,
      }}
    >
      <span style={{ color: available ? "var(--blusukan-primary)" : "var(--blusukan-outline)" }}>{icon}</span>
      <span
        className="text-sm font-medium flex-1"
        style={{ color: available ? "var(--blusukan-on-surface)" : "var(--blusukan-on-surface-variant)" }}
      >
        {label}
      </span>
      {available ? (
        <CheckCircle2 size={15} style={{ color: "var(--blusukan-primary)" }} />
      ) : (
        <XCircle size={15} style={{ color: "var(--blusukan-outline)" }} />
      )}
    </div>
  );
}

function StarRow({ rating, size = 15 }: { rating: number; size?: number }) {
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

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
        {label}
      </p>
      <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--blusukan-on-surface)" }}>
        {value}
      </p>
    </div>
  );
}

export default async function DashboardDestinasiDetailPage({ params }: Props) {
  await requireAdminPage();
  const { id } = await params;

  const d = await prisma.destination.findUnique({
    where: { id },
    include: {
      submittedBy: { select: { name: true, email: true } },
      approvedBy: { select: { name: true, email: true } },
      reports: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { user: { select: { name: true } } },
      },
      fasilitas: { orderBy: { nama: "asc" } },
      warungs: {
        orderBy: { name: "asc" },
        include: { menuItems: true },
      },
      localServices: { orderBy: { providerName: "asc" } },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { user: { select: { name: true } } },
      },
    },
  });

  if (!d) notFound();

  const [reviewCount, reviewAgg] = await Promise.all([
    prisma.review.count({ where: { destinationId: id } }),
    prisma.review.aggregate({ where: { destinationId: id }, _avg: { rating: true } }),
  ]);
  const avgRating = reviewAgg._avg.rating != null ? Number(reviewAgg._avg.rating.toFixed(1)) : null;

  const statusStyle = STATUS_STYLE[d.status] ?? STATUS_STYLE.PENDING;

  return (
    <div className="min-h-screen" style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-10">
        <Link
          href="/dashboard/destinasi"
          id="destinasi-detail-back"
          className="flex items-center gap-1.5 text-sm font-semibold mb-6 hover:opacity-70 transition-opacity"
          style={{ color: "var(--blusukan-primary)" }}
        >
          <ArrowLeft size={16} />
          Kembali ke Daftar Destinasi
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3 mb-8">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <MapPin size={14} style={{ color: "var(--blusukan-on-surface-variant)" }} />
              <span className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                {KABUPATEN_LABEL[d.kabupaten] ?? d.kabupaten} · {KATEGORI_LABEL[d.kategori] ?? d.kategori}
              </span>
            </div>
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
            >
              {d.name}
            </h1>
          </div>
          <span
            className="text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap"
            style={{ background: statusStyle.bg, color: statusStyle.color }}
          >
            {STATUS_LABEL[d.status] ?? d.status}
          </span>
        </div>

        <div className="space-y-6">
          {d.status === "PENDING" && <ApprovalActions destinationId={d.id} />}

          {/* Galeri foto — read-only */}
          {d.photoUrls.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {d.photoUrls.map((url, idx) => (
                <div
                  key={url}
                  className="relative rounded-xl overflow-hidden"
                  style={{ aspectRatio: "4/3", border: "1px solid var(--blusukan-outline-variant)" }}
                >
                  <Image
                    src={url}
                    alt={`${d.name} — foto ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div
              className="rounded-xl flex items-center justify-center py-10"
              style={{ background: "#f0f0f0", border: "1px solid var(--blusukan-outline-variant)" }}
            >
              <ImageOff size={28} style={{ color: "var(--blusukan-outline)" }} />
            </div>
          )}

          {/* Info Dasar */}
          <SectionCard>
            <SectionTitle>Informasi Destinasi</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem label="Kabupaten" value={KABUPATEN_LABEL[d.kabupaten] ?? d.kabupaten} />
              <InfoItem label="Kategori" value={KATEGORI_LABEL[d.kategori] ?? d.kategori} />
              <InfoItem label="Jam Operasional" value={d.jamOperasional || "Tidak ada data"} />
              <InfoItem
                label="Harga Tiket Dewasa"
                value={Number(d.htmResmi) === 0 ? "Gratis" : formatRupiah(Number(d.htmResmi))}
              />
              <InfoItem
                label="Harga Tiket Anak-anak"
                value={
                  d.htmAnak == null
                    ? "Tidak dibedakan (1 harga untuk semua)"
                    : Number(d.htmAnak) === 0
                      ? "Gratis"
                      : formatRupiah(Number(d.htmAnak))
                }
              />
              <InfoItem label="Tanggal Diajukan" value={formatTanggal(d.createdAt)} />
              <InfoItem
                label="Tanggal Disetujui"
                value={d.approvedAt ? formatTanggal(d.approvedAt) : "Belum disetujui"}
              />
            </div>

            <div className="mt-4">
              <p className="text-xs mb-2" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                Koordinat
              </p>
              <PetaLokasi latitude={d.latitude} longitude={d.longitude} />
              <p className="text-xs mt-2" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                {d.latitude}, {d.longitude}
              </p>
            </div>
          </SectionCard>

          <TrenKunjunganSection destinationId={d.id} title="Tren Kunjungan Destinasi Ini" />

          {/* Info Kepemilikan */}
          <SectionCard>
            <SectionTitle>Kepemilikan & Persetujuan</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }}
                >
                  <UserCircle size={18} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                    Diajukan oleh (Pengelola)
                  </p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--blusukan-on-surface)" }}>
                    {d.submittedBy.name}
                  </p>
                  <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                    {d.submittedBy.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "#fef3e7", color: "#805533" }}
                >
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                    Disetujui oleh (Admin)
                  </p>
                  {d.approvedBy ? (
                    <>
                      <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--blusukan-on-surface)" }}>
                        {d.approvedBy.name}
                      </p>
                      <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                        {d.approvedBy.email}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm mt-0.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                      Belum ada
                    </p>
                  )}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Fasilitas Umum — gratis */}
          <SectionCard>
            <SectionTitle>Fasilitas Umum (Gratis)</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <FasilitasGratisItem label="Toilet" available={d.hasToilet} icon={<Droplets size={16} />} />
              <FasilitasGratisItem label="Parkir" available={d.hasParkir} icon={<Car size={16} />} />
              <FasilitasGratisItem label="Tempat Ibadah" available={d.hasTempatIbadah} icon={<Cross size={16} />} />
              <FasilitasGratisItem label="Tempat Duduk" available={d.hasTempatDuduk} icon={<Armchair size={16} />} />
              <FasilitasGratisItem
                label="Penitipan Barang"
                available={d.hasPenitipanBarang}
                icon={<Package size={16} />}
              />
            </div>
          </SectionCard>

          {/* Fasilitas — read-only */}
          <SectionCard>
            <SectionTitle>
              <span className="flex items-center gap-2">
                <Package size={16} />
                Fasilitas yang Dikelola
              </span>
            </SectionTitle>
            {d.fasilitas.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                Belum ada fasilitas terdaftar.
              </p>
            ) : (
              <div className="space-y-2.5">
                {d.fasilitas.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between py-2.5 px-3.5 rounded-xl"
                    style={{ background: "var(--blusukan-surface)", border: "1px solid var(--blusukan-outline-variant)" }}
                  >
                    <span className="text-sm font-medium" style={{ color: "var(--blusukan-on-surface)" }}>
                      {f.nama}
                    </span>
                    <span className="text-sm font-bold" style={{ color: "var(--blusukan-primary)" }}>
                      {formatRupiah(Number(f.hargaSewa))} / {f.satuanWaktu}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* UMKM Terdaftar */}
          <SectionCard>
            <SectionTitle>
              <span className="flex items-center gap-2">
                <Store size={16} />
                UMKM Terdaftar
              </span>
            </SectionTitle>
            {d.warungs.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                Belum ada UMKM terdaftar di destinasi ini.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {d.warungs.map((w) => (
                  <div
                    key={w.id}
                    className="py-3 px-3.5 rounded-xl"
                    style={{ background: "var(--blusukan-surface)", border: "1px solid var(--blusukan-outline-variant)" }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-sm font-semibold" style={{ color: "var(--blusukan-on-surface)" }}>
                        {w.name}
                      </span>
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                        style={{ background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }}
                      >
                        {KATEGORI_UMKM_LABEL[w.kategori] ?? w.kategori}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                      {w.menuItems.length} produk {w.namaPemilik ? `· Pemilik: ${w.namaPemilik}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Transportasi Tersedia */}
          <SectionCard>
            <SectionTitle>
              <span className="flex items-center gap-2">
                <Bike size={16} />
                Transportasi Tersedia
              </span>
            </SectionTitle>
            {d.localServices.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                Belum ada jasa transportasi terdaftar.
              </p>
            ) : (
              <div className="space-y-2.5">
                {d.localServices.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between gap-3 py-2.5 px-3.5 rounded-xl"
                    style={{ background: "var(--blusukan-surface)", border: "1px solid var(--blusukan-outline-variant)" }}
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }}
                      >
                        {SERVICE_TYPE_ICON[s.serviceType] ?? <Compass size={13} />}
                      </span>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--blusukan-on-surface)" }}>
                          {s.providerName}
                        </p>
                        <p className="text-xs flex items-center gap-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                          {SERVICE_TYPE_LABEL[s.serviceType] ?? s.serviceType}
                          <span className="inline-flex items-center gap-0.5">
                            <Phone size={11} />
                            {s.contactWa}
                          </span>
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold whitespace-nowrap" style={{ color: "var(--blusukan-primary)" }}>
                      {formatRupiah(Number(s.baseRate))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Ulasan & Rating */}
          <SectionCard>
            <SectionTitle>
              <span className="flex items-center gap-2">
                <Star size={16} />
                Ulasan & Rating
              </span>
            </SectionTitle>
            <div className="flex items-center gap-2 mb-4">
              <StarRow rating={avgRating ?? 0} />
              <span className="text-sm font-bold" style={{ color: "var(--blusukan-on-surface)" }}>
                {avgRating != null ? avgRating.toFixed(1) : "Belum ada rating"}
              </span>
              <span className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                ({reviewCount} ulasan)
              </span>
            </div>
            {d.reviews.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                Belum ada ulasan dari wisatawan.
              </p>
            ) : (
              <div className="space-y-3">
                {d.reviews.map((r) => (
                  <div
                    key={r.id}
                    className="py-3 px-3.5 rounded-xl"
                    style={{ background: "var(--blusukan-surface)", border: "1px solid var(--blusukan-outline-variant)" }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-sm font-semibold" style={{ color: "var(--blusukan-on-surface)" }}>
                        {r.user.name}
                      </span>
                      <span className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                        {formatTanggal(r.createdAt)}
                      </span>
                    </div>
                    <StarRow rating={r.rating} size={12} />
                    {r.komentar && (
                      <p className="text-xs italic mt-1.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                        &ldquo;{r.komentar}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Laporan Kondisi Lapangan — 5 terbaru */}
          <SectionCard>
            <SectionTitle>
              <span className="flex items-center gap-2">
                <MessageCircle size={16} />
                Laporan Kondisi Lapangan Terbaru
              </span>
            </SectionTitle>
            {d.reports.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                Belum ada laporan dari wisatawan.
              </p>
            ) : (
              <div className="space-y-3">
                {d.reports.map((r) => (
                  <div
                    key={r.id}
                    className="py-3 px-3.5 rounded-xl"
                    style={{ background: "var(--blusukan-surface)", border: "1px solid var(--blusukan-outline-variant)" }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-sm font-semibold" style={{ color: "var(--blusukan-on-surface)" }}>
                        {r.user.name}
                      </span>
                      <span className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                        {formatTanggal(r.createdAt)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-1.5">
                      <span
                        className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ background: "#f0f0f0", color: "#4b4f45" }}
                      >
                        Jalan: {ROAD_LABEL[r.roadCondition] ?? r.roadCondition}
                      </span>
                      <span
                        className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ background: "#f0f0f0", color: "#4b4f45" }}
                      >
                        {SIGNAL_LABEL[r.signalStrength] ?? r.signalStrength}
                      </span>
                      <span
                        className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ background: "#f0f0f0", color: "#4b4f45" }}
                      >
                        Keramaian: {CROWD_LABEL[r.crowdLevel] ?? r.crowdLevel}
                      </span>
                    </div>
                    {r.notes && (
                      <p className="text-xs italic mt-1.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                        &ldquo;{r.notes}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <HapusPermanenAction destinationId={d.id} destinationName={d.name} />
        </div>
      </div>
    </div>
  );
}
