import { Construction } from "lucide-react";

// Placeholder halaman Admin yang belum diisi — dipakai menu utama PRD yang kontennya menyusul di fase berikutnya.
export default function ComingSoon({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
        >
          {title}
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          {description}
        </p>

        <div
          className="rounded-2xl p-12 flex flex-col items-center text-center"
          style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }}
          >
            {icon ?? <Construction size={26} />}
          </div>
          <p
            className="text-lg font-bold mb-1"
            style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
          >
            Segera hadir
          </p>
          <p className="text-sm max-w-md" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Fitur ini sedang dalam pengembangan dan akan tersedia di pembaruan berikutnya.
          </p>
        </div>
      </div>
    </div>
  );
}
