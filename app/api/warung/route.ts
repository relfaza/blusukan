import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function serializeMenuItem(m: { id: string; warungId: string; name: string; price: unknown }) {
  return { id: m.id, warungId: m.warungId, name: m.name, price: Number(m.price) };
}

function serializeWarung(w: {
  id: string;
  destinationId: string;
  name: string;
  location: string | null;
  menuItems: { id: string; warungId: string; name: string; price: unknown }[];
}) {
  return {
    id: w.id,
    destinationId: w.destinationId,
    name: w.name,
    location: w.location,
    menuItems: w.menuItems.map(serializeMenuItem),
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const destinationId = searchParams.get("destinationId");

  if (!destinationId) {
    return NextResponse.json({ message: "destinationId wajib diisi." }, { status: 400 });
  }

  const warungs = await prisma.localWarung.findMany({
    where: { destinationId },
    include: { menuItems: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(warungs.map(serializeWarung));
}
