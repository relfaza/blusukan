/**
 * Normalisasi teks hasil Gemini untuk ditampilkan.
 *
 * Gemini sering menyelipkan format markdown ("- poin", "1. poin", "**tebal**")
 * ke dalam string, padahal UI sudah punya bullet/nomor visual sendiri. Tanpa
 * dibersihkan, penandanya ikut terbaca sebagai teks mentah di depan tiap poin.
 */

const PENANDA_POIN = /^\s*(?:[-*•–]|\d+[.)])\s+/;
const PENANDA_TEBAL = /\*\*/g;

/** Bersihkan satu baris: buang penanda list di depan dan tanda tebal markdown. */
export function bersihkanTeksAi(teks: string): string {
  return teks.replace(PENANDA_POIN, "").replace(PENANDA_TEBAL, "").trim();
}

/**
 * Ubah hasil AI jadi daftar poin siap render sebagai <li>.
 *
 * Menerima array (bentuk normal dari API) maupun string tunggal yang di dalamnya
 * masih berisi "\n- poin", lalu memecahnya jadi satu poin per baris.
 */
export function keDaftarPoin(raw: string[] | string): string[] {
  return (Array.isArray(raw) ? raw : [raw])
    .flatMap((s) => s.split("\n"))
    .map(bersihkanTeksAi)
    .filter((s) => s !== "");
}
