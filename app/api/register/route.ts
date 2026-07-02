import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { encryptNIK } from "@/lib/encryption";

export async function POST(req: Request) {
  try {
    const { role, nama, email, telepon, nik, password } = await req.json();

    // Validasi role
    if (role !== "WISATAWAN" && role !== "PENGELOLA") {
      return NextResponse.json(
        { message: "Role tidak valid. Pilih Wisatawan atau Pengelola." },
        { status: 400 }
      );
    }

    // Validasi field wajib umum
    if (!nama || !email || !password) {
      return NextResponse.json(
        { message: "Nama, email, dan password wajib diisi." },
        { status: 400 }
      );
    }

    // Validasi password minimal 8 karakter
    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password minimal 8 karakter." },
        { status: 400 }
      );
    }

    // Validasi field khusus Pengelola
    if (role === "PENGELOLA") {
      if (!telepon) {
        return NextResponse.json(
          { message: "Nomor telepon wajib diisi untuk Pengelola Lokal." },
          { status: 400 }
        );
      }
      if (!nik || !/^\d{16}$/.test(nik)) {
        return NextResponse.json(
          { message: "NIK wajib diisi dan harus 16 digit angka." },
          { status: 400 }
        );
      }
    }

    // Cek email sudah terdaftar
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { message: "Email sudah terdaftar. Silakan login." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Enkripsi NIK jika Pengelola
    let nikEncrypted: string | null = null;
    if (role === "PENGELOLA" && nik) {
      nikEncrypted = encryptNIK(nik);
    }

    const user = await prisma.user.create({
      data: {
        name: nama,
        email,
        phone: telepon || null,
        passwordHash: hashedPassword,
        role: role === "PENGELOLA" ? "PENGELOLA" : "WISATAWAN",
        nikEncrypted,
      },
    });

    return NextResponse.json(
      { message: "Akun berhasil dibuat.", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API /register]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}