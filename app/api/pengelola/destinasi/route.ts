import { NextResponse } from "next/server";
import { requirePengelolaApi } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

const KABUPATEN_VALUES = ["SLEMAN", "GUNUNGKIDUL", "BANTUL", "KULON_PROGO", "KOTA_YOGYAKARTA"] as const;
const KATEGORI_VALUES = ["PANTAI", "AIR_TERJUN", "GUNUNG", "BUKIT", "TEBING"] as const;
const VIBE_VALUES = ["SUNSET", "SUNRISE", "SPOT_FOTO", "QUIET_PLACE"] as const;

function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
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
    htmResmi,
    hasToilet,
    hasParkir,
    hasTempatIbadah,
    hasTempatDuduk,
    hasPenitipanBarang,
    aksesibilitas,
    vibeTags,
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

  const vibeTagsInput = Array.isArray(vibeTags) ? vibeTags : [];
  if (!vibeTagsInput.every((tag) => isOneOf(tag, VIBE_VALUES))) {
    return NextResponse.json({ message: "Vibe tag tidak valid." }, { status: 400 });
  }

  const destination = await prisma.destination.create({
    data: {
      name: name.trim(),
      kabupaten,
      kategori,
      latitude: lat,
      longitude: lng,
      jamOperasional: typeof jamOperasional === "string" && jamOperasional.trim() !== "" ? jamOperasional.trim() : null,
      htmResmi: htm,
      hasToilet: Boolean(hasToilet),
      hasParkir: Boolean(hasParkir),
      hasTempatIbadah: Boolean(hasTempatIbadah),
      hasTempatDuduk: Boolean(hasTempatDuduk),
      hasPenitipanBarang: Boolean(hasPenitipanBarang),
      aksesibilitas: typeof aksesibilitas === "string" && aksesibilitas.trim() !== "" ? aksesibilitas.trim() : null,
      vibeTags: vibeTagsInput,
      status: "PENDING",
      submittedById: authResult.userId,
    },
  });

  return NextResponse.json({ id: destination.id, status: destination.status }, { status: 201 });
}
