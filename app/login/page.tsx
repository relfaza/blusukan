"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Compass } from "lucide-react";

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
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-10"
      style={{ backgroundColor: "var(--blusukan-surface-low)", fontFamily: "Inter, sans-serif" }}
    >
      <div
        className="relative w-full max-w-6xl flex flex-col lg:flex-row rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden"
        style={{
          backgroundColor: "var(--blusukan-surface-container-lowest)",
          boxShadow: "0 30px 60px -20px rgba(31,77,44,0.25), 0 10px 24px -8px rgba(0,0,0,0.08)",
        }}
      >
        {/* Ikon kompas — pojok kanan atas keseluruhan card */}
        <Link
          href="/"
          aria-label="Kembali ke beranda"
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30 w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-105"
          style={{
            backgroundColor: "var(--blusukan-primary)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
            color: "#ffffff",
          }}
        >
          <Compass size={18} strokeWidth={2} />
        </Link>

        {/* Panel kiri — Foto (mobile: strip atas ~32vh, desktop: separuh card) */}
        <div className="relative h-[32vh] lg:h-auto lg:w-1/2 overflow-hidden">
          <Image
            src="/prambanan.jpg"
            alt="Siluet Candi Prambanan saat golden hour dengan gunung di belakang"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />

          {/* Overlay gradient hijau tua — gelap di bawah-kiri, transparan di atas-kanan */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top right, rgba(15,33,20,0.92) 0%, rgba(31,77,44,0.6) 42%, rgba(31,77,44,0.08) 78%)",
            }}
          />

          {/* Aksen dekoratif — lingkaran tipis overlap, mengambang di pojok bawah panel foto */}
          <div
            className="absolute -bottom-6 -left-6 w-24 h-24 lg:w-36 lg:h-36 rounded-full pointer-events-none"
            style={{ border: "1px solid rgba(255,255,255,0.22)" }}
          />
          <div
            className="absolute bottom-2 left-8 lg:left-12 w-14 h-14 lg:w-20 lg:h-20 rounded-full pointer-events-none"
            style={{ border: "1px solid rgba(255,255,255,0.32)" }}
          />
          <div
            className="absolute bottom-8 lg:bottom-14 left-0 lg:left-1 w-9 h-9 lg:w-12 lg:h-12 rounded-full pointer-events-none"
            style={{ border: "1px solid rgba(255,255,255,0.42)" }}
          />

          {/* Konten: brand + headline */}
          <div className="relative z-10 h-full flex flex-col justify-between p-4 sm:p-6 lg:p-12">
            <span
              className="text-white text-base sm:text-lg lg:text-2xl font-bold"
              style={{ fontFamily: "Montserrat, sans-serif", textShadow: "0 1px 4px rgba(0,0,0,0.35)" }}
            >
              Blusukan
            </span>

            <div>
              <h2
                className="text-white text-lg sm:text-2xl lg:text-4xl xl:text-5xl leading-[1.15] mb-1.5 lg:mb-4"
                style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 900, textShadow: "0 2px 6px rgba(0,0,0,0.35)" }}
              >
                Temukan Permata<br />Tersembunyi.
              </h2>
              <p
                className="text-white/80 text-[11px] sm:text-sm lg:text-base leading-relaxed"
                style={{ textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}
              >
                Destinasi wisata hidden gem Yogyakarta<br />yang menanti untuk dijelajahi.
              </p>
            </div>
          </div>
        </div>

        {/* Divider organik — versi vertikal (desktop) */}
        <svg
          className="hidden lg:block absolute top-0 h-full w-20 z-20"
          style={{ left: "calc(50% - 40px)" }}
          viewBox="0 0 80 800"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M40,0 C10,90 65,160 35,260 C8,350 68,430 38,540 C12,630 66,700 40,800 L80,800 L80,0 Z"
            fill="var(--blusukan-surface-container-lowest)"
          />
        </svg>

        {/* Divider organik — versi horizontal (mobile) */}
        <svg
          className="lg:hidden absolute left-0 w-full h-10 z-20"
          style={{ top: "calc(32vh - 20px)" }}
          viewBox="0 0 800 80"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,40 C90,10 160,65 260,35 C350,8 430,68 540,38 C630,12 700,66 800,40 L800,80 L0,80 Z"
            fill="var(--blusukan-surface-container-lowest)"
          />
        </svg>

        {/* Panel kanan — Form */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 py-10 lg:px-16 relative z-10">
          <div className="w-full max-w-sm">

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
    </div>
  );
}
