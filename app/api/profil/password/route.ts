import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Anda harus login." }, { status: 401 });
  }

  const { currentPassword, newPassword } = await req.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { message: "Password lama dan password baru wajib diisi." },
      { status: 400 }
    );
  }

  if (typeof newPassword !== "string" || newPassword.length < 8) {
    return NextResponse.json(
      { message: "Password baru minimal 8 karakter." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });

  if (!user) {
    return NextResponse.json({ message: "Pengguna tidak ditemukan." }, { status: 404 });
  }

  const currentMatch = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!currentMatch) {
    return NextResponse.json(
      { message: "Password lama tidak sesuai." },
      { status: 400 }
    );
  }

  const newHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: newHash },
  });

  return NextResponse.json({ message: "Password berhasil diubah." });
}
