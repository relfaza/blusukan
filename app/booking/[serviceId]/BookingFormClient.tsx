"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bike, Car, CheckCircle2, Compass, MessageCircle } from "lucide-react";

type ServiceInfo = {
  id: string;
  providerName: string;
  serviceType: string;
  baseRate: number;
  contactWa: string;
};

type DestinationInfo = { id: string; name: string };

interface Props {
  service: ServiceInfo;
  destination: DestinationInfo;
  defaultContactNumber: string;
}

type ConfirmedBooking = {
  travelDate: string;
  meetingPoint: string;
  contactNumber: string;
  notes: string;
  estimatedArrivalTime: string;
};

const SERVICE_TYPE_LABEL: Record<string, string> = {
  OJEK: "Ojek Lokal",
  JEEP: "Sewa Jeep",
  GUIDE: "Pemandu Wisata",
};

const SERVICE_TYPE_ICON: Record<string, React.ReactNode> = {
  OJEK: <Bike size={16} />,
  JEEP: <Car size={16} />,
  GUIDE: <Compass size={16} />,
};

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatTanggal(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(year, month - 1, day));
}

function todayISODate(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-sm shrink-0" style={{ color: "var(--blusukan-on-surface-variant)" }}>
        {label}
      </span>
      <span className="text-sm font-semibold text-right" style={{ color: "var(--blusukan-on-surface)" }}>
        {value}
      </span>
    </div>
  );
}

