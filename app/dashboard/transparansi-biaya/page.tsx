import { Wallet } from "lucide-react";
import { requireAdminPage } from "@/lib/auth-helpers";
import ComingSoon from "@/components/admin/coming-soon";

export const dynamic = "force-dynamic";

export default async function TransparansiBiayaPage() {
  await requireAdminPage();

  return (
    <ComingSoon
      title="Transparansi Biaya"
      description="Rincian tiket, tarif fasilitas, dan estimasi biaya kunjungan"
      icon={<Wallet size={26} />}
    />
  );
}
