import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import BookingFormClient from "./BookingFormClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ serviceId: string }>;
}

export default async function BookingFormPage({ params }: Props) {
  const { serviceId } = await params;

  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    redirect("/login");
  }

  const [service, user] = await Promise.all([
    prisma.localService.findFirst({
      where: { id: serviceId, isValidated: true },
      include: { destination: { select: { id: true, name: true } } },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { phone: true } }),
  ]);

  if (!service) notFound();

  return (
    <BookingFormClient
      service={{
        id: service.id,
        providerName: service.providerName,
        serviceType: service.serviceType,
        baseRate: Number(service.baseRate),
        contactWa: service.contactWa,
      }}
      destination={{ id: service.destination.id, name: service.destination.name }}
      defaultContactNumber={user?.phone ?? ""}
    />
  );
}
