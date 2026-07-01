"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nama: "",
    email: "",
    telepon: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Password tidak cocok.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nama: form.nama,
        email: form.email,
        telepon: form.telepon,
        password: form.password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Terjadi kesalahan.");
      setLoading(false);
      return;
    }

    router.push("/login?registered=true");
  }

  const fields = [
    { name: "nama", label: "Nama Lengkap", type: "text", placeholder: "Nama kamu", required: true },
    { name: "email", label: "Email", type: "email", placeholder: "email@contoh.com", required: true },
    { name: "telepon", label: "No. Telepon (opsional)", type: "tel", placeholder: "08xxxxxxxxxx", required: false },
    { name: "password", label: "Password", type: "password", placeholder: "Min. 8 karakter", required: true },
    { name: "confirmPassword", label: "Konfirmasi Password", type: "password", placeholder: "Ulangi password", required: true },
  ];

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex flex-col justify-center px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="font-bold text-3xl text-[#154212]" style={{ fontFamily: "Montserrat, sans-serif" }}>
          Blusukan
        </h1>
        <p className="text-[#42493e] text-sm mt-1">Jelajahi hidden gem Yogyakarta</p>
      </div>

      <div className="bg-white rounded-lg border border-[#c2c9bb] p-6">
        <h2 className="font-bold text-xl text-[#1a1c1c] mb-6" style={{ fontFamily: "Montserrat, sans-serif" }}>
          Buat Akun
        </h2>

        {error && (
          <div className="bg-[#ffdad6] text-[#ba1a1a] text-sm rounded p-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-xs font-bold text-[#42493e] uppercase tracking-wide mb-1">
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={form[field.name as keyof typeof form]}
                onChange={handleChange}
                placeholder={field.placeholder}
                required={field.required}
                className="w-full border border-[#72796e] px-3 py-2 rounded text-[#1a1c1c] bg-white focus:outline-none focus:ring-2 focus:ring-[#2d5a27] text-sm"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2d5a27] text-white font-bold py-2.5 rounded hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Daftar"}
          </button>
        </form>

        <p className="text-center text-sm text-[#42493e] mt-4">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-[#154212] font-bold">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
