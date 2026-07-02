"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapDestination = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  routeStatus: string;
};

function createPin(color: string, opacity = 1): L.DivIcon {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36" opacity="${opacity}">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="${color}" stroke="white" stroke-width="2"/>
    <circle cx="14" cy="14" r="5" fill="white"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  });
}

// Pin normal (destinasi sesuai filter / semua destinasi di beranda)
const PIN_AMAN = createPin("#2d5a27");
const PIN_BERLUMPUR = createPin("#44372a");
const PIN_RUSAK = createPin("#ba1a1a");
const PIN_DEFAULT = createPin("#72796e");

// Pin redup (destinasi di luar filter — muncul tapi lebih transparan)
const PIN_AMAN_DIM = createPin("#2d5a27", 0.3);
const PIN_BERLUMPUR_DIM = createPin("#44372a", 0.3);
const PIN_RUSAK_DIM = createPin("#ba1a1a", 0.3);
const PIN_DEFAULT_DIM = createPin("#72796e", 0.3);

function getPinIcon(routeStatus: string, dim = false): L.DivIcon {
  if (dim) {
    if (routeStatus === "MUDAH" || routeStatus === "SEDANG") return PIN_AMAN_DIM;
    if (routeStatus === "SULIT") return PIN_BERLUMPUR_DIM;
    if (routeStatus === "RUSAK") return PIN_RUSAK_DIM;
    return PIN_DEFAULT_DIM;
  }
  if (routeStatus === "MUDAH" || routeStatus === "SEDANG") return PIN_AMAN;
  if (routeStatus === "SULIT") return PIN_BERLUMPUR;
  if (routeStatus === "RUSAK") return PIN_RUSAK;
  return PIN_DEFAULT;
}

interface DestinationMapProps {
  destinations: MapDestination[];
  /**
   * Jika diisi, hanya destinasi dengan id dalam Set ini yang tampil dengan pin penuh.
   * Sisanya tampil redup. Jika tidak diisi (undefined), semua pin tampil penuh.
   */
  highlightIds?: Set<string>;
}

export default function DestinationMap({ destinations, highlightIds }: DestinationMapProps) {
  // Fix leaflet marker icons in Next.js
  useEffect(() => {
    // no-op — icons dibuat manual via DivIcon, tidak perlu fix default icon
  }, []);

  return (
    <MapContainer
      center={[-7.88, 110.38]}
      zoom={10}
      scrollWheelZoom={false}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {destinations.map((dest) => {
        const dim = highlightIds !== undefined && !highlightIds.has(dest.id);
        return (
          <Marker
            key={dest.id}
            position={[dest.latitude, dest.longitude]}
            icon={getPinIcon(dest.routeStatus, dim)}
          >
            <Popup>
              <div className="text-sm font-semibold text-[#1a1c1c]">
                {dest.name}
              </div>
              {dim && (
                <div className="text-xs text-[#72796e] mt-0.5">
                  Di luar filter aktif
                </div>
              )}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
