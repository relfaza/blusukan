import { NextResponse } from "next/server";
import { requirePengelolaApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

const ALLOWED_STATUS = ["CONFIRMED", "COMPLETED", "EXPIRED"] as const;
type AllowedStatus = (typeof ALLOWED_STATUS)[number];

function isAllowedStatus(value: unknown): value is AllowedStatus {
  return typeof value === "string" && (ALLOWED_STATUS as readonly string[]).includes(value);
}

const NOTIFIKASI_CONTENT: Record<AllowedStatus, (namaDestinasi: string) => { judul: string; pesan: string }> = {
  CONFIRMED: (nama) => ({
    judul: "Booking Dikonfirmasi",
    pesan: `Booking transport Anda di ${nama} telah dikonfirmasi oleh pengelola.`,
  }),
  COMPLETED: (nama) => ({
    judul: "Booking Selesai",
    pesan: `Terima kasih, booking transport Anda di ${nama} telah selesai.`,
  }),
  EXPIRED: (nama) => ({
    judul: "Booking Ditolak",
    pesan: `Booking transport Anda di ${nama} ditolak oleh pengelola.`,
  }),
};

interface Props {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: Props) {
  const authResult = await requirePengelolaApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { id } = await params;
  const { status } = await req.json();

  if (!isAllowedStatus(status)) {
    return NextResponse.json({ message: "Status tidak valid." }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { destination: { select: { submittedById: true, name: true } } },
  });

  if (!booking) {
    return NextResponse.json({ message: "Booking tidak ditemukan." }, { status: 404 });
  }

  if (booking.destination.submittedById !== authResult.userId) {
    return NextResponse.json({ message: "Anda tidak memiliki akses ke booking ini." }, { status: 403 });
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status },
  });

  const { judul, pesan } = NOTIFIKASI_CONTENT[status](booking.destination.name);
  await prisma.notifikasi.create({
    data: {
      userId: booking.userId,
      judul,
      pesan,
      link: `/booking/${booking.id}`,
      kategori: "TRANSPORT",
    },
  });

  return NextResponse.json({ id: updated.id, status: updated.status });
}
