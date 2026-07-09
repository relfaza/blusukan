import { NextResponse } from "next/server";
import { requirePengelolaApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ id: string }>;
}

const ALLOWED_STATUS = ["APPROVED", "NONAKTIF"] as const;
type AllowedStatus = (typeof ALLOWED_STATUS)[number];

function isAllowedStatus(value: unknown): value is AllowedStatus {
  return typeof value === "string" && (ALLOWED_STATUS as readonly string[]).includes(value);
}

/**
 * Toggle status APPROVED <-> NONAKTIF milik Pengelola sendiri.
 * Terpisah dari PATCH utama karena scope-nya sengaja dibatasi: Pengelola tidak boleh
 * menyentuh PENDING/REJECTED (itu murni alur approval Admin).
 */
export async function PATCH(req: Request, { params }: Props) {
  const authResult = await requirePengelolaApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { id } = await params;
  const { status } = await req.json();

  if (!isAllowedStatus(status)) {
    return NextResponse.json(
      { message: "Status tidak valid. Pengelola hanya bisa mengubah ke APPROVED atau NONAKTIF." },
      { status: 400 }
    );
  }

  const existing = await prisma.destination.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ message: "Destinasi tidak ditemukan." }, { status: 404 });
  }
  if (existing.submittedById !== authResult.userId) {
    return NextResponse.json({ message: "Anda tidak memiliki akses ke destinasi ini." }, { status: 403 });
  }
  if (existing.status !== "APPROVED" && existing.status !== "NONAKTIF") {
    return NextResponse.json(
      { message: "Destinasi harus disetujui Admin terlebih dahulu sebelum bisa diaktifkan/nonaktifkan." },
      { status: 400 }
    );
  }

  const updated = await prisma.destination.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json({ id: updated.id, status: updated.status });
}
