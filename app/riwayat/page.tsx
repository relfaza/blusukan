import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Riwayat Transaksi sudah dipindah jadi tab di halaman /notifikasi.
export default function RiwayatPage() {
  redirect("/notifikasi?tab=riwayat");
}
