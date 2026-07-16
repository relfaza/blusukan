"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Building2,
  Wallet,
  Users,
  AlertTriangle,
  MapPin,
  ClipboardCheck,
  MessageSquare,
  Receipt,
  Trophy,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronUp,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: React.ReactNode };

export type AdminSidebarUser = { name: string | null; role: string | null } | null;

type NotifikasiItem = { id: string; isRead: boolean };

const COLLAPSE_KEY = "blusukan-admin-sidebar-collapsed";

const ROLE_LABEL: Record<string, string> = {
  WISATAWAN: "Wisatawan",
  PENGELOLA: "Pengelola Lokal",
  ADMIN: "Administrator",
};

// 5 Menu Utama sesuai PRD — WAJIB ADA.
const MENU_UTAMA: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: <LayoutDashboard size={18} /> },
  { href: "/dashboard/infrastruktur", label: "Infrastruktur & Fasilitas", icon: <Building2 size={18} /> },
  { href: "/dashboard/transparansi-biaya", label: "Transparansi Biaya", icon: <Wallet size={18} /> },
  { href: "/dashboard/kunjungan", label: "Kunjungan & Kepadatan", icon: <Users size={18} /> },
  { href: "/dashboard/prioritas-investigasi", label: "Prioritas Investigasi", icon: <AlertTriangle size={18} /> },
];

// Menu operasional pendukung — halaman lama, tetap bisa diakses (di luar 5 menu utama).
const MENU_OPERASIONAL: NavItem[] = [
  { href: "/dashboard/destinasi", label: "Destinasi Aktif", icon: <MapPin size={18} /> },
  { href: "/dashboard/persetujuan", label: "Persetujuan", icon: <ClipboardCheck size={18} /> },
  { href: "/dashboard/laporan", label: "Laporan", icon: <MessageSquare size={18} /> },
  { href: "/dashboard/keuangan", label: "Keuangan", icon: <Receipt size={18} /> },
  { href: "/dashboard/peringkat", label: "Peringkat", icon: <Trophy size={18} /> },
];

