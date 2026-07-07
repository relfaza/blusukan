"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Bell } from "lucide-react";
import RiwayatTransaksiList, { type RiwayatTransaksiItem } from "./RiwayatTransaksiList";

type NotifikasiItem = {
  id: string;
  judul: string;
  pesan: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

type Tab = "notifikasi" | "riwayat";

// Waktu relatif ringkas ala "2 jam lalu"
function formatRelativeTime(iso: string): string {
  const diffSec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diffSec < 60) return "Baru saja";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function NotifikasiPageClient({
  transaksis,
  role,
}: {
  transaksis: RiwayatTransaksiItem[];
  role: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPengelola = role === "PENGELOLA";
  const initialTab: Tab = !isPengelola && searchParams.get("tab") === "riwayat" ? "riwayat" : "notifikasi";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [notifications, setNotifications] = useState<NotifikasiItem[] | null>(null);

  useEffect(() => {
    fetch("/api/notifikasi")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => setNotifications([]));
  }, []);

  function selectTab(next: Tab) {
    setTab(next);
    router.replace(next === "riwayat" ? "/notifikasi?tab=riwayat" : "/notifikasi");
  }

  async function handleNotifClick(n: NotifikasiItem) {
    if (!n.isRead) {
      setNotifications((prev) =>
        prev ? prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item)) : prev
      );
      fetch("/api/notifikasi", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: n.id }),
      }).catch(() => {});
    }
    if (n.link) {
      router.push(n.link);
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "notifikasi", label: "Notifikasi" },
    { key: "riwayat", label: "Riwayat Transaksi" },
  ];

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}
    >
      <div className="max-w-3xl mx-auto px-4 lg:px-8 py-10">
        <Link
          href="/"
          id="notifikasi-back-home"
          className="inline-flex items-center gap-1.5 text-sm font-semibold mb-4 hover:opacity-70 transition-opacity"
          style={{ color: "var(--blusukan-primary)" }}
        >
          <ArrowLeft size={16} />
          Kembali ke Beranda
        </Link>
        <h1
          className="text-2xl font-bold mb-6"
          style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
        >
          {isPengelola ? "Notifikasi" : "Notifikasi & Riwayat Transaksi"}
        </h1>

        {!isPengelola && (
          <div className="flex items-center gap-2 mb-6">
            {tabs.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  id={`tab-${t.key}`}
                  onClick={() => selectTab(t.key)}
                  className="px-4 py-2 rounded-full text-sm font-semibold transition-colors"
                  style={{
                    background: active ? "var(--blusukan-primary)" : "#ffffff",
                    color: active ? "var(--blusukan-on-primary)" : "var(--blusukan-on-surface-variant)",
                    border: `1px solid ${active ? "var(--blusukan-primary)" : "var(--blusukan-outline-variant)"}`,
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        )}

        {tab === "notifikasi" ? (
          notifications === null ? (
            <p className="text-sm text-center py-10" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Memuat notifikasi...
            </p>
          ) : notifications.length === 0 ? (
            <div
              className="rounded-2xl p-10 flex flex-col items-center text-center"
              style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
            >
              <Bell size={40} style={{ color: "var(--blusukan-outline)" }} className="mb-3" />
              <p className="text-sm font-medium" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                Belum ada notifikasi
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  id={`notifikasi-item-${n.id}`}
                  onClick={() => handleNotifClick(n)}
                  className="w-full text-left rounded-2xl p-4 transition-colors hover:opacity-90"
                  style={{
                    background: n.isRead ? "#ffffff" : "var(--blusukan-primary-container)",
                    border: "1px solid var(--blusukan-outline-variant)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    {!n.isRead && (
                      <span
                        className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                        style={{ background: "var(--blusukan-primary)" }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-bold"
                        style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
                      >
                        {n.judul}
                      </p>
                      <p className="text-sm mt-0.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                        {n.pesan}
                      </p>
                      <p className="text-xs mt-1.5" style={{ color: "var(--blusukan-outline)" }}>
                        {formatRelativeTime(n.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )
        ) : (
          <RiwayatTransaksiList transaksis={transaksis} />
        )}
      </div>
    </div>
  );
}
