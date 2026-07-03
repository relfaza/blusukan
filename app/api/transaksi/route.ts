import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const KODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function generateKodeTransaksi(): string {
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += KODE_CHARS[Math.floor(Math.random() * KODE_CHARS.length)];
  }
  return `BLS-${suffix}`;
}

function serializeTransaksi(t: {
  id: string;
  destinationId: string;
  destination: { name: string };
  type: string;
  totalHarga: unknown;
  status: string;
  paymentMethod: string;
  jadwal: Date | null;
  kodeTransaksi: string;
  createdAt: Date;
  items: { id: string; namaItem: string; hargaSatuan: unknown; kuantitas: number; subtotal: unknown }[];
}) {
  return {
    id: t.id,
    destinationId: t.destinationId,
    destination: { name: t.destination.name },
    type: t.type,
    totalHarga: Number(t.totalHarga),
    status: t.status,
    paymentMethod: t.paymentMethod,
    jadwal: t.jadwal ? t.jadwal.toISOString() : null,
    kodeTransaksi: t.kodeTransaksi,
    createdAt: t.createdAt.toISOString(),
    items: t.items.map((item) => ({
      id: item.id,
      namaItem: item.namaItem,
      hargaSatuan: Number(item.hargaSatuan),
      kuantitas: item.kuantitas,
      subtotal: Number(item.subtotal),
    })),
  };
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const namaPembeli = (session?.user as { name?: string } | undefined)?.name ?? "Wisatawan";

  if (!userId) {
    return NextResponse.json({ message: "Anda harus masuk terlebih dahulu." }, { status: 401 });
  }

  const body = await req.json();
  const type = body.type === "FASILITAS" ? "FASILITAS" : "TIKET_MASUK";
  const { destinationId, kuantitas } = body;

  if (typeof destinationId !== "string" || !destinationId) {
    return NextResponse.json({ message: "destinationId wajib diisi." }, { status: 400 });
  }

  const jumlah = Number(kuantitas);
  if (!Number.isInteger(jumlah) || jumlah < 1) {
    return NextResponse.json({ message: "Kuantitas tidak valid." }, { status: 400 });
  }

  const destination = await prisma.destination.findUnique({
    where: { id: destinationId },
    select: { name: true, htmResmi: true, submittedById: true },
  });

  if (!destination) {
    return NextResponse.json({ message: "Destinasi tidak ditemukan." }, { status: 404 });
  }

  let namaItem: string;
  let hargaSatuan: number;
  let jadwal: Date | null = null;

  if (type === "FASILITAS") {
    const { fasilitasId } = body;

    if (typeof fasilitasId !== "string" || !fasilitasId) {
      return NextResponse.json({ message: "fasilitasId wajib diisi." }, { status: 400 });
    }
    if (typeof body.jadwal !== "string" || !body.jadwal) {
      return NextResponse.json({ message: "Jadwal booking wajib diisi." }, { status: 400 });
    }

    const parsedJadwal = new Date(body.jadwal);
    if (Number.isNaN(parsedJadwal.getTime())) {
      return NextResponse.json({ message: "Format jadwal tidak valid." }, { status: 400 });
    }

    const fasilitas = await prisma.fasilitas.findFirst({
      where: { id: fasilitasId, destinationId },
    });

    if (!fasilitas) {
      return NextResponse.json({ message: "Fasilitas tidak ditemukan untuk destinasi ini." }, { status: 404 });
    }

    namaItem = fasilitas.nama;
    hargaSatuan = Number(fasilitas.hargaSewa);
    jadwal = parsedJadwal;
  } else {
    namaItem = "Tiket Masuk";
    hargaSatuan = Number(destination.htmResmi);
  }

  const totalHarga = hargaSatuan * jumlah;

  const MAX_ATTEMPTS = 5;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const transaksi = await prisma.$transaction(async (tx) => {
        const created = await tx.transaksi.create({
          data: {
            userId,
            destinationId,
            type,
            status: "PENDING",
            paymentMethod: "COD",
            totalHarga,
            jadwal,
            kodeTransaksi: generateKodeTransaksi(),
            items: {
              create: {
                namaItem,
                hargaSatuan,
                kuantitas: jumlah,
                subtotal: totalHarga,
              },
            },
          },
          include: {
            items: true,
            destination: { select: { name: true } },
          },
        });

        await tx.notifikasi.create({
          data: {
            userId: destination.submittedById,
            judul: "Pesanan Baru Masuk",
            pesan: `${namaPembeli} memesan ${namaItem} di ${destination.name}. Kode: ${created.kodeTransaksi}`,
            link: `/pengelola/destinasi/${destinationId}`,
          },
        });

        return created;
      });

      return NextResponse.json(serializeTransaksi(transaksi), { status: 201 });
    } catch (error) {
      const isUniqueViolation =
        typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
      if (isUniqueViolation && attempt < MAX_ATTEMPTS - 1) {
        continue;
      }
      console.error("[API /transaksi POST]", error);
      return NextResponse.json({ message: "Terjadi kesalahan server." }, { status: 500 });
    }
  }
}

export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return NextResponse.json({ message: "Anda harus masuk terlebih dahulu." }, { status: 401 });
  }

  const transaksis = await prisma.transaksi.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      destination: { select: { name: true } },
    },
  });

  return NextResponse.json(transaksis.map(serializeTransaksi));
}
