import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type SessionUser = { id?: string; role?: string };

async function getSessionUser(): Promise<SessionUser | undefined> {
  const session = await auth();
  return session?.user as SessionUser | undefined;
}

/** Dipakai di Server Component halaman app/pengelola/** — redirect kalau bukan Pengelola yang login */
export async function requirePengelolaPage(): Promise<string> {
  const user = await getSessionUser();

  if (!user?.id) {
    redirect("/login");
  }
  if (user.role !== "PENGELOLA") {
    redirect("/");
  }

  return user.id as string;
}

type PengelolaAuthResult =
  | { ok: true; userId: string }
  | { ok: false; status: 401 | 403; message: string };

/** Dipakai di Route Handler app/api/pengelola/** — caller yang bikin NextResponse dari hasilnya */
export async function requirePengelolaApi(): Promise<PengelolaAuthResult> {
  const user = await getSessionUser();

  if (!user?.id) {
    return { ok: false, status: 401, message: "Anda harus masuk terlebih dahulu." };
  }
  if (user.role !== "PENGELOLA") {
    return { ok: false, status: 403, message: "Akses khusus untuk Pengelola." };
  }

  return { ok: true, userId: user.id };
}

/** Destinasi dianggap "milik" userId kalau submittedById cocok — bukan tabel kepemilikan baru */
export async function findOwnedDestination(destinationId: string, userId: string) {
  return prisma.destination.findFirst({
    where: { id: destinationId, submittedById: userId },
  });
}

/** Dipakai di Server Component halaman app/dashboard/** — redirect kalau bukan Admin yang login */
export async function requireAdminPage(): Promise<string> {
  const user = await getSessionUser();

  if (!user?.id) {
    redirect("/login");
  }
  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return user.id as string;
}

type AdminAuthResult =
  | { ok: true; userId: string }
  | { ok: false; status: 401 | 403; message: string };

/** Dipakai di Route Handler app/api/admin/** — caller yang bikin NextResponse dari hasilnya */
export async function requireAdminApi(): Promise<AdminAuthResult> {
  const user = await getSessionUser();

  if (!user?.id) {
    return { ok: false, status: 401, message: "Anda harus masuk terlebih dahulu." };
  }
  if (user.role !== "ADMIN") {
    return { ok: false, status: 403, message: "Akses khusus untuk Admin." };
  }

  return { ok: true, userId: user.id };
}

/** Dipakai di Server Component halaman app/pengaturan-wisatawan/** — redirect kalau bukan Wisatawan yang login */
export async function requireWisatawanPage(): Promise<string> {
  const user = await getSessionUser();

  if (!user?.id) {
    redirect("/login");
  }
  if (user.role !== "WISATAWAN") {
    redirect("/");
  }

  return user.id as string;
}

type WisatawanAuthResult =
  | { ok: true; userId: string }
  | { ok: false; status: 401 | 403; message: string };

/** Dipakai di Route Handler app/api/pengaturan-wisatawan/** — caller yang bikin NextResponse dari hasilnya */
export async function requireWisatawanApi(): Promise<WisatawanAuthResult> {
  const user = await getSessionUser();

  if (!user?.id) {
    return { ok: false, status: 401, message: "Anda harus masuk terlebih dahulu." };
  }
  if (user.role !== "WISATAWAN") {
    return { ok: false, status: 403, message: "Akses khusus untuk Wisatawan." };
  }

  return { ok: true, userId: user.id };
}
