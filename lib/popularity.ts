export const POPULARITY_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/** Dari peta {crowdLevel: jumlah laporan}, kembalikan crowdLevel dengan jumlah terbanyak. */
export function pickMajorityCrowdLevel(
  counts: Iterable<[string, number]>
): string | null {
  let maxLevel: string | null = null;
  let maxCount = 0;
  for (const [level, count] of counts) {
    if (count > maxCount) {
      maxCount = count;
      maxLevel = level;
    }
  }
  return maxLevel;
}

/**
 * Indikator popularitas/kepercayaan komunitas — murni menampilkan ulang
 * upvote & laporan terverifikasi yang sudah ada, BUKAN rating 1-5 bintang.
 */
export type PopularityBadge = {
  kind: "trending" | "confirmation";
  label: string;
};

export function getPopularityBadge(dest: {
  populerMingguIni: boolean;
  totalUpvotes: number;
  verifiedReportsCount: number;
}): PopularityBadge | null {
  if (dest.populerMingguIni) {
    return { kind: "trending", label: "Populer minggu ini" };
  }
  const confirmations = dest.totalUpvotes + dest.verifiedReportsCount;
  if (confirmations > 0) {
    return { kind: "confirmation", label: `${confirmations} orang mengonfirmasi info ini` };
  }
  return null;
}