// Overview cocok persis (/dashboard). Sisanya berbasis segmen supaya "/dashboard/peringkat-rating"
// tidak ikut menyalakan "Peringkat".
function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getInitials(name?: string | null): string {
  if (!name) return "A";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function cx(...classes: (string | false | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export default function AdminSidebar({ user }: { user: AdminSidebarUser }) {
  const pathname = usePathname() ?? "";
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotifikasiItem[] | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Rail = mode ikon-saja (desktop, collapsed & tidak sedang di-hover).
  const rail = collapsed && !hovered;

  // Baca preferensi collapse dari localStorage setelah mount (hindari mismatch hidrasi).
  useEffect(() => {
    if (localStorage.getItem(COLLAPSE_KEY) === "true") setCollapsed(true);
  }, []);

  function toggleCollapse() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, String(next));
      return next;
    });
  }

  // Tutup drawer & dropdown profil setiap kali pindah halaman.
  useEffect(() => {
    setDrawerOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  // Tutup dropdown profil saat klik di luar.
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Polling notifikasi ringan — sama seperti header lama.
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

  function renderNav(items: NavItem[]) {
    return items.map((item) => {
      const active = isActive(pathname, item.href);
      return (
        <Link
          key={item.href}
          href={item.href}
          id={`admin-nav-${item.href.replace(/\//g, "-").replace(/^-/, "")}`}
          title={rail ? item.label : undefined}
          className={cx(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors",
            rail && "lg:justify-center lg:px-0"
          )}
          style={{
            background: active ? "var(--blusukan-primary-container)" : "transparent",
            color: active ? "var(--blusukan-primary)" : "var(--blusukan-on-surface-variant)",
          }}
        >
          <span
            className="shrink-0"
            style={{ color: active ? "var(--blusukan-primary)" : "var(--blusukan-outline)" }}
          >
            {item.icon}
          </span>
          <span className={cx("truncate", rail && "lg:hidden")}>{item.label}</span>
        </Link>
      );
    });
  }

  return (
    <>
      {/* Tombol hamburger — hanya mobile/tablet, mengambang di pojok kiri atas konten */}
      <button
        type="button"
        id="admin-sidebar-hamburger"
        onClick={() => setDrawerOpen(true)}
        aria-label="Buka menu"
        className="lg:hidden fixed top-4 left-4 z-30 w-10 h-10 flex items-center justify-center rounded-xl shadow-sm"
        style={{
          background: "var(--blusukan-surface-container-lowest)",
          border: "1px solid var(--blusukan-outline-variant)",
          color: "var(--blusukan-on-surface)",
        }}
      >
        <Menu size={20} />
      </button>

      {/* Overlay gelap — mobile/tablet saat drawer terbuka */}
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — flex child di desktop, off-canvas drawer di mobile */}
      <aside
        id="admin-sidebar"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cx(
          "z-50 flex flex-col shrink-0 h-full transition-[width,transform] duration-200 ease-in-out",
          "fixed inset-y-0 left-0 lg:static",
          drawerOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          rail ? "w-64 lg:w-16" : "w-64"
        )}
        style={{
          background: "var(--blusukan-surface-container-lowest)",
          borderRight: "1px solid var(--blusukan-outline-variant)",
        }}
      >
        {/* Header sidebar: logo + toggle collapse (desktop) / tutup (mobile) */}
        <div
          className={cx("flex items-center gap-2 h-16 px-3 shrink-0 border-b", rail && "lg:justify-center lg:px-0")}
          style={{ borderColor: "var(--blusukan-outline-variant)" }}
        >
          <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
            <Image src="/logo.png" alt="Blusukan" width={28} height={28} className="object-contain shrink-0" />
            <span
              className={cx("text-lg font-bold truncate", rail && "lg:hidden")}
              style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-primary)" }}
            >
              Blusukan
            </span>
          </Link>

          {/* Toggle collapse — desktop */}
          <button
            type="button"
            id="admin-sidebar-collapse"
            onClick={toggleCollapse}
            aria-label={collapsed ? "Perlebar sidebar" : "Perkecil sidebar"}
            className={cx(
              "hidden lg:flex ml-auto w-8 h-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--blusukan-surface-low)]",
              rail && "lg:hidden"
            )}
            style={{ color: "var(--blusukan-on-surface-variant)" }}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>

          {/* Tutup drawer — mobile */}
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Tutup menu"
            className="lg:hidden ml-auto w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--blusukan-surface-low)]"
            style={{ color: "var(--blusukan-on-surface-variant)" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tombol expand saat rail (muncul di tempat toggle yang tersembunyi) */}
        {rail && (
          <button
            type="button"
            onClick={toggleCollapse}
            aria-label="Perlebar sidebar"
            className="hidden lg:flex mx-auto mt-2 w-8 h-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--blusukan-surface-low)]"
            style={{ color: "var(--blusukan-on-surface-variant)" }}
          >
            <PanelLeftOpen size={18} />
          </button>
        )}

        {/* Navigasi — area scroll independen */}
        <div className="flex-1 overflow-y-auto hide-scrollbar px-2 py-3 space-y-4">
          <nav className="space-y-1">
            {!rail && (
              <p className="px-3 mb-1 text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--blusukan-outline)" }}>
                Menu Utama
              </p>
            )}
            {renderNav(MENU_UTAMA)}
          </nav>

          <div className="border-t" style={{ borderColor: "var(--blusukan-outline-variant)" }} />

          <nav className="space-y-1">
            {!rail && (
              <p className="px-3 mb-1 text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--blusukan-outline)" }}>
                Menu Operasional
              </p>
            )}
            {renderNav(MENU_OPERASIONAL)}
          </nav>
        </div>

        {/* Bawah: notifikasi + profil */}
        <div className="mt-auto border-t p-2 space-y-1" style={{ borderColor: "var(--blusukan-outline-variant)" }}>
          <Link
            href="/notifikasi"
            id="admin-sidebar-notif"
            title={rail ? "Notifikasi" : undefined}
            className={cx(
              "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:bg-[var(--blusukan-surface-low)]",
              rail && "lg:justify-center lg:px-0"
            )}
            style={{ color: "var(--blusukan-on-surface-variant)" }}
          >
            <span className="relative shrink-0" style={{ color: "var(--blusukan-outline)" }}>
              <Bell size={18} />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ background: "var(--blusukan-error)", color: "#ffffff" }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </span>
            <span className={cx("truncate", rail && "lg:hidden")}>Notifikasi</span>
          </Link>

          {/* Profil + dropdown (buka ke atas) */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              id="admin-sidebar-profile"
              onClick={() => setProfileOpen((p) => !p)}
              className={cx(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-[var(--blusukan-surface-low)]",
                rail && "lg:justify-center lg:px-0"
              )}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }}
              >
                {initials}
              </div>
              <div className={cx("min-w-0 flex-1 text-left", rail && "lg:hidden")}>
                <p className="text-sm font-semibold truncate" style={{ color: "var(--blusukan-on-surface)" }}>
                  {user?.name ?? "Admin"}
                </p>
                {roleLabel && (
                  <p className="text-[11px] truncate" style={{ color: "var(--blusukan-outline)" }}>
                    {roleLabel}
                  </p>
                )}
              </div>
              <ChevronUp
                size={14}
                className={cx("shrink-0 transition-transform", rail && "lg:hidden")}
                style={{
                  color: "var(--blusukan-outline)",
                  transform: profileOpen ? "rotate(0deg)" : "rotate(180deg)",
                }}
              />
            </button>

            {profileOpen && (
              <div
                className="absolute bottom-full left-0 mb-2 w-52 rounded-2xl overflow-hidden z-50"
                style={{
                  background: "var(--blusukan-surface-container-lowest)",
                  border: "1px solid var(--blusukan-outline-variant)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                }}
              >
                <div className="py-1">
                  <Link
                    href="/profil"
                    id="admin-dropdown-profil"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--blusukan-surface-low)]"
                    style={{ color: "var(--blusukan-on-surface)" }}
                  >
                    <User size={15} style={{ color: "var(--blusukan-on-surface-variant)" }} />
                    Profil Saya
                  </Link>
                  <Link
                    href="/pengaturan"
                    id="admin-dropdown-pengaturan"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--blusukan-surface-low)]"
                    style={{ color: "var(--blusukan-on-surface)" }}
                  >
                    <Settings size={15} style={{ color: "var(--blusukan-on-surface-variant)" }} />
                    Pengaturan
                  </Link>
                  <button
                    id="admin-dropdown-logout"
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      signOut({ callbackUrl: "/login" });
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-[color-mix(in_srgb,var(--blusukan-error)_10%,transparent)]"
                    style={{ color: "var(--blusukan-error)" }}
                  >
                    <LogOut size={15} />
                    Keluar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
