"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, LogOut, User, LayoutDashboard, Settings } from "lucide-react";
import { signOut } from "next-auth/react";

type NotifikasiItem = {
  id: string;
  isRead: boolean;
};

// Inisial nama user (maks 2 huruf)
function getInitials(name?: string | null): string {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

const ROLE_LABEL: Record<string, string> = {
  WISATAWAN: "Wisatawan",
  PENGELOLA: "Pengelola Lokal",
  ADMIN: "Administrator",
};

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/info", label: "Info & Update" },
];

// Menu navigasi & shortcut dashboard khusus per role — WISATAWAN pakai NAV_LINKS default
const ROLE_NAV_LINKS: Record<string, { href: string; label: string }[]> = {
  PENGELOLA: [
    { href: "/pengelola", label: "Dashboard Pengelola" },
  ],
  ADMIN: [
    { href: "/dashboard", label: "Dashboard Admin" },
  ],
};

const ROLE_DASHBOARD_LINK: Record<string, { href: string; label: string }> = {
  PENGELOLA: { href: "/pengelola", label: "Dashboard Pengelola" },
  ADMIN: { href: "/dashboard", label: "Dashboard Admin" },
};

export type NavbarUser = {
  name: string | null;
  role: string | null;
} | null;

export default function NavbarClient({ user }: { user: NavbarUser }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<NotifikasiItem[] | null>(null);

  // Shadow on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch notifikasi saat header mount / setelah login (props user berubah),
  // lalu polling ringan tiap 30 detik + refetch saat tab kembali fokus —
  // bukan WebSocket, cukup ini supaya badge tidak basi selama user browsing.
  useEffect(() => {
    if (!user) {
      setNotifications(null);
      return;
    }

    function fetchNotifikasi() {
      fetch("/api/notifikasi")
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setNotifications(Array.isArray(data) ? data : []))
        .catch(() => setNotifications([]));
    }

    fetchNotifikasi();
    const intervalId = setInterval(fetchNotifikasi, 30_000);
    window.addEventListener("focus", fetchNotifikasi);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", fetchNotifikasi);
    };
  }, [user]);

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;
  const initials = getInitials(user?.name);
  const roleLabel = user?.role ? (ROLE_LABEL[user.role] ?? user.role) : null;
  const navLinks = (user?.role && ROLE_NAV_LINKS[user.role]) || NAV_LINKS;
  const dashboardLink = user?.role ? ROLE_DASHBOARD_LINK[user.role] : undefined;

  // Halaman pre-login tidak menampilkan header aplikasi
  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/lupa-password" ||
    pathname?.startsWith("/reset-password")
  ) {
    return null;
  }

  return (
    <div className="sticky top-0 z-50 w-full flex justify-center px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4 pointer-events-none">
      <nav
        className="pointer-events-auto w-full max-w-6xl rounded-full transition-all duration-300"
        style={{
          background:
            "color-mix(in srgb, var(--blusukan-surface-container-lowest) 85%, transparent)",
          backdropFilter: "blur(20px) saturate(160%)",
          WebkitBackdropFilter: "blur(20px) saturate(160%)",
          border: "1px solid var(--blusukan-outline-variant)",
          boxShadow: scrolled
            ? "0 12px 36px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.06)"
            : "0 8px 28px rgba(0,0,0,0.10)",
        }}
      >
      <div className="px-3 sm:px-4 lg:px-6 h-14 flex items-center justify-between gap-4">

        {/* ── Logo ── */}
        <Link
          href={dashboardLink?.href ?? "/"}
          id="nav-logo"
          className="flex items-center gap-2 shrink-0"
        >
          <Image
            src="/logo.png"
            alt="Blusukan"
            width={32}
            height={32}
            className="object-contain shrink-0"
          />
          <span
            className="text-lg font-bold"
            style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-primary)" }}
          >
            Blusukan
          </span>
        </Link>

        {/* ── Nav links (desktop only) ── */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                id={`nav-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-colors"
                style={{
                  color: active ? "var(--blusukan-primary)" : "var(--blusukan-on-surface-variant)",
                  background: active ? "rgba(45,90,39,0.08)" : "transparent",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Tentang Kami — selalu tampil untuk semua kondisi (guest & semua role), terpisah dari navLinks per-role */}
          <Link
            href="/tentang"
            id="nav-link-tentang-kami"
            className="px-4 py-2 rounded-full text-sm font-semibold transition-colors"
            style={{
              color: pathname === "/tentang" ? "var(--blusukan-primary)" : "var(--blusukan-on-surface-variant)",
              background: pathname === "/tentang" ? "rgba(45,90,39,0.08)" : "transparent",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Tentang Kami
          </Link>
        </div>

        {/* ── Right side: Notif + Avatar ── */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Bell icon dengan badge — hanya untuk user yang sudah login, klik buka /notifikasi */}
          {user && (
            <Link
              href="/notifikasi"
              id="nav-notif"
              onClick={() => setDropdownOpen(false)}
              className="relative w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:bg-[var(--blusukan-surface-low)]"
              aria-label="Notifikasi"
            >
              <Bell size={20} style={{ color: "var(--blusukan-on-surface-variant)" }} />
              {unreadCount > 0 && (
                <span
                  className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ background: "var(--blusukan-error)", color: "#ffffff" }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          )}

          {/* Avatar + dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="nav-avatar"
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 rounded-full pl-1 pr-2 py-1 transition-colors hover:bg-[var(--blusukan-surface-low)]"
            >
              {/* Inisial avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }}
              >
                {initials}
              </div>
              <ChevronDown
                size={14}
                className="hidden sm:block transition-transform"
                style={{
                  color: "var(--blusukan-outline)",
                  transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-52 rounded-2xl overflow-hidden z-50"
                style={{
                  background: "var(--blusukan-surface-container-lowest)",
                  border: "1px solid var(--blusukan-outline-variant)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                }}
              >
                {/* User info */}
                <div
                  className="px-4 py-3 border-b"
                  style={{ borderColor: "var(--blusukan-outline-variant)" }}
                >
                  <p
                    className="text-sm font-semibold truncate"
                    style={{ color: "var(--blusukan-on-surface)", fontFamily: "Montserrat, sans-serif" }}
                  >
                    {user?.name ?? "Pengguna"}
                  </p>
                  {roleLabel && (
                    <p className="text-xs mt-0.5 truncate" style={{ color: "var(--blusukan-outline)" }}>
                      {roleLabel}
                    </p>
                  )}
                </div>

                {/* Menu items */}
                <div className="py-1">
                  {dashboardLink && (
                    <Link
                      href={dashboardLink.href}
                      id="dropdown-dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--blusukan-surface-low)]"
                      style={{ color: "var(--blusukan-on-surface)", fontFamily: "Inter, sans-serif" }}
                    >
                      <LayoutDashboard size={15} style={{ color: "var(--blusukan-on-surface-variant)" }} />
                      {dashboardLink.label}
                    </Link>
                  )}

                  <Link
                    href="/profil"
                    id="dropdown-profil"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--blusukan-surface-low)]"
                    style={{ color: "var(--blusukan-on-surface)", fontFamily: "Inter, sans-serif" }}
                  >
                    <User size={15} style={{ color: "var(--blusukan-on-surface-variant)" }} />
                    Profil Saya
                  </Link>

                  {user?.role === "ADMIN" && (
                    <Link
                      href="/pengaturan"
                      id="dropdown-pengaturan"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--blusukan-surface-low)]"
                      style={{ color: "var(--blusukan-on-surface)", fontFamily: "Inter, sans-serif" }}
                    >
                      <Settings size={15} style={{ color: "var(--blusukan-on-surface-variant)" }} />
                      Pengaturan
                    </Link>
                  )}

                  {user?.role === "PENGELOLA" && (
                    <Link
                      href="/pengaturan-pengelola"
                      id="dropdown-pengaturan-pengelola"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--blusukan-surface-low)]"
                      style={{ color: "var(--blusukan-on-surface)", fontFamily: "Inter, sans-serif" }}
                    >
                      <Settings size={15} style={{ color: "var(--blusukan-on-surface-variant)" }} />
                      Pengaturan
                    </Link>
                  )}

                  {user?.role === "WISATAWAN" && (
                    <Link
                      href="/pengaturan-wisatawan"
                      id="dropdown-pengaturan-wisatawan"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--blusukan-surface-low)]"
                      style={{ color: "var(--blusukan-on-surface)", fontFamily: "Inter, sans-serif" }}
                    >
                      <Settings size={15} style={{ color: "var(--blusukan-on-surface-variant)" }} />
                      Pengaturan
                    </Link>
                  )}

                  <button
                    id="dropdown-logout"
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      signOut({ callbackUrl: "/login" });
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-[color-mix(in_srgb,var(--blusukan-error)_10%,transparent)]"
                    style={{ color: "var(--blusukan-error)", fontFamily: "Inter, sans-serif" }}
                  >
                    <LogOut size={15} />
                    Keluar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </nav>
    </div>
  );
}
