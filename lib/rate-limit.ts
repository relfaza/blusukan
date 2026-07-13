import "server-only";

/**
 * Rate limit sederhana untuk endpoint AI: 1 permintaan per jendela waktu per pemanggil.
 *
 * Disimpan di memori proses — cukup untuk menahan spam klik ke API Gemini yang
 * berkuota, tapi TIDAK tahan lintas-instance. Kalau nanti di-deploy multi-instance
 * (atau serverless), state ini perlu dipindah ke Redis/DB.
 */
export const AI_RATE_LIMIT_MS = 5_000;

const lastRequestAt = new Map<string, number>();

/**
 * Catat permintaan dari `key`. Kembalikan true kalau permintaan ini harus DITOLAK
 * karena datang terlalu cepat setelah permintaan sebelumnya.
 */
export function tolakKarenaRateLimit(
  key: string,
  now: number = Date.now(),
  windowMs: number = AI_RATE_LIMIT_MS
): boolean {
  // Buang entri kedaluwarsa dulu supaya Map tidak tumbuh tanpa batas
  for (const [k, waktu] of lastRequestAt) {
    if (now - waktu > windowMs) {
      lastRequestAt.delete(k);
    }
  }

  const sebelumnya = lastRequestAt.get(key);
  if (sebelumnya !== undefined && now - sebelumnya < windowMs) {
    return true;
  }

  lastRequestAt.set(key, now);
  return false;
}

/** Identitas pemanggil: userId kalau login, kalau tamu jatuh ke IP dari proxy. */
export function getRateLimitKey(req: Request, userId: string | undefined): string {
  if (userId) return `user:${userId}`;

  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  return `ip:${ip}`;
}
