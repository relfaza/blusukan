"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

interface DateTimePickerProps {
  id: string;
  value: string; // format "YYYY-MM-DDTHH:mm", sama seperti <input type="datetime-local">
  min?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const WEEKDAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function parseValue(value: string): { date: Date | null; time: string } {
  if (!value) return { date: null, time: "" };
  const [datePart, timePart] = value.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  return { date: new Date(y, m - 1, d), time: timePart ?? "" };
}

function formatValue(date: Date, time: string): string {
  const [h, min] = (time || "00:00").split(":").map(Number);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(h)}:${pad(min)}`;
}

function formatDisplay(value: string): string {
  const { date, time } = parseValue(value);
  if (!date) return "";
  const [h, m] = (time || "00:00").split(":");
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}, ${h}.${m}`;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Date/time picker dengan kalender kustom + tombol "Pilih" eksplisit untuk konfirmasi. */
export default function DateTimePicker({ id, value, min, onChange, placeholder = "Pilih jadwal" }: DateTimePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const minParsed = parseValue(min ?? "");
  const initial = parseValue(value);

  const [viewMonth, setViewMonth] = useState<Date>(initial.date ?? minParsed.date ?? new Date());
  const [draftDate, setDraftDate] = useState<Date | null>(initial.date);
  const [draftTime, setDraftTime] = useState<string>(initial.time || "00:00");

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function openPicker() {
    const cur = parseValue(value);
    setDraftDate(cur.date);
    setDraftTime(cur.time || "00:00");
    setViewMonth(cur.date ?? minParsed.date ?? new Date());
    setOpen(true);
  }

  function isBeforeMinDay(day: Date): boolean {
    if (!minParsed.date) return false;
    const a = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    const b = new Date(minParsed.date.getFullYear(), minParsed.date.getMonth(), minParsed.date.getDate());
    return a < b;
  }

  function handleConfirm() {
    if (!draftDate) return;
    let time = draftTime || "00:00";
    if (minParsed.date && minParsed.time && sameDay(draftDate, minParsed.date) && time < minParsed.time) {
      time = minParsed.time;
    }
    onChange(formatValue(draftDate, time));
    setOpen(false);
  }

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        id={id}
        onClick={() => (open ? setOpen(false) : openPicker())}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left"
        style={{
          border: "1px solid var(--blusukan-outline-variant)",
          borderRadius: "8px",
          color: value ? "var(--blusukan-on-surface)" : "var(--blusukan-on-surface-variant)",
          background: "#ffffff",
        }}
      >
        <span>{value ? formatDisplay(value) : placeholder}</span>
        <CalendarDays size={16} style={{ color: "var(--blusukan-on-surface-variant)" }} />
      </button>

      {open && (
        <div
          className="absolute z-[1100] mt-1 w-full min-w-[260px] rounded-xl p-3 shadow-lg"
          style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
        >
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setViewMonth(new Date(year, month - 1, 1))}
              aria-label="Bulan sebelumnya"
              className="p-1 rounded hover:bg-[#f0f0f0]"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold" style={{ color: "var(--blusukan-on-surface)" }}>
              {MONTHS[month]} {year}
            </span>
            <button
              type="button"
              onClick={() => setViewMonth(new Date(year, month + 1, 1))}
              aria-label="Bulan berikutnya"
              className="p-1 rounded hover:bg-[#f0f0f0]"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((w) => (
              <span
                key={w}
                className="text-[10px] text-center font-medium"
                style={{ color: "var(--blusukan-on-surface-variant)" }}
              >
                {w}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 mb-3">
            {cells.map((day, idx) => {
              if (day === null) return <span key={`blank-${idx}`} />;
              const dayDate = new Date(year, month, day);
              const disabled = isBeforeMinDay(dayDate);
              const selected = draftDate !== null && sameDay(draftDate, dayDate);
              return (
                <button
                  key={day}
                  type="button"
                  disabled={disabled}
                  onClick={() => setDraftDate(dayDate)}
                  className="w-7 h-7 rounded-full text-xs flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: selected ? "var(--blusukan-primary)" : "transparent",
                    color: selected ? "var(--blusukan-on-primary)" : "var(--blusukan-on-surface)",
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mb-3">
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "var(--blusukan-on-surface-variant)" }}
            >
              Jam
            </label>
            <input
              type="time"
              value={draftTime}
              onChange={(e) => setDraftTime(e.target.value)}
              className="w-full px-2 py-1.5 text-sm"
              style={{ border: "1px solid var(--blusukan-outline-variant)", borderRadius: "8px" }}
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-70"
              style={{ color: "var(--blusukan-on-surface-variant)" }}
            >
              Batal
            </button>
            <button
              type="button"
              id={`${id}-confirm`}
              disabled={!draftDate}
              onClick={handleConfirm}
              className="px-4 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
            >
              Pilih
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
