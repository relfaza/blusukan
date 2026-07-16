import { AlertTriangle } from "lucide-react";
import { requireAdminPage } from "@/lib/auth-helpers";
import ComingSoon from "@/components/admin/coming-soon";

export const dynamic = "force-dynamic";

export default async function PrioritasInvestigasiPage() {
  await requireAdminPage();

  return (
    <ComingSoon
      title="Prioritas Investigasi"
      description="Destinasi yang perlu ditinjau — berbasis peringkat keramaian & klasifikasi"
      icon={<AlertTriangle size={26} />}
    />
  );
}
