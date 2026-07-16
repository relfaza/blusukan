"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Check, X } from "lucide-react";
import AdminFilterBar from "@/components/admin/admin-filter-bar";

const AdminMapHeatmapJalan = dynamic(() => import("@/components/admin-map-heatmap-jalan"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-72 sm:h-[26rem] flex items-center justify-center rounded-2xl"
      style={{ background: "#f3f3f3", border: "1px solid var(--blusukan-outline-variant)" }}
    >
      <span className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
        Memuat peta…
      </span>
    </div>
  ),
});

const KABUPATEN_LABEL: Record<string, string> = {
  SLEMAN: "Sleman",
  GUNUNGKIDUL: "Gunungkidul",
  BANTUL: "Bantul",
  KULON_PROGO: "Kulon Progo",
  KOTA_YOGYAKARTA: "Kota Yogyakarta",
};

type Destinasi = {
  id: string;
  name: string;
  kabupaten: string;
  routeStatus: string;
  latitude: number;
  longitude: number;
  hasToilet: boolean;
  hasParkir: boolean;
  hasTempatIbadah: boolean;
  hasTempatDuduk: boolean;
  hasPenitipanBarang: boolean;
};

type Response = { groups: { kabupaten: string; destinasi: Destinasi[] }[] };

const FASILITAS_KOLOM: { key: keyof Destinasi; label: string }[] = [
  { key: "hasToilet", label: "Toilet" },
  { key: "hasParkir", label: "Parkir" },
  { key: "hasTempatIbadah", label: "Tempat Ibadah" },
  { key: "hasTempatDuduk", label: "Tempat Duduk" },
  { key: "hasPenitipanBarang", label: "Penitipan Barang" },
];

function CheckCell({ value }: { value: boolean }) {
  return (
    <span className="inline-flex items-center justify-center">
      {value ? (
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }}
          aria-label="Tersedia"
        >
          <Check size={15} strokeWidth={3} />
        </span>
      ) : (
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: "var(--blusukan-surface)", color: "var(--blusukan-outline)" }}
          aria-label="Tidak tersedia"
        >
          <X size={15} strokeWidth={3} />
        </span>
      )}
    </span>
  );
}

export default function InfrastrukturClient() {
  const [data, setData] = useState<Response | null>(null);
  const [error, setError] = useState("");

  const searchParams = useSearchParams();
  const kabupaten = searchParams.get("kabupaten");
  const kondisiJalan = searchParams.get("kondisiJalan");

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (kabupaten) params.set("kabupaten", kabupaten);
    if (kondisiJalan) params.set("kondisiJalan", kondisiJalan);
    const qs = params.toString();

    fetch(`/api/admin/kelayakan-fasilitas${qs ? `?${qs}` : ""}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((json: Response) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setError("Gagal memuat data infrastruktur & fasilitas.");
      });
    return () => {
      cancelled = true;
    };
  }, [kabupaten, kondisiJalan]);

  // Data sudah difilter di server; cukup ratakan semua grup.
  const terfilter = useMemo(() => (data ? data.groups.flatMap((g) => g.destinasi) : []), [data]);

  const mapPoints = terfilter.map((d) => ({
    id: d.id,
    name: d.name,
    kabupaten: d.kabupaten,
    routeStatus: d.routeStatus,
    latitude: d.latitude,
    longitude: d.longitude,
  }));

  return (
    <div className="min-h-screen" style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
        >
          Infrastruktur & Fasilitas
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Kondisi jalan menuju destinasi dan kelengkapan fasilitas dasar
        </p>

        {error && (
          <p
            className="text-sm px-4 py-2.5 rounded-lg mb-8"
            style={{ background: "var(--blusukan-error-container)", color: "var(--blusukan-error)" }}
          >
            {error}
          </p>
        )}

        {/* ── Section 1: Peta Kondisi Jalan ── */}
        <section className="mb-12">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2
              className="text-lg font-bold"
              style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
            >
              🗺️ Peta Kondisi Jalan per Kabupaten
            </h2>

            <AdminFilterBar />
          </div>

          {!data && !error ? (
            <div
              className="w-full h-72 sm:h-[26rem] rounded-2xl animate-pulse"
              style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
            />
          ) : (
            <>
              <AdminMapHeatmapJalan destinasi={mapPoints} />
              <p className="text-xs mt-2" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                {terfilter.length} destinasi ditampilkan
                {kabupaten ? ` di ${KABUPATEN_LABEL[kabupaten] ?? kabupaten}` : ""}
              </p>
            </>
          )}
        </section>

        {/* ── Section 2: Tabel Kelayakan Fasilitas ── */}
        <section>
          <h2
            className="text-lg font-bold mb-4"
            style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
          >
            Tabel Kelayakan Fasilitas Dasar
          </h2>

          {!data && !error ? (
            <div
              className="rounded-2xl h-64 animate-pulse"
              style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
            />
          ) : terfilter.length === 0 ? (
            <div
              className="rounded-2xl p-10 text-center"
              style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
            >
              <p className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                Tidak ada destinasi untuk filter ini.
              </p>
            </div>
          ) : (
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
            >
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr style={{ background: "var(--blusukan-surface)" }}>
                      <th
                        className="text-left text-xs font-bold uppercase tracking-wide px-4 py-3 whitespace-nowrap"
                        style={{ color: "var(--blusukan-on-surface-variant)" }}
                      >
                        Nama Destinasi
                      </th>
                      <th
                        className="text-left text-xs font-bold uppercase tracking-wide px-4 py-3 whitespace-nowrap"
                        style={{ color: "var(--blusukan-on-surface-variant)" }}
                      >
                        Kabupaten
                      </th>
                      {FASILITAS_KOLOM.map((k) => (
                        <th
                          key={k.key}
                          className="text-center text-xs font-bold uppercase tracking-wide px-4 py-3 whitespace-nowrap"
                          style={{ color: "var(--blusukan-on-surface-variant)" }}
                        >
                          {k.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {terfilter.map((d, idx) => (
                      <tr
                        key={d.id}
                        style={{ borderTop: idx === 0 ? "none" : "1px solid var(--blusukan-outline-variant)" }}
                      >
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          <span className="font-semibold" style={{ color: "var(--blusukan-on-surface)" }}>
                            {d.name}
                          </span>
                        </td>
                        <td
                          className="px-4 py-3 text-sm whitespace-nowrap"
                          style={{ color: "var(--blusukan-on-surface-variant)" }}
                        >
                          {KABUPATEN_LABEL[d.kabupaten] ?? d.kabupaten}
                        </td>
                        {FASILITAS_KOLOM.map((k) => (
                          <td key={k.key} className="px-4 py-3 text-center">
                            <CheckCell value={Boolean(d[k.key])} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
