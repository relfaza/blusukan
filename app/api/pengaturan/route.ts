import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

const BAHASA_VALUES = ["id", "en"] as const;
type Bahasa = (typeof BAHASA_VALUES)[number];

function isBahasa(value: unknown): value is Bahasa {
  return typeof value === "string" && (BAHASA_VALUES as readonly string[]).includes(value);
}

export async function GET() {
  const authResult = await requireAdminApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const user = await prisma.user.findUnique({
    where: { id: authResult.userId },
    select: {
      name: true,
      email: true,
      phone: true,
      namaInstansi: true,
      notifEmailAktif: true,
      bahasaPreferensi: true,
    },
  });

  if (!user) {
    return NextResponse.json({ message: "Pengguna tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(req: Request) {
  const authResult = await requireAdminApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { namaInstansi, notifEmailAktif, bahasaPreferensi } = await req.json();

  const data: Prisma.UserUpdateInput = {};

  if (namaInstansi !== undefined) {
    if (namaInstansi !== null && typeof namaInstansi !== "string") {
      return NextResponse.json({ message: "Nama instansi tidak valid." }, { status: 400 });
    }
    data.namaInstansi = typeof namaInstansi === "string" && namaInstansi.trim() ? namaInstansi.trim() : null;
  }

  if (notifEmailAktif !== undefined) {
    if (typeof notifEmailAktif !== "boolean") {
      return NextResponse.json({ message: "Preferensi notifikasi tidak valid." }, { status: 400 });
    }
    data.notifEmailAktif = notifEmailAktif;
  }

  if (bahasaPreferensi !== undefined) {
    if (!isBahasa(bahasaPreferensi)) {
      return NextResponse.json({ message: "Bahasa tidak valid." }, { status: 400 });
    }
    data.bahasaPreferensi = bahasaPreferensi;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ message: "Tidak ada perubahan untuk disimpan." }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: authResult.userId },
    data,
    select: {
      name: true,
      email: true,
      phone: true,
      namaInstansi: true,
      notifEmailAktif: true,
      bahasaPreferensi: true,
    },
  });

  return NextResponse.json({ message: "Pengaturan berhasil disimpan.", user: updated });
}
