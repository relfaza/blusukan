"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bike, Car, Compass, MapPin, Phone, SlidersHorizontal, Wallet } from "lucide-react";

type ServiceItem = {
  id: string;
  providerName: string;
  serviceType: string;
  contactWa: string;
  baseRate: number;
  destination: { id: string; name: string };
};

type DestinationOption = { id: string; name: string; kabupaten: string };

const KABUPATEN_LABEL: Record<string, string> = {
  SLEMAN: "Sleman",
  GUNUNGKIDUL: "Gunungkidul",
  BANTUL: "Bantul",
  KULON_PROGO: "Kulon Progo",
  KOTA_YOGYAKARTA: "Kota Yogyakarta",
};

interface Props {
  services: ServiceItem[];
  destinations: DestinationOption[];
}

const SERVICE_TYPE_LABEL: Record<string, string> = {
  OJEK: "Ojek Lokal",
  JEEP: "Sewa Jeep",
  GUIDE: "Pemandu Wisata",
};

const SERVICE_TYPE_STYLE: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
  OJEK: { bg: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)", icon: <Bike size={13} /> },
  JEEP: { bg: "var(--blusukan-secondary-container)", color: "var(--blusukan-secondary)", icon: <Car size={13} /> },
  GUIDE: { bg: "#e0ecfd", color: "#1d4ed8", icon: <Compass size={13} /> },
};

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function BookingListClient({ services, destinations }: Props) {
  const [destinationFilter, setDestinationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const filtered = useMemo(() => {
    return services.filter((s) => {
      if (destinationFilter && s.destination.id !== destinationFilter) return false;
      if (typeFilter && s.serviceType !== typeFilter) return false;
      return true;
    });
  }, [services, destinationFilter, typeFilter]);

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}
    >
      {/* ── Header — heading sederhana di atas background cream ── */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-10">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
        >
          Booking Jasa Transportasi Lokal
        </h1>
        <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Pesan ojek, sewa jeep, atau pemandu wisata dari warga lokal terverifikasi
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-8 pb-12">

        {/* ── Filter bar ── */}
        <div
          className="flex flex-col sm:flex-row gap-3 mb-6 p-4 rounded-2xl"
          style={{
            background: "var(--blusukan-surface-container-lowest)",
            border: "1px solid var(--blusukan-outline-variant)",
            boxShadow: "0 6px 20px -10px rgba(0,0,0,0.18)",
          }}
        >
          <div className="flex items-center gap-2 shrink-0" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            <SlidersHorizontal size={16} />
            <span className="text-xs font-semibold">Filter</span>
          </div>
          <select
            id="filter-destinasi"
            value={destinationFilter}
            onChange={(e) => setDestinationFilter(e.target.value)}
            className="flex-1 px-3 py-2 text-sm"
            style={{
              border: "1px solid var(--blusukan-outline-variant)",
              borderRadius: "8px",
              color: "var(--blusukan-on-surface)",
              background: "var(--blusukan-surface-container-lowest)",
            }}
          >
            <option value="">Semua Destinasi</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({KABUPATEN_LABEL[d.kabupaten] ?? d.kabupaten})
              </option>
            ))}
          </select>
          <select
            id="filter-jenis-layanan"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="flex-1 px-3 py-2 text-sm"
            style={{
              border: "1px solid var(--blusukan-outline-variant)",
              borderRadius: "8px",
              color: "var(--blusukan-on-surface)",
              background: "var(--blusukan-surface-container-lowest)",
            }}
          >
            <option value="">Semua Jenis Layanan</option>
            <option value="OJEK">Ojek Lokal</option>
            <option value="JEEP">Sewa Jeep</option>
            <option value="GUIDE">Pemandu Wisata</option>
          </select>
        </div>

        {/* ── List kartu jasa ── */}
        {filtered.length === 0 ? (
          <div
            className="rounded-2xl p-10 flex flex-col items-center text-center"
            style={{ background: "var(--blusukan-surface-container-lowest)", border: "1px solid var(--blusukan-outline-variant)" }}
          >
            <Compass size={40} style={{ color: "var(--blusukan-outline)" }} className="mb-3" />
            <p className="text-sm font-medium" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Tidak ada jasa yang cocok dengan filter ini
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((s) => {
              const typeStyle = SERVICE_TYPE_STYLE[s.serviceType] ?? {
                bg: "var(--blusukan-surface-container)",
                color: "var(--blusukan-on-surface-variant)",
                icon: <Compass size={13} />,
              };
              return (
                <Link
                  key={s.id}
                  href={`/booking/${s.id}`}
                  id={`service-card-${s.id}`}
                  className="flex flex-col h-full rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  style={{ background: "var(--blusukan-surface-container-lowest)", border: "1px solid var(--blusukan-outline-variant)" }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p
                        className="text-base font-extrabold"
                        style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
                      >
                        {s.providerName}
                      </p>
                      <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                        <MapPin size={12} />
                        {s.destination.name}
                      </p>
                    </div>
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                      style={{ background: typeStyle.bg, color: typeStyle.color }}
                    >
                      {typeStyle.icon}
                      {SERVICE_TYPE_LABEL[s.serviceType] ?? s.serviceType}
                    </span>
                  </div>

                  <div
                    className="mt-auto flex items-center justify-between pt-3"
                    style={{ borderTop: "1px dashed var(--blusukan-outline-variant)" }}
                  >
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                      <Wallet size={13} />
                      Tarif dasar
                    </div>
                    <span className="text-sm font-bold" style={{ color: "var(--blusukan-primary)" }}>
                      {formatRupiah(s.baseRate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs mt-1.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                    <Phone size={12} />
                    {s.contactWa}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
