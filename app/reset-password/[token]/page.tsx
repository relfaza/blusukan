"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Terjadi kesalahan. Coba lagi.");
        setLoading(false);
        return;
      }

      router.push("/login?reset=success");
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
          </div>

          {/* Heading */}
          <h1
            className="text-2xl font-bold mb-1"
            style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
          >
            Atur Ulang Password
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Masukkan password baru Anda.
          </p>

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
              {error.includes("kedaluwarsa") && (
                <div className="mt-2">
                  <Link
                    href="/lupa-password"
                    className="font-semibold hover:underline"
                    style={{ color: "var(--blusukan-error)" }}
                  >
                    Minta link baru
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="reset-new-password"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--blusukan-on-surface)" }}
              >
                Password Baru
              </label>
              <input
                id="reset-new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
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

            <div>
              <label
                htmlFor="reset-confirm-password"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--blusukan-on-surface)" }}
              >
                Konfirmasi Password Baru
              </label>
              <input
                id="reset-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
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

            <button
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
              {loading ? "Memproses..." : "Atur Ulang Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
