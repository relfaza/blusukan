"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { signOut } from "next-auth/react";

type PengaturanData = {
  name: string;
  email: string;
  phone: string | null;
  notifStatusTransaksiAktif: boolean;
  notifStatusBookingAktif: boolean;
  notifLainnyaAktif: boolean;
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

export default function PengaturanWisatawanClient() {
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
  const [notifStatusTransaksiAktif, setNotifStatusTransaksiAktif] = useState(true);
  const [notifStatusBookingAktif, setNotifStatusBookingAktif] = useState(true);
  const [notifLainnyaAktif, setNotifLainnyaAktif] = useState(true);
  const [savingNotif, setSavingNotif] = useState(false);
  const [notifMessage, setNotifMessage] = useState<Message>(null);

  useEffect(() => {
    async function loadPengaturan() {
      try {
        const res = await fetch("/api/pengaturan-wisatawan");
        const json = await res.json();
        if (res.ok) {
          setData(json.user);
          setName(json.user.name ?? "");
          setPhone(json.user.phone ?? "");
          setNotifStatusTransaksiAktif(json.user.notifStatusTransaksiAktif ?? true);
          setNotifStatusBookingAktif(json.user.notifStatusBookingAktif ?? true);
          setNotifLainnyaAktif(json.user.notifLainnyaAktif ?? true);
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

  async function handleToggleNotif(
    key: "notifStatusTransaksiAktif" | "notifStatusBookingAktif" | "notifLainnyaAktif"
  ) {
    const setters = {
      notifStatusTransaksiAktif: setNotifStatusTransaksiAktif,
      notifStatusBookingAktif: setNotifStatusBookingAktif,
      notifLainnyaAktif: setNotifLainnyaAktif,
    } as const;
    const current = { notifStatusTransaksiAktif, notifStatusBookingAktif, notifLainnyaAktif }[key];
    const next = !current;

    setters[key](next);
    setNotifMessage(null);
    setSavingNotif(true);
    try {
      const res = await fetch("/api/pengaturan-wisatawan", {
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
      {/* ── Header — panel gradient brand ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, var(--blusukan-primary) 0%, color-mix(in srgb, var(--blusukan-primary) 62%, var(--blusukan-tertiary) 38%) 100%)",
        }}
      >
        <div
          className="absolute -top-20 -right-10 w-64 h-64 rounded-full blur-3xl opacity-25 pointer-events-none"
          style={{ background: "var(--blusukan-primary-fixed-dim)" }}
        />
        <div className="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          <Link
            href="/"
            id="pengaturan-wisatawan-back"
            className="inline-flex items-center gap-1.5 text-sm font-semibold mb-6 hover:opacity-70 transition-opacity"
            style={{ color: "var(--blusukan-on-primary)" }}
          >
            <ArrowLeft size={16} />
            Kembali
          </Link>
          <h1
            className="text-3xl font-black tracking-tight"
            style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-primary)" }}
          >
            Pengaturan
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--blusukan-primary-container)" }}>
            Kelola akun, keamanan, dan preferensi Wisatawan.
          </p>
        </div>
      </div>

      {/* relative z-10 wajib: header di atas ber-position:relative, tanpa ini konten tertimpa */}
      <div className="relative z-10 max-w-xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-12 space-y-6">
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
                    htmlFor="pengaturan-wisatawan-email"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--blusukan-on-surface)" }}
                  >
                    Email
                  </label>
                  <input
                    id="pengaturan-wisatawan-email"
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
                    htmlFor="pengaturan-wisatawan-name"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--blusukan-on-surface)" }}
                  >
                    Nama
                  </label>
                  <input
                    id="pengaturan-wisatawan-name"
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
                    htmlFor="pengaturan-wisatawan-phone"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--blusukan-on-surface)" }}
                  >
                    Nomor Telepon
                  </label>
                  <input
                    id="pengaturan-wisatawan-phone"
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
                  id="pengaturan-wisatawan-akun-save"
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
                    htmlFor="pengaturan-wisatawan-password-current"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--blusukan-on-surface)" }}
                  >
                    Password Lama
                  </label>
                  <input
                    id="pengaturan-wisatawan-password-current"
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
                    htmlFor="pengaturan-wisatawan-password-new"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--blusukan-on-surface)" }}
                  >
                    Password Baru
                  </label>
                  <input
                    id="pengaturan-wisatawan-password-new"
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
                    htmlFor="pengaturan-wisatawan-password-confirm"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--blusukan-on-surface)" }}
                  >
                    Konfirmasi Password Baru
                  </label>
                  <input
                    id="pengaturan-wisatawan-password-confirm"
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
                  id="pengaturan-wisatawan-password-save"
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
                  id="pengaturan-wisatawan-notif-transaksi-toggle"
                  label="Terima notifikasi status transaksi"
                  description="Dapatkan notifikasi saat status transaksi Anda berubah."
                  checked={notifStatusTransaksiAktif}
                  disabled={savingNotif}
                  onToggle={() => handleToggleNotif("notifStatusTransaksiAktif")}
                />
                <NotifToggle
                  id="pengaturan-wisatawan-notif-booking-toggle"
                  label="Terima notifikasi status booking transport"
                  description="Dapatkan notifikasi saat status booking transport Anda berubah."
                  checked={notifStatusBookingAktif}
                  disabled={savingNotif}
                  onToggle={() => handleToggleNotif("notifStatusBookingAktif")}
                />
                <NotifToggle
                  id="pengaturan-wisatawan-notif-lainnya-toggle"
                  label="Terima notifikasi lainnya"
                  description="Dapatkan notifikasi lain seputar aktivitas Anda di Blusukan."
                  checked={notifLainnyaAktif}
                  disabled={savingNotif}
                  onToggle={() => handleToggleNotif("notifLainnyaAktif")}
                />
              </div>
            </div>

            {/* Keluar */}
            <button
              id="pengaturan-wisatawan-logout"
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
