import { requireAdminPage } from "@/lib/auth-helpers";
import { getPeringkatKeuangan } from "@/lib/peringkat-keuangan";
import KeuanganDashboardClient from "./KeuanganDashboardClient";
import type { PeringkatWidgetItem } from "@/components/admin/peringkat-widget";

export const dynamic = "force-dynamic";

export default async function DashboardKeuanganPage() {
  await requireAdminPage();

  const peringkat = await getPeringkatKeuangan();
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
