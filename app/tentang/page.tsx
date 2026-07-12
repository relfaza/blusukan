import Link from "next/link";
import {
  Tags,
  Users,
  Store,
  ShieldCheck,
  Search,
  Eye,
  Send,
  Landmark,
} from "lucide-react";

export const metadata = {
  title: "Tentang Kami — Blusukan",
  description:
    "Blusukan menghadirkan transparansi harga, kondisi jalan crowdsourced, dan dukungan untuk UMKM/Pokdarwis lokal, dengan pengawasan Dinas Pariwisata.",
};

const MISI_POINTS = [
  {
    icon: <Tags size={20} />,
    title: "Transparansi Harga",
    description:
      "Setiap destinasi menampilkan harga tiket masuk apa adanya, dilaporkan langsung oleh pengunjung — tidak ada biaya tersembunyi yang mengejutkan wisatawan di lapangan.",
  },
  {
    icon: <Users size={20} />,
    title: "Kondisi Jalan Crowdsourced",
    description:
      "Kondisi jalan, sinyal, dan tingkat keramaian diperbarui oleh komunitas wisatawan secara real-time, sehingga setiap rencana perjalanan didasarkan pada data lapangan terkini.",
  },
  {
    icon: <Store size={20} />,
    title: "Dukungan Ekonomi Lokal",
    description:
      "Blusukan mempromosikan UMKM dan Pokdarwis di sekitar destinasi, membuka akses pasar yang lebih luas bagi pelaku usaha dan pengelola wisata lokal.",
  },
  {
    icon: <ShieldCheck size={20} />,
    title: "Pengawasan Dinas Pariwisata",
    description:
      "Setiap destinasi dan laporan komunitas berada di bawah pengawasan Dinas Pariwisata, menjaga kualitas data dan akuntabilitas pengelolaan wisata daerah.",
  },
];

const CARA_KERJA_STEPS = [
  {
    icon: <Search size={22} />,
    title: "Cari Destinasi",
    description: "Jelajahi hidden gem Yogyakarta berdasarkan wilayah, kategori, atau vibe yang diinginkan.",
  },
  {
    icon: <Eye size={22} />,
    title: "Lihat Info Transparan",
    description: "Cek harga, kondisi jalan, sinyal, dan tingkat keramaian dari laporan komunitas terkini.",
  },
  {
    icon: <Send size={22} />,
    title: "Booking / Lapor Langsung",
    description: "Booking layanan transport lokal atau kirim laporan kondisi terbaru langsung dari aplikasi.",
  },
  {
    icon: <Landmark size={22} />,
    title: "Dinas Pariwisata Pantau Kualitas",
    description: "Data dan destinasi diawasi Dinas Pariwisata untuk menjaga akurasi dan kualitas layanan.",
  },
];

