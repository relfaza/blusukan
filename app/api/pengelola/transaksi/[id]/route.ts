import { NextResponse } from "next/server";
import { requirePengelolaApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

const ALLOWED_STATUS = ["DIKONFIRMASI", "SELESAI", "DIBATALKAN"] as const;
type AllowedStatus = (typeof ALLOWED_STATUS)[number];

function isAllowedStatus(value: unknown): value is AllowedStatus {
  return typeof value === "string" && (ALLOWED_STATUS as readonly string[]).includes(value);
}

interface Props {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: Props) {
  const authResult = await requirePengelolaApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { id } = await params;
  const { status } = await req.json();

  if (!isAllowedStatus(status)) {
    return NextResponse.json({ message: "Status tidak valid." }, { status: 400 });
  }

  const transaksi = await prisma.transaksi.findUnique({
    where: { id },
    include: { destination: { select: { submittedById: true } } },
  });

  if (!transaksi) {
    return NextResponse.json({ message: "Transaksi tidak ditemukan." }, { status: 404 });
  }

  if (transaksi.destination.submittedById !== authResult.userId) {
    return NextResponse.json({ message: "Anda tidak memiliki akses ke transaksi ini." }, { status: 403 });
  }

  const updated = await prisma.transaksi.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json({ id: updated.id, status: updated.status });
}
