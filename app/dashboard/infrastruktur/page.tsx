import { Building2 } from "lucide-react";
import { requireAdminPage } from "@/lib/auth-helpers";
import ComingSoon from "@/components/admin/coming-soon";

export const dynamic = "force-dynamic";

export default async function InfrastrukturPage() {
  await requireAdminPage();

  return (
    <ComingSoon
      title="Infrastruktur & Fasilitas"
      description="Pemantauan kondisi jalan, sinyal, dan fasilitas destinasi"
      icon={<Building2 size={26} />}
    />
  );
}
