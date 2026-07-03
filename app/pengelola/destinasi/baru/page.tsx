import { requirePengelolaPage } from "@/lib/auth-helpers";
import AjukanDestinasiFormClient from "./AjukanDestinasiFormClient";

export const dynamic = "force-dynamic";

export default async function AjukanDestinasiPage() {
  await requirePengelolaPage();

  return <AjukanDestinasiFormClient />;
}
