import { requireAdminPage } from "@/lib/auth-helpers";
import PersetujuanClient from "./PersetujuanClient";

export const dynamic = "force-dynamic";

export default async function PersetujuanPage() {
  await requireAdminPage();

  return <PersetujuanClient />;
}
