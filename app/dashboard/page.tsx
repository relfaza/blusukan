import { requireAdminPage } from "@/lib/auth-helpers";
import { getPeringkatDestinasi } from "@/lib/peringkat";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await requireAdminPage();
  const peringkat = await getPeringkatDestinasi();

  return <DashboardClient top5Destinasi={peringkat.slice(0, 5)} />;
}
