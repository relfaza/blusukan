import { requireAdminPage } from "@/lib/auth-helpers";
import TransparansiBiayaClient from "./TransparansiBiayaClient";

export const dynamic = "force-dynamic";

export default async function TransparansiBiayaPage() {
  await requireAdminPage();

  return <TransparansiBiayaClient />;
}
