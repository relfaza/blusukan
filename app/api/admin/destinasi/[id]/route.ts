import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

const ALLOWED_STATUS = ["APPROVED", "REJECTED"] as const;
type AllowedStatus = (typeof ALLOWED_STATUS)[number];

function isAllowedStatus(value: unknown): value is AllowedStatus {
  return typeof value === "string" && (ALLOWED_STATUS as readonly string[]).includes(value);
}

const NOTIFIKASI_CONTENT: Record<AllowedStatus, (namaDestinasi: string) => { judul: string; pesan: string }> = {
  APPROVED: (nama) => ({
    judul: "Destinasi Disetujui",
    pesan: `Destinasi ${nama} yang Anda ajukan telah disetujui dan kini tampil di Beranda.`,
  }),
  REJECTED: (nama) => ({
    judul: "Destinasi Ditolak",
    pesan: `Destinasi ${nama} yang Anda ajukan ditolak oleh admin.`,
  }),
};

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Props) {
  const authResult = await requireAdminApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { id } = await params;

  const destination = await prisma.destination.findUnique({
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
    },
  });

  if (!destination) {
    return NextResponse.json({ message: "Destinasi tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({
    id: destination.id,
    name: destination.name,
    kabupaten: destination.kabupaten,
    kategori: destination.kategori,
    latitude: destination.latitude,
    longitude: destination.longitude,
    jamOperasional: destination.jamOperasional,
    htmResmi: Number(destination.htmResmi),
    hasToilet: destination.hasToilet,
    hasParkir: destination.hasParkir,
    hasTempatIbadah: destination.hasTempatIbadah,
    hasTempatDuduk: destination.hasTempatDuduk,
    hasPenitipanBarang: destination.hasPenitipanBarang,
    aksesibilitas: destination.aksesibilitas,
    photoUrls: destination.photoUrls,
    vibeTags: destination.vibeTags,
    routeStatus: destination.routeStatus,
    status: destination.status,
    createdAt: destination.createdAt.toISOString(),
    approvedAt: destination.approvedAt ? destination.approvedAt.toISOString() : null,
    submittedBy: { name: destination.submittedBy.name, email: destination.submittedBy.email },
    approvedBy: destination.approvedBy
      ? { name: destination.approvedBy.name, email: destination.approvedBy.email }
      : null,
    reports: destination.reports.map((r) => ({
      id: r.id,
      userName: r.user.name,
      roadCondition: r.roadCondition,
      signalStrength: r.signalStrength,
      crowdLevel: r.crowdLevel,
      reportedFee: r.reportedFee ? Number(r.reportedFee) : null,
      notes: r.notes,
      createdAt: r.createdAt.toISOString(),
    })),
    fasilitas: destination.fasilitas.map((f) => ({
      id: f.id,
      nama: f.nama,
      hargaSewa: Number(f.hargaSewa),
      satuanWaktu: f.satuanWaktu,
      jumlahUnit: f.jumlahUnit,
    })),
  });
}

export async function PATCH(req: Request, { params }: Props) {
  const authResult = await requireAdminApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { id } = await params;
  const { status } = await req.json();

  if (!isAllowedStatus(status)) {
    return NextResponse.json({ message: "Status tidak valid." }, { status: 400 });
  }

  const destination = await prisma.destination.findUnique({
    where: { id },
    select: { id: true, name: true, submittedById: true },
  });

  if (!destination) {
    return NextResponse.json({ message: "Destinasi tidak ditemukan." }, { status: 404 });
  }

  const updated = await prisma.destination.update({
    where: { id },
    data: {
      status,
      approvedById: authResult.userId,
      approvedAt: new Date(),
    },
  });

  const { judul, pesan } = NOTIFIKASI_CONTENT[status](destination.name);
  await prisma.notifikasi.create({
    data: {
      userId: destination.submittedById,
      judul,
      pesan,
      link: "/pengelola",
    },
  });

  return NextResponse.json({ id: updated.id, status: updated.status });
}
