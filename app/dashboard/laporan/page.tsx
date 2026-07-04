import { requireAdminPage } from "@/lib/auth-helpers";
import LaporanDashboardClient from "./LaporanDashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardLaporanPage() {
  await requireAdminPage();

  return <LaporanDashboardClient />;
}
