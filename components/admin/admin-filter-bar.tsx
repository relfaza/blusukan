"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, MapPin, Route, SlidersHorizontal } from "lucide-react";
import { KABUPATEN_FILTER_OPTIONS, KONDISI_JALAN_FILTER_OPTIONS } from "@/lib/admin-filters";

/**
 * Filter bar reusable untuk semua halaman dashboard Admin: Kabupaten + Status Kondisi Jalan.
 * State disimpan di URL query param (`kabupaten`, `kondisiJalan`) supaya bisa dibaca
 * oleh server page (searchParams) maupun client component (useSearchParams).
 */
export default function AdminFilterBar({
  showKondisiJalan = true,
  className = "",
}: {
  showKondisiJalan?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const kabupaten = searchParams.get("kabupaten") ?? "ALL";
  const kondisiJalan = searchParams.get("kondisiJalan") ?? "ALL";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "ALL") params.delete(key);
      else params.set(key, value);
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  return (
    <div
      id="admin-filter-bar"
      className={`flex flex-wrap items-center gap-2.5 ${className}`}
    >
      <span
        className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide"
        style={{ color: "var(--blusukan-on-surface-variant)" }}
      >
        <SlidersHorizontal size={14} />
        Filter
      </span>

      <FilterSelect
        id="admin-filter-kabupaten"
        icon={<MapPin size={15} />}
        value={kabupaten}
        options={KABUPATEN_FILTER_OPTIONS}
        onChange={(v) => updateParam("kabupaten", v)}
      />

      {showKondisiJalan && (
        <FilterSelect
          id="admin-filter-kondisi-jalan"
          icon={<Route size={15} />}
          value={kondisiJalan}
          options={KONDISI_JALAN_FILTER_OPTIONS}
          onChange={(v) => updateParam("kondisiJalan", v)}
        />
      )}
    </div>
  );
}

function FilterSelect({
  id,
  icon,
  value,
  options,
  onChange,
}: {
  id: string;
  icon: React.ReactNode;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const active = value !== "ALL";
  return (
    <div className="relative inline-flex items-center">
      <span
        className="absolute left-3 pointer-events-none"
        style={{ color: active ? "var(--blusukan-primary)" : "var(--blusukan-on-surface-variant)" }}
      >
        {icon}
      </span>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none text-sm font-semibold rounded-xl pl-9 pr-9 py-2 cursor-pointer transition-colors focus:outline-none"
        style={{
          background: active ? "var(--blusukan-primary-container)" : "#ffffff",
          border: `1px solid ${active ? "var(--blusukan-primary)" : "var(--blusukan-outline-variant)"}`,
          color: active ? "var(--blusukan-primary)" : "var(--blusukan-on-surface)",
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ color: "var(--blusukan-on-surface)" }}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={15}
        className="absolute right-3 pointer-events-none"
        style={{ color: active ? "var(--blusukan-primary)" : "var(--blusukan-on-surface-variant)" }}
      />
    </div>
  );
}
