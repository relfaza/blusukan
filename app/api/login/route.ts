import { NextResponse } from "next/server";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return NextResponse.json({ success: true, role: result?.role ?? "WISATAWAN" });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { message: "Email atau password salah." },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { message: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
