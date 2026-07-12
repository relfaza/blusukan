import { NextResponse } from "next/server";
import { requireWisatawanApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

export async function GET() {
  const authResult = await requireWisatawanApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const user = await prisma.user.findUnique({
    where: { id: authResult.userId },
    select: {
      name: true,
      email: true,
      phone: true,
      notifStatusTransaksiAktif: true,
      notifStatusBookingAktif: true,
      notifLainnyaAktif: true,
    },
  });

  if (!user) {
    return NextResponse.json({ message: "Pengguna tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(req: Request) {
  const authResult = await requireWisatawanApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { notifStatusTransaksiAktif, notifStatusBookingAktif, notifLainnyaAktif } = await req.json();

  const data: Prisma.UserUpdateInput = {};

  if (notifStatusTransaksiAktif !== undefined) {
    if (typeof notifStatusTransaksiAktif !== "boolean") {
      return NextResponse.json({ message: "Preferensi notifikasi transaksi tidak valid." }, { status: 400 });
    }
    data.notifStatusTransaksiAktif = notifStatusTransaksiAktif;
  }

  if (notifStatusBookingAktif !== undefined) {
    if (typeof notifStatusBookingAktif !== "boolean") {
      return NextResponse.json({ message: "Preferensi notifikasi booking tidak valid." }, { status: 400 });
    }
    data.notifStatusBookingAktif = notifStatusBookingAktif;
  }

  if (notifLainnyaAktif !== undefined) {
    if (typeof notifLainnyaAktif !== "boolean") {
      return NextResponse.json({ message: "Preferensi notifikasi lainnya tidak valid." }, { status: 400 });
    }
    data.notifLainnyaAktif = notifLainnyaAktif;
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
      notifStatusTransaksiAktif: true,
      notifStatusBookingAktif: true,
      notifLainnyaAktif: true,
    },
  });

  return NextResponse.json({ message: "Pengaturan berhasil disimpan.", user: updated });
}
