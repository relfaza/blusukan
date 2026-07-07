"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Email atau password salah.");
        setLoading(false);
        return;
      }

      if (data.role === "ADMIN") {
        router.push("/dashboard");
      } else if (data.role === "PENGELOLA") {
        router.push("/pengelola");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  }

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
        {/* Overlay tekstur halus */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 80%, #a8d5a2 0%, transparent 50%), radial-gradient(circle at 80% 20%, #6dbe8a 0%, transparent 50%)",
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <span
            className="text-white text-2xl font-bold"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Blusukan
          </span>
        </div>

        {/* Tagline bawah */}
        <div className="relative z-10">
          <h2
            className="text-white text-4xl font-bold leading-tight mb-4"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Temukan Permata<br />Tersembunyi.
          </h2>
          <p className="text-white/70 text-base leading-relaxed">
            Destinasi wisata hidden gem Yogyakarta<br />yang menanti untuk dijelajahi.
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

          {/* Heading */}
          <h1
            className="text-2xl font-bold mb-1"
            style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
          >
            Masuk
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Selamat datang kembali
          </p>

          {/* Sukses reset password */}
          {resetSuccess && (
            <div
              className="text-sm rounded-lg px-4 py-3 mb-6"
              style={{
                backgroundColor: "var(--blusukan-surface-container-lowest)",
                border: "1px solid var(--blusukan-outline-variant)",
                color: "var(--blusukan-on-surface)",
                borderRadius: "8px",
              }}
            >
              Password berhasil direset. Silakan masuk dengan password baru Anda.
            </div>
          )}

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
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--blusukan-on-surface)" }}
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@contoh.com"
                required
                className="w-full px-3.5 py-2.5 text-sm transition-colors"
                style={{
                  border: "1px solid var(--blusukan-outline-variant)",
                  borderRadius: "8px",
                  backgroundColor: "var(--blusukan-surface-container-lowest)",
                  color: "var(--blusukan-on-surface)",
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--blusukan-primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--blusukan-outline-variant)")}
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium"
                  style={{ color: "var(--blusukan-on-surface)" }}
                >
                  Password
                </label>
                <Link
                  href="/lupa-password"
                  className="text-xs font-medium hover:underline"
                  style={{ color: "var(--blusukan-primary)" }}
                >
                  Lupa Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2.5 pr-11 text-sm transition-colors"
                  style={{
                    border: "1px solid var(--blusukan-outline-variant)",
                    borderRadius: "8px",
                    backgroundColor: "var(--blusukan-surface-container-lowest)",
                    color: "var(--blusukan-on-surface)",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--blusukan-primary)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--blusukan-outline-variant)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--blusukan-on-surface-variant)" }}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full font-semibold py-2.5 transition-opacity mt-2"
              style={{
                backgroundColor: "var(--blusukan-primary)",
                color: "var(--blusukan-on-primary)",
                borderRadius: "8px",
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          {/* Link daftar */}
          <p
            className="text-center text-sm mt-6"
            style={{ color: "var(--blusukan-on-surface-variant)" }}
          >
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-semibold hover:underline"
              style={{ color: "var(--blusukan-primary)" }}
            >
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
