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

const KATEGORI_LABEL: Record<string, string> = {
  PANTAI: "Pantai",
  AIR_TERJUN: "Air Terjun",
  GUNUNG: "Gunung",
  BUKIT: "Bukit",
  TEBING: "Tebing",
};

// Satu warna per kategori supaya destinasi bisa dibedakan sekilas di peta ramai.
const KATEGORI_COLOR: Record<string, string> = {
  PANTAI: "#0284c7",
  AIR_TERJUN: "#06b6d4",
  GUNUNG: "#78350f",
  BUKIT: "#16a34a",
  TEBING: "#f97316",
};
const DEFAULT_COLOR = "#1f4d2c";

// DivIcon + inline SVG (pola sama seperti components/map-picker.tsx) — menghindari
// bug ikon default Leaflet yang hilang saat dibundel lewat Next.js/webpack.
const iconCache = new Map<string, L.DivIcon>();
function getCategoryIcon(kategori: string): L.DivIcon {
  const cached = iconCache.get(kategori);
  if (cached) return cached;

  const color = KATEGORI_COLOR[kategori] ?? DEFAULT_COLOR;
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
  iconCache.set(kategori, icon);
  return icon;
}

export interface AdminMapDestinasi {
  id: string;
  name: string;
  kabupaten: string;
  kategori: string;
  latitude: number;
  longitude: number;
}

export default function AdminMapOverview({ destinasi }: { destinasi: AdminMapDestinasi[] }) {
  const points = destinasi.filter(
    (d) => Number.isFinite(d.latitude) && Number.isFinite(d.longitude)
  );

  return (
    <div>
      <div
        className="w-full h-72 sm:h-96 rounded-2xl overflow-hidden"
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
            <Marker key={d.id} position={[d.latitude, d.longitude]} icon={getCategoryIcon(d.kategori)}>
              <Popup>
                <div className="text-sm">
                  <p className="font-bold mb-0.5">{d.name}</p>
                  <p className="text-xs mb-2" style={{ color: "#5f6368" }}>
                    {KABUPATEN_LABEL[d.kabupaten] ?? d.kabupaten} · {KATEGORI_LABEL[d.kategori] ?? d.kategori}
                  </p>
                  <Link href={`/dashboard/destinasi/${d.id}`} className="text-xs font-semibold" style={{ color: "#1f4d2c" }}>
                    Lihat detail →
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="flex flex-wrap gap-3 mt-3">
        {Object.entries(KATEGORI_LABEL).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ background: KATEGORI_COLOR[key] }}
            />
            <span className="text-xs" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
