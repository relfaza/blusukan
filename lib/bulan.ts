export const BULAN_LABEL = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

export type BulanBucket = { bulan: string; year: number; month: number };

/** 6 bulan terakhir termasuk bulan berjalan, urut dari paling lama ke paling baru. */
export function last6Months(now: Date = new Date()): BulanBucket[] {
  const months: BulanBucket[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      bulan: `${BULAN_LABEL[d.getMonth()]} ${d.getFullYear()}`,
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }
  return months;
}
