"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Store } from "lucide-react";
import { signOut } from "next-auth/react";

type PengaturanData = {
  name: string;
  email: string;
  phone: string | null;
  namaUsaha: string | null;
  notifTransaksiAktif: boolean;
  notifBookingAktif: boolean;
  notifUlasanAktif: boolean;
};

type Message = { type: "success" | "error"; text: string } | null;

function MessageBanner({ message }: { message: Message }) {
  if (!message) return null;
  return (
    <div
      className="text-sm rounded-lg px-4 py-3 mb-4"
      style={{
        backgroundColor:
          message.type === "success" ? "var(--blusukan-primary-container)" : "var(--blusukan-error-container)",
        color: message.type === "success" ? "var(--blusukan-on-primary-container)" : "var(--blusukan-error)",
        borderRadius: "8px",
      }}
    >
      {message.text}
    </div>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-base font-semibold mb-4"
      style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
    >
      {children}
    </h2>
  );
}

function NotifToggle({
  id,
  label,
  description,
  checked,
  disabled,
  onToggle,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div>
        <p className="text-sm font-medium" style={{ color: "var(--blusukan-on-surface)" }}>
          {label}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          {description}
        </p>
      </div>

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onToggle}
        disabled={disabled}
        className="relative shrink-0 w-11 h-6 rounded-full transition-colors disabled:opacity-60"
        style={{
          backgroundColor: checked ? "var(--blusukan-primary)" : "var(--blusukan-outline-variant)",
        }}
      >
        <span
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform"
          style={{ transform: checked ? "translateX(22px)" : "translateX(2px)" }}
        />
      </button>
    </div>
  );
}

