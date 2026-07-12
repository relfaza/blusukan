"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, MapPin } from "lucide-react";

const JELAJAHI_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/info", label: "Info & Update" },
];

const PENGELOLA_LINKS = [
  { href: "/register", label: "Daftar sebagai Pengelola" },
  { href: "/login", label: "Masuk" },
];

export default function Footer() {
  const pathname = usePathname();

  // Halaman pre-login punya layout sendiri tanpa header, jadi footer juga disembunyikan
  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/lupa-password" ||
    pathname?.startsWith("/reset-password")
  ) {
    return null;
  }

  return (
    <footer
      style={{
        background: "var(--blusukan-primary)",
        color: "var(--blusukan-on-primary)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Kolom 1: Brand */}
        <div>
          <div className="flex items-center gap-1.5">
            <MapPin size={20} style={{ color: "var(--blusukan-primary-fixed-dim)" }} />
            <span
              className="text-lg font-bold"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Blusukan
            </span>
          </div>
          <p
            className="mt-3 text-sm"
            style={{ color: "var(--blusukan-primary-fixed-dim)", fontFamily: "Inter, sans-serif" }}
          >
            Temukan hidden gem Yogyakarta
          </p>
          <p
            className="mt-6 text-xs"
            style={{ color: "var(--blusukan-primary-fixed-dim)", fontFamily: "Inter, sans-serif" }}
          >
            © 2026 Blusukan. Dibuat untuk Tugas Akhir Sistem Informasi.
          </p>
        </div>

        {/* Kolom 2: Jelajahi */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide">Jelajahi</h3>
          <ul className="mt-4 space-y-2.5">
            {JELAJAHI_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm transition-opacity hover:opacity-80"
                  style={{ color: "var(--blusukan-on-primary)", fontFamily: "Inter, sans-serif" }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Kolom 3: Untuk Pengelola */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide">Untuk Pengelola</h3>
          <ul className="mt-4 space-y-2.5">
            {PENGELOLA_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm transition-opacity hover:opacity-80"
                  style={{ color: "var(--blusukan-on-primary)", fontFamily: "Inter, sans-serif" }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Kolom 4: Kontak & Sosial */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide">Kontak & Sosial</h3>
          <a
            href="mailto:halo@blusukan.id"
            className="mt-4 flex items-center gap-2 text-sm transition-opacity hover:opacity-80"
            style={{ color: "var(--blusukan-on-primary)", fontFamily: "Inter, sans-serif" }}
          >
            <Mail size={16} />
            halo@blusukan.id
          </a>
          <div className="mt-4 flex items-center gap-3">
            <a
              href="#"
              aria-label="Instagram"
              className="w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
              style={{ border: "1px solid var(--blusukan-primary-fixed-dim)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="WhatsApp"
              className="w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
              style={{ border: "1px solid var(--blusukan-primary-fixed-dim)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.77.46 3.45 1.27 4.9L2 22l5.25-1.38a9.96 9.96 0 0 0 4.79 1.22h.01c5.52 0 10-4.48 10-10s-4.48-10-10.01-10zm5.87 14.3c-.25.7-1.45 1.33-2 1.42-.51.08-1.15.11-1.86-.12-.43-.14-.98-.32-1.69-.63-2.97-1.28-4.91-4.28-5.06-4.48-.15-.2-1.21-1.6-1.21-3.06 0-1.45.76-2.17 1.03-2.46.27-.3.6-.37.8-.37s.4 0 .58.01c.19.01.44-.07.68.53.25.6.85 2.06.92 2.21.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.18-.31.4-.44.53-.15.15-.3.31-.13.6.17.3.75 1.24 1.62 2.01 1.11.99 2.05 1.3 2.35 1.45.3.15.47.12.65-.07.18-.2.75-.87.95-1.17.2-.3.4-.24.68-.14.28.1 1.75.83 2.05.98.3.15.5.22.57.35.08.13.08.72-.17 1.42z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
