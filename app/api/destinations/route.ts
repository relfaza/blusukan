import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const destinations = await prisma.destination.findMany({
    where: { status: "APPROVED" },
    select: { id: true, name: true, kabupaten: true, latitude: true, longitude: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(destinations);
}
