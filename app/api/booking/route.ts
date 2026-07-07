import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function serializeBooking(b: {
  id: string;
  serviceId: string;
  destinationId: string;
  travelDate: Date;
  meetingPoint: string | null;
  notes: string | null;
  contactNumber: string;
  estimatedArrivalTime: string | null;
  status: string;
  createdAt: Date;
  service: { providerName: string; serviceType: string; baseRate: unknown; contactWa: string };
  destination: { name: string };
}) {
  return {
    id: b.id,
    serviceId: b.serviceId,
    destinationId: b.destinationId,
    travelDate: b.travelDate.toISOString(),
    meetingPoint: b.meetingPoint,
    notes: b.notes,
    contactNumber: b.contactNumber,
    estimatedArrivalTime: b.estimatedArrivalTime,
    status: b.status,
    createdAt: b.createdAt.toISOString(),
    service: {
      providerName: b.service.providerName,
      serviceType: b.service.serviceType,
      baseRate: Number(b.service.baseRate),
      contactWa: b.service.contactWa,
    },
    destination: { name: b.destination.name },
  };
}

const BOOKING_INCLUDE = {
  service: { select: { providerName: true, serviceType: true, baseRate: true, contactWa: true } },
  destination: { select: { name: true } },
} as const;

function formatTanggalNotif(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(date);
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const namaPemesan = (session?.user as { name?: string } | undefined)?.name ?? "Wisatawan";

  if (!userId) {
    return NextResponse.json({ message: "Anda harus masuk terlebih dahulu." }, { status: 401 });
  }

  const body = await req.json();
  const { serviceId, destinationId, travelDate, meetingPoint, notes, contactNumber, estimatedArrivalTime } = body;

  if (typeof serviceId !== "string" || !serviceId) {
    return NextResponse.json({ message: "serviceId wajib diisi." }, { status: 400 });
  }
  if (typeof destinationId !== "string" || !destinationId) {
    return NextResponse.json({ message: "destinationId wajib diisi." }, { status: 400 });
  }
  if (typeof travelDate !== "string" || !travelDate) {
    return NextResponse.json({ message: "Tanggal perjalanan wajib diisi." }, { status: 400 });
  }
  if (typeof contactNumber !== "string" || !contactNumber.trim()) {
    return NextResponse.json({ message: "Nomor kontak wajib diisi." }, { status: 400 });
  }

  const parsedDate = new Date(travelDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return NextResponse.json({ message: "Format tanggal tidak valid." }, { status: 400 });
  }

  const service = await prisma.localService.findFirst({
    where: { id: serviceId, destinationId, isValidated: true },
    include: { destination: { select: { name: true, submittedById: true } } },
  });

  if (!service) {
    return NextResponse.json({ message: "Jasa tidak ditemukan untuk destinasi ini." }, { status: 404 });
  }

  const booking = await prisma.booking.create({
    data: {
      userId,
      serviceId,
      destinationId,
      travelDate: parsedDate,
      meetingPoint: typeof meetingPoint === "string" && meetingPoint.trim() ? meetingPoint.trim() : null,
      notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
      contactNumber: contactNumber.trim(),
      estimatedArrivalTime:
        typeof estimatedArrivalTime === "string" && estimatedArrivalTime.trim()
          ? estimatedArrivalTime.trim()
          : null,
      status: "PENDING",
    },
    include: BOOKING_INCLUDE,
  });

  await prisma.notifikasi.create({
    data: {
      userId: service.destination.submittedById,
      judul: "Booking Transport Baru",
      pesan: `${namaPemesan} booking ${service.providerName} (${service.serviceType}) di ${service.destination.name} untuk tanggal ${formatTanggalNotif(parsedDate)}.`,
      link: `/pengelola/destinasi/${destinationId}`,
      kategori: "TRANSPORT",
    },
  });

  return NextResponse.json(serializeBooking(booking), { status: 201 });
}

export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return NextResponse.json({ message: "Anda harus masuk terlebih dahulu." }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: BOOKING_INCLUDE,
  });

  return NextResponse.json(bookings.map(serializeBooking));
}
