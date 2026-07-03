"use client";

import { useEffect, useState, type CSSProperties } from "react";

interface RupiahInputProps {
  id?: string;
  value: number | "";
  onChange: (value: number) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

function onlyDigits(raw: string): string {
  return raw.replace(/\D/g, "");
}

function formatRibuan(digits: string): string {
  if (!digits) return "";
  return Number(digits).toLocaleString("id-ID");
}

/**
 * Input angka Rupiah — tampilan otomatis dapat pemisah ribuan format Indonesia
 * ("120.000") saat mengetik, tapi value yang dikirim lewat onChange tetap angka murni.
 */
export default function RupiahInput({
  id,
  value,
  onChange,
  placeholder = "0",
  required,
  disabled,
  className,
  style,
}: RupiahInputProps) {
  const [display, setDisplay] = useState(() => formatRibuan(onlyDigits(String(value))));

  // Sinkron tampilan kalau value berubah dari luar (reset form, load data edit, dll)
  useEffect(() => {
    setDisplay(formatRibuan(onlyDigits(String(value))));
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = onlyDigits(e.target.value);
    setDisplay(formatRibuan(digits));
    onChange(digits === "" ? 0 : Number(digits));
  }

  return (
    <div className="relative">
      <span
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none select-none"
        style={{ color: "var(--blusukan-on-surface-variant)" }}
      >
        Rp
      </span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={className ?? "w-full pl-9 pr-3 py-2.5 text-sm"}
        style={{
          border: "1px solid var(--blusukan-outline-variant)",
          borderRadius: "8px",
          background: "#ffffff",
          color: "var(--blusukan-on-surface)",
          ...style,
        }}
      />
    </div>
  );
}
