import { NextResponse } from "next/server";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    // signIn() tidak mengembalikan field custom (role selalu undefined dari result),
    // jadi kita ambil role langsung dari database setelah autentikasi berhasil.
    await signIn("credentials", { email, password, redirect: false });

    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true },
    });

    return NextResponse.json({ success: true, role: user?.role ?? "WISATAWAN" });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { message: "Email atau password salah." },
        { status: 401 }
      );
    }
    console.error("[API /login]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
