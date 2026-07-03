import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SERVICE_TYPES = ["OJEK", "JEEP", "GUIDE"] as const;
type ServiceTypeFilter = (typeof SERVICE_TYPES)[number];

function isServiceType(value: string | null): value is ServiceTypeFilter {
  return typeof value === "string" && (SERVICE_TYPES as readonly string[]).includes(value);
}

function serializeService(s: {
  id: string;
  destinationId: string;
  providerName: string;
  serviceType: string;
  contactWa: string;
  baseRate: unknown;
  destination: { id: string; name: string };
}) {
  return {
    id: s.id,
    destinationId: s.destinationId,
    providerName: s.providerName,
    serviceType: s.serviceType,
    contactWa: s.contactWa,
    baseRate: Number(s.baseRate),
    destination: { id: s.destination.id, name: s.destination.name },
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const destinationId = searchParams.get("destinationId");
  const serviceTypeParam = searchParams.get("serviceType");

  const services = await prisma.localService.findMany({
    where: {
      isValidated: true,
      ...(destinationId ? { destinationId } : {}),
      ...(isServiceType(serviceTypeParam) ? { serviceType: serviceTypeParam } : {}),
    },
    include: { destination: { select: { id: true, name: true } } },
    orderBy: { providerName: "asc" },
  });

  return NextResponse.json(services.map(serializeService));
}
