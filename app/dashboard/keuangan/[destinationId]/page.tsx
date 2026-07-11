import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import KeuanganDestinasiClient from "./KeuanganDestinasiClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ destinationId: string }>;
}

export default async function KeuanganDestinasiPage({ params }: Props) {
  await requireAdminPage();
  const { destinationId } = await params;

  const destination = await prisma.destination.findUnique({
    where: { id: destinationId },
    select: { id: true, name: true, kabupaten: true },
  });

  if (!destination) notFound();

  return (
    <KeuanganDestinasiClient destinationId={destination.id} destinationName={destination.name} kabupaten={destination.kabupaten} />
  );
}
