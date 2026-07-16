"use client";

import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER: [number, number] = [-7.797, 110.37];
const DEFAULT_ZOOM = 10;

const KABUPATEN_LABEL: Record<string, string> = {
  SLEMAN: "Sleman",
  GUNUNGKIDUL: "Gunungkidul",
  BANTUL: "Bantul",
  KULON_PROGO: "Kulon Progo",
  KOTA_YOGYAKARTA: "Kota Yogyakarta",
};

// Label + warna per kondisi jalan (routeStatus) — INI yang membedakan peta ini dari peta overview
// yang mewarnai per kategori. Urutan sengaja dari terbaik ke terburuk untuk legend.
const ROUTE_STATUS: { key: string; label: string; color: string }[] = [
  { key: "MUDAH", label: "Mudah", color: "#16a34a" },
  { key: "SEDANG", label: "Sedang", color: "#eab308" },
  { key: "SULIT", label: "Sulit", color: "#f97316" },
  { key: "RUSAK", label: "Rusak", color: "#dc2626" },
  { key: "BELUM_ADA_DATA", label: "Belum ada data", color: "#9ca3af" },
];

const ROUTE_LABEL: Record<string, string> = Object.fromEntries(ROUTE_STATUS.map((r) => [r.key, r.label]));
const ROUTE_COLOR: Record<string, string> = Object.fromEntries(ROUTE_STATUS.map((r) => [r.key, r.color]));
const DEFAULT_COLOR = "#9ca3af";

// DivIcon + inline SVG (pola sama seperti peta overview / map-picker) untuk menghindari
// bug ikon default Leaflet yang hilang saat dibundel lewat Next.js/webpack.
const iconCache = new Map<string, L.DivIcon>();
function getRouteIcon(routeStatus: string): L.DivIcon {
  const cached = iconCache.get(routeStatus);
  if (cached) return cached;

  const color = ROUTE_COLOR[routeStatus] ?? DEFAULT_COLOR;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="34" viewBox="0 0 28 36">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="${color}" stroke="white" stroke-width="2"/>
    <circle cx="14" cy="14" r="5" fill="white"/>
  </svg>`;
  const icon = L.divIcon({
    html: svg,
    className: "",
    iconSize: [26, 34],
    iconAnchor: [13, 34],
    popupAnchor: [0, -34],
  });
  iconCache.set(routeStatus, icon);
  return icon;
}

export interface HeatmapJalanDestinasi {
  id: string;
  name: string;
  kabupaten: string;
  routeStatus: string;
  latitude: number;
  longitude: number;
}

export default function AdminMapHeatmapJalan({ destinasi }: { destinasi: HeatmapJalanDestinasi[] }) {
  const points = destinasi.filter(
    (d) => Number.isFinite(d.latitude) && Number.isFinite(d.longitude)
  );

  return (
    <div>
      <div
        className="relative w-full h-72 sm:h-[26rem] rounded-2xl overflow-hidden"
        style={{ border: "1px solid var(--blusukan-outline-variant)" }}
      >
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {points.map((d) => (
            <Marker key={d.id} position={[d.latitude, d.longitude]} icon={getRouteIcon(d.routeStatus)}>
              <Popup>
                <div className="text-sm">
                  <p className="font-bold mb-0.5">{d.name}</p>
                  <p className="text-xs mb-1" style={{ color: "#5f6368" }}>
                    {KABUPATEN_LABEL[d.kabupaten] ?? d.kabupaten}
                  </p>
                  <p className="text-xs mb-2">
                    Kondisi jalan:{" "}
                    <span className="font-semibold" style={{ color: ROUTE_COLOR[d.routeStatus] ?? DEFAULT_COLOR }}>
                      {ROUTE_LABEL[d.routeStatus] ?? d.routeStatus}
                    </span>
                  </p>
                  <Link href={`/dashboard/destinasi/${d.id}`} className="text-xs font-semibold" style={{ color: "#1f4d2c" }}>
                    Lihat detail →
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend warna kondisi jalan — mengambang di pojok kanan bawah peta */}
        <div
          className="absolute bottom-3 right-3 z-[1000] rounded-xl px-3 py-2.5"
          style={{
            background: "color-mix(in srgb, #ffffff 92%, transparent)",
            border: "1px solid var(--blusukan-outline-variant)",
            boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
          }}
        >
          <p className="text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Kondisi Jalan
          </p>
          <div className="space-y-1">
            {ROUTE_STATUS.map((r) => (
              <div key={r.key} className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ background: r.color }} />
                <span className="text-xs" style={{ color: "var(--blusukan-on-surface)" }}>
                  {r.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
