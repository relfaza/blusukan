import "server-only";
import { GoogleGenAI } from "@google/genai";

/**
 * Model flash terbaru yang benar-benar bisa diakses API key ini.
 *
 * JANGAN turunkan ke gemini-2.0/2.5-flash: keduanya sudah ditutup Google untuk
 * pengguna baru (404 "no longer available to new users" / 429 kuota free tier 0),
 * dan itulah penyebab semua fitur AI sempat error.
 *
 * Bisa dioverride lewat env GEMINI_MODEL tanpa ubah kode.
 */
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";

export type GeminiErrorKind =
  /** GEMINI_API_KEY belum diset di environment */
  | "config"
  /** Gemini menolak/gagal merespons (kuota habis, key invalid, model tidak ada, safety block) */
  | "upstream"
  /** Gemini merespons, tapi isinya bukan JSON yang bisa dipakai */
  | "parse";

export class GeminiError extends Error {
  readonly kind: GeminiErrorKind;

  constructor(kind: GeminiErrorKind, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "GeminiError";
    this.kind = kind;
  }
}

/** Apakah GEMINI_API_KEY terisi — TANPA membocorkan isinya. */
export function statusApiKey(): { ada: boolean; panjang: number } {
  const key = process.env.GEMINI_API_KEY ?? "";
  return { ada: key.trim() !== "", panjang: key.trim().length };
}

/**
 * Client dibuat lazy (bukan di module scope) supaya file ini aman di-import
 * saat build/typecheck walaupun GEMINI_API_KEY belum tersedia.
 */
function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    throw new GeminiError("config", "GEMINI_API_KEY belum diset di environment.");
  }

  return new GoogleGenAI({ apiKey });
}

/**
 * LOGGING DIAGNOSTIK SEMENTARA.
 * Bongkar error mentah dari Gemini apa adanya — status HTTP, pesan asli, dan
 * detail kuota/model — supaya akar masalah kelihatan di terminal, bukan cuma
 * pesan generik yang dikirim ke browser.
 */
export function logErrorGeminiMentah(asal: string, err: unknown): void {
  console.error(`\n──────── [${asal}] ERROR MENTAH DARI GEMINI ────────`);
  console.error("model yang dipakai :", GEMINI_MODEL);
  console.error("GEMINI_API_KEY     :", statusApiKey().ada ? `ADA (${statusApiKey().panjang} karakter)` : "KOSONG / TIDAK ADA");

  if (err instanceof Error) {
    console.error("error.name         :", err.name);
    console.error("error.message      :", err.message);
  } else {
    console.error("error (non-Error)  :", err);
  }

  // SDK @google/genai menaruh detail HTTP di properti dinamis — tampilkan semuanya.
  const anyErr = err as Record<string, unknown> | null;
  if (anyErr && typeof anyErr === "object") {
    for (const field of ["status", "statusText", "code", "response", "errorDetails"]) {
      if (field in anyErr && anyErr[field] !== undefined) {
        console.error(`error.${field.padEnd(13)}:`, anyErr[field]);
      }
    }
  }

  try {
    console.error("JSON lengkap       :", JSON.stringify(err, Object.getOwnPropertyNames(err ?? {}), 2));
  } catch {
    console.error("JSON lengkap       : (tidak bisa diserialisasi)");
  }
  console.error("──────────────────────────────────────────────────────\n");
}

type GenerateJsonOptions = {
  /** Peran & aturan main model — dipisah dari input user supaya tidak gampang di-override lewat prompt. */
  systemInstruction: string;
  /** Isi permintaan: konteks data + kalimat user. */
  prompt: string;
  /** 0 = paling deterministik. Rekomendasi tidak perlu kreatif. */
  temperature?: number;
  /** Dipakai di log supaya ketahuan error ini datang dari endpoint mana. */
  asal?: string;
  /** Override model — dipakai endpoint diagnostik untuk menguji model kandidat. */
  model?: string;
};

/**
 * Panggil Gemini dan kembalikan hasilnya sebagai objek JSON hasil parse.
 * responseMimeType "application/json" memaksa model membalas JSON murni,
 * jadi tidak perlu mengupas pagar ```json dari teks bebas.
 *
 * Melempar GeminiError — caller yang memutuskan status HTTP-nya.
 */
export async function generateJson<T>({
  systemInstruction,
  prompt,
  temperature = 0.3,
  asal = "gemini",
  model = GEMINI_MODEL,
}: GenerateJsonOptions): Promise<T> {
  const ai = getClient();

  let rawText: string;
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature,
        responseMimeType: "application/json",
      },
    });

    rawText = response.text ?? "";
  } catch (err) {
    logErrorGeminiMentah(asal, err);
    throw new GeminiError("upstream", "Gemini gagal merespons.", { cause: err });
  }

  if (rawText.trim() === "") {
    console.error(`[${asal}] Gemini membalas TEKS KOSONG (kemungkinan safety block / finishReason bukan STOP).`);
    throw new GeminiError("parse", "Respons Gemini kosong.");
  }

  try {
    return JSON.parse(rawText) as T;
  } catch (err) {
    // LOGGING DIAGNOSTIK SEMENTARA — tampilkan teks asli yang gagal di-parse.
    console.error(`\n──────── [${asal}] RESPONS GEMINI BUKAN JSON ────────`);
    console.error("teks mentah dari Gemini:\n" + rawText.slice(0, 2000));
    console.error("──────────────────────────────────────────────────────\n");
    throw new GeminiError("parse", "Respons Gemini bukan JSON yang valid.", { cause: err });
  }
}

/**
 * DIAGNOSTIK SEMENTARA: daftar model yang benar-benar bisa diakses API key ini,
 * beserta apakah model tersebut mendukung generateContent.
 */
export async function listModelYangTersedia(): Promise<string[]> {
  const ai = getClient();
  const hasil: string[] = [];

  const pager = await ai.models.list();
  for await (const model of pager) {
    const actions = model.supportedActions ?? [];
    const bisaGenerate = actions.length === 0 || actions.includes("generateContent");
    if (bisaGenerate && model.name) {
      hasil.push(model.name.replace(/^models\//, ""));
    }
  }

  return hasil;
}
