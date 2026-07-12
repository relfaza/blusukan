import { requirePengelolaPage } from "@/lib/auth-helpers";
import AjukanDestinasiWizard from "./AjukanDestinasiWizard";

export const dynamic = "force-dynamic";

export default async function AjukanDestinasiPage() {
  await requirePengelolaPage();

  return <AjukanDestinasiWizard />;
}
