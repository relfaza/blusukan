import { requireAdminPage } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import TransaksiDashboardClient from "./TransaksiDashboardClient";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ from?: string }>;
}

const BACK_TARGET: Record<string, { href: string; label: string }> = {
  keuangan: { href: "/dashboard/keuangan", label: "Kembali ke Keuangan" },
};
const DEFAULT_BACK = BACK_TARGET.keuangan;

export default async function DashboardTransaksiPage({ searchParams }: Props) {
  await requireAdminPage();
  const { from } = await searchParams;
  const back = (from && BACK_TARGET[from]) || DEFAULT_BACK;

  const destinasi = await prisma.destination.findMany({
    where: { status: "APPROVED" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return <TransaksiDashboardClient destinasiOptions={destinasi} backHref={back.href} backLabel={back.label} />;
}
