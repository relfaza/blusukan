export const BULAN_LABEL = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export type Bucket = { label: string; start: Date; end: Date };
export type PeriodeKeuangan = "harian" | "mingguan" | "bulanan" | "tahunan";

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** 30 hari terakhir, per tanggal */
export function buildHarianBuckets(now: Date): Bucket[] {
  const today = startOfDay(now);
  const buckets: Bucket[] = [];
  for (let i = 29; i >= 0; i--) {
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
    buckets.push({ label: `${start.getDate()} ${BULAN_LABEL[start.getMonth()]}`, start, end });
  }
  return buckets;
}

/** 12 minggu terakhir (blok 7 hari) */
export function buildMingguanBuckets(now: Date): Bucket[] {
  const today = startOfDay(now);
  const buckets: Bucket[] = [];
  for (let i = 11; i >= 0; i--) {
    const weekEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i * 7);
    const weekStart = new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate() - 6);
    const end = new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate() + 1);
    buckets.push({
      label: `Minggu ${weekStart.getDate()} ${BULAN_LABEL[weekStart.getMonth()]}`,
      start: weekStart,
      end,
    });
  }
  return buckets;
}

/** 12 bulan terakhir, per bulan kalender */
export function buildBulananBuckets(now: Date): Bucket[] {
  const buckets: Bucket[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    buckets.push({ label: `${BULAN_LABEL[d.getMonth()]} ${d.getFullYear()}`, start, end });
  }
  return buckets;
}

/** 5 tahun terakhir, per tahun kalender */
export function buildTahunanBuckets(now: Date): Bucket[] {
  const buckets: Bucket[] = [];
  for (let i = 4; i >= 0; i--) {
    const year = now.getFullYear() - i;
    buckets.push({ label: String(year), start: new Date(year, 0, 1), end: new Date(year + 1, 0, 1) });
  }
  return buckets;
}

export function buildBucketsForPeriodeKeuangan(periode: PeriodeKeuangan, now: Date): Bucket[] {
  return periode === "harian"
    ? buildHarianBuckets(now)
    : periode === "mingguan"
      ? buildMingguanBuckets(now)
      : periode === "bulanan"
        ? buildBulananBuckets(now)
        : buildTahunanBuckets(now);
}
