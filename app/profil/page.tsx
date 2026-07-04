"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

const ROLE_LABEL: Record<string, string> = {
  WISATAWAN: "Wisatawan",
  PENGELOLA: "Pengelola Lokal",
  ADMIN: "Admin",
};

type ProfilData = {
  name: string;
  email: string;
  phone: string | null;
  role: string;
};

type RingkasanPengelola = {
  totalDestinasiDikelola: number;
  totalDisetujui: number;
  totalMenunggu: number;
  totalTransaksiSelesai: number;
};

export default function ProfilPage() {
  const [profil, setProfil] = useState<ProfilData | null>(null);
  const [loadingProfil, setLoadingProfil] = useState(true);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfil, setSavingProfil] = useState(false);
  const [profilMessage, setProfilMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [ringkasan, setRingkasan] = useState<RingkasanPengelola | null>(null);
  const [loadingRingkasan, setLoadingRingkasan] = useState(false);

  useEffect(() => {
    async function loadProfil() {
      try {
        const res = await fetch("/api/profil");
        const data = await res.json();
        if (res.ok) {
          setProfil(data.user);
          setName(data.user.name ?? "");
          setPhone(data.user.phone ?? "");
        }
      } finally {
        setLoadingProfil(false);
      }
    }
    loadProfil();
  }, []);

  useEffect(() => {
    if (profil?.role !== "PENGELOLA") return;

    async function loadRingkasan() {
      setLoadingRingkasan(true);
      try {
        const res = await fetch("/api/profil/ringkasan-pengelola");
        const data = await res.json();
        if (res.ok) {
          setRingkasan(data);
        }
      } finally {
        setLoadingRingkasan(false);
      }
    }
    loadRingkasan();
  }, [profil?.role]);

  async function handleSaveProfil(e: React.FormEvent) {
    e.preventDefault();
    setProfilMessage(null);

    if (!name.trim()) {
      setProfilMessage({ type: "error", text: "Nama tidak boleh kosong." });
      return;
    }

    setSavingProfil(true);
    try {
      const res = await fetch("/api/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();

      if (!res.ok) {
        setProfilMessage({ type: "error", text: data.message || "Gagal menyimpan perubahan." });
        return;
      }

      setProfil(data.user);
      setProfilMessage({ type: "success", text: "Perubahan berhasil disimpan." });
    } catch {
      setProfilMessage({ type: "error", text: "Terjadi kesalahan. Coba lagi." });
    } finally {
      setSavingProfil(false);
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
      const data = await res.json();

      if (!res.ok) {
        setPasswordMessage({ type: "error", text: data.message || "Gagal mengubah password." });
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

  return (
    <div
      className="min-h-screen px-4 py-8 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}
    >
      <div className="max-w-xl mx-auto space-y-6">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
        >
          Profil Saya
        </h1>

        {loadingProfil ? (
          <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Memuat data profil...
          </p>
        ) : !profil ? (
          <p className="text-sm" style={{ color: "var(--blusukan-error)" }}>
            Gagal memuat data profil. Silakan muat ulang halaman.
          </p>
        ) : (
          <>
            {profil.role === "PENGELOLA" && (
              <div
                className="p-5 sm:p-6"
                style={{
                  backgroundColor: "var(--blusukan-surface-container-lowest)",
                  border: "1px solid var(--blusukan-outline-variant)",
                  borderRadius: "16px",
                }}
              >
                <h2
                  className="text-base font-semibold mb-4"
                  style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
                >
                  Ringkasan Pengelola
                </h2>

                {loadingRingkasan ? (
                  <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                    Memuat ringkasan...
                  </p>
                ) : !ringkasan ? (
                  <p className="text-sm" style={{ color: "var(--blusukan-error)" }}>
                    Gagal memuat ringkasan pengelola.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { label: "Destinasi Dikelola", value: ringkasan.totalDestinasiDikelola },
                      { label: "Disetujui", value: ringkasan.totalDisetujui },
                      { label: "Menunggu Persetujuan", value: ringkasan.totalMenunggu },
                      { label: "Transaksi Selesai", value: ringkasan.totalTransaksiSelesai },
                    ].map((kpi) => (
                      <div
                        key={kpi.label}
                        className="p-3.5"
                        style={{
                          backgroundColor: "var(--blusukan-surface-container)",
                          border: "1px solid var(--blusukan-outline-variant)",
                          borderRadius: "12px",
                        }}
                      >
                        <p
                          className="text-xl font-bold"
                          style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-primary)" }}
                        >
                          {kpi.value}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                          {kpi.label}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <Link
                  href="/pengelola"
                  className="inline-block w-full sm:w-auto text-center font-semibold px-6 py-2.5 transition-opacity"
                  style={{
                    backgroundColor: "var(--blusukan-primary)",
                    color: "var(--blusukan-on-primary)",
                    borderRadius: "8px",
                  }}
                >
                  Buka Dashboard Pengelola
                </Link>
              </div>
            )}

            {/* Card: Info profil + form edit */}
            <div
              className="p-5 sm:p-6"
              style={{
                backgroundColor: "var(--blusukan-surface-container-lowest)",
                border: "1px solid var(--blusukan-outline-variant)",
                borderRadius: "16px",
              }}
            >
              <h2
                className="text-base font-semibold mb-4"
                style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
              >
                Informasi Akun
              </h2>

              {profilMessage && (
                <div
                  className="text-sm rounded-lg px-4 py-3 mb-4"
                  style={{
                    backgroundColor:
                      profilMessage.type === "success"
                        ? "var(--blusukan-primary-container)"
                        : "var(--blusukan-error-container)",
                    color:
                      profilMessage.type === "success"
                        ? "var(--blusukan-on-primary-container)"
                        : "var(--blusukan-error)",
                    borderRadius: "8px",
                  }}
                >
                  {profilMessage.text}
                </div>
              )}

              <form onSubmit={handleSaveProfil} className="space-y-4">
                <div>
                  <label
                    htmlFor="profil-email"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--blusukan-on-surface)" }}
                  >
                    Email
                  </label>
                  <input
                    id="profil-email"
                    type="email"
                    value={profil.email}
                    readOnly
                    disabled
                    className="w-full px-3.5 py-2.5 text-sm"
                    style={readOnlyInputStyle}
                  />
                </div>

                <div>
                  <label
                    htmlFor="profil-role"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--blusukan-on-surface)" }}
                  >
                    Peran
                  </label>
                  <input
                    id="profil-role"
                    type="text"
                    value={ROLE_LABEL[profil.role] ?? profil.role}
                    readOnly
                    disabled
                    className="w-full px-3.5 py-2.5 text-sm"
                    style={readOnlyInputStyle}
                  />
                </div>

                <div>
                  <label
                    htmlFor="profil-name"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--blusukan-on-surface)" }}
                  >
                    Nama
                  </label>
                  <input
                    id="profil-name"
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
                    htmlFor="profil-phone"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--blusukan-on-surface)" }}
                  >
                    Nomor Telepon
                  </label>
                  <input
                    id="profil-phone"
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
                  id="profil-save"
                  type="submit"
                  disabled={savingProfil}
                  className="w-full sm:w-auto font-semibold px-6 py-2.5 transition-opacity"
                  style={{
                    backgroundColor: "var(--blusukan-primary)",
                    color: "var(--blusukan-on-primary)",
                    borderRadius: "8px",
                    opacity: savingProfil ? 0.6 : 1,
                    cursor: savingProfil ? "not-allowed" : "pointer",
                  }}
                >
                  {savingProfil ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </form>
            </div>

            {/* Card: Ubah password */}
            <div
              className="p-5 sm:p-6"
              style={{
                backgroundColor: "var(--blusukan-surface-container-lowest)",
                border: "1px solid var(--blusukan-outline-variant)",
                borderRadius: "16px",
              }}
            >
              <h2
                className="text-base font-semibold mb-4"
                style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
              >
                Ubah Password
              </h2>

              {passwordMessage && (
                <div
                  className="text-sm rounded-lg px-4 py-3 mb-4"
                  style={{
                    backgroundColor:
                      passwordMessage.type === "success"
                        ? "var(--blusukan-primary-container)"
                        : "var(--blusukan-error-container)",
                    color:
                      passwordMessage.type === "success"
                        ? "var(--blusukan-on-primary-container)"
                        : "var(--blusukan-error)",
                    borderRadius: "8px",
                  }}
                >
                  {passwordMessage.text}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label
                    htmlFor="password-current"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--blusukan-on-surface)" }}
                  >
                    Password Lama
                  </label>
                  <input
                    id="password-current"
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
                    htmlFor="password-new"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--blusukan-on-surface)" }}
                  >
                    Password Baru
                  </label>
                  <input
                    id="password-new"
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
                    htmlFor="password-confirm"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--blusukan-on-surface)" }}
                  >
                    Konfirmasi Password Baru
                  </label>
                  <input
                    id="password-confirm"
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
                  id="password-save"
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

            {/* Keluar */}
            <button
              id="profil-logout"
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
