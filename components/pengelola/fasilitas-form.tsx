"use client";

import { useState } from "react";
import RupiahInput from "@/components/ui/rupiah-input";

export type FasilitasFormValues = {
  nama: string;
  hargaSewa: number;
  satuanWaktu: string;
  jumlahUnit: number;
};

/** Form tambah/edit fasilitas — dipakai di Kelola Fasilitas maupun step opsional wizard Ajukan Destinasi */
export default function FasilitasForm({
  initial,
  onCancel,
  onSubmit,
  submitting,
}: {
  initial?: FasilitasFormValues;
  onCancel: () => void;
  onSubmit: (values: FasilitasFormValues) => void;
  submitting: boolean;
}) {
  const [nama, setNama] = useState(initial?.nama ?? "");
  const [hargaSewa, setHargaSewa] = useState<number | "">(initial ? initial.hargaSewa : "");
  const [satuanWaktu, setSatuanWaktu] = useState(initial?.satuanWaktu ?? "per jam");
  const [jumlahUnit, setJumlahUnit] = useState(initial ? String(initial.jumlahUnit) : "1");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      nama,
      hargaSewa: Number(hargaSewa),
      satuanWaktu,
      jumlahUnit: Number(jumlahUnit),
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
          Nama Fasilitas
        </label>
        <input
          required
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Contoh: Sewa Tikar"
          className="w-full px-3 py-2 text-sm"
          style={inputStyle}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Harga Sewa
          </label>
          <RupiahInput
            id="hargaSewa"
            required
            value={hargaSewa}
            onChange={setHargaSewa}
            className="w-full pl-9 pr-3 py-2 text-sm"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Satuan Waktu
          </label>
          <input
            required
            value={satuanWaktu}
            onChange={(e) => setSatuanWaktu(e.target.value)}
            placeholder="per jam"
            className="w-full px-3 py-2 text-sm"
            style={inputStyle}
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Jumlah Unit Tersedia
        </label>
        <input
          required
          type="number"
          min={1}
          value={jumlahUnit}
          onChange={(e) => setJumlahUnit(e.target.value)}
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
