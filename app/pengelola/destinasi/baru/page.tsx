import { requirePengelolaPage } from "@/lib/auth-helpers";
import DestinasiFormClient from "../DestinasiFormClient";

export const dynamic = "force-dynamic";

export default async function AjukanDestinasiPage() {
  await requirePengelolaPage();

  return <DestinasiFormClient mode="create" />;
}
