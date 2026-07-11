import { requirePengelolaPage } from "@/lib/auth-helpers";
import PengaturanPengelolaClient from "./PengaturanPengelolaClient";

export default async function PengaturanPengelolaPage() {
  await requirePengelolaPage();

  return <PengaturanPengelolaClient />;
}
