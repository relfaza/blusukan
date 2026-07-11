import { NextResponse } from "next/server";
import { requirePengelolaApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

export async function GET() {
  const authResult = await requirePengelolaApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const user = await prisma.user.findUnique({
    where: { id: authResult.userId },
    select: {
      name: true,
      email: true,
      phone: true,
      namaUsaha: true,
      notifTransaksiAktif: true,
      notifBookingAktif: true,
      notifUlasanAktif: true,
    },
  });

  if (!user) {
    return NextResponse.json({ message: "Pengguna tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(req: Request) {
  const authResult = await requirePengelolaApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { namaUsaha, notifTransaksiAktif, notifBookingAktif, notifUlasanAktif } = await req.json();

  const data: Prisma.UserUpdateInput = {};

  if (namaUsaha !== undefined) {
    if (namaUsaha !== null && typeof namaUsaha !== "string") {
      return NextResponse.json({ message: "Nama usaha tidak valid." }, { status: 400 });
    }
    data.namaUsaha = typeof namaUsaha === "string" && namaUsaha.trim() ? namaUsaha.trim() : null;
  }

  if (notifTransaksiAktif !== undefined) {
    if (typeof notifTransaksiAktif !== "boolean") {
      return NextResponse.json({ message: "Preferensi notifikasi transaksi tidak valid." }, { status: 400 });
    }
    data.notifTransaksiAktif = notifTransaksiAktif;
  }

  if (notifBookingAktif !== undefined) {
    if (typeof notifBookingAktif !== "boolean") {
      return NextResponse.json({ message: "Preferensi notifikasi booking tidak valid." }, { status: 400 });
    }
    data.notifBookingAktif = notifBookingAktif;
  }

  if (notifUlasanAktif !== undefined) {
    if (typeof notifUlasanAktif !== "boolean") {
      return NextResponse.json({ message: "Preferensi notifikasi ulasan tidak valid." }, { status: 400 });
    }
    data.notifUlasanAktif = notifUlasanAktif;
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
      namaUsaha: true,
      notifTransaksiAktif: true,
      notifBookingAktif: true,
      notifUlasanAktif: true,
    },
  });

  return NextResponse.json({ message: "Pengaturan berhasil disimpan.", user: updated });
}
