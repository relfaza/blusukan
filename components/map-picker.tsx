"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Crosshair, Loader2 } from "lucide-react";

const DEFAULT_CENTER: [number, number] = [-7.797, 110.37];
const DEFAULT_ZOOM = 10;
const SELECTED_ZOOM = 13;

// Marker kustom via DivIcon + inline SVG — menghindari bug klasik Leaflet di
// Next.js/webpack yang membuat ikon default (marker-icon.png) hilang/rusak
// karena path asetnya tidak ter-resolve lewat bundler. Pola yang sama dipakai
// di components/DestinationMap.tsx.
function createPinIcon(): L.DivIcon {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="#1f4d2c" stroke="white" stroke-width="2"/>
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

const PIN_ICON = createPinIcon();

function ClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Leaflet's `center` prop hanya berlaku saat mount pertama — untuk pindah
// pusat peta secara terprogram (mis. setelah geolocation) perlu panggil
// map.setView() langsung lewat useMap().
function FlyToPosition({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, Math.max(map.getZoom(), SELECTED_ZOOM));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position]);
  return null;
}

interface MapPickerProps {
  initialLatitude?: number | null;
  initialLongitude?: number | null;
  onLocationSelect: (lat: number, lng: number) => void;
}

export default function MapPicker({ initialLatitude, initialLongitude, onLocationSelect }: MapPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    initialLatitude != null && initialLongitude != null ? [initialLatitude, initialLongitude] : null
  );
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState("");

  function handleSelect(lat: number, lng: number) {
    setPosition([lat, lng]);
    onLocationSelect(lat, lng);
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setGeoError("Geolocation tidak didukung di perangkat ini.");
      return;
    }
    setLocating(true);
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setPosition(next);
        setFlyTo(next);
        onLocationSelect(next[0], next[1]);
        setLocating(false);
      },
      () => {
        setGeoError("Gagal mengambil lokasi. Izinkan akses lokasi lalu coba lagi.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div>
      <div
        className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden"
        style={{ border: "1px solid var(--blusukan-outline-variant)" }}
      >
        <MapContainer
          center={position ?? DEFAULT_CENTER}
          zoom={position ? SELECTED_ZOOM : DEFAULT_ZOOM}
          scrollWheelZoom
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onSelect={handleSelect} />
          <FlyToPosition position={flyTo} />
          {position && <Marker position={position} icon={PIN_ICON} />}
        </MapContainer>
      </div>

      <p className="text-xs mt-2" style={{ color: "var(--blusukan-on-surface-variant)" }}>
        {position
          ? `Koordinat terpilih: ${position[0].toFixed(6)}, ${position[1].toFixed(6)}`
          : "Klik di peta untuk memilih lokasi destinasi."}
      </p>

      <button
        type="button"
        onClick={handleUseMyLocation}
        disabled={locating}
        className="mt-2 flex items-center justify-center gap-1.5 w-full text-sm font-semibold px-4 py-2.5 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{
          background: "#ffffff",
          color: "var(--blusukan-primary)",
          border: "1px solid var(--blusukan-primary)",
        }}
      >
        {locating ? <Loader2 size={16} className="animate-spin" /> : <Crosshair size={16} />}
        {locating ? "Mengambil lokasi..." : "Gunakan Lokasi Saya Saat Ini"}
      </button>

      {geoError && (
        <p className="text-xs mt-1.5" style={{ color: "var(--blusukan-error)" }}>
          {geoError}
        </p>
      )}
    </div>
  );
}
