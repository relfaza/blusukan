import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Syarat & Ketentuan — Blusukan",
};

export default function SyaratKetentuanPage() {
  return (
    <div
      className="min-h-screen px-4 py-8 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold hover:opacity-70 transition-opacity"
          style={{ color: "var(--blusukan-primary)" }}
        >
          <ArrowLeft size={16} />
          Kembali
        </Link>

        <div
          className="p-5 sm:p-6"
          style={{
            backgroundColor: "var(--blusukan-surface-container-lowest)",
            border: "1px solid var(--blusukan-outline-variant)",
            borderRadius: "16px",
          }}
        >
          <h1
            className="text-2xl font-bold mb-4"
            style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
          >
            Syarat & Ketentuan
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Halaman ini masih dalam penyusunan. Syarat dan ketentuan penggunaan layanan Blusukan akan
            ditampilkan di sini.
          </p>
        </div>
      </div>
    </div>
  );
}
