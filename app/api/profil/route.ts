import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Anda harus login." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true, role: true },
  });

  if (!user) {
    return NextResponse.json({ message: "Pengguna tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Anda harus login." }, { status: 401 });
  }

  const { name, phone } = await req.json();

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ message: "Nama tidak boleh kosong." }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: name.trim(),
      phone: typeof phone === "string" && phone.trim() ? phone.trim() : null,
    },
    select: { name: true, email: true, phone: true, role: true },
  });

  return NextResponse.json({ message: "Profil berhasil diperbarui.", user: updated });
}
