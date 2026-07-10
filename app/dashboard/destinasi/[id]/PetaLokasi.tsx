"use client";

import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("@/components/map-picker"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-56 flex items-center justify-center rounded-2xl"
      style={{ background: "#f3f3f3", border: "1px solid var(--blusukan-outline-variant)" }}
    >
      <span className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
        Memuat peta…
      </span>
    </div>
  ),
});

export default function PetaLokasi({ latitude, longitude }: { latitude: number; longitude: number }) {
  return <MapPicker initialLatitude={latitude} initialLongitude={longitude} readOnly />;
}
