import { NextResponse } from "next/server";
import { requirePengelolaApi, findOwnedDestination } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

function serializeMenuItem(m: { id: string; warungId: string; name: string; price: unknown }) {
  return { id: m.id, warungId: m.warungId, name: m.name, price: Number(m.price) };
}

function serializeWarung(w: {
  id: string;
  destinationId: string;
  name: string;
  location: string | null;
  menuItems?: { id: string; warungId: string; name: string; price: unknown }[];
}) {
  return {
    id: w.id,
    destinationId: w.destinationId,
    name: w.name,
    location: w.location,
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

  const { destinationId, name, location } = await req.json();

  if (typeof destinationId !== "string" || !destinationId) {
    return NextResponse.json({ message: "destinationId wajib diisi." }, { status: 400 });
  }
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ message: "Nama warung wajib diisi." }, { status: 400 });
  }
  if (location !== undefined && location !== null && typeof location !== "string") {
    return NextResponse.json({ message: "Lokasi tidak valid." }, { status: 400 });
  }

  const destination = await findOwnedDestination(destinationId, authResult.userId);
  if (!destination) {
    return NextResponse.json({ message: "Anda tidak memiliki akses ke destinasi ini." }, { status: 403 });
  }

  const warung = await prisma.localWarung.create({
    data: {
      destinationId,
      name: name.trim(),
      location: typeof location === "string" && location.trim() ? location.trim() : null,
    },
  });

  return NextResponse.json(serializeWarung({ ...warung, menuItems: [] }), { status: 201 });
}
