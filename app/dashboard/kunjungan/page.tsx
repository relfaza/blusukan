import { requireAdminPage } from "@/lib/auth-helpers";
import TrenKunjunganSection from "../TrenKunjunganSection";

export const dynamic = "force-dynamic";

// Kunjungan & Kepadatan — versi detail dari tren kunjungan (dipindah dari Overview supaya tidak duplikat).
// Section kepadatan/keramaian tambahan menyusul di fase berikutnya.
export default async function KunjunganPage() {
  await requireAdminPage();

  return (
    <div className="min-h-screen" style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
        >
          Kunjungan & Kepadatan
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Tren kunjungan wisatawan dari waktu ke waktu
        </p>

        <TrenKunjunganSection />
      </div>
    </div>
  );
}
