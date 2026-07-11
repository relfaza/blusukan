"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, LogOut, User, MapPin, LayoutDashboard, Settings } from "lucide-react";
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
    <nav
      className="sticky top-0 z-50 w-full transition-shadow"
      style={{
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid #c2c9bb",
        boxShadow: scrolled ? "0 2px 12px rgba(0,0,0,0.08)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-14 flex items-center justify-between gap-4">

        {/* ── Logo ── */}
        <Link
          href={dashboardLink?.href ?? "/"}
          id="nav-logo"
          className="flex items-center gap-1.5 shrink-0"
        >
          <MapPin size={20} style={{ color: "#2d5a27" }} />
          <span
            className="text-lg font-bold"
            style={{ fontFamily: "Montserrat, sans-serif", color: "#2d5a27" }}
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
                  color: active ? "#2d5a27" : "#42493e",
                  background: active ? "rgba(45,90,39,0.08)" : "transparent",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* ── Right side: Notif + Avatar ── */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Bell icon dengan badge — hanya untuk user yang sudah login, klik buka /notifikasi */}
          {user && (
            <Link
              href="/notifikasi"
              id="nav-notif"
              onClick={() => setDropdownOpen(false)}
              className="relative w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:bg-[#f3f3f3]"
              aria-label="Notifikasi"
            >
              <Bell size={20} style={{ color: "#42493e" }} />
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
              className="flex items-center gap-1.5 rounded-full pl-1 pr-2 py-1 transition-colors hover:bg-[#f3f3f3]"
            >
              {/* Inisial avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: "#e3efe0", color: "#2d5a27" }}
              >
                {initials}
              </div>
              <ChevronDown
                size={14}
                className="hidden sm:block transition-transform"
                style={{
                  color: "#72796e",
                  transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-52 rounded-2xl overflow-hidden z-50"
                style={{
                  background: "#ffffff",
                  border: "1px solid #c2c9bb",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                }}
              >
                {/* User info */}
                <div
                  className="px-4 py-3 border-b"
                  style={{ borderColor: "#c2c9bb" }}
                >
                  <p
                    className="text-sm font-semibold truncate"
                    style={{ color: "#1a1c1c", fontFamily: "Montserrat, sans-serif" }}
                  >
                    {user?.name ?? "Pengguna"}
                  </p>
                  {roleLabel && (
                    <p className="text-xs mt-0.5 truncate" style={{ color: "#72796e" }}>
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
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-[#f3f3f3]"
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
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-[#f3f3f3]"
                    style={{ color: "#1a1c1c", fontFamily: "Inter, sans-serif" }}
                  >
                    <User size={15} style={{ color: "#42493e" }} />
                    Profil Saya
                  </Link>

                  {user?.role === "ADMIN" && (
                    <Link
                      href="/pengaturan"
                      id="dropdown-pengaturan"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-[#f3f3f3]"
                      style={{ color: "#1a1c1c", fontFamily: "Inter, sans-serif" }}
                    >
                      <Settings size={15} style={{ color: "#42493e" }} />
                      Pengaturan
                    </Link>
                  )}

                  {user?.role === "PENGELOLA" && (
                    <Link
                      href="/pengaturan-pengelola"
                      id="dropdown-pengaturan-pengelola"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-[#f3f3f3]"
                      style={{ color: "#1a1c1c", fontFamily: "Inter, sans-serif" }}
                    >
                      <Settings size={15} style={{ color: "#42493e" }} />
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
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-[#fff0f0]"
                    style={{ color: "#ba1a1a", fontFamily: "Inter, sans-serif" }}
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
  );
}
