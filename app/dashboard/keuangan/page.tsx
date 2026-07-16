import { requireAdminPage } from "@/lib/auth-helpers";
import { getPeringkatKeuangan } from "@/lib/peringkat-keuangan";
import KeuanganDashboardClient from "./KeuanganDashboardClient";
import type { PeringkatWidgetItem } from "@/components/admin/peringkat-widget";
import { parseAdminFilters } from "@/lib/admin-filters";

export const dynamic = "force-dynamic";

export default async function DashboardKeuanganPage({
  searchParams,
}: {
  searchParams: Promise<{ kabupaten?: string }>;
}) {
  await requireAdminPage();

  const filters = parseAdminFilters(await searchParams);
  const peringkat = await getPeringkatKeuangan(filters);
  const semuaDestinasiKeuangan = peringkat.filter((d) => d.jumlahTransaksi > 0);

  const peringkatWidgetItems: PeringkatWidgetItem[] = semuaDestinasiKeuangan.map((d) => ({
    id: d.id,
    name: d.name,
    kabupaten: d.kabupaten,
    value: d.totalPendapatan,
  }));

  return (
    <KeuanganDashboardClient
      semuaDestinasiKeuangan={semuaDestinasiKeuangan}
      peringkatWidgetItems={peringkatWidgetItems}
    />
  );
}
