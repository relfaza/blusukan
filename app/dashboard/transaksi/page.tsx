import { requireAdminPage } from "@/lib/auth-helpers";
import TransaksiDashboardClient from "./TransaksiDashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardTransaksiPage() {
  await requireAdminPage();

  return <TransaksiDashboardClient />;
}
