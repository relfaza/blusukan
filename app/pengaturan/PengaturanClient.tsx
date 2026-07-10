"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, FileText, Info } from "lucide-react";
import { signOut } from "next-auth/react";

const APP_VERSION = "v1.0";

const BAHASA_OPTIONS: { value: string; label: string }[] = [
  { value: "id", label: "Bahasa Indonesia" },
  { value: "en", label: "English" },
];

type PengaturanData = {
  name: string;
  email: string;
  phone: string | null;
  namaInstansi: string | null;
  notifEmailAktif: boolean;
  bahasaPreferensi: string;
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

export default function PengaturanClient() {
  const [data, setData] = useState<PengaturanData | null>(null);
  const [loading, setLoading] = useState(true);

  // Akun & Instansi
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [namaInstansi, setNamaInstansi] = useState("");
  const [savingAkun, setSavingAkun] = useState(false);
  const [akunMessage, setAkunMessage] = useState<Message>(null);

  // Password & Keamanan
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<Message>(null);

  // Preferensi Aplikasi
  const [bahasaPreferensi, setBahasaPreferensi] = useState("id");
  const [savingBahasa, setSavingBahasa] = useState(false);
  const [bahasaMessage, setBahasaMessage] = useState<Message>(null);

  // Preferensi Notifikasi
  const [notifEmailAktif, setNotifEmailAktif] = useState(true);
  const [savingNotif, setSavingNotif] = useState(false);
  const [notifMessage, setNotifMessage] = useState<Message>(null);

  useEffect(() => {
    async function loadPengaturan() {
      try {
        const res = await fetch("/api/pengaturan");
        const json = await res.json();
        if (res.ok) {
          setData(json.user);
          setName(json.user.name ?? "");
          setPhone(json.user.phone ?? "");
          setNamaInstansi(json.user.namaInstansi ?? "");
          setBahasaPreferensi(json.user.bahasaPreferensi ?? "id");
          setNotifEmailAktif(json.user.notifEmailAktif ?? true);
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
      const [profilRes, pengaturanRes] = await Promise.all([
        fetch("/api/profil", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone }),
        }),
        fetch("/api/pengaturan", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ namaInstansi }),
        }),
      ]);
      const profilData = await profilRes.json();
      const pengaturanData = await pengaturanRes.json();

      if (!profilRes.ok) {
        setAkunMessage({ type: "error", text: profilData.message || "Gagal menyimpan perubahan." });
        return;
      }
      if (!pengaturanRes.ok) {
        setAkunMessage({ type: "error", text: pengaturanData.message || "Gagal menyimpan perubahan." });
        return;
      }

      setData((prev) => (prev ? { ...prev, ...profilData.user, ...pengaturanData.user } : prev));
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

  async function handleSaveBahasa(e: React.FormEvent) {
    e.preventDefault();
    setBahasaMessage(null);
    setSavingBahasa(true);
    try {
      const res = await fetch("/api/pengaturan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bahasaPreferensi }),
      });
      const responseData = await res.json();
      if (!res.ok) {
        setBahasaMessage({ type: "error", text: responseData.message || "Gagal menyimpan preferensi bahasa." });
        return;
      }
      setBahasaMessage({ type: "success", text: "Preferensi bahasa disimpan." });
    } catch {
      setBahasaMessage({ type: "error", text: "Terjadi kesalahan. Coba lagi." });
    } finally {
      setSavingBahasa(false);
    }
  }

  async function handleToggleNotif() {
    const next = !notifEmailAktif;
    setNotifEmailAktif(next);
    setNotifMessage(null);
    setSavingNotif(true);
    try {
      const res = await fetch("/api/pengaturan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifEmailAktif: next }),
      });
      const responseData = await res.json();
      if (!res.ok) {
        setNotifEmailAktif(!next);
        setNotifMessage({ type: "error", text: responseData.message || "Gagal menyimpan preferensi notifikasi." });
        return;
      }
      setNotifMessage({ type: "success", text: "Preferensi notifikasi disimpan." });
    } catch {
      setNotifEmailAktif(!next);
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

  function focusPrimary(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.target.style.borderColor = "var(--blusukan-primary)";
  }
  function blurDefault(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.target.style.borderColor = "var(--blusukan-outline-variant)";
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: "var(--blusukan-surface-container-lowest)",
    border: "1px solid var(--blusukan-outline-variant)",
    borderRadius: "16px",
  };

  return (
    <div
      className="min-h-screen px-4 py-8 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}
    >
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <Link
            href="/dashboard"
            id="pengaturan-back"
            className="inline-flex items-center gap-1.5 text-sm font-semibold mb-3 hover:opacity-70 transition-opacity"
            style={{ color: "var(--blusukan-primary)" }}
          >
            <ArrowLeft size={16} />
            Kembali
          </Link>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
          >
            Pengaturan
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Kelola akun, keamanan, dan preferensi Administrator.
          </p>
        </div>

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
            {/* Akun & Instansi */}
            <div className="p-5 sm:p-6" style={cardStyle}>
              <CardTitle>Akun & Instansi</CardTitle>
              <MessageBanner message={akunMessage} />

              <form onSubmit={handleSaveAkun} className="space-y-4">
                <div>
                  <label
                    htmlFor="pengaturan-email"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--blusukan-on-surface)" }}
                  >
                    Email
                  </label>
                  <input
                    id="pengaturan-email"
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
                    htmlFor="pengaturan-name"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--blusukan-on-surface)" }}
                  >
                    Nama
                  </label>
                  <input
                    id="pengaturan-name"
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
                    htmlFor="pengaturan-phone"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--blusukan-on-surface)" }}
                  >
                    Nomor Telepon
                  </label>
                  <input
                    id="pengaturan-phone"
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

                <div>
                  <label
                    htmlFor="pengaturan-instansi"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--blusukan-on-surface)" }}
                  >
                    Nama Instansi
                  </label>
                  <input
                    id="pengaturan-instansi"
                    type="text"
                    value={namaInstansi}
                    onChange={(e) => setNamaInstansi(e.target.value)}
                    placeholder="mis. Dinas Pariwisata DIY"
                    className="w-full px-3.5 py-2.5 text-sm transition-colors"
                    style={inputStyle}
                    onFocus={focusPrimary}
                    onBlur={blurDefault}
                  />
                  <p className="text-xs mt-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                    Ditampilkan sebagai identitas instansi/Pokdarwis Anda sebagai Administrator.
                  </p>
                </div>

                <button
                  id="pengaturan-akun-save"
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
                    htmlFor="pengaturan-password-current"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--blusukan-on-surface)" }}
                  >
                    Password Lama
                  </label>
                  <input
                    id="pengaturan-password-current"
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
                    htmlFor="pengaturan-password-new"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--blusukan-on-surface)" }}
                  >
                    Password Baru
                  </label>
                  <input
                    id="pengaturan-password-new"
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
                    htmlFor="pengaturan-password-confirm"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--blusukan-on-surface)" }}
                  >
                    Konfirmasi Password Baru
                  </label>
                  <input
                    id="pengaturan-password-confirm"
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
                  id="pengaturan-password-save"
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

            {/* Preferensi Aplikasi */}
            <div className="p-5 sm:p-6" style={cardStyle}>
              <CardTitle>Preferensi Aplikasi</CardTitle>
              <MessageBanner message={bahasaMessage} />

              <form onSubmit={handleSaveBahasa} className="space-y-4">
                <div>
                  <label
                    htmlFor="pengaturan-bahasa"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--blusukan-on-surface)" }}
                  >
                    Bahasa Antarmuka
                  </label>
                  <select
                    id="pengaturan-bahasa"
                    value={bahasaPreferensi}
                    onChange={(e) => setBahasaPreferensi(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm transition-colors"
                    style={inputStyle}
                    onFocus={focusPrimary}
                    onBlur={blurDefault}
                  >
                    {BAHASA_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs mt-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                    Preferensi ini disimpan untuk mendukung lokalisasi bahasa antarmuka di masa mendatang.
                  </p>
                </div>

                <button
                  id="pengaturan-bahasa-save"
                  type="submit"
                  disabled={savingBahasa}
                  className="w-full sm:w-auto font-semibold px-6 py-2.5 transition-opacity"
                  style={{
                    backgroundColor: "var(--blusukan-primary)",
                    color: "var(--blusukan-on-primary)",
                    borderRadius: "8px",
                    opacity: savingBahasa ? 0.6 : 1,
                    cursor: savingBahasa ? "not-allowed" : "pointer",
                  }}
                >
                  {savingBahasa ? "Menyimpan..." : "Simpan Preferensi"}
                </button>
              </form>
            </div>

            {/* Preferensi Notifikasi */}
            <div className="p-5 sm:p-6" style={cardStyle}>
              <CardTitle>Preferensi Notifikasi</CardTitle>
              <MessageBanner message={notifMessage} />

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--blusukan-on-surface)" }}>
                    Terima notifikasi via email
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                    Fondasi untuk pengiriman notifikasi email di masa mendatang. Saat ini hanya menyimpan
                    preferensi Anda.
                  </p>
                </div>

                <button
                  id="pengaturan-notif-toggle"
                  type="button"
                  role="switch"
                  aria-checked={notifEmailAktif}
                  onClick={handleToggleNotif}
                  disabled={savingNotif}
                  className="relative shrink-0 w-11 h-6 rounded-full transition-colors disabled:opacity-60"
                  style={{
                    backgroundColor: notifEmailAktif ? "var(--blusukan-primary)" : "var(--blusukan-outline-variant)",
                  }}
                >
                  <span
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                    style={{ transform: notifEmailAktif ? "translateX(22px)" : "translateX(2px)" }}
                  />
                </button>
              </div>
            </div>

            {/* Tentang Aplikasi */}
            <div className="p-5 sm:p-6" style={cardStyle}>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <Info size={16} />
                  Tentang Aplikasi
                </span>
              </CardTitle>

              <div className="flex items-center justify-between py-2">
                <span className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                  Versi Aplikasi
                </span>
                <span className="text-sm font-semibold" style={{ color: "var(--blusukan-on-surface)" }}>
                  {APP_VERSION}
                </span>
              </div>

              <div className="mt-2 pt-2 space-y-1" style={{ borderTop: "1px solid var(--blusukan-outline-variant)" }}>
                <Link
                  href="/syarat-ketentuan"
                  className="flex items-center gap-2.5 py-2 text-sm hover:opacity-70 transition-opacity"
                  style={{ color: "var(--blusukan-on-surface)" }}
                >
                  <FileText size={15} style={{ color: "var(--blusukan-on-surface-variant)" }} />
                  Syarat & Ketentuan
                </Link>
                <Link
                  href="/kebijakan-privasi"
                  className="flex items-center gap-2.5 py-2 text-sm hover:opacity-70 transition-opacity"
                  style={{ color: "var(--blusukan-on-surface)" }}
                >
                  <ShieldCheck size={15} style={{ color: "var(--blusukan-on-surface-variant)" }} />
                  Kebijakan Privasi
                </Link>
              </div>
            </div>

            {/* Keluar */}
            <button
              id="pengaturan-logout"
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
