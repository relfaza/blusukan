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

function formatJamNotif(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", { timeStyle: "short" }).format(date);
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

async function handleUmkmTransaksi({
  body,
  destinationId,
  destination,
  userId,
  namaPembeli,
}: {
  body: { warungId?: unknown; items?: unknown; reservasiTempat?: unknown; jadwal?: unknown };
  destinationId: string;
  destination: { name: string; submittedById: string };
  userId: string;
  namaPembeli: string;
}) {
  const { warungId, items: rawItems, reservasiTempat: reservasiTempatRaw, jadwal: jadwalRaw } = body;

  if (typeof warungId !== "string" || !warungId) {
    return NextResponse.json({ message: "warungId wajib diisi." }, { status: 400 });
  }
  if (!Array.isArray(rawItems)) {
    return NextResponse.json({ message: "Format items tidak valid." }, { status: 400 });
  }

  for (const item of rawItems) {
    if (typeof item?.menuItemId !== "string" || !item.menuItemId) {
      return NextResponse.json({ message: "menuItemId tidak valid." }, { status: 400 });
    }
    if (!Number.isInteger(item.kuantitas) || item.kuantitas < 1) {
      return NextResponse.json({ message: "Kuantitas menu tidak valid." }, { status: 400 });
    }
  }

  const items: { menuItemId: string; kuantitas: number }[] = rawItems;
  const reservasiTempat = reservasiTempatRaw === true;

  if (items.length === 0 && !reservasiTempat) {
    return NextResponse.json(
      { message: "Pilih menu atau centang reservasi tempat." },
      { status: 400 }
    );
  }

  let jadwal: Date | null = null;
  if (reservasiTempat) {
    if (typeof jadwalRaw !== "string" || !jadwalRaw) {
      return NextResponse.json(
        { message: "Jadwal kedatangan wajib diisi untuk reservasi tempat." },
        { status: 400 }
      );
    }
    const parsedJadwal = new Date(jadwalRaw);
    if (Number.isNaN(parsedJadwal.getTime())) {
      return NextResponse.json({ message: "Format jadwal tidak valid." }, { status: 400 });
    }
    jadwal = parsedJadwal;
  }

  const warung = await prisma.localWarung.findFirst({ where: { id: warungId, destinationId } });
  if (!warung) {
    return NextResponse.json({ message: "Warung tidak ditemukan untuk destinasi ini." }, { status: 404 });
  }

  const menuItemIds = items.map((i) => i.menuItemId);
  const menuItems =
    menuItemIds.length > 0
      ? await prisma.menuItem.findMany({ where: { id: { in: menuItemIds }, warungId } })
      : [];
  const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

  for (const id of menuItemIds) {
    if (!menuItemMap.has(id)) {
      return NextResponse.json(
        { message: "Menu tidak ditemukan untuk warung ini." },
        { status: 404 }
      );
    }
  }

  const itemsData = items.map((item) => {
    const menuItem = menuItemMap.get(item.menuItemId)!;
    const hargaSatuan = Number(menuItem.price);
    const subtotal = hargaSatuan * item.kuantitas;
    return {
      namaItem: `${warung.name} - ${menuItem.name}`,
      hargaSatuan,
      kuantitas: item.kuantitas,
      subtotal,
    };
  });

  if (reservasiTempat) {
    itemsData.push({
      namaItem: `Reservasi Tempat - ${warung.name}`,
      hargaSatuan: 0,
      kuantitas: 1,
      subtotal: 0,
    });
  }

  const totalHarga = itemsData.reduce((sum, it) => sum + it.subtotal, 0);

  let pesan: string;
  if (items.length > 0 && reservasiTempat) {
    pesan = `${namaPembeli} memesan ${items.length} menu dari ${warung.name} di ${destination.name}, reservasi tempat jam ${formatJamNotif(jadwal!)}.`;
  } else if (items.length > 0) {
    pesan = `${namaPembeli} memesan ${items.length} menu dari ${warung.name} di ${destination.name}.`;
  } else {
    pesan = `${namaPembeli} reservasi tempat di ${warung.name}, ${destination.name}, jam ${formatJamNotif(jadwal!)}.`;
  }

  const MAX_ATTEMPTS = 5;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const transaksi = await prisma.$transaction(async (tx) => {
        const created = await tx.transaksi.create({
          data: {
            userId,
            destinationId,
            type: "UMKM",
            status: "PENDING",
            paymentMethod: "COD",
            totalHarga,
            jadwal,
            kodeTransaksi: generateKodeTransaksi(),
            items: { create: itemsData },
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
            pesan,
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
      console.error("[API /transaksi POST UMKM]", error);
      return NextResponse.json({ message: "Terjadi kesalahan server." }, { status: 500 });
    }
  }
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const namaPembeli = (session?.user as { name?: string } | undefined)?.name ?? "Wisatawan";

  if (!userId) {
    return NextResponse.json({ message: "Anda harus masuk terlebih dahulu." }, { status: 401 });
  }

  const body = await req.json();
  const type = body.type === "FASILITAS" ? "FASILITAS" : body.type === "UMKM" ? "UMKM" : "TIKET_MASUK";
  const { destinationId } = body;

  if (typeof destinationId !== "string" || !destinationId) {
    return NextResponse.json({ message: "destinationId wajib diisi." }, { status: 400 });
  }

  const destination = await prisma.destination.findUnique({
    where: { id: destinationId },
    select: { name: true, htmResmi: true, submittedById: true },
  });

  if (!destination) {
    return NextResponse.json({ message: "Destinasi tidak ditemukan." }, { status: 404 });
  }

  if (type === "UMKM") {
    return handleUmkmTransaksi({ body, destinationId, destination, userId, namaPembeli });
  }

  const { kuantitas } = body;
  const jumlah = Number(kuantitas);
  if (!Number.isInteger(jumlah) || jumlah < 1) {
    return NextResponse.json({ message: "Kuantitas tidak valid." }, { status: 400 });
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
