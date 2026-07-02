"use client";

import { useEffect, useRef } from "react";
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

function createPin(color: string): L.DivIcon {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
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

const PIN_AMAN = createPin("#2d5a27");
const PIN_BERLUMPUR = createPin("#44372a");
const PIN_RUSAK = createPin("#ba1a1a");
const PIN_DEFAULT = createPin("#72796e");

function getPinIcon(routeStatus: string): L.DivIcon {
  if (routeStatus === "MUDAH" || routeStatus === "SEDANG") return PIN_AMAN;
  if (routeStatus === "SULIT") return PIN_BERLUMPUR;
  if (routeStatus === "RUSAK") return PIN_RUSAK;
  return PIN_DEFAULT;
}

interface DestinationMapProps {
  destinations: MapDestination[];
}

export default function DestinationMap({ destinations }: DestinationMapProps) {
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
      {destinations.map((dest) => (
        <Marker
          key={dest.id}
          position={[dest.latitude, dest.longitude]}
          icon={getPinIcon(dest.routeStatus)}
        >
          <Popup>
            <div className="text-sm font-semibold text-[#1a1c1c]">
              {dest.name}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
