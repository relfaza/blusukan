import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function serializeReview(r: {
  id: string;
  rating: number;
  komentar: string | null;
  createdAt: Date;
  user: { name: string };
}) {
  return {
    id: r.id,
    rating: r.rating,
    komentar: r.komentar,
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
  const { destinationId, rating, komentar } = body;

  if (typeof destinationId !== "string" || !destinationId) {
    return NextResponse.json({ message: "Destinasi wajib dipilih." }, { status: 400 });
  }
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ message: "Rating harus berupa angka 1-5." }, { status: 400 });
  }

  const destination = await prisma.destination.findFirst({
    where: { id: destinationId, status: "APPROVED" },
  });

  if (!destination) {
    return NextResponse.json({ message: "Destinasi tidak ditemukan." }, { status: 404 });
  }

  const komentarValue =
    typeof komentar === "string" && komentar.trim() !== "" ? komentar.trim() : null;

  // Satu user hanya boleh punya 1 review aktif per destinasi — review baru
  // menimpa (update) review lama, bukan bikin baris duplikat.
  const review = await prisma.review.upsert({
    where: { userId_destinationId: { userId, destinationId } },
    create: { userId, destinationId, rating, komentar: komentarValue },
    update: { rating, komentar: komentarValue },
    include: { user: { select: { name: true } } },
  });

  return NextResponse.json(serializeReview(review), { status: 201 });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const destinationId = searchParams.get("destinationId");

  if (!destinationId) {
    return NextResponse.json({ message: "destinationId wajib diisi." }, { status: 400 });
  }

  const [reviews, aggregate] = await Promise.all([
    prisma.review.findMany({
      where: { destinationId },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
    prisma.review.aggregate({
      where: { destinationId },
      _avg: { rating: true },
      _count: { _all: true },
    }),
  ]);

  return NextResponse.json({
    reviews: reviews.map(serializeReview),
    rataRataRating: aggregate._avg.rating ?? 0,
    totalReview: aggregate._count._all,
  });
}