export default function TentangPage() {
  return (
    <div style={{ background: "var(--blusukan-surface)", fontFamily: "Inter, sans-serif" }}>
      {/* ── Hero kecil ── */}
      <div
        className="px-4 lg:px-8 py-10 sm:py-14"
        style={{ background: "var(--blusukan-primary-container)" }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <p
            className="text-xs sm:text-sm font-semibold uppercase tracking-widest mb-2"
            style={{ color: "var(--blusukan-primary)" }}
          >
            Yogyakarta · Wisata Berkelanjutan
          </p>
          <h1
            className="text-3xl sm:text-4xl font-extrabold"
            style={{ color: "var(--blusukan-on-primary-container)", fontFamily: "Montserrat, sans-serif" }}
          >
            Tentang Blusukan
          </h1>
          <p
            className="mt-3 text-sm sm:text-base max-w-2xl mx-auto"
            style={{ color: "var(--blusukan-on-surface-variant)" }}
          >
            Platform yang menghubungkan wisatawan, pengelola lokal, dan Dinas Pariwisata untuk
            wisata Yogyakarta yang lebih transparan dan berkelanjutan.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-12 sm:py-16 space-y-16">
        {/* ── Misi Kami ── */}
        <section>
          <h2
            className="text-2xl sm:text-3xl font-bold text-center"
            style={{ color: "var(--blusukan-on-surface)", fontFamily: "Montserrat, sans-serif" }}
          >
            Misi Kami
          </h2>
          <p
            className="mt-3 text-sm sm:text-base text-center max-w-3xl mx-auto leading-relaxed"
            style={{ color: "var(--blusukan-on-surface-variant)" }}
          >
            Blusukan hadir untuk menjawab tantangan wisata hidden gem di Yogyakarta yang kerap
            minim informasi: harga yang tidak jelas, kondisi jalan yang tidak terpantau, serta
            manfaat ekonomi yang belum sepenuhnya dirasakan masyarakat sekitar. Kami membangun
            ekosistem yang transparan dan akuntabel — dari wisatawan, pengelola lokal, hingga
            Dinas Pariwisata — agar setiap perjalanan aman direncanakan dan setiap kunjungan
            memberi dampak nyata bagi ekonomi lokal.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {MISI_POINTS.map((point) => (
              <div
                key={point.title}
                className="p-5 rounded-2xl flex gap-4"
                style={{
                  background: "var(--blusukan-surface-container-lowest)",
                  border: "1px solid var(--blusukan-outline-variant)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "var(--blusukan-primary-container)", color: "var(--blusukan-primary)" }}
                >
                  {point.icon}
                </div>
                <div>
                  <h3
                    className="text-sm font-bold"
                    style={{ color: "var(--blusukan-on-surface)", fontFamily: "Montserrat, sans-serif" }}
                  >
                    {point.title}
                  </h3>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                    {point.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Bagaimana Cara Kerjanya ── */}
        <section>
          <h2
            className="text-2xl sm:text-3xl font-bold text-center"
            style={{ color: "var(--blusukan-on-surface)", fontFamily: "Montserrat, sans-serif" }}
          >
            Bagaimana Cara Kerjanya
          </h2>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CARA_KERJA_STEPS.map((step, i) => (
              <div key={step.title} className="text-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
                  style={{ background: "var(--blusukan-primary)", color: "var(--blusukan-on-primary)" }}
                >
                  {step.icon}
                </div>
                <p
                  className="mt-3 text-xs font-bold uppercase tracking-wide"
                  style={{ color: "var(--blusukan-primary)" }}
                >
                  Langkah {i + 1}
                </p>
                <h3
                  className="text-sm font-bold mt-1"
                  style={{ color: "var(--blusukan-on-surface)", fontFamily: "Montserrat, sans-serif" }}
                >
                  {step.title}
                </h3>
                <p className="text-xs mt-1.5 leading-relaxed" style={{ color: "var(--blusukan-on-surface-variant)" }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Untuk Pengelola Lokal ── */}
        <section
          className="rounded-2xl px-6 py-10 sm:py-12 text-center"
          style={{ background: "var(--blusukan-primary)" }}
        >
          <h2
            className="text-xl sm:text-2xl font-bold"
            style={{ color: "var(--blusukan-on-primary)", fontFamily: "Montserrat, sans-serif" }}
          >
            Untuk Pengelola Lokal
          </h2>
          <p
            className="mt-3 text-sm sm:text-base max-w-xl mx-auto"
            style={{ color: "var(--blusukan-primary-container)" }}
          >
            Kelola destinasi Anda, jangkau lebih banyak wisatawan, dan kembangkan UMKM/Pokdarwis
            bersama Blusukan.
          </p>
          <Link
            href="/register"
            id="tentang-daftar-pengelola"
            className="inline-block mt-6 font-semibold px-6 py-3 rounded-full transition-opacity hover:opacity-90"
            style={{
              background: "var(--blusukan-on-primary)",
              color: "var(--blusukan-primary)",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Daftar sebagai Pengelola
          </Link>
        </section>
      </div>
    </div>
  );
}