export default function PengaturanPengelolaClient() {
  const [data, setData] = useState<PengaturanData | null>(null);
  const [loading, setLoading] = useState(true);

  // Akun & Kontak
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [savingAkun, setSavingAkun] = useState(false);
  const [akunMessage, setAkunMessage] = useState<Message>(null);

  // Password & Keamanan
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<Message>(null);

  // Preferensi Notifikasi
  const [notifTransaksiAktif, setNotifTransaksiAktif] = useState(true);
  const [notifBookingAktif, setNotifBookingAktif] = useState(true);
  const [notifUlasanAktif, setNotifUlasanAktif] = useState(true);
  const [savingNotif, setSavingNotif] = useState(false);
  const [notifMessage, setNotifMessage] = useState<Message>(null);

  // Info Bisnis
  const [namaUsaha, setNamaUsaha] = useState("");
  const [savingBisnis, setSavingBisnis] = useState(false);
  const [bisnisMessage, setBisnisMessage] = useState<Message>(null);

  useEffect(() => {
    async function loadPengaturan() {
      try {
        const res = await fetch("/api/pengaturan-pengelola");
        const json = await res.json();
        if (res.ok) {
          setData(json.user);
          setName(json.user.name ?? "");
          setPhone(json.user.phone ?? "");
          setNamaUsaha(json.user.namaUsaha ?? "");
          setNotifTransaksiAktif(json.user.notifTransaksiAktif ?? true);
          setNotifBookingAktif(json.user.notifBookingAktif ?? true);
          setNotifUlasanAktif(json.user.notifUlasanAktif ?? true);
        }
      } finally {
        setLoading(false);
      }
    }
    loadPengaturan();
  }, []);

  async function handleSaveAkun(e: React.FormEvent) {
    e.preventDefault();
    setAkunMessage(null);

    if (!name.trim()) {
      setAkunMessage({ type: "error", text: "Nama tidak boleh kosong." });
      return;
    }

    setSavingAkun(true);
    try {
      const res = await fetch("/api/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const responseData = await res.json();

      if (!res.ok) {
        setAkunMessage({ type: "error", text: responseData.message || "Gagal menyimpan perubahan." });
        return;
      }

      setData((prev) => (prev ? { ...prev, ...responseData.user } : prev));
      setAkunMessage({ type: "success", text: "Perubahan berhasil disimpan." });
    } catch {
      setAkunMessage({ type: "error", text: "Terjadi kesalahan. Coba lagi." });
    } finally {
      setSavingAkun(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "Password baru minimal 8 karakter." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Konfirmasi password baru tidak cocok." });
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/profil/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const responseData = await res.json();

      if (!res.ok) {
        setPasswordMessage({ type: "error", text: responseData.message || "Gagal mengubah password." });
        return;
      }

      setPasswordMessage({ type: "success", text: "Password berhasil diubah." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordMessage({ type: "error", text: "Terjadi kesalahan. Coba lagi." });
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleToggleNotif(key: "notifTransaksiAktif" | "notifBookingAktif" | "notifUlasanAktif") {
    const setters = {
      notifTransaksiAktif: setNotifTransaksiAktif,
      notifBookingAktif: setNotifBookingAktif,
      notifUlasanAktif: setNotifUlasanAktif,
    } as const;
    const current = { notifTransaksiAktif, notifBookingAktif, notifUlasanAktif }[key];
    const next = !current;

    setters[key](next);
    setNotifMessage(null);
    setSavingNotif(true);
    try {
      const res = await fetch("/api/pengaturan-pengelola", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: next }),
      });
      const responseData = await res.json();
      if (!res.ok) {
        setters[key](current);
        setNotifMessage({ type: "error", text: responseData.message || "Gagal menyimpan preferensi notifikasi." });
        return;
      }
      setNotifMessage({ type: "success", text: "Preferensi notifikasi disimpan." });
    } catch {
      setters[key](current);
      setNotifMessage({ type: "error", text: "Terjadi kesalahan. Coba lagi." });
    } finally {
      setSavingNotif(false);
    }
  }

  async function handleSaveBisnis(e: React.FormEvent) {
    e.preventDefault();
    setBisnisMessage(null);
    setSavingBisnis(true);
    try {
      const res = await fetch("/api/pengaturan-pengelola", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namaUsaha }),
      });
      const responseData = await res.json();
      if (!res.ok) {
        setBisnisMessage({ type: "error", text: responseData.message || "Gagal menyimpan info bisnis." });
        return;
      }
      setBisnisMessage({ type: "success", text: "Info bisnis disimpan." });
    } catch {
      setBisnisMessage({ type: "error", text: "Terjadi kesalahan. Coba lagi." });
    } finally {
      setSavingBisnis(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    border: "1px solid var(--blusukan-outline-variant)",
    borderRadius: "8px",
    backgroundColor: "var(--blusukan-surface-container-lowest)",
    color: "var(--blusukan-on-surface)",
    outline: "none",
  };

  const readOnlyInputStyle: React.CSSProperties = {
    ...inputStyle,
    backgroundColor: "var(--blusukan-surface-container)",
    color: "var(--blusukan-on-surface-variant)",
  };

  function focusPrimary(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = "var(--blusukan-primary)";
  }
  function blurDefault(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = "var(--blusukan-outline-variant)";
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: "var(--blusukan-surface-container-lowest)",
    border: "1px solid var(--blusukan-outline-variant)",
    borderRadius: "16px",
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}
    >
      {/* ── Header — heading sederhana di atas background cream ── */}
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          href="/pengelola"
          id="pengaturan-pengelola-back"
          className="inline-flex items-center gap-1.5 text-sm font-semibold mb-4 hover:opacity-70 transition-opacity"
          style={{ color: "var(--blusukan-primary)" }}
        >
          <ArrowLeft size={16} />
          Kembali
        </Link>
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
        >
          Pengaturan
        </h1>
        <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Kelola akun, keamanan, dan preferensi Pengelola.
        </p>
      </div>

      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 space-y-6">
        {loading ? (
          <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Memuat pengaturan...
          </p>
        ) : !data ? (
          <p className="text-sm" style={{ color: "var(--blusukan-error)" }}>
            Gagal memuat pengaturan. Silakan muat ulang halaman.
          </p>
        ) : (
          <>
            {/* Akun & Kontak */}
            <div className="p-5 sm:p-6" style={cardStyle}>
              <CardTitle>Akun & Kontak</CardTitle>
              <MessageBanner message={akunMessage} />

              <form onSubmit={handleSaveAkun} className="space-y-4">
                <div>
                  <label
                    htmlFor="pengaturan-pengelola-email"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--blusukan-on-surface)" }}
                  >
                    Email
                  </label>
                  <input
                    id="pengaturan-pengelola-email"
                    type="email"
                    value={data.email}
                    readOnly
                    disabled
                    className="w-full px-3.5 py-2.5 text-sm"
                    style={readOnlyInputStyle}
                  />
                </div>

                <div>
                  <label
                    htmlFor="pengaturan-pengelola-name"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--blusukan-on-surface)" }}
                  >
                    Nama
                  </label>
                  <input
                    id="pengaturan-pengelola-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-sm transition-colors"
                    style={inputStyle}
                    onFocus={focusPrimary}
                    onBlur={blurDefault}
                  />
                </div>

                <div>
                  <label
                    htmlFor="pengaturan-pengelola-phone"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--blusukan-on-surface)" }}
                  >
                    Nomor Telepon
                  </label>
                  <input
                    id="pengaturan-pengelola-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-3.5 py-2.5 text-sm transition-colors"
                    style={inputStyle}
                    onFocus={focusPrimary}
                    onBlur={blurDefault}
                  />
                </div>

                <button
                  id="pengaturan-pengelola-akun-save"
                  type="submit"
                  disabled={savingAkun}
                  className="w-full sm:w-auto font-semibold px-6 py-2.5 transition-opacity"
                  style={{
                    backgroundColor: "var(--blusukan-primary)",
                    color: "var(--blusukan-on-primary)",
                    borderRadius: "8px",
                    opacity: savingAkun ? 0.6 : 1,
                    cursor: savingAkun ? "not-allowed" : "pointer",
                  }}
                >
                  {savingAkun ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </form>
            </div>

            {/* Password & Keamanan */}
            <div className="p-5 sm:p-6" style={cardStyle}>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <ShieldCheck size={16} />
                  Password & Keamanan
                </span>
              </CardTitle>
              <MessageBanner message={passwordMessage} />

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label
                    htmlFor="pengaturan-pengelola-password-current"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--blusukan-on-surface)" }}
                  >
                    Password Lama
                  </label>
                  <input
                    id="pengaturan-pengelola-password-current"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-sm transition-colors"
                    style={inputStyle}
                    onFocus={focusPrimary}
                    onBlur={blurDefault}
                  />
                </div>

                <div>
                  <label
                    htmlFor="pengaturan-pengelola-password-new"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--blusukan-on-surface)" }}
                  >
                    Password Baru
                  </label>
                  <input
                    id="pengaturan-pengelola-password-new"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-3.5 py-2.5 text-sm transition-colors"
                    style={inputStyle}
                    onFocus={focusPrimary}
                    onBlur={blurDefault}
                  />
                  <p className="text-xs mt-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                    Minimal 8 karakter.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="pengaturan-pengelola-password-confirm"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--blusukan-on-surface)" }}
                  >
                    Konfirmasi Password Baru
                  </label>
                  <input
                    id="pengaturan-pengelola-password-confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-3.5 py-2.5 text-sm transition-colors"
                    style={inputStyle}
                    onFocus={focusPrimary}
                    onBlur={blurDefault}
                  />
                </div>

                <button
                  id="pengaturan-pengelola-password-save"
                  type="submit"
                  disabled={savingPassword}
                  className="w-full sm:w-auto font-semibold px-6 py-2.5 transition-opacity"
                  style={{
                    backgroundColor: "var(--blusukan-primary)",
                    color: "var(--blusukan-on-primary)",
                    borderRadius: "8px",
                    opacity: savingPassword ? 0.6 : 1,
                    cursor: savingPassword ? "not-allowed" : "pointer",
                  }}
                >
                  {savingPassword ? "Menyimpan..." : "Ubah Password"}
                </button>
              </form>
            </div>

            {/* Preferensi Notifikasi */}
            <div className="p-5 sm:p-6" style={cardStyle}>
              <CardTitle>Preferensi Notifikasi</CardTitle>
              <MessageBanner message={notifMessage} />

              <div className="divide-y" style={{ borderColor: "var(--blusukan-outline-variant)" }}>
                <NotifToggle
                  id="pengaturan-pengelola-notif-transaksi-toggle"
                  label="Transaksi baru"
                  description="Dapatkan notifikasi saat ada transaksi baru di destinasi Anda."
                  checked={notifTransaksiAktif}
                  disabled={savingNotif}
                  onToggle={() => handleToggleNotif("notifTransaksiAktif")}
                />
                <NotifToggle
                  id="pengaturan-pengelola-notif-booking-toggle"
                  label="Booking transport baru"
                  description="Dapatkan notifikasi saat ada booking transport baru."
                  checked={notifBookingAktif}
                  disabled={savingNotif}
                  onToggle={() => handleToggleNotif("notifBookingAktif")}
                />
                <NotifToggle
                  id="pengaturan-pengelola-notif-ulasan-toggle"
                  label="Ulasan baru"
                  description="Dapatkan notifikasi saat ada ulasan baru di destinasi Anda."
                  checked={notifUlasanAktif}
                  disabled={savingNotif}
                  onToggle={() => handleToggleNotif("notifUlasanAktif")}
                />
              </div>
            </div>

            {/* Info Bisnis */}
            <div className="p-5 sm:p-6" style={cardStyle}>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <Store size={16} />
                  Info Bisnis
                </span>
              </CardTitle>
              <MessageBanner message={bisnisMessage} />

              <form onSubmit={handleSaveBisnis} className="space-y-4">
                <div>
                  <label
                    htmlFor="pengaturan-pengelola-nama-usaha"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--blusukan-on-surface)" }}
                  >
                    Nama Usaha/Pokdarwis
                  </label>
                  <input
                    id="pengaturan-pengelola-nama-usaha"
                    type="text"
                    value={namaUsaha}
                    onChange={(e) => setNamaUsaha(e.target.value)}
                    placeholder="mis. Pokdarwis Sejahtera"
                    className="w-full px-3.5 py-2.5 text-sm transition-colors"
                    style={inputStyle}
                    onFocus={focusPrimary}
                    onBlur={blurDefault}
                  />
                  <p className="text-xs mt-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                    Opsional. Deskripsi singkat tentang komunitas/usaha yang Anda kelola.
                  </p>
                </div>

                <button
                  id="pengaturan-pengelola-bisnis-save"
                  type="submit"
                  disabled={savingBisnis}
                  className="w-full sm:w-auto font-semibold px-6 py-2.5 transition-opacity"
                  style={{
                    backgroundColor: "var(--blusukan-primary)",
                    color: "var(--blusukan-on-primary)",
                    borderRadius: "8px",
                    opacity: savingBisnis ? 0.6 : 1,
                    cursor: savingBisnis ? "not-allowed" : "pointer",
                  }}
                >
                  {savingBisnis ? "Menyimpan..." : "Simpan Info Bisnis"}
                </button>
              </form>
            </div>

            {/* Keluar */}
            <button
              id="pengaturan-pengelola-logout"
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full font-semibold py-2.5 transition-colors"
              style={{
                backgroundColor: "transparent",
                color: "var(--blusukan-error)",
                border: "1px solid var(--blusukan-error)",
                borderRadius: "8px",
              }}
            >
              Keluar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
