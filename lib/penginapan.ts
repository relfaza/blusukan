import "server-only";

export const MAX_NAMA_PENGINAPAN = 120;
export const MAX_KONTAK_PENGINAPAN = 100;

export type PenginapanInput = {
  destinationId: string;
  nama: string;
  jarakKm: number;
  estimasiHarga: number;
  kontak: string;
};

/** Validasi & normalisasi body request penginapan. Dipakai route Admin & Pengelola. */
export function parsePenginapanBody(
  body: unknown
): { ok: true; data: PenginapanInput } | { ok: false; message: string } {
  const b = (body ?? {}) as Record<string, unknown>;

  const destinationId = typeof b.destinationId === "string" ? b.destinationId.trim() : "";
  const nama = typeof b.nama === "string" ? b.nama.trim() : "";
  const kontak = typeof b.kontak === "string" ? b.kontak.trim() : "";
  const jarakKm = typeof b.jarakKm === "number" ? b.jarakKm : Number(b.jarakKm);
  const estimasiHarga = typeof b.estimasiHarga === "number" ? b.estimasiHarga : Number(b.estimasiHarga);

  if (!destinationId) return { ok: false, message: "destinationId wajib diisi." };
  if (!nama) return { ok: false, message: "Nama penginapan wajib diisi." };
  if (nama.length > MAX_NAMA_PENGINAPAN)
    return { ok: false, message: `Nama maksimal ${MAX_NAMA_PENGINAPAN} karakter.` };
  if (!kontak) return { ok: false, message: "Kontak wajib diisi." };
  if (kontak.length > MAX_KONTAK_PENGINAPAN)
    return { ok: false, message: `Kontak maksimal ${MAX_KONTAK_PENGINAPAN} karakter.` };
  if (!Number.isFinite(jarakKm) || jarakKm < 0) return { ok: false, message: "Jarak (km) harus angka ≥ 0." };
  if (!Number.isFinite(estimasiHarga) || estimasiHarga < 0)
    return { ok: false, message: "Estimasi harga harus angka ≥ 0." };

  return { ok: true, data: { destinationId, nama, jarakKm, estimasiHarga, kontak } };
}

/** Serialisasi record Penginapan (Decimal → number, Date → ISO) untuk respons JSON. */
export function serializePenginapan(p: {
  id: string;
  destinationId: string;
  nama: string;
  jarakKm: number;
  estimasiHarga: unknown;
  kontak: string;
  createdAt: Date;
}) {
  return {
    id: p.id,
    destinationId: p.destinationId,
    nama: p.nama,
    jarakKm: p.jarakKm,
    estimasiHarga: Number(p.estimasiHarga),
    kontak: p.kontak,
    createdAt: p.createdAt.toISOString(),
  };
}
