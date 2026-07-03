import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const ROAD_CONDITIONS = ["MUDAH", "SEDANG", "SULIT", "RUSAK"] as const;
const SIGNAL_STRENGTHS = ["LEMAH", "SEDANG", "KUAT"] as const;
const CROWD_LEVELS = ["SEPI", "SEDANG", "PADAT"] as const;

function toOptionalBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function serializeReport(r: {
  id: string;
  destinationId: string;
  roadCondition: string;
  signalStrength: string;
  toiletLayak: boolean | null;
  parkirLayak: boolean | null;
  tempatIbadahLayak: boolean | null;
  tempatDudukLayak: boolean | null;
  penitipanBarangLayak: boolean | null;
  reportedFee: unknown;
  crowdLevel: string;
  photoUrl: string | null;
  isVerified: boolean;
  upvoteCount: number;
  notes: string | null;
  createdAt: Date;
  user: { name: string };
}) {
  return {
    id: r.id,
    destinationId: r.destinationId,
    roadCondition: r.roadCondition,
    signalStrength: r.signalStrength,
    toiletLayak: r.toiletLayak,
    parkirLayak: r.parkirLayak,
    tempatIbadahLayak: r.tempatIbadahLayak,
    tempatDudukLayak: r.tempatDudukLayak,
    penitipanBarangLayak: r.penitipanBarangLayak,
    reportedFee: r.reportedFee === null ? null : Number(r.reportedFee),
    crowdLevel: r.crowdLevel,
    photoUrl: r.photoUrl,
    isVerified: r.isVerified,
    upvoteCount: r.upvoteCount,
    notes: r.notes,
    createdAt: r.createdAt.toISOString(),
    userFirstName: r.user.name.split(" ")[0],
  };
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return NextResponse.json({ message: "Anda harus masuk terlebih dahulu." }, { status: 401 });
  }

  const body = await req.json();
  const {
    destinationId,
    roadCondition,
    signalStrength,
    crowdLevel,
    latitude,
    longitude,
    toiletLayak,
    parkirLayak,
    tempatIbadahLayak,
    tempatDudukLayak,
    penitipanBarangLayak,
    reportedFee,
    notes,
  } = body;

  if (typeof destinationId !== "string" || !destinationId) {
    return NextResponse.json({ message: "Destinasi wajib dipilih." }, { status: 400 });
  }
  if (!ROAD_CONDITIONS.includes(roadCondition)) {
    return NextResponse.json({ message: "Kondisi jalan tidak valid." }, { status: 400 });
  }
  if (!SIGNAL_STRENGTHS.includes(signalStrength)) {
    return NextResponse.json({ message: "Kekuatan sinyal tidak valid." }, { status: 400 });
  }
  if (!CROWD_LEVELS.includes(crowdLevel)) {
    return NextResponse.json({ message: "Tingkat keramaian tidak valid." }, { status: 400 });
  }
  if (typeof latitude !== "number" || Number.isNaN(latitude)) {
    return NextResponse.json({ message: "Latitude wajib diisi." }, { status: 400 });
  }
  if (typeof longitude !== "number" || Number.isNaN(longitude)) {
    return NextResponse.json({ message: "Longitude wajib diisi." }, { status: 400 });
  }

  let parsedFee: number | null = null;
  if (reportedFee !== undefined && reportedFee !== null && reportedFee !== "") {
    const fee = Number(reportedFee);
    if (Number.isNaN(fee) || fee < 0) {
      return NextResponse.json({ message: "Biaya yang dilaporkan tidak valid." }, { status: 400 });
    }
    parsedFee = fee;
  }

  const destination = await prisma.destination.findFirst({
    where: { id: destinationId, status: "APPROVED" },
  });

  if (!destination) {
    return NextResponse.json({ message: "Destinasi tidak ditemukan." }, { status: 404 });
  }

  const report = await prisma.userReport.create({
    data: {
      userId,
      destinationId,
      roadCondition,
      signalStrength,
      crowdLevel,
      latitude,
      longitude,
      toiletLayak: toOptionalBoolean(toiletLayak),
      parkirLayak: toOptionalBoolean(parkirLayak),
      tempatIbadahLayak: toOptionalBoolean(tempatIbadahLayak),
      tempatDudukLayak: toOptionalBoolean(tempatDudukLayak),
      penitipanBarangLayak: toOptionalBoolean(penitipanBarangLayak),
      reportedFee: parsedFee,
      notes: typeof notes === "string" && notes.trim() !== "" ? notes.trim() : null,
    },
    include: { user: { select: { name: true } } },
  });

  return NextResponse.json(serializeReport(report), { status: 201 });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const destinationId = searchParams.get("destinationId");

  if (!destinationId) {
    return NextResponse.json({ message: "destinationId wajib diisi." }, { status: 400 });
  }

  const reports = await prisma.userReport.findMany({
    where: { destinationId },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  });

  return NextResponse.json(reports.map(serializeReport));
}
