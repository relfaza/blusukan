import { NextResponse } from "next/server";
import { findOwnedDestination, requirePengelolaApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { parsePenginapanBody, serializePenginapan } from "@/lib/penginapan";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requirePengelolaApi();
  if (!auth.ok) return NextResponse.json({ message: auth.message }, { status: auth.status });

  const destinationId = new URL(request.url).searchParams.get("destinationId");
  if (!destinationId) {
    return NextResponse.json({ message: "destinationId wajib diisi." }, { status: 400 });
  }

  // Kepemilikan: pengelola hanya boleh melihat penginapan destinasi miliknya.
  const owned = await findOwnedDestination(destinationId, auth.userId);
  if (!owned) {
    return NextResponse.json({ message: "Destinasi tidak ditemukan atau bukan milik Anda." }, { status: 404 });
  }

  const rows = await prisma.penginapan.findMany({
    where: { destinationId },
    orderBy: [{ jarakKm: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(rows.map(serializePenginapan));
}

export async function POST(request: Request) {
  const auth = await requirePengelolaApi();
  if (!auth.ok) return NextResponse.json({ message: auth.message }, { status: auth.status });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Format permintaan tidak valid." }, { status: 400 });
  }

  const parsed = parsePenginapanBody(body);
  if (!parsed.ok) return NextResponse.json({ message: parsed.message }, { status: 400 });

  const owned = await findOwnedDestination(parsed.data.destinationId, auth.userId);
  if (!owned) {
    return NextResponse.json({ message: "Destinasi tidak ditemukan atau bukan milik Anda." }, { status: 404 });
  }

  const created = await prisma.penginapan.create({ data: parsed.data });
  return NextResponse.json(serializePenginapan(created), { status: 201 });
}

export async function DELETE(request: Request) {
  const auth = await requirePengelolaApi();
  if (!auth.ok) return NextResponse.json({ message: auth.message }, { status: auth.status });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ message: "id wajib diisi." }, { status: 400 });

  // Verifikasi kepemilikan lewat destinasi induk sebelum menghapus.
  const existing = await prisma.penginapan.findUnique({
    where: { id },
    select: { id: true, destination: { select: { submittedById: true } } },
  });
  if (!existing || existing.destination.submittedById !== auth.userId) {
    return NextResponse.json({ message: "Data penginapan tidak ditemukan atau bukan milik Anda." }, { status: 404 });
  }

  await prisma.penginapan.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
