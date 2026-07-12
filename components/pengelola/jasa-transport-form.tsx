"use client";

import { useState } from "react";
import RupiahInput from "@/components/ui/rupiah-input";

export const SERVICE_TYPE_VALUES = ["OJEK", "JEEP", "GUIDE"] as const;

export const SERVICE_TYPE_LABEL: Record<string, string> = {
  OJEK: "Ojek Lokal",
  JEEP: "Sewa Jeep",
  GUIDE: "Pemandu Wisata",
};

export type JasaTransportFormValues = {
  providerName: string;
  serviceType: string;
  contactWa: string;
  baseRate: number;
};

/** Form tambah jasa transport lokal (ojek/jeep/pemandu) — dipakai di step opsional wizard Ajukan Destinasi */
export default function JasaTransportForm({
  initial,
  onCancel,
  onSubmit,
  submitting,
}: {
  initial?: JasaTransportFormValues;
  onCancel: () => void;
  onSubmit: (values: JasaTransportFormValues) => void;
  submitting: boolean;
}) {
  const [providerName, setProviderName] = useState(initial?.providerName ?? "");
  const [serviceType, setServiceType] = useState(initial?.serviceType ?? SERVICE_TYPE_VALUES[0]);
  const [contactWa, setContactWa] = useState(initial?.contactWa ?? "");
  const [baseRate, setBaseRate] = useState<number | "">(initial ? initial.baseRate : "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      providerName: providerName.trim(),
      serviceType,
      contactWa: contactWa.trim(),
      baseRate: Number(baseRate),
    });
  }

  const inputStyle: React.CSSProperties = {
    border: "1px solid var(--blusukan-outline-variant)",
    borderRadius: "8px",
    background: "#ffffff",
    color: "var(--blusukan-on-surface)",
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-5 space-y-3"
      style={{ background: "var(--blusukan-primary-container)", border: "1px solid var(--blusukan-outline-variant)" }}
    >
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Nama Penyedia Jasa
        </label>
        <input
          required
          value={providerName}
          onChange={(e) => setProviderName(e.target.value)}
          placeholder="Contoh: Pak Joko Ojek"
          className="w-full px-3 py-2 text-sm"
          style={inputStyle}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Jenis Jasa
          </label>
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="w-full px-3 py-2 text-sm"
            style={inputStyle}
          >
            {SERVICE_TYPE_VALUES.map((v) => (
              <option key={v} value={v}>
                {SERVICE_TYPE_LABEL[v]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Tarif Dasar
          </label>
          <RupiahInput
            id="baseRate"
            required
            value={baseRate}
            onChange={setBaseRate}
            className="w-full pl-9 pr-3 py-2 text-sm"
            style={inputStyle}
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Nomor WhatsApp
        </label>
        <input
          required
          type="tel"
          value={contactWa}
          onChange={(e) => setContactWa(e.target.value)}
          placeholder="08xxxxxxxxxx"
          className="w-full px-3 py-2 text-sm"
          style={inputStyle}
        />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="text-sm font-bold px-4 py-2 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
        >
          {submitting ? "Menyimpan..." : "Simpan"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="text-sm font-medium px-4 py-2 rounded-lg"
          style={{ color: "var(--blusukan-on-surface-variant)" }}
        >
          Batal
        </button>
      </div>
    </form>
  );
}
