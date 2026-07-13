/**
 * ENDPOINT DIAGNOSTIK SEMENTARA — HAPUS setelah akar masalah AI ketemu.
 *
 * Menjawab tiga pertanyaan sekaligus, tanpa pernah membocorkan isi API key:
 *  1. GEMINI_API_KEY ada isinya atau tidak?
 *  2. Model apa saja yang benar-benar bisa diakses key ini?
 *  3. Kalau dipakai memanggil Gemini sungguhan, error mentahnya apa?
 */
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import {
  GEMINI_MODEL,
  GeminiError,
  generateJson,
  listModelYangTersedia,
  logErrorGeminiMentah,
  statusApiKey,
} from "@/lib/gemini";

export const dynamic = "force-dynamic";

function ringkasError(err: unknown) {
  const anyErr = err as Record<string, unknown> | null;
  return {
    name: err instanceof Error ? err.name : typeof err,
    message: err instanceof Error ? err.message : String(err),
    status: anyErr && typeof anyErr === "object" ? anyErr.status : undefined,
  };
}

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status });
  }

  const key = statusApiKey();

  // 1. Key kosong → tidak usah lanjut, itu sudah akar masalahnya.
  if (!key.ada) {
    return NextResponse.json({
      apiKey: "KOSONG / TIDAK ADA di environment",
      modelAktif: GEMINI_MODEL,
      kesimpulan: "GEMINI_API_KEY tidak terbaca. Set dulu di .env lalu restart dev server.",
    });
  }

  // 2. Model apa saja yang tersedia untuk key ini?
  let modelTersedia: string[] | null = null;
  let errorListModel: ReturnType<typeof ringkasError> | null = null;
  try {
    modelTersedia = await listModelYangTersedia();
  } catch (err) {
    logErrorGeminiMentah("ai/diagnostik:listModels", err);
    errorListModel = ringkasError(err);
  }

  // 3. Uji beberapa model kandidat lewat jalur kode yang sama dengan fitur AI,
  //    supaya ketahuan model mana yang benar-benar jalan untuk key ini.
  const kandidat = [
    GEMINI_MODEL,
    "gemini-3.5-flash",
    "gemini-flash-latest",
    "gemini-3-flash-preview",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
  ].filter((m, i, arr) => arr.indexOf(m) === i);

  const hasilUjiModel: Record<string, string> = {};
  for (const model of kandidat) {
    try {
      const out = await generateJson<unknown>({
        asal: `ai/diagnostik:${model}`,
        model,
        systemInstruction: 'Balas HANYA JSON persis: {"ok":true}',
        prompt: "tes koneksi",
      });
      hasilUjiModel[model] = `JALAN — balasan: ${JSON.stringify(out)}`;
    } catch (err) {
      const inner = err instanceof GeminiError ? (err.cause ?? err) : err;
      const r = ringkasError(inner);
      hasilUjiModel[model] = `GAGAL (${r.status ?? "?"}) ${String(r.message).slice(0, 150)}`;
    }
  }

  return NextResponse.json({
    apiKey: `ADA (${key.panjang} karakter)`,
    modelAktif: GEMINI_MODEL,
    modelFlashYangTersedia: modelTersedia?.filter((m) => m.includes("flash")) ?? null,
    totalModelTersedia: modelTersedia?.length ?? null,
    errorListModel,
    hasilUjiModel,
  });
}
