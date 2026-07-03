import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import BookingListClient from "./BookingListClient";

export const dynamic = "force-dynamic";

export default async function BookingPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    redirect("/login");
  }

  const services = await prisma.localService.findMany({
    where: { isValidated: true },
    include: { destination: { select: { id: true, name: true } } },
    orderBy: { providerName: "asc" },
  });

  const destinationMap = new Map<string, string>();
  for (const s of services) {
    destinationMap.set(s.destination.id, s.destination.name);
  }
  const destinations = Array.from(destinationMap, ([id, name]) => ({ id, name })).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const serviceList = services.map((s) => ({
    id: s.id,
    providerName: s.providerName,
    serviceType: s.serviceType,
    contactWa: s.contactWa,
    baseRate: Number(s.baseRate),
    destination: { id: s.destination.id, name: s.destination.name },
  }));

  return <BookingListClient services={serviceList} destinations={destinations} />;
}
