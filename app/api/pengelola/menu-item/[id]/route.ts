import { NextResponse } from "next/server";
import { requirePengelolaApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ id: string }>;
}

function serializeMenuItem(m: { id: string; warungId: string; name: string; price: unknown }) {
  return { id: m.id, warungId: m.warungId, name: m.name, price: Number(m.price) };
}

function isValidPrice(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

async function findOwnedMenuItem(id: string) {
  return prisma.menuItem.findUnique({
    where: { id },
    include: { warung: { include: { destination: { select: { submittedById: true } } } } },
  });
}

export async function PATCH(req: Request, { params }: Props) {
  const authResult = await requirePengelolaApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { id } = await params;
  const { name, price } = await req.json();

  const existing = await findOwnedMenuItem(id);

  if (!existing) {
    return NextResponse.json({ message: "Menu tidak ditemukan." }, { status: 404 });
  }
  if (existing.warung.destination.submittedById !== authResult.userId) {
    return NextResponse.json({ message: "Anda tidak memiliki akses ke menu ini." }, { status: 403 });
  }

  const data: { name?: string; price?: number } = {};

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ message: "Nama menu tidak valid." }, { status: 400 });
    }
    data.name = name.trim();
  }
  if (price !== undefined) {
    if (!isValidPrice(price)) {
      return NextResponse.json({ message: "Harga tidak valid." }, { status: 400 });
    }
    data.price = price;
  }

  const updated = await prisma.menuItem.update({ where: { id }, data });

  return NextResponse.json(serializeMenuItem(updated));
}

export async function DELETE(_req: Request, { params }: Props) {
  const authResult = await requirePengelolaApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { id } = await params;

  const existing = await findOwnedMenuItem(id);

  if (!existing) {
    return NextResponse.json({ message: "Menu tidak ditemukan." }, { status: 404 });
  }
  if (existing.warung.destination.submittedById !== authResult.userId) {
    return NextResponse.json({ message: "Anda tidak memiliki akses ke menu ini." }, { status: 403 });
  }

  await prisma.menuItem.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
