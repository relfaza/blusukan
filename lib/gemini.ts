import "server-only";
import { GoogleGenerativeAI } from "@google/generative-ai";

/** Model cepat dengan kuota gratis besar — cukup untuk rekomendasi teks pendek. */
export const GEMINI_MODEL = "gemini-2.0-flash";

export type GeminiErrorKind =
  /** GEMINI_API_KEY belum diset di environment */
  | "config"
  /** Gemini menolak/gagal merespons (kuota habis, jaringan, safety block) */
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

/**
 * Client dibuat lazy (bukan di module scope) supaya file ini aman di-import
 * saat build/typecheck walaupun GEMINI_API_KEY belum tersedia.
 */
function getClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new GeminiError("config", "GEMINI_API_KEY belum diset di environment.");
  }

  return new GoogleGenerativeAI(apiKey);
}

type GenerateJsonOptions = {
  /** Peran & aturan main model — dipisah dari input user supaya tidak gampang di-override lewat prompt. */
  systemInstruction: string;
  /** Isi permintaan: konteks data + kalimat user. */
  prompt: string;
  /** 0 = paling deterministik. Rekomendasi tidak perlu kreatif. */
  temperature?: number;
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
}: GenerateJsonOptions): Promise<T> {
  const model = getClient().getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction,
    generationConfig: {
      temperature,
      responseMimeType: "application/json",
    },
  });

  let rawText: string;
  try {
    const result = await model.generateContent(prompt);
    rawText = result.response.text();
  } catch (err) {
    throw new GeminiError("upstream", "Gemini gagal merespons.", { cause: err });
  }

  try {
    return JSON.parse(rawText) as T;
  } catch (err) {
    throw new GeminiError("parse", "Respons Gemini bukan JSON yang valid.", { cause: err });
  }
}
