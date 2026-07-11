import { requireAdminPage } from "@/lib/auth-helpers";
import DestinasiAktifClient from "./DestinasiAktifClient";

export const dynamic = "force-dynamic";

export default async function DashboardDestinasiPage() {
  await requireAdminPage();

  return <DestinasiAktifClient />;
}
