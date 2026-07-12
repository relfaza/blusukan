"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Crosshair, Loader2, Search, X } from "lucide-react";

const DEFAULT_CENTER: [number, number] = [-7.797, 110.37];
const DEFAULT_ZOOM = 10;
const SELECTED_ZOOM = 13;
const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";
const SEARCH_DEBOUNCE_MS = 400;

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

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
};

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
  onLocationSelect?: (lat: number, lng: number) => void;
  readOnly?: boolean;
}

export default function MapPicker({ initialLatitude, initialLongitude, onLocationSelect, readOnly = false }: MapPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    initialLatitude != null && initialLongitude != null ? [initialLatitude, initialLongitude] : null
  );
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchAbortRef = useRef<AbortController | null>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const [latInput, setLatInput] = useState(initialLatitude != null ? String(initialLatitude) : "");
  const [lngInput, setLngInput] = useState(initialLongitude != null ? String(initialLongitude) : "");

  function handleSelect(lat: number, lng: number) {
    setPosition([lat, lng]);
    setLatInput(String(lat));
    setLngInput(String(lng));
    onLocationSelect?.(lat, lng);
  }

  function handleSearchQueryChange(raw: string) {
    setSearchQuery(raw);
    if (raw.trim().length < 3) {
      searchAbortRef.current?.abort();
      setSearchResults([]);
      setSearching(false);
      setSearchError("");
    }
  }

  // Debounced search ke Nominatim — batal request sebelumnya kalau query berubah lagi sebelum selesai.
  // Reset untuk query pendek ditangani sinkron di handleSearchQueryChange; efek ini murni menjadwalkan
  // fetch supaya semua setState terkait pencarian terjadi di dalam callback async, bukan langsung di body efek.
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 3) return;

    searchAbortRef.current?.abort();
    const controller = new AbortController();
    searchAbortRef.current = controller;

    const timeout = setTimeout(() => {
      setSearching(true);
      setSearchError("");

      const params = new URLSearchParams({
        q: query,
        format: "json",
        limit: "5",
        countrycodes: "id",
      });

      fetch(`${NOMINATIM_SEARCH_URL}?${params.toString()}`, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error("Gagal mencari lokasi.");
          return res.json();
        })
        .then((data: NominatimResult[]) => {
          setSearchResults(Array.isArray(data) ? data : []);
          setShowResults(true);
        })
        .catch((err) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          setSearchError("Gagal mencari lokasi. Coba lagi.");
          setSearchResults([]);
        })
        .finally(() => setSearching(false));
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [searchQuery]);

  function handleSelectResult(result: NominatimResult) {
    const lat = Number(result.lat);
    const lng = Number(result.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    handleSelect(lat, lng);
    setFlyTo([lat, lng]);
    setSearchQuery(result.display_name);
    setShowResults(false);
  }

  function handleClearSearch() {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  }

  function handleLatInputChange(raw: string) {
    setLatInput(raw);
    const lat = Number(raw);
    const lng = Number(lngInput);
    if (raw.trim() !== "" && Number.isFinite(lat) && lat >= -90 && lat <= 90 && Number.isFinite(lng) && lngInput.trim() !== "") {
      setPosition([lat, lng]);
      setFlyTo([lat, lng]);
      onLocationSelect?.(lat, lng);
    }
  }

  function handleLngInputChange(raw: string) {
    setLngInput(raw);
    const lat = Number(latInput);
    const lng = Number(raw);
    if (raw.trim() !== "" && Number.isFinite(lng) && lng >= -180 && lng <= 180 && Number.isFinite(lat) && latInput.trim() !== "") {
      setPosition([lat, lng]);
      setFlyTo([lat, lng]);
      onLocationSelect?.(lat, lng);
    }
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
        handleSelect(next[0], next[1]);
        setFlyTo(next);
        setLocating(false);
      },
      () => {
        setGeoError("Gagal mengambil lokasi. Izinkan akses lokasi lalu coba lagi.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  const fieldStyle: React.CSSProperties = {
    border: "1px solid var(--blusukan-outline-variant)",
    borderRadius: "8px",
    background: "#ffffff",
    color: "var(--blusukan-on-surface)",
  };

  return (
    <div>
      {!readOnly && (
        <div className="relative mb-3" ref={searchBoxRef}>
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--blusukan-on-surface-variant)" }}
          />
          <input
            id="map-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchQueryChange(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            placeholder="Cari lokasi, mis. Malioboro..."
            autoComplete="off"
            className="w-full pl-10 pr-9 py-2.5 text-sm"
            style={fieldStyle}
          />
          {searching ? (
            <Loader2
              size={16}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin"
              style={{ color: "var(--blusukan-on-surface-variant)" }}
            />
          ) : searchQuery ? (
            <button
              type="button"
              onClick={handleClearSearch}
              aria-label="Hapus pencarian"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#f0f0f0]"
              style={{ color: "var(--blusukan-on-surface-variant)" }}
            >
              <X size={14} />
            </button>
          ) : null}

          {showResults && searchResults.length > 0 && (
            <div
              id="map-search-results"
              className="absolute z-[1000] top-full left-0 right-0 mt-1.5 rounded-lg overflow-hidden max-h-64 overflow-y-auto"
              style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)", boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
            >
              {searchResults.map((result, idx) => (
                <button
                  key={`${result.lat}-${result.lon}-${idx}`}
                  type="button"
                  id={`map-search-result-${idx}`}
                  onClick={() => handleSelectResult(result)}
                  className="w-full text-left px-3.5 py-2.5 text-sm transition-colors hover:bg-[#f3f3f3]"
                  style={{
                    color: "var(--blusukan-on-surface)",
                    borderTop: idx === 0 ? "none" : "1px solid var(--blusukan-outline-variant)",
                  }}
                >
                  {result.display_name}
                </button>
              ))}
            </div>
          )}

          {searchError && (
            <p className="text-xs mt-1.5" style={{ color: "var(--blusukan-error)" }}>
              {searchError}
            </p>
          )}
        </div>
      )}

      <div
        className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden"
        style={{ border: "1px solid var(--blusukan-outline-variant)" }}
      >
        <MapContainer
          center={position ?? DEFAULT_CENTER}
          zoom={position ? SELECTED_ZOOM : DEFAULT_ZOOM}
          scrollWheelZoom={!readOnly}
          dragging={!readOnly}
          zoomControl={!readOnly}
          doubleClickZoom={!readOnly}
          touchZoom={!readOnly}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {!readOnly && <ClickHandler onSelect={handleSelect} />}
          <FlyToPosition position={flyTo} />
          {position && <Marker position={position} icon={PIN_ICON} />}
        </MapContainer>
      </div>

      {!readOnly && (
        <>
          <p className="text-xs mt-2" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            {position
              ? `Koordinat terpilih: ${position[0].toFixed(6)}, ${position[1].toFixed(6)}`
              : "Cari lokasi, klik di peta, atau isi koordinat manual untuk memilih lokasi destinasi."}
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

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label htmlFor="map-lat-input" className="block text-xs font-medium mb-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                Latitude (manual)
              </label>
              <input
                id="map-lat-input"
                type="number"
                step="any"
                min={-90}
                max={90}
                value={latInput}
                onChange={(e) => handleLatInputChange(e.target.value)}
                placeholder="-7.797068"
                className="w-full px-3 py-2 text-sm"
                style={fieldStyle}
              />
            </div>
            <div>
              <label htmlFor="map-lng-input" className="block text-xs font-medium mb-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                Longitude (manual)
              </label>
              <input
                id="map-lng-input"
                type="number"
                step="any"
                min={-180}
                max={180}
                value={lngInput}
                onChange={(e) => handleLngInputChange(e.target.value)}
                placeholder="110.370529"
                className="w-full px-3 py-2 text-sm"
                style={fieldStyle}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
