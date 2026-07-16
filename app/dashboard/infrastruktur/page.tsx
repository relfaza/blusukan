import { requireAdminPage } from "@/lib/auth-helpers";
import InfrastrukturClient from "./InfrastrukturClient";

export const dynamic = "force-dynamic";

export default async function InfrastrukturPage() {
  await requireAdminPage();

  return <InfrastrukturClient />;
}
