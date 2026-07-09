import { NextResponse } from "next/server";
import { requirePengelolaApi, findOwnedDestination } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

const KATEGORI_UMKM_VALUES = ["KULINER", "KERAJINAN", "FASHION", "JASA", "LAINNYA"] as const;

function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

function isValidPrice(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function serializeMenuItem(m: { id: string; warungId: string; name: string; price: unknown }) {
  return { id: m.id, warungId: m.warungId, name: m.name, price: Number(m.price) };
}

function serializeWarung(w: {
  id: string;
  destinationId: string;
  name: string;
  location: string | null;
  kategori: string;
  namaPemilik: string | null;
  fotoUrl: string | null;
  menuItems?: { id: string; warungId: string; name: string; price: unknown }[];
}) {
  return {
    id: w.id,
    destinationId: w.destinationId,
    name: w.name,
    location: w.location,
    kategori: w.kategori,
    namaPemilik: w.namaPemilik,
    fotoUrl: w.fotoUrl,
    menuItems: (w.menuItems ?? []).map(serializeMenuItem),
  };
}

export async function GET(req: Request) {
  const authResult = await requirePengelolaApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { searchParams } = new URL(req.url);
  const destinationId = searchParams.get("destinationId");

  if (!destinationId) {
    return NextResponse.json({ message: "destinationId wajib diisi." }, { status: 400 });
  }

  const destination = await findOwnedDestination(destinationId, authResult.userId);
  if (!destination) {
    return NextResponse.json({ message: "Anda tidak memiliki akses ke destinasi ini." }, { status: 403 });
  }

  const warungs = await prisma.localWarung.findMany({
    where: { destinationId },
    include: { menuItems: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(warungs.map(serializeWarung));
}

export async function POST(req: Request) {
  const authResult = await requirePengelolaApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { destinationId, name, location, kategori, namaPemilik, fotoUrl, items } = await req.json();

  if (typeof destinationId !== "string" || !destinationId) {
    return NextResponse.json({ message: "destinationId wajib diisi." }, { status: 400 });
  }
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ message: "Nama UMKM wajib diisi." }, { status: 400 });
  }
  if (location !== undefined && location !== null && typeof location !== "string") {
    return NextResponse.json({ message: "Lokasi tidak valid." }, { status: 400 });
  }
  if (kategori !== undefined && !isOneOf(kategori, KATEGORI_UMKM_VALUES)) {
    return NextResponse.json({ message: "Kategori tidak valid." }, { status: 400 });
  }
  if (namaPemilik !== undefined && namaPemilik !== null && typeof namaPemilik !== "string") {
    return NextResponse.json({ message: "Nama pemilik tidak valid." }, { status: 400 });
  }
  if (fotoUrl !== undefined && fotoUrl !== null && typeof fotoUrl !== "string") {
    return NextResponse.json({ message: "Foto tidak valid." }, { status: 400 });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ message: "Minimal 1 produk wajib diisi." }, { status: 400 });
  }
  for (const item of items) {
    if (typeof item?.nama !== "string" || !item.nama.trim()) {
      return NextResponse.json({ message: "Nama produk wajib diisi." }, { status: 400 });
    }
    if (!isValidPrice(item?.harga)) {
      return NextResponse.json({ message: "Harga produk tidak valid." }, { status: 400 });
    }
  }

  const destination = await findOwnedDestination(destinationId, authResult.userId);
  if (!destination) {
    return NextResponse.json({ message: "Anda tidak memiliki akses ke destinasi ini." }, { status: 403 });
  }

  const warung = await prisma.$transaction(async (tx) => {
    const created = await tx.localWarung.create({
      data: {
        destinationId,
        name: name.trim(),
        location: typeof location === "string" && location.trim() ? location.trim() : null,
        kategori: isOneOf(kategori, KATEGORI_UMKM_VALUES) ? kategori : "LAINNYA",
        namaPemilik: typeof namaPemilik === "string" && namaPemilik.trim() ? namaPemilik.trim() : null,
        fotoUrl: typeof fotoUrl === "string" && fotoUrl.trim() ? fotoUrl.trim() : null,
      },
    });

    await tx.menuItem.createMany({
      data: items.map((item: { nama: string; harga: number }) => ({
        warungId: created.id,
        name: item.nama.trim(),
        price: item.harga,
      })),
    });

    const menuItems = await tx.menuItem.findMany({ where: { warungId: created.id } });

    return { ...created, menuItems };
  });

  return NextResponse.json(serializeWarung(warung), { status: 201 });
}
