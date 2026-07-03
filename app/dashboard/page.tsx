import { requireAdminPage } from "@/lib/auth-helpers";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await requireAdminPage();

  return <DashboardClient />;
}
