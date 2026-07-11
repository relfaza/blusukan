import { requireAdminPage } from "@/lib/auth-helpers";
import KeuanganDashboardClient from "./KeuanganDashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardKeuanganPage() {
  await requireAdminPage();

  return <KeuanganDashboardClient />;
}
