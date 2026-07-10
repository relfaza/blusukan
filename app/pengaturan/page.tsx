import { requireAdminPage } from "@/lib/auth-helpers";
import PengaturanClient from "./PengaturanClient";

export default async function PengaturanPage() {
  await requireAdminPage();

  return <PengaturanClient />;
}
