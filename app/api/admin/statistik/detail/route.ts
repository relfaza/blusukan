import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { BULAN_LABEL, buildBucketsForPeriode } from "@/lib/kunjunganBuckets";
import type { Kabupaten, Kategori, RouteStatus, CrowdLevel } from "@/lib/generated/prisma/enums";

const TRANSAKSI_SELESAI_STATUS = ["SELESAI", "DIKONFIRMASI"] as const;
const MAX_ROWS = 50;

const VALID_KABUPATEN = ["SLEMAN", "GUNUNGKIDUL", "BANTUL", "KULON_PROGO", "KOTA_YOGYAKARTA"];
const VALID_KATEGORI = ["PANTAI", "AIR_TERJUN", "GUNUNG", "BUKIT", "TEBING"];
const VALID_ROAD_CONDITION = ["MUDAH", "SEDANG", "SULIT", "RUSAK", "BELUM_ADA_DATA"];
const VALID_CROWD_LEVEL = ["SEPI", "SEDANG", "PADAT"];

function parseBulanTahun(bulanTahun: string): { year: number; month: number } | null {
  const [bulanAbbr, tahunStr] = bulanTahun.split(" ");
  const month = BULAN_LABEL.indexOf(bulanAbbr);
  const year = Number(tahunStr);
  if (month === -1 || Number.isNaN(year)) return null;
  return { year, month };
}

