"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      } else {
        router.push("/");
      }
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex flex-col justify-center px-4">
      <div className="mb-8 text-center">
        <h1 className="font-bold text-3xl text-[#154212]" style={{ fontFamily: "Montserrat, sans-serif" }}>
          Blusukan
        </h1>
        <p className="text-[#42493e] text-sm mt-1">Jelajahi hidden gem Yogyakarta</p>
      </div>

      <div className="bg-white rounded-lg border border-[#c2c9bb] p-6">
        <h2 className="font-bold text-xl text-[#1a1c1c] mb-6" style={{ fontFamily: "Montserrat, sans-serif" }}>
          Masuk
        </h2>

        {error && (
          <div className="bg-[#ffdad6] text-[#ba1a1a] text-sm rounded p-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#42493e] uppercase tracking-wide mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@contoh.com"
              required
              className="w-full border border-[#72796e] px-3 py-2 rounded text-[#1a1c1c] bg-white focus:outline-none focus:ring-2 focus:ring-[#2d5a27] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#42493e] uppercase tracking-wide mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border border-[#72796e] px-3 py-2 rounded text-[#1a1c1c] bg-white focus:outline-none focus:ring-2 focus:ring-[#2d5a27] text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2d5a27] text-white font-bold py-2.5 rounded hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="text-center text-sm text-[#42493e] mt-4">
          Belum punya akun?{" "}
          <Link href="/register" className="text-[#154212] font-bold">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
