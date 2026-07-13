import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDestinasiBeranda } from "@/lib/destinasi-beranda";
import BerandaClient from "./beranda-client";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (role === "ADMIN") {
    redirect("/dashboard");
  }
  if (role === "PENGELOLA") {
    redirect("/pengelola");
  }

  const destinations = await getDestinasiBeranda();

  return <BerandaClient destinations={destinations} />;
}
