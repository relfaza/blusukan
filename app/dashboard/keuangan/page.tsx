import { requireAdminPage } from "@/lib/auth-helpers";
import { getPeringkatKeuangan } from "@/lib/peringkat-keuangan";
import { getPeringkatRating } from "@/lib/peringkat-rating";
import KeuanganDashboardClient from "./KeuanganDashboardClient";
import type { PeringkatWidgetItem } from "@/components/admin/peringkat-widget";

export const dynamic = "force-dynamic";

export default async function DashboardKeuanganPage() {
  await requireAdminPage();

  const [peringkat, peringkatRating] = await Promise.all([getPeringkatKeuangan(), getPeringkatRating()]);
  const semuaDestinasiKeuangan = peringkat.filter((d) => d.jumlahTransaksi > 0);

  const ratingMap = new Map(peringkatRating.map((r) => [r.id, r]));
  const peringkatWidgetItems: PeringkatWidgetItem[] = semuaDestinasiKeuangan.map((d) => {
    const rating = ratingMap.get(d.id);
    return {
      id: d.id,
      name: d.name,
      kabupaten: d.kabupaten,
      primaryValue: d.totalPendapatan,
      rataRataRating: rating?.rataRataRating ?? 0,
      totalReview: rating?.totalReview ?? 0,
    };
  });

  return (
    <KeuanganDashboardClient
      semuaDestinasiKeuangan={semuaDestinasiKeuangan}
      peringkatWidgetItems={peringkatWidgetItems}
    />
  );
}
