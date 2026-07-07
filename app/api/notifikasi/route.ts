import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function getUserId(): Promise<string | undefined> {
  const session = await auth();
  return (session?.user as { id?: string } | undefined)?.id;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ message: "Anda harus masuk terlebih dahulu." }, { status: 401 });
  }

  const notifikasis = await prisma.notifikasi.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json(
    notifikasis.map((n) => ({
      id: n.id,
      judul: n.judul,
      pesan: n.pesan,
      link: n.link,
      kategori: n.kategori,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
    }))
  );
}

export async function PATCH(req: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ message: "Anda harus masuk terlebih dahulu." }, { status: 401 });
  }

  const body = await req.json();

  if (body?.markAllAsRead === true) {
    await prisma.notifikasi.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return NextResponse.json({ success: true });
  }

  if (typeof body?.id === "string" && body.id) {
    const notif = await prisma.notifikasi.findUnique({ where: { id: body.id } });
    if (!notif || notif.userId !== userId) {
      return NextResponse.json({ message: "Notifikasi tidak ditemukan." }, { status: 404 });
    }

    await prisma.notifikasi.update({
      where: { id: body.id },
      data: { isRead: true },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ message: "id atau markAllAsRead wajib diisi." }, { status: 400 });
}
