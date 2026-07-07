import { NextResponse } from "next/server";
import { requirePengelolaApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

const ALLOWED_STATUS = ["DIKONFIRMASI", "SELESAI", "DIBATALKAN"] as const;
type AllowedStatus = (typeof ALLOWED_STATUS)[number];

function isAllowedStatus(value: unknown): value is AllowedStatus {
  return typeof value === "string" && (ALLOWED_STATUS as readonly string[]).includes(value);
}

const STATUS_TIMESTAMP_FIELD: Record<AllowedStatus, "dikonfirmasiAt" | "selesaiAt" | "dibatalkanAt"> = {
  DIKONFIRMASI: "dikonfirmasiAt",
  SELESAI: "selesaiAt",
  DIBATALKAN: "dibatalkanAt",
};

const NOTIFIKASI_CONTENT: Record<
  AllowedStatus,
  (kodeTransaksi: string, namaDestinasi: string) => { judul: string; pesan: string }
> = {
  DIKONFIRMASI: (kode, nama) => ({
    judul: "Pesanan Dikonfirmasi",
    pesan: `Pesanan ${kode} di ${nama} telah dikonfirmasi oleh pengelola.`,
  }),
  DIBATALKAN: (kode, nama) => ({
    judul: "Pesanan Ditolak",
    pesan: `Pesanan ${kode} di ${nama} ditolak oleh pengelola.`,
  }),
  SELESAI: (_kode, nama) => ({
    judul: "Kunjungan Selesai",
    pesan: `Terima kasih telah berkunjung ke ${nama}!`,
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

  const transaksi = await prisma.transaksi.findUnique({
    where: { id },
    include: { destination: { select: { submittedById: true, name: true } } },
  });

  if (!transaksi) {
    return NextResponse.json({ message: "Transaksi tidak ditemukan." }, { status: 404 });
  }

  if (transaksi.destination.submittedById !== authResult.userId) {
    return NextResponse.json({ message: "Anda tidak memiliki akses ke transaksi ini." }, { status: 403 });
  }

  const updated = await prisma.transaksi.update({
    where: { id },
    data: { status, [STATUS_TIMESTAMP_FIELD[status]]: new Date() },
  });

  const { judul, pesan } = NOTIFIKASI_CONTENT[status](
    transaksi.kodeTransaksi,
    transaksi.destination.name
  );
  await prisma.notifikasi.create({
    data: {
      userId: transaksi.userId,
      judul,
      pesan,
      link: `/transaksi/${transaksi.id}`,
    },
  });

  return NextResponse.json({ id: updated.id, status: updated.status });
}
