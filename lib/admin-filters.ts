import type { Kabupaten, RouteStatus } from "@/lib/generated/prisma/enums";

/**
 * Sumber tunggal untuk filter dashboard Admin (Kabupaten + Status Kondisi Jalan).
 * Dipakai bersama oleh komponen filter (client), API route, dan server page.
 */

export const KABUPATEN_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "Semua Kabupaten" },
  { value: "SLEMAN", label: "Sleman" },
  { value: "GUNUNGKIDUL", label: "Gunungkidul" },
  { value: "BANTUL", label: "Bantul" },
  { value: "KULON_PROGO", label: "Kulon Progo" },
  { value: "KOTA_YOGYAKARTA", label: "Kota Yogyakarta" },
];

export const KONDISI_JALAN_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "Semua Kondisi Jalan" },
  { value: "MUDAH", label: "Mudah" },
  { value: "SEDANG", label: "Sedang" },
  { value: "SULIT", label: "Sulit" },
  { value: "RUSAK", label: "Rusak" },
  { value: "BELUM_ADA_DATA", label: "Belum Ada Data" },
];

const KABUPATEN_VALUES = new Set(["SLEMAN", "GUNUNGKIDUL", "BANTUL", "KULON_PROGO", "KOTA_YOGYAKARTA"]);
const KONDISI_JALAN_VALUES = new Set(["MUDAH", "SEDANG", "SULIT", "RUSAK", "BELUM_ADA_DATA"]);

export function sanitizeKabupaten(value: string | null | undefined): Kabupaten | null {
  return value && KABUPATEN_VALUES.has(value) ? (value as Kabupaten) : null;
}

export function sanitizeKondisiJalan(value: string | null | undefined): RouteStatus | null {
  return value && KONDISI_JALAN_VALUES.has(value) ? (value as RouteStatus) : null;
}

export type AdminFilters = { kabupaten: Kabupaten | null; kondisiJalan: RouteStatus | null };

/** Parse filter dari searchParams (query string API atau prop searchParams server page). */
export function parseAdminFilters(source: {
  kabupaten?: string | string[] | null;
  kondisiJalan?: string | string[] | null;
}): AdminFilters {
  const kab = Array.isArray(source.kabupaten) ? source.kabupaten[0] : source.kabupaten;
  const kj = Array.isArray(source.kondisiJalan) ? source.kondisiJalan[0] : source.kondisiJalan;
  return { kabupaten: sanitizeKabupaten(kab), kondisiJalan: sanitizeKondisiJalan(kj) };
}

export type DestinationFilterWhere = { kabupaten?: Kabupaten; routeStatus?: RouteStatus };

/** WHERE-fragment untuk model Destination (di-spread langsung ke where destinasi). */
export function destinationFilterWhere({ kabupaten, kondisiJalan }: AdminFilters): DestinationFilterWhere {
  return {
    ...(kabupaten ? { kabupaten } : {}),
    ...(kondisiJalan ? { routeStatus: kondisiJalan } : {}),
  };
}

/**
 * WHERE-fragment untuk model yang punya relasi `destination` (UserReport/Transaksi/Review).
 * Mengembalikan {} saat tidak ada filter aktif agar perilaku query tidak berubah.
 */
export function destinationRelationWhere(filters: AdminFilters): { destination?: DestinationFilterWhere } {
  const where = destinationFilterWhere(filters);
  return Object.keys(where).length > 0 ? { destination: where } : {};
}