export default function BookingFormClient({ service, destination, defaultContactNumber }: Props) {
  const [travelDate, setTravelDate] = useState("");
  const [meetingPoint, setMeetingPoint] = useState("");
  const [contactNumber, setContactNumber] = useState(defaultContactNumber);
  const [notes, setNotes] = useState("");
  const [estimatedArrivalTime, setEstimatedArrivalTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState<ConfirmedBooking | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!travelDate) {
      setError("Pilih tanggal perjalanan terlebih dahulu.");
      return;
    }
    if (!contactNumber.trim()) {
      setError("Nomor kontak wajib diisi.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          destinationId: destination.id,
          travelDate,
          meetingPoint: meetingPoint.trim() || undefined,
          notes: notes.trim() || undefined,
          contactNumber: contactNumber.trim(),
          estimatedArrivalTime: estimatedArrivalTime.trim() || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal membuat booking. Coba lagi.");
        setLoading(false);
        return;
      }

      setConfirmed({
        travelDate,
        meetingPoint: meetingPoint.trim(),
        contactNumber: contactNumber.trim(),
        notes: notes.trim(),
        estimatedArrivalTime: estimatedArrivalTime.trim(),
      });
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  }

  // ── Tampilan konfirmasi setelah submit berhasil ──
  if (confirmed) {
    const waMessage =
      `Halo ${service.providerName}, saya baru saja melakukan reservasi *${SERVICE_TYPE_LABEL[service.serviceType] ?? service.serviceType}* melalui Blusukan.\n\n` +
      `Destinasi: ${destination.name}\n` +
      `Tanggal: ${formatTanggal(confirmed.travelDate)}\n` +
      `Titik Jemput: ${confirmed.meetingPoint || "-"}\n` +
      `Nomor Kontak: ${confirmed.contactNumber}` +
      (confirmed.notes ? `\nCatatan: ${confirmed.notes}` : "") +
      `\n\nMohon konfirmasi ketersediaannya. Terima kasih.`;
    const waHref = `https://wa.me/${service.contactWa.replace(/\D/g, "")}?text=${encodeURIComponent(waMessage)}`;

    return (
      <div
        className="min-h-screen flex flex-col items-center px-4 py-16"
        style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
          style={{ background: "var(--blusukan-primary-container)" }}
        >
          <CheckCircle2 size={36} style={{ color: "var(--blusukan-primary)" }} />
        </div>

        <h1
          className="text-2xl font-bold text-center mb-1"
          style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
        >
          Booking Berhasil Dibuat
        </h1>
        <p className="text-sm text-center mb-8 max-w-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
          Reservasi Anda tersimpan. Hubungi penyedia jasa via WhatsApp untuk konfirmasi ketersediaan.
        </p>

        <div
          className="w-full max-w-md rounded-2xl p-6"
          style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
        >
          <div className="text-center mb-5 pb-5" style={{ borderBottom: "1px dashed var(--blusukan-outline-variant)" }}>
            <p className="text-xs mb-1.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Penyedia Jasa
            </p>
            <p className="text-xl font-bold" style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-primary)" }}>
              {service.providerName}
            </p>
          </div>

          <div className="space-y-3">
            <SummaryRow label="Destinasi" value={destination.name} />
            <SummaryRow label="Jenis Layanan" value={SERVICE_TYPE_LABEL[service.serviceType] ?? service.serviceType} />
            <SummaryRow label="Tanggal" value={formatTanggal(confirmed.travelDate)} />
            {confirmed.meetingPoint && <SummaryRow label="Titik Jemput" value={confirmed.meetingPoint} />}
            {confirmed.estimatedArrivalTime && (
              <SummaryRow label="Perkiraan Tiba" value={confirmed.estimatedArrivalTime} />
            )}
            <SummaryRow label="Nomor Kontak" value={confirmed.contactNumber} />
            {confirmed.notes && <SummaryRow label="Catatan" value={confirmed.notes} />}
            <div className="flex justify-between items-center pt-1">
              <span className="text-sm" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                Status
              </span>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: "#fef3e7", color: "#805533" }}
              >
                Menunggu Konfirmasi
              </span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md mt-8 flex flex-col items-center gap-4">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            id="btn-wa-booking"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: "#25D366", color: "#ffffff" }}
          >
            <MessageCircle size={16} />
            Hubungi via WhatsApp
          </a>
          <Link
            href="/booking/riwayat"
            id="btn-lihat-riwayat-booking"
            className="w-full text-center py-2.5 rounded-lg text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
          >
            Lihat Riwayat Booking
          </Link>
          <Link href="/booking" className="text-sm font-medium hover:underline" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Kembali ke Daftar Jasa
          </Link>
        </div>
      </div>
    );
  }

  // ── Form booking ──
  return (
    <div className="min-h-screen" style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-md mx-auto px-4 py-8">
        <Link
          href="/booking"
          id="booking-form-back"
          className="flex items-center gap-1.5 text-sm font-semibold mb-6 hover:opacity-70 transition-opacity"
          style={{ color: "var(--blusukan-primary)" }}
        >
          <ArrowLeft size={16} />
          Kembali ke Daftar Jasa
        </Link>

        {/* Ringkasan jasa */}
        <div
          className="rounded-2xl p-5 mb-6"
          style={{ background: "#ffffff", border: "1px solid var(--blusukan-outline-variant)" }}
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p
                className="text-base font-bold"
                style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
              >
                {service.providerName}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                {destination.name}
              </p>
            </div>
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap"
              style={{ background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }}
            >
              {SERVICE_TYPE_ICON[service.serviceType]}
              {SERVICE_TYPE_LABEL[service.serviceType] ?? service.serviceType}
            </span>
          </div>
          <div className="pt-3" style={{ borderTop: "1px dashed var(--blusukan-outline-variant)" }}>
            <span className="text-sm font-bold" style={{ color: "var(--blusukan-primary)" }}>
              {formatRupiah(service.baseRate)}
            </span>
            <span className="text-xs ml-1" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              tarif dasar
            </span>
          </div>
        </div>

        <h1
          className="text-lg font-bold mb-4"
          style={{ fontFamily: "Montserrat, sans-serif", color: "var(--blusukan-on-surface)" }}
        >
          Form Booking
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="travelDate" className="block text-xs font-medium mb-1.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Tanggal Perjalanan <span style={{ color: "var(--blusukan-error)" }}>*</span>
            </label>
            <input
              id="travelDate"
              type="date"
              required
              min={todayISODate()}
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              className="w-full px-3 py-2.5 text-sm"
              style={{
                border: "1px solid var(--blusukan-outline-variant)",
                borderRadius: "8px",
                color: "var(--blusukan-on-surface)",
              }}
            />
          </div>

          <div>
            <label htmlFor="meetingPoint" className="block text-xs font-medium mb-1.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Titik Jemput
            </label>
            <input
              id="meetingPoint"
              type="text"
              placeholder="misal: Terminal Giwangan, Yogyakarta"
              value={meetingPoint}
              onChange={(e) => setMeetingPoint(e.target.value)}
              className="w-full px-3 py-2.5 text-sm"
              style={{
                border: "1px solid var(--blusukan-outline-variant)",
                borderRadius: "8px",
                color: "var(--blusukan-on-surface)",
              }}
            />
          </div>

          <div>
            <label htmlFor="contactNumber" className="block text-xs font-medium mb-1.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Nomor Kontak <span style={{ color: "var(--blusukan-error)" }}>*</span>
            </label>
            <input
              id="contactNumber"
              type="tel"
              required
              placeholder="08xxxxxxxxxx"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="w-full px-3 py-2.5 text-sm"
              style={{
                border: "1px solid var(--blusukan-outline-variant)",
                borderRadius: "8px",
                color: "var(--blusukan-on-surface)",
              }}
            />
          </div>

          <div>
            <label htmlFor="estimatedArrivalTime" className="block text-xs font-medium mb-1.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Perkiraan Waktu Tiba
            </label>
            <input
              id="estimatedArrivalTime"
              type="text"
              placeholder="misal: 09.00 WIB"
              value={estimatedArrivalTime}
              onChange={(e) => setEstimatedArrivalTime(e.target.value)}
              className="w-full px-3 py-2.5 text-sm"
              style={{
                border: "1px solid var(--blusukan-outline-variant)",
                borderRadius: "8px",
                color: "var(--blusukan-on-surface)",
              }}
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-xs font-medium mb-1.5" style={{ color: "var(--blusukan-on-surface-variant)" }}>
              Catatan Tambahan
            </label>
            <textarea
              id="notes"
              rows={3}
              placeholder="misal: rombongan 4 orang, bawa anak kecil"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 text-sm resize-none"
              style={{
                border: "1px solid var(--blusukan-outline-variant)",
                borderRadius: "8px",
                color: "var(--blusukan-on-surface)",
              }}
            />
          </div>

          {error && (
            <p className="text-xs" style={{ color: "var(--blusukan-error)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            id="btn-submit-booking"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
          >
            {loading ? "Memproses..." : "Ajukan Booking"}
          </button>

          <p className="text-xs text-center" style={{ color: "var(--blusukan-on-surface-variant)" }}>
            Ini bukan transaksi pembayaran. Konfirmasi akhir dilakukan langsung dengan penyedia jasa via WhatsApp.
          </p>
        </form>
      </div>
    </div>
  );
}
