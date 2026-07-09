import { NextResponse } from "next/server";
import { requirePengelolaApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ id: string }>;
}

const KABUPATEN_VALUES = ["SLEMAN", "GUNUNGKIDUL", "BANTUL", "KULON_PROGO", "KOTA_YOGYAKARTA"] as const;
const KATEGORI_VALUES = ["PANTAI", "AIR_TERJUN", "GUNUNG", "BUKIT", "TEBING"] as const;
const VIBE_VALUES = ["SUNSET", "SUNRISE", "SPOT_FOTO", "QUIET_PLACE"] as const;

function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

const JAM_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

function isValidJam(value: unknown): value is string {
  return typeof value === "string" && JAM_REGEX.test(value);
}

function serializeDestination(d: {
  id: string;
  name: string;
  kabupaten: string;
  kategori: string;
  latitude: number;
  longitude: number;
  jamOperasional: string | null;
  jamBuka: string | null;
  jamTutup: string | null;
  buka24Jam: boolean;
  htmResmi: unknown;
  htmAnak: unknown;
  hasToilet: boolean;
  hasParkir: boolean;
  hasTempatIbadah: boolean;
  hasTempatDuduk: boolean;
  hasPenitipanBarang: boolean;
  aksesibilitas: string | null;
  photoUrls: string[];
  vibeTags: string[];
  status: string;
}) {
  return {
    id: d.id,
    name: d.name,
    kabupaten: d.kabupaten,
    kategori: d.kategori,
    latitude: d.latitude,
    longitude: d.longitude,
    jamOperasional: d.jamOperasional,
    jamBuka: d.jamBuka,
    jamTutup: d.jamTutup,
    buka24Jam: d.buka24Jam,
    htmResmi: Number(d.htmResmi),
    htmAnak: d.htmAnak != null ? Number(d.htmAnak) : null,
    hasToilet: d.hasToilet,
    hasParkir: d.hasParkir,
    hasTempatIbadah: d.hasTempatIbadah,
    hasTempatDuduk: d.hasTempatDuduk,
    hasPenitipanBarang: d.hasPenitipanBarang,
    aksesibilitas: d.aksesibilitas,
    photoUrls: d.photoUrls,
    vibeTags: d.vibeTags,
    status: d.status,
  };
}

export async function GET(_req: Request, { params }: Props) {
  const authResult = await requirePengelolaApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { id } = await params;

  const destination = await prisma.destination.findUnique({ where: { id } });

  if (!destination) {
    return NextResponse.json({ message: "Destinasi tidak ditemukan." }, { status: 404 });
  }
  if (destination.submittedById !== authResult.userId) {
    return NextResponse.json({ message: "Anda tidak memiliki akses ke destinasi ini." }, { status: 403 });
  }

  return NextResponse.json(serializeDestination(destination));
}

export async function PATCH(req: Request, { params }: Props) {
  const authResult = await requirePengelolaApi();
  if (!authResult.ok) {
    return NextResponse.json({ message: authResult.message }, { status: authResult.status });
  }

  const { id } = await params;

  const existing = await prisma.destination.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ message: "Destinasi tidak ditemukan." }, { status: 404 });
  }
  if (existing.submittedById !== authResult.userId) {
    return NextResponse.json({ message: "Anda tidak memiliki akses ke destinasi ini." }, { status: 403 });
  }

  const body = await req.json();
  const {
    name,
    kabupaten,
    kategori,
    latitude,
    longitude,
    jamBuka,
    jamTutup,
    buka24Jam,
    htmResmi,
    htmAnak,
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

  const htmAnakValue: number | null =
    htmAnak === undefined || htmAnak === null || htmAnak === "" ? null : Number(htmAnak);
  if (htmAnakValue !== null && (!Number.isFinite(htmAnakValue) || htmAnakValue < 0)) {
    return NextResponse.json({ message: "HTM anak-anak tidak valid." }, { status: 400 });
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

  const jamOperasionalValue = buka24JamValue
    ? "Buka 24 Jam"
    : jamBukaValue && jamTutupValue
      ? `${jamBukaValue} - ${jamTutupValue}`
      : null;

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

  // Sengaja tidak menyertakan `status` di sini — perubahan status APPROVED/PENDING/REJECTED/NONAKTIF
  // murni wewenang Admin (approve/reject) atau endpoint status khusus Pengelola (aktif/nonaktif).
  const updated = await prisma.destination.update({
    where: { id },
    data: {
      name: name.trim(),
      kabupaten,
      kategori,
      latitude: lat,
      longitude: lng,
      jamOperasional: jamOperasionalValue,
      jamBuka: jamBukaValue,
      jamTutup: jamTutupValue,
      buka24Jam: buka24JamValue,
      htmResmi: htm,
      htmAnak: htmAnakValue,
      hasToilet: Boolean(hasToilet),
      hasParkir: Boolean(hasParkir),
      hasTempatIbadah: Boolean(hasTempatIbadah),
      hasTempatDuduk: Boolean(hasTempatDuduk),
      hasPenitipanBarang: Boolean(hasPenitipanBarang),
      aksesibilitas: typeof aksesibilitas === "string" && aksesibilitas.trim() !== "" ? aksesibilitas.trim() : null,
      vibeTags: vibeTagsInput,
      photoUrls: photoUrlsInput,
    },
  });

  return NextResponse.json(serializeDestination(updated));
}