export async function GET(request: Request) {
  const authResult = await requireAdminApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  switch (type) {
    case "laporanBulan": {
      const bulan = searchParams.get("bulan") ?? "";
      const parsed = parseBulanTahun(bulan);
      if (!parsed) return NextResponse.json({ message: "Parameter bulan tidak valid." }, { status: 400 });
      const start = new Date(parsed.year, parsed.month, 1);
      const end = new Date(parsed.year, parsed.month + 1, 1);
      const reports = await prisma.userReport.findMany({
        where: { createdAt: { gte: start, lt: end } },
        orderBy: { createdAt: "desc" },
        take: MAX_ROWS,
        include: { destination: { select: { name: true } }, user: { select: { name: true } } },
      });
      return NextResponse.json({
        rows: reports.map((r) => ({
          destinationName: r.destination.name,
          userName: r.user.name,
          roadCondition: r.roadCondition,
          crowdLevel: r.crowdLevel,
          createdAt: r.createdAt.toISOString(),
        })),
      });
    }

    case "transaksiBulan": {
      const bulan = searchParams.get("bulan") ?? "";
      const parsed = parseBulanTahun(bulan);
      if (!parsed) return NextResponse.json({ message: "Parameter bulan tidak valid." }, { status: 400 });
      const start = new Date(parsed.year, parsed.month, 1);
      const end = new Date(parsed.year, parsed.month + 1, 1);
      const transaksis = await prisma.transaksi.findMany({
        where: { createdAt: { gte: start, lt: end }, status: { in: [...TRANSAKSI_SELESAI_STATUS] } },
        orderBy: { createdAt: "desc" },
        take: MAX_ROWS,
        include: { destination: { select: { name: true } }, user: { select: { name: true } } },
      });
      return NextResponse.json({
        rows: transaksis.map((t) => ({
          kodeTransaksi: t.kodeTransaksi,
          destinationName: t.destination.name,
          userName: t.user.name,
          type: t.type,
          totalHarga: Number(t.totalHarga),
          status: t.status,
          createdAt: t.createdAt.toISOString(),
        })),
      });
    }

    case "kategoriDestinasi": {
      const kategori = searchParams.get("kategori") ?? "";
      if (!VALID_KATEGORI.includes(kategori)) {
        return NextResponse.json({ message: "Parameter kategori tidak valid." }, { status: 400 });
      }
      const destinations = await prisma.destination.findMany({
        where: { status: "APPROVED", kategori: kategori as Kategori },
        orderBy: { createdAt: "desc" },
        take: MAX_ROWS,
        select: { name: true, kabupaten: true, createdAt: true },
      });
      return NextResponse.json({
        rows: destinations.map((d) => ({
          name: d.name,
          kabupaten: d.kabupaten,
          createdAt: d.createdAt.toISOString(),
        })),
      });
    }

    case "kabupatenDestinasi": {
      const kabupaten = searchParams.get("kabupaten") ?? "";
      if (!VALID_KABUPATEN.includes(kabupaten)) {
        return NextResponse.json({ message: "Parameter kabupaten tidak valid." }, { status: 400 });
      }
      const destinations = await prisma.destination.findMany({
        where: { status: "APPROVED", kabupaten: kabupaten as Kabupaten },
        orderBy: { createdAt: "desc" },
        take: MAX_ROWS,
        select: { name: true, kategori: true, createdAt: true },
      });
      return NextResponse.json({
        rows: destinations.map((d) => ({
          name: d.name,
          kategori: d.kategori,
          createdAt: d.createdAt.toISOString(),
        })),
      });
    }

    case "kondisiJalan": {
      const kondisi = searchParams.get("kondisi") ?? "";
      if (!VALID_ROAD_CONDITION.includes(kondisi)) {
        return NextResponse.json({ message: "Parameter kondisi tidak valid." }, { status: 400 });
      }
      const reports = await prisma.userReport.findMany({
        where: { roadCondition: kondisi as RouteStatus },
        orderBy: { createdAt: "desc" },
        take: MAX_ROWS,
        include: { destination: { select: { name: true } }, user: { select: { name: true } } },
      });
      return NextResponse.json({
        rows: reports.map((r) => ({
          destinationName: r.destination.name,
          userName: r.user.name,
          crowdLevel: r.crowdLevel,
          createdAt: r.createdAt.toISOString(),
        })),
      });
    }

    case "keramaian": {
      const keramaian = searchParams.get("keramaian") ?? "";
      if (!VALID_CROWD_LEVEL.includes(keramaian)) {
        return NextResponse.json({ message: "Parameter keramaian tidak valid." }, { status: 400 });
      }
      const reports = await prisma.userReport.findMany({
        where: { crowdLevel: keramaian as CrowdLevel },
        orderBy: { createdAt: "desc" },
        take: MAX_ROWS,
        include: { destination: { select: { name: true } }, user: { select: { name: true } } },
      });
      return NextResponse.json({
        rows: reports.map((r) => ({
          destinationName: r.destination.name,
          userName: r.user.name,
          roadCondition: r.roadCondition,
          createdAt: r.createdAt.toISOString(),
        })),
      });
    }

    case "ratingBulan": {
      const bulan = searchParams.get("bulan") ?? "";
      const parsed = parseBulanTahun(bulan);
      if (!parsed) return NextResponse.json({ message: "Parameter bulan tidak valid." }, { status: 400 });
      const start = new Date(parsed.year, parsed.month, 1);
      const end = new Date(parsed.year, parsed.month + 1, 1);
      const reviews = await prisma.review.findMany({
        where: { createdAt: { gte: start, lt: end } },
        orderBy: { createdAt: "desc" },
        take: MAX_ROWS,
        include: { destination: { select: { name: true } }, user: { select: { name: true } } },
      });
      return NextResponse.json({
        rows: reviews.map((r) => ({
          destinationName: r.destination.name,
          userName: r.user.name,
          rating: r.rating,
          komentar: r.komentar ?? "",
          createdAt: r.createdAt.toISOString(),
        })),
      });
    }

    case "kunjungan": {
      const periode = searchParams.get("periode") ?? "harian";
      const label = searchParams.get("label") ?? "";
      const destinationId = searchParams.get("destinationId") || undefined;
      if (!["harian", "mingguan", "bulanan"].includes(periode)) {
        return NextResponse.json({ message: "Periode tidak valid." }, { status: 400 });
      }
      const buckets = buildBucketsForPeriode(periode as "harian" | "mingguan" | "bulanan", new Date());
      const bucket = buckets.find((b) => b.label === label);
      if (!bucket) return NextResponse.json({ message: "Label tidak ditemukan." }, { status: 400 });
      const transaksis = await prisma.transaksi.findMany({
        where: {
          type: "TIKET_MASUK",
          status: "SELESAI",
          selesaiAt: { gte: bucket.start, lt: bucket.end },
          ...(destinationId ? { destinationId } : {}),
        },
        orderBy: { selesaiAt: "desc" },
        take: MAX_ROWS,
        include: { destination: { select: { name: true } }, user: { select: { name: true } } },
      });
      return NextResponse.json({
        rows: transaksis.map((t) => ({
          kodeTransaksi: t.kodeTransaksi,
          destinationName: t.destination.name,
          userName: t.user.name,
          selesaiAt: t.selesaiAt?.toISOString() ?? "",
        })),
      });
    }

    default:
      return NextResponse.json({ message: "Tipe detail tidak dikenal." }, { status: 400 });
  }
}
