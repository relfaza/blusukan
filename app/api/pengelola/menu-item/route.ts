import { NextResponse } from "next/server";
import { requirePengelolaApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

function serializeMenuItem(m: { id: string; warungId: string; name: string; price: unknown }) {
  return { id: m.id, warungId: m.warungId, name: m.name, price: Number(m.price) };
}

function isValidPrice(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

/** POST tunggal: { warungId, name, price }. POST batch (mis. "Simpan Semua" tambah produk sekaligus): { warungId, items: [{ nama, harga }] }. */
export async function POST(req: Request) {
  const authResult = await requirePengelolaApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const body = await req.json();
  const { warungId } = body;

  if (typeof warungId !== "string" || !warungId) {
    return NextResponse.json({ message: "warungId wajib diisi." }, { status: 400 });
  }

  const warung = await prisma.localWarung.findUnique({
    where: { id: warungId },
    include: { destination: { select: { submittedById: true } } },
  });

  if (!warung) {
    return NextResponse.json({ message: "UMKM tidak ditemukan." }, { status: 404 });
  }
  if (warung.destination.submittedById !== authResult.userId) {
    return NextResponse.json({ message: "Anda tidak memiliki akses ke UMKM ini." }, { status: 403 });
  }

  if (Array.isArray(body.items)) {
    const items: unknown[] = body.items;
    if (items.length === 0) {
      return NextResponse.json({ message: "Minimal 1 produk wajib diisi." }, { status: 400 });
    }
    for (const item of items) {
      const it = item as { nama?: unknown; harga?: unknown };
      if (typeof it?.nama !== "string" || !it.nama.trim()) {
        return NextResponse.json({ message: "Nama produk wajib diisi." }, { status: 400 });
      }
      if (!isValidPrice(it?.harga)) {
        return NextResponse.json({ message: "Harga produk tidak valid." }, { status: 400 });
      }
    }

    const created = await prisma.$transaction(
      (items as { nama: string; harga: number }[]).map((item) =>
        prisma.menuItem.create({ data: { warungId, name: item.nama.trim(), price: item.harga } })
      )
    );

    return NextResponse.json(created.map(serializeMenuItem), { status: 201 });
  }

  const { name, price } = body;

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ message: "Nama menu wajib diisi." }, { status: 400 });
  }
  if (!isValidPrice(price)) {
    return NextResponse.json({ message: "Harga tidak valid." }, { status: 400 });
  }

  const menuItem = await prisma.menuItem.create({
    data: { warungId, name: name.trim(), price },
  });

  return NextResponse.json(serializeMenuItem(menuItem), { status: 201 });
}

/** PATCH batch: { items: [{ id, name, price }] } — dipakai untuk "Simpan Semua Perubahan" saat edit beberapa produk sekaligus. */
export async function PATCH(req: Request) {
  const authResult = await requirePengelolaApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { items } = await req.json();

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ message: "Minimal 1 produk wajib diisi." }, { status: 400 });
  }

  const ids: string[] = [];
  for (const item of items) {
    const it = item as { id?: unknown; name?: unknown; price?: unknown };
    if (typeof it?.id !== "string" || !it.id) {
      return NextResponse.json({ message: "id produk wajib diisi." }, { status: 400 });
    }
    if (typeof it?.name !== "string" || !it.name.trim()) {
      return NextResponse.json({ message: "Nama menu wajib diisi." }, { status: 400 });
    }
    if (!isValidPrice(it?.price)) {
      return NextResponse.json({ message: "Harga tidak valid." }, { status: 400 });
    }
    ids.push(it.id);
  }

  const owned = await prisma.menuItem.findMany({
    where: { id: { in: ids } },
    include: { warung: { include: { destination: { select: { submittedById: true } } } } },
  });

  if (owned.length !== ids.length || owned.some((m) => m.warung.destination.submittedById !== authResult.userId)) {
    return NextResponse.json({ message: "Anda tidak memiliki akses ke salah satu menu ini." }, { status: 403 });
  }

  const typedItems = items as { id: string; name: string; price: number }[];
  const updated = await prisma.$transaction(
    typedItems.map((item) =>
      prisma.menuItem.update({ where: { id: item.id }, data: { name: item.name.trim(), price: item.price } })
    )
  );

  return NextResponse.json(updated.map(serializeMenuItem));
}
