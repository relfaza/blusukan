import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const GENERIC_MESSAGE = "Kalau email terdaftar, link reset sudah dikirim.";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email wajib diisi." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken: token, resetTokenExpiry: expiry },
      });

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const resetLink = `${baseUrl}/reset-password/${token}`;

      try {
        await sendEmail({
          to: user.email,
          subject: "Reset Password Blusukan",
          html: `
            <h2>Reset Password</h2>
            <p>Klik link berikut untuk mengatur ulang password Anda. Link berlaku selama 1 jam.</p>
            <p><a href="${resetLink}">${resetLink}</a></p>
          `,
        });
      } catch (emailError) {
        // Kegagalan kirim email tidak boleh mengubah response (harus tetap generik),
        // supaya tidak jadi oracle untuk menebak email terdaftar.
        console.error("[API /lupa-password] gagal kirim email", emailError);
      }
    }

    return NextResponse.json({ message: GENERIC_MESSAGE });
  } catch (error) {
    console.error("[API /lupa-password]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
