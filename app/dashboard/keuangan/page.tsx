import { requireAdminPage } from "@/lib/auth-helpers";
import { getPeringkatKeuangan } from "@/lib/peringkat-keuangan";
import KeuanganDashboardClient from "./KeuanganDashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardKeuanganPage() {
  await requireAdminPage();

  const peringkat = await getPeringkatKeuangan();
  const semuaDestinasiKeuangan = peringkat.filter((d) => d.jumlahTransaksi > 0);

  return <KeuanganDashboardClient semuaDestinasiKeuangan={semuaDestinasiKeuangan} />;
}
