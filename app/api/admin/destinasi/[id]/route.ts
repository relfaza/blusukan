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
