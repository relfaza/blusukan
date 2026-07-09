import { NextResponse } from "next/server";
import { requirePengelolaApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

function serializeMenuItem(m: { id: string; warungId: string; name: string; price: unknown }) {
  return { id: m.id, warungId: m.warungId, name: m.name, price: Number(m.price) };
}

function isValidPrice(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

export async function POST(req: Request) {
  const authResult = await requirePengelolaApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { warungId, name, price } = await req.json();

  if (typeof warungId !== "string" || !warungId) {
    return NextResponse.json({ message: "warungId wajib diisi." }, { status: 400 });
  }
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ message: "Nama menu wajib diisi." }, { status: 400 });
  }
  if (!isValidPrice(price)) {
    return NextResponse.json({ message: "Harga tidak valid." }, { status: 400 });
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

  const menuItem = await prisma.menuItem.create({
    data: { warungId, name: name.trim(), price },
  });

  return NextResponse.json(serializeMenuItem(menuItem), { status: 201 });
}
