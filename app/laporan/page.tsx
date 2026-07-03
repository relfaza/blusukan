import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LaporanFormClient from "./LaporanFormClient";

export const dynamic = "force-dynamic";

export default async function LaporanPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    redirect("/login");
  }

  return <LaporanFormClient />;
}
