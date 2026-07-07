import { NextResponse } from "next/server";
import { requirePengelolaApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

const KABUPATEN_VALUES = ["SLEMAN", "GUNUNGKIDUL", "BANTUL", "KULON_PROGO", "KOTA_YOGYAKARTA"] as const;
const KATEGORI_VALUES = ["PANTAI", "AIR_TERJUN", "GUNUNG", "BUKIT", "TEBING"] as const;
const VIBE_VALUES = ["SUNSET", "SUNRISE", "SPOT_FOTO", "QUIET_PLACE"] as const;

const KABUPATEN_LABEL: Record<string, string> = {
  SLEMAN: "Sleman",
  GUNUNGKIDUL: "Gunungkidul",
  BANTUL: "Bantul",
  KULON_PROGO: "Kulon Progo",
  KOTA_YOGYAKARTA: "Kota Yogyakarta",
};

function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

const JAM_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

function isValidJam(value: unknown): value is string {
  return typeof value === "string" && JAM_REGEX.test(value);
}

export async function POST(req: Request) {
  const authResult = await requirePengelolaApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const body = await req.json();
  const {
    name,
    kabupaten,
    kategori,
    latitude,
    longitude,
    jamOperasional,
    jamBuka,
    jamTutup,
    buka24Jam,
    htmResmi,
    hasToilet,
    hasParkir,
    hasTempatIbadah,
    hasTempatDuduk,
    hasPenitipanBarang,
    aksesibilitas,
    vibeTags,
    photoUrls,
  } = body;

  if (typeof name !== "string" || name.trim() === "") {
    return NextResponse.json({ message: "Nama destinasi wajib diisi." }, { status: 400 });
  }
  if (!isOneOf(kabupaten, KABUPATEN_VALUES)) {
    return NextResponse.json({ message: "Kabupaten tidak valid." }, { status: 400 });
  }
  if (!isOneOf(kategori, KATEGORI_VALUES)) {
    return NextResponse.json({ message: "Kategori tidak valid." }, { status: 400 });
  }

  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ message: "Koordinat tidak valid." }, { status: 400 });
  }

  const htm = htmResmi === undefined || htmResmi === null || htmResmi === "" ? 0 : Number(htmResmi);
  if (!Number.isFinite(htm) || htm < 0) {
    return NextResponse.json({ message: "HTM tidak valid." }, { status: 400 });
  }

  const buka24JamValue = Boolean(buka24Jam);
  let jamBukaValue: string | null = null;
  let jamTutupValue: string | null = null;
  if (!buka24JamValue) {
    if (jamBuka !== undefined && jamBuka !== null && jamBuka !== "") {
      if (!isValidJam(jamBuka)) {
        return NextResponse.json({ message: "Format jam buka tidak valid." }, { status: 400 });
      }
      jamBukaValue = jamBuka;
    }
    if (jamTutup !== undefined && jamTutup !== null && jamTutup !== "") {
      if (!isValidJam(jamTutup)) {
        return NextResponse.json({ message: "Format jam tutup tidak valid." }, { status: 400 });
      }
      jamTutupValue = jamTutup;
    }
  }

  const vibeTagsInput = Array.isArray(vibeTags) ? vibeTags : [];
  if (!vibeTagsInput.every((tag) => isOneOf(tag, VIBE_VALUES))) {
    return NextResponse.json({ message: "Vibe tag tidak valid." }, { status: 400 });
  }

  const photoUrlsInput = Array.isArray(photoUrls)
    ? photoUrls.filter((url): url is string => typeof url === "string" && url.trim() !== "")
    : [];
  if (photoUrlsInput.length > 5) {
    return NextResponse.json({ message: "Maksimal 5 foto per destinasi." }, { status: 400 });
  }

  const destination = await prisma.destination.create({
    data: {
      name: name.trim(),
      kabupaten,
      kategori,
      latitude: lat,
      longitude: lng,
      jamOperasional: typeof jamOperasional === "string" && jamOperasional.trim() !== "" ? jamOperasional.trim() : null,
      jamBuka: jamBukaValue,
      jamTutup: jamTutupValue,
      buka24Jam: buka24JamValue,
      htmResmi: htm,
      hasToilet: Boolean(hasToilet),
      hasParkir: Boolean(hasParkir),
      hasTempatIbadah: Boolean(hasTempatIbadah),
      hasTempatDuduk: Boolean(hasTempatDuduk),
      hasPenitipanBarang: Boolean(hasPenitipanBarang),
      aksesibilitas: typeof aksesibilitas === "string" && aksesibilitas.trim() !== "" ? aksesibilitas.trim() : null,
      vibeTags: vibeTagsInput,
      photoUrls: photoUrlsInput,
      status: "PENDING",
      submittedById: authResult.userId,
    },
  });

  const [pengelola, admins] = await Promise.all([
    prisma.user.findUnique({ where: { id: authResult.userId }, select: { name: true } }),
    prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } }),
  ]);

  if (admins.length > 0) {
    await prisma.notifikasi.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        judul: "Pengajuan Destinasi Baru",
        pesan: `${pengelola?.name ?? "Pengelola"} mengajukan destinasi ${destination.name} di ${
          KABUPATEN_LABEL[destination.kabupaten] ?? destination.kabupaten
        }`,
        link: `/dashboard/destinasi/${destination.id}`,
      })),
    });
  }

  return NextResponse.json({ id: destination.id, status: destination.status }, { status: 201 });
}
