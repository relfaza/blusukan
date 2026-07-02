"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Ikon mata (show/hide password)
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
}

// Ikon Wisatawan
function WisatawanIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

// Ikon Pengelola
function PengelolaIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
    </svg>
  );
}

type Role = "WISATAWAN" | "PENGELOLA";
type Stage = "role" | "form";

interface FormState {
  nama: string;
  email: string;
  telepon: string;
  nik: string;
  password: string;
  confirmPassword: string;
  consent: boolean;
}

const INITIAL_FORM: FormState = {
  nama: "",
  email: "",
  telepon: "",
  nik: "",
  password: "",
  confirmPassword: "",
  consent: false,
};

// Komponen input reusable
function FormField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  helperText,
  badge,
  rightSlot,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  helperText?: string;
  badge?: string;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <label
          htmlFor={id}
          className="block text-sm font-medium"
          style={{ color: "var(--blusukan-on-surface)" }}
        >
          {label}
        </label>
        {badge && (
          <span
            className="text-xs"
            style={{ color: "var(--blusukan-on-surface-variant)" }}
          >
            ({badge})
          </span>
        )}
      </div>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full px-3.5 py-2.5 text-sm transition-colors"
          style={{
            border: "1px solid var(--blusukan-outline-variant)",
            borderRadius: "8px",
            backgroundColor: "var(--blusukan-surface-container-lowest)",
            color: "var(--blusukan-on-surface)",
            outline: "none",
            paddingRight: rightSlot ? "2.75rem" : undefined,
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--blusukan-primary)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--blusukan-outline-variant)")}
        />
        {rightSlot && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>
        )}
      </div>
      {helperText && (
        <p className="text-xs mt-1.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          {helperText}
        </p>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("role");
  const [role, setRole] = useState<Role | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function setField(field: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleRoleSelect(r: Role) {
    setRole(r);
    setStage("form");
    setError("");
  }

  function handleBack() {
    setStage("role");
    setError("");
    setForm(INITIAL_FORM);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validasi password match (client-side, tidak submit ke API)
    if (form.password !== form.confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    // Validasi NIK Pengelola (client-side)
    if (role === "PENGELOLA") {
      if (!form.telepon) {
        setError("Nomor telepon wajib diisi untuk Pengelola Lokal.");
        return;
      }
      if (!/^\d{16}$/.test(form.nik)) {
        setError("NIK harus 16 digit angka.");
        return;
      }
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          nama: form.nama,
          email: form.email,
          telepon: form.telepon || undefined,
          nik: form.nik || undefined,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Terjadi kesalahan. Coba lagi.");
        setLoading(false);
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  }

  // ─── Tombol submit disabled jika consent belum dicentang ───
  const canSubmit = form.consent && !loading;

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}
    >
      {/* Panel kiri — Dekoratif (desktop only) */}
      {/* TODO: ganti gradient dengan foto hutan asli saat asset tersedia */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #1a3d22 0%, #1f4d2c 40%, #2e6b3e 70%, #3a8050 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 80%, #a8d5a2 0%, transparent 50%), radial-gradient(circle at 80% 20%, #6dbe8a 0%, transparent 50%)",
          }}
        />
        <div className="relative z-10">
          <span
            className="text-white text-2xl font-bold"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Blusukan
          </span>
        </div>
        <div className="relative z-10">
          <h2
            className="text-white text-4xl font-bold leading-tight mb-4"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Temukan Permata<br />Tersembunyi.
          </h2>
          <p className="text-white/70 text-base leading-relaxed">
            Bergabunglah dan mulai eksplorasi<br />destinasi hidden gem Yogyakarta.
          </p>
        </div>
      </div>

      {/* Panel kanan — Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-sm">

          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <span
              className="text-2xl font-bold"
              style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-primary)" }}
            >
              Blusukan
            </span>
            <p className="text-sm mt-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Temukan Permata Tersembunyi
            </p>
          </div>

          {/* ══════════════════════════════════════
              TAHAP 1 — Pilih Tipe Akun
          ══════════════════════════════════════ */}
          {stage === "role" && (
            <>
              <h1
                className="text-2xl font-bold mb-1"
                style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
              >
                Daftar Akun
              </h1>
              <p className="text-sm mb-8" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                Pilih tipe akun yang sesuai denganmu
              </p>

              <div className="space-y-4">
                {/* Kartu Wisatawan */}
                <button
                  id="role-wisatawan"
                  type="button"
                  onClick={() => handleRoleSelect("WISATAWAN")}
                  className="w-full text-left flex items-start gap-4 p-5 transition-all"
                  style={{
                    border: "1px solid var(--blusukan-outline-variant)",
                    borderRadius: "16px",
                    backgroundColor: "var(--blusukan-surface-container-lowest)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "var(--blusukan-primary-container)";
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--blusukan-primary)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "var(--blusukan-surface-container-lowest)";
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--blusukan-outline-variant)";
                  }}
                >
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5"
                    style={{ backgroundColor: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }}
                  >
                    <WisatawanIcon />
                  </div>
                  <div>
                    <p
                      className="font-semibold text-base mb-1"
                      style={{ color: "var(--blusukan-on-surface)" }}
                    >
                      Wisatawan
                    </p>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--blusukan-on-surface-variant)" }}
                    >
                      Jelajahi dan temukan destinasi hidden gem di Yogyakarta.
                    </p>
                  </div>
                </button>

                {/* Kartu Pengelola Lokal */}
                <button
                  id="role-pengelola"
                  type="button"
                  onClick={() => handleRoleSelect("PENGELOLA")}
                  className="w-full text-left flex items-start gap-4 p-5 transition-all"
                  style={{
                    border: "1px solid var(--blusukan-outline-variant)",
                    borderRadius: "16px",
                    backgroundColor: "var(--blusukan-surface-container-lowest)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "var(--blusukan-primary-container)";
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--blusukan-primary)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "var(--blusukan-surface-container-lowest)";
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--blusukan-outline-variant)";
                  }}
                >
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5"
                    style={{ backgroundColor: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }}
                  >
                    <PengelolaIcon />
                  </div>
                  <div>
                    <p
                      className="font-semibold text-base mb-1"
                      style={{ color: "var(--blusukan-on-surface)" }}
                    >
                      Pengelola Lokal
                    </p>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--blusukan-on-surface-variant)" }}
                    >
                      Daftarkan dan kelola destinasi wisata milikmu.
                    </p>
                  </div>
                </button>
              </div>

              <p
                className="text-center text-sm mt-8"
                style={{ color: "var(--blusukan-on-surface-variant)" }}
              >
                Sudah punya akun?{" "}
                <Link
                  href="/login"
                  className="font-semibold hover:underline"
                  style={{ color: "var(--blusukan-primary)" }}
                >
                  Masuk
                </Link>
              </p>
            </>
          )}

          {/* ══════════════════════════════════════
              TAHAP 2 — Form Register
          ══════════════════════════════════════ */}
          {stage === "form" && (
            <>
              {/* Tombol kembali */}
              <button
                id="register-back"
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 text-sm font-medium mb-6 hover:opacity-70 transition-opacity"
                style={{ color: "var(--blusukan-primary)" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Kembali
              </button>

              <h1
                className="text-2xl font-bold mb-1"
                style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
              >
                {role === "PENGELOLA" ? "Daftar Pengelola" : "Daftar Akun"}
              </h1>
              <p className="text-sm mb-8" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                {role === "PENGELOLA" ? "Akun Pengelola Lokal" : "Akun Wisatawan"}
              </p>

              {/* Error */}
              {error && (
                <div
                  className="text-sm rounded-lg px-4 py-3 mb-6"
                  style={{
                    backgroundColor: "var(--blusukan-error-container)",
                    color: "var(--blusukan-error)",
                    borderRadius: "8px",
                  }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nama Lengkap */}
                <FormField
                  id="reg-nama"
                  label="Nama Lengkap"
                  value={form.nama}
                  onChange={(v) => setField("nama", v)}
                  placeholder="Nama lengkapmu"
                  required
                />

                {/* Email */}
                <FormField
                  id="reg-email"
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(v) => setField("email", v)}
                  placeholder="email@contoh.com"
                  required
                />

                {/* Nomor Telepon */}
                <FormField
                  id="reg-telepon"
                  label="Nomor Telepon"
                  type="tel"
                  value={form.telepon}
                  onChange={(v) => setField("telepon", v)}
                  placeholder="08xxxxxxxxxx"
                  required={role === "PENGELOLA"}
                  badge={role === "PENGELOLA" ? "Wajib" : "Opsional"}
                />

                {/* NIK — hanya Pengelola */}
                {role === "PENGELOLA" && (
                  <FormField
                    id="reg-nik"
                    label="NIK"
                    type="text"
                    value={form.nik}
                    onChange={(v) => setField("nik", v.replace(/\D/g, "").slice(0, 16))}
                    placeholder="16 digit nomor KTP"
                    required
                    helperText="Data dienkripsi, hanya untuk verifikasi keaslian pengelola."
                  />
                )}

                {/* Password */}
                <FormField
                  id="reg-password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(v) => setField("password", v)}
                  placeholder="Min. 8 karakter"
                  required
                  helperText="Minimal 8 karakter."
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ color: "var(--blusukan-on-surface-variant)" }}
                      aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  }
                />

                {/* Konfirmasi Password */}
                <FormField
                  id="reg-confirm-password"
                  label="Konfirmasi Password"
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(v) => setField("confirmPassword", v)}
                  placeholder="Ulangi password"
                  required
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      style={{ color: "var(--blusukan-on-surface-variant)" }}
                      aria-label={showConfirm ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      <EyeIcon open={showConfirm} />
                    </button>
                  }
                />

                {/* Checkbox consent — wajib dicentang sebelum submit aktif */}
                <div className="flex items-start gap-3 pt-1">
                  <input
                    id="reg-consent"
                    type="checkbox"
                    checked={form.consent}
                    onChange={(e) => setField("consent", e.target.checked)}
                    className="mt-0.5 flex-shrink-0"
                    style={{
                      width: "16px",
                      height: "16px",
                      accentColor: "var(--blusukan-primary)",
                      cursor: "pointer",
                    }}
                  />
                  <label
                    htmlFor="reg-consent"
                    className="text-sm leading-relaxed cursor-pointer"
                    style={{ color: "var(--blusukan-on-surface-variant)" }}
                  >
                    Saya menyetujui{" "}
                    <Link
                      href="/syarat-ketentuan"
                      className="font-medium hover:underline"
                      style={{ color: "var(--blusukan-primary)" }}
                    >
                      Syarat & Ketentuan
                    </Link>{" "}
                    dan{" "}
                    <Link
                      href="/kebijakan-privasi"
                      className="font-medium hover:underline"
                      style={{ color: "var(--blusukan-primary)" }}
                    >
                      Kebijakan Privasi
                    </Link>
                  </label>
                </div>

                {/* Tombol submit — disabled jika consent belum dicentang */}
                <button
                  id="register-submit"
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full font-semibold py-2.5 transition-opacity mt-2"
                  style={{
                    backgroundColor: "var(--blusukan-primary)",
                    color: "var(--blusukan-on-primary)",
                    borderRadius: "8px",
                    opacity: canSubmit ? 1 : 0.45,
                    cursor: canSubmit ? "pointer" : "not-allowed",
                  }}
                >
                  {loading ? "Memproses..." : "Daftar"}
                </button>
              </form>

              <p
                className="text-center text-sm mt-6"
                style={{ color: "var(--blusukan-on-surface-variant)" }}
              >
                Sudah punya akun?{" "}
                <Link
                  href="/login"
                  className="font-semibold hover:underline"
                  style={{ color: "var(--blusukan-primary)" }}
                >
                  Masuk
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
