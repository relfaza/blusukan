import { auth } from "@/auth";
import AdminSidebar, { type AdminSidebarUser } from "@/components/admin-sidebar";

// Layout Admin: full sidebar kiri (tanpa header/footer global) + area konten kanan yang scroll independen.
// Membungkus SEMUA halaman di app/dashboard/**. Guard per-halaman tetap dipakai (requireAdminPage).
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const sessionUser = session?.user as { name?: string | null; role?: string } | undefined;
  const user: AdminSidebarUser = sessionUser
    ? { name: sessionUser.name ?? null, role: sessionUser.role ?? null }
    : null;

  return (
    <div className="flex h-[100dvh] overflow-hidden" style={{ background: "var(--blusukan-surface)" }}>
      <AdminSidebar user={user} />
      <main className="flex-1 min-w-0 overflow-y-auto pt-16 lg:pt-0">{children}</main>
    </div>
  );
}
