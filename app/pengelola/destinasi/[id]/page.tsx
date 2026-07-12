import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { requirePengelolaPage } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import PengelolaDestinasiClient from "./PengelolaDestinasiClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

const STATUS_RANK: Record<string, number> = {
  PENDING: 0,
  DIKONFIRMASI: 1,
  SELESAI: 1,
  DIBATALKAN: 1,
};

const TRANSAKSI_PREVIEW_LIMIT = 8;

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
        Anda tidak memiliki akses untuk mengelola destinasi ini.
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

export default async function PengelolaDestinasiPage({ params }: Props) {
  const { id } = await params;
  const userId = await requirePengelolaPage();

  const destination = await prisma.destination.findUnique({ where: { id } });

  if (!destination || destination.submittedById !== userId) {
    return <TidakDiizinkan />;
  }

  const [transaksis, transaksiCount, fasilitasList, warungList, bookings] = await Promise.all([
    prisma.transaksi.findMany({
      where: { destinationId: id },
      orderBy: { createdAt: "desc" },
      take: TRANSAKSI_PREVIEW_LIMIT,
      include: {
        items: true,
        user: { select: { name: true } },
      },
    }),
    prisma.transaksi.count({ where: { destinationId: id } }),
    prisma.fasilitas.findMany({ where: { destinationId: id }, orderBy: { nama: "asc" } }),
    prisma.localWarung.findMany({
      where: { destinationId: id },
      include: { menuItems: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.booking.findMany({
      where: { destinationId: id },
      orderBy: { createdAt: "desc" },
      include: {
        service: { select: { providerName: true, serviceType: true } },
        user: { select: { name: true } },
      },
    }),
  ]);

  const sortedTransaksis = [...transaksis].sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status]);

  const initialTransaksis = sortedTransaksis.map((t) => ({
    id: t.id,
    type: t.type,
    totalHarga: Number(t.totalHarga),
    status: t.status,
    kodeTransaksi: t.kodeTransaksi,
    createdAt: t.createdAt.toISOString(),
    namaPemesan: t.user.name,
  }));

  const initialFasilitas = fasilitasList.map((f) => ({
    id: f.id,
    destinationId: f.destinationId,
    nama: f.nama,
    hargaSewa: Number(f.hargaSewa),
    satuanWaktu: f.satuanWaktu,
    jumlahUnit: f.jumlahUnit,
  }));

  const initialWarungs = warungList.map((w) => ({
    id: w.id,
    destinationId: w.destinationId,
    name: w.name,
    location: w.location,
    kategori: w.kategori,
    namaPemilik: w.namaPemilik,
    photoUrls: w.photoUrls,
    bisaBooking: w.bisaBooking,
    menuItems: w.menuItems.map((m) => ({
      id: m.id,
      warungId: m.warungId,
      name: m.name,
      price: Number(m.price),
    })),
  }));

  const initialBookings = bookings.map((b) => ({
    id: b.id,
    status: b.status,
    travelDate: b.travelDate.toISOString(),
    createdAt: b.createdAt.toISOString(),
    contactNumber: b.contactNumber,
    namaPemesan: b.user.name,
    service: { providerName: b.service.providerName, serviceType: b.service.serviceType },
  }));

  return (
    <PengelolaDestinasiClient
      destination={{
        id: destination.id,
        name: destination.name,
        status: destination.status,
        kabupaten: destination.kabupaten,
        kategori: destination.kategori,
        latitude: destination.latitude,
        longitude: destination.longitude,
        jamOperasional: destination.jamOperasional,
        htmResmi: Number(destination.htmResmi),
        htmAnak: destination.htmAnak != null ? Number(destination.htmAnak) : null,
        hasToilet: destination.hasToilet,
        hasParkir: destination.hasParkir,
        hasTempatIbadah: destination.hasTempatIbadah,
        hasTempatDuduk: destination.hasTempatDuduk,
        hasPenitipanBarang: destination.hasPenitipanBarang,
        createdAt: destination.createdAt.toISOString(),
        approvedAt: destination.approvedAt ? destination.approvedAt.toISOString() : null,
      }}
      initialTransaksis={initialTransaksis}
      transaksiCount={transaksiCount}
      initialFasilitas={initialFasilitas}
      initialWarungs={initialWarungs}
      initialBookings={initialBookings}
    />
  );
}
