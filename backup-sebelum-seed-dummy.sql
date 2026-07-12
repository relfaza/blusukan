--
-- PostgreSQL database dump
--

\restrict N9nobybms7GzEipd5FJBlcAlUk2IC7OqSjyl2YfsWTmYNtzlnqJwixc2PCCb8pV

-- Dumped from database version 18.4 (709c4c3)
-- Dumped by pg_dump version 18.4 (Ubuntu 18.4-0ubuntu0.26.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: BookingStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."BookingStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'COMPLETED',
    'EXPIRED'
);


ALTER TYPE public."BookingStatus" OWNER TO neondb_owner;

--
-- Name: CrowdLevel; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."CrowdLevel" AS ENUM (
    'SEPI',
    'SEDANG',
    'PADAT'
);


ALTER TYPE public."CrowdLevel" OWNER TO neondb_owner;

--
-- Name: DestinationStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."DestinationStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'NONAKTIF'
);


ALTER TYPE public."DestinationStatus" OWNER TO neondb_owner;

--
-- Name: Kabupaten; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."Kabupaten" AS ENUM (
    'SLEMAN',
    'GUNUNGKIDUL',
    'BANTUL',
    'KULON_PROGO',
    'KOTA_YOGYAKARTA'
);


ALTER TYPE public."Kabupaten" OWNER TO neondb_owner;

--
-- Name: Kategori; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."Kategori" AS ENUM (
    'PANTAI',
    'AIR_TERJUN',
    'GUNUNG',
    'BUKIT',
    'TEBING'
);


ALTER TYPE public."Kategori" OWNER TO neondb_owner;

--
-- Name: KategoriUmkm; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."KategoriUmkm" AS ENUM (
    'KULINER',
    'KERAJINAN',
    'FASHION',
    'JASA',
    'LAINNYA'
);


ALTER TYPE public."KategoriUmkm" OWNER TO neondb_owner;

--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'COD',
    'TRANSFER_MANUAL'
);


ALTER TYPE public."PaymentMethod" OWNER TO neondb_owner;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."Role" AS ENUM (
    'WISATAWAN',
    'PENGELOLA',
    'ADMIN'
);


ALTER TYPE public."Role" OWNER TO neondb_owner;

--
-- Name: RouteStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."RouteStatus" AS ENUM (
    'MUDAH',
    'SEDANG',
    'SULIT',
    'RUSAK',
    'BELUM_ADA_DATA'
);


ALTER TYPE public."RouteStatus" OWNER TO neondb_owner;

--
-- Name: ServiceType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ServiceType" AS ENUM (
    'OJEK',
    'JEEP',
    'GUIDE'
);


ALTER TYPE public."ServiceType" OWNER TO neondb_owner;

--
-- Name: SignalStrength; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."SignalStrength" AS ENUM (
    'LEMAH',
    'SEDANG',
    'KUAT'
);


ALTER TYPE public."SignalStrength" OWNER TO neondb_owner;

--
-- Name: TransaksiStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."TransaksiStatus" AS ENUM (
    'PENDING',
    'DIKONFIRMASI',
    'SELESAI',
    'DIBATALKAN'
);


ALTER TYPE public."TransaksiStatus" OWNER TO neondb_owner;

--
-- Name: TransaksiType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."TransaksiType" AS ENUM (
    'TIKET_MASUK',
    'FASILITAS',
    'UMKM'
);


ALTER TYPE public."TransaksiType" OWNER TO neondb_owner;

--
-- Name: VibeTag; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."VibeTag" AS ENUM (
    'SUNSET',
    'SUNRISE',
    'SPOT_FOTO',
    'QUIET_PLACE'
);


ALTER TYPE public."VibeTag" OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Booking; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Booking" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "serviceId" text NOT NULL,
    "destinationId" text NOT NULL,
    "travelDate" timestamp(3) without time zone NOT NULL,
    "meetingPoint" text,
    notes text,
    "contactNumber" text NOT NULL,
    "estimatedArrivalTime" text,
    status public."BookingStatus" DEFAULT 'PENDING'::public."BookingStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Booking" OWNER TO neondb_owner;

--
-- Name: Destination; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Destination" (
    id text NOT NULL,
    name text NOT NULL,
    kabupaten public."Kabupaten" NOT NULL,
    kategori public."Kategori" NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    "jamOperasional" text,
    "htmResmi" numeric(65,30) DEFAULT 0 NOT NULL,
    "hasToilet" boolean DEFAULT false NOT NULL,
    "hasParkir" boolean DEFAULT false NOT NULL,
    "hasTempatIbadah" boolean DEFAULT false NOT NULL,
    "hasTempatDuduk" boolean DEFAULT false NOT NULL,
    "hasPenitipanBarang" boolean DEFAULT false NOT NULL,
    aksesibilitas text,
    "vibeTags" public."VibeTag"[],
    "routeStatus" public."RouteStatus" DEFAULT 'BELUM_ADA_DATA'::public."RouteStatus" NOT NULL,
    status public."DestinationStatus" DEFAULT 'PENDING'::public."DestinationStatus" NOT NULL,
    "submittedById" text NOT NULL,
    "approvedById" text,
    "approvedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "photoUrls" text[] DEFAULT ARRAY[]::text[],
    "buka24Jam" boolean DEFAULT false NOT NULL,
    "jamBuka" text,
    "jamTutup" text,
    "htmAnak" numeric(65,30)
);


ALTER TABLE public."Destination" OWNER TO neondb_owner;

--
-- Name: Fasilitas; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Fasilitas" (
    id text NOT NULL,
    "destinationId" text NOT NULL,
    nama text NOT NULL,
    "hargaSewa" numeric(65,30) NOT NULL,
    "satuanWaktu" text DEFAULT 'per jam'::text NOT NULL,
    "jumlahUnit" integer DEFAULT 1 NOT NULL,
    "deskripsiManfaat" text,
    "fotoUrl" text,
    "lokasiDalamDestinasi" text
);


ALTER TABLE public."Fasilitas" OWNER TO neondb_owner;

--
-- Name: LocalService; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."LocalService" (
    id text NOT NULL,
    "destinationId" text NOT NULL,
    "providerName" text NOT NULL,
    "serviceType" public."ServiceType" NOT NULL,
    "contactWa" text NOT NULL,
    "baseRate" numeric(65,30) NOT NULL,
    "isValidated" boolean DEFAULT false NOT NULL,
    "validatedById" text,
    "fotoUrl" text,
    "kapasitasPenumpang" integer
);


ALTER TABLE public."LocalService" OWNER TO neondb_owner;

--
-- Name: LocalWarung; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."LocalWarung" (
    id text NOT NULL,
    "destinationId" text NOT NULL,
    name text NOT NULL,
    location text,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    kategori public."KategoriUmkm" DEFAULT 'LAINNYA'::public."KategoriUmkm" NOT NULL,
    "namaPemilik" text,
    "bisaBooking" boolean DEFAULT true NOT NULL,
    "photoUrls" text[] DEFAULT ARRAY[]::text[]
);


ALTER TABLE public."LocalWarung" OWNER TO neondb_owner;

--
-- Name: MenuItem; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."MenuItem" (
    id text NOT NULL,
    "warungId" text NOT NULL,
    name text NOT NULL,
    price numeric(65,30) NOT NULL
);


ALTER TABLE public."MenuItem" OWNER TO neondb_owner;

--
-- Name: Notifikasi; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Notifikasi" (
    id text NOT NULL,
    "userId" text NOT NULL,
    judul text NOT NULL,
    pesan text NOT NULL,
    link text,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    kategori text
);


ALTER TABLE public."Notifikasi" OWNER TO neondb_owner;

--
-- Name: Review; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Review" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "destinationId" text NOT NULL,
    rating integer NOT NULL,
    komentar text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Review" OWNER TO neondb_owner;

--
-- Name: TitikJemput; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."TitikJemput" (
    id text NOT NULL,
    "serviceId" text NOT NULL,
    "namaLokasi" text NOT NULL,
    "hargaTambahan" numeric(65,30) DEFAULT 0 NOT NULL,
    "estimasiWaktu" text
);


ALTER TABLE public."TitikJemput" OWNER TO neondb_owner;

--
-- Name: Transaksi; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Transaksi" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "destinationId" text NOT NULL,
    type public."TransaksiType" NOT NULL,
    "totalHarga" numeric(65,30) NOT NULL,
    status public."TransaksiStatus" DEFAULT 'PENDING'::public."TransaksiStatus" NOT NULL,
    "paymentMethod" public."PaymentMethod" DEFAULT 'COD'::public."PaymentMethod" NOT NULL,
    jadwal timestamp(3) without time zone,
    catatan text,
    "kodeTransaksi" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "dibatalkanAt" timestamp(3) without time zone,
    "dikonfirmasiAt" timestamp(3) without time zone,
    "selesaiAt" timestamp(3) without time zone
);


ALTER TABLE public."Transaksi" OWNER TO neondb_owner;

--
-- Name: TransaksiItem; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."TransaksiItem" (
    id text NOT NULL,
    "transaksiId" text NOT NULL,
    "namaItem" text NOT NULL,
    "hargaSatuan" numeric(65,30) NOT NULL,
    kuantitas integer NOT NULL,
    subtotal numeric(65,30) NOT NULL
);


ALTER TABLE public."TransaksiItem" OWNER TO neondb_owner;

--
-- Name: User; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    "passwordHash" text NOT NULL,
    "nikEncrypted" text,
    role public."Role" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "resetToken" text,
    "resetTokenExpiry" timestamp(3) without time zone,
    "bahasaPreferensi" text DEFAULT 'id'::text NOT NULL,
    "namaInstansi" text,
    "notifEmailAktif" boolean DEFAULT true NOT NULL,
    "namaUsaha" text,
    "notifBookingAktif" boolean DEFAULT true NOT NULL,
    "notifTransaksiAktif" boolean DEFAULT true NOT NULL,
    "notifUlasanAktif" boolean DEFAULT true NOT NULL,
    "notifLainnyaAktif" boolean DEFAULT true NOT NULL,
    "notifStatusBookingAktif" boolean DEFAULT true NOT NULL,
    "notifStatusTransaksiAktif" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."User" OWNER TO neondb_owner;

--
-- Name: UserReport; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."UserReport" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "destinationId" text NOT NULL,
    "roadCondition" public."RouteStatus" NOT NULL,
    "signalStrength" public."SignalStrength" NOT NULL,
    "toiletLayak" boolean,
    "parkirLayak" boolean,
    "tempatIbadahLayak" boolean,
    "tempatDudukLayak" boolean,
    "penitipanBarangLayak" boolean,
    "reportedFee" numeric(65,30),
    "crowdLevel" public."CrowdLevel" NOT NULL,
    "photoUrl" text,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    "upvoteCount" integer DEFAULT 0 NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."UserReport" OWNER TO neondb_owner;

--
-- Name: VisitStat; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."VisitStat" (
    id text NOT NULL,
    "destinationId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "visitorCount" integer DEFAULT 0 NOT NULL,
    "peakHour" integer,
    "crowdLevel" public."CrowdLevel"
);


ALTER TABLE public."VisitStat" OWNER TO neondb_owner;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO neondb_owner;

--
-- Data for Name: Booking; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Booking" (id, "userId", "serviceId", "destinationId", "travelDate", "meetingPoint", notes, "contactNumber", "estimatedArrivalTime", status, "createdAt") FROM stdin;
cmr53s74n008enxu22d0a4ozt	cmr53rtnd0004nxu2di8cbvo7	cmr53rulv000lnxu2my50du2a	cmr53rtuq0008nxu2bh61jc5b	2026-07-04 15:43:38.517	Pos Masuk Destinasi	\N	628681435264	\N	CONFIRMED	2026-07-02 15:43:38.517
cmr53s763008fnxu2znm7lwme	cmr53rtkn0002nxu21bbesvmg	cmr53rulv000lnxu2my50du2a	cmr53rtuq0008nxu2bh61jc5b	2026-06-13 15:43:38.568	Pos Masuk Destinasi	\N	628356168618	\N	PENDING	2026-06-24 15:43:38.568
cmr53s77d008gnxu239a77b7f	cmr53rtoq0005nxu2ayl9e30c	cmr53rulv000lnxu2my50du2a	cmr53rtuq0008nxu2bh61jc5b	2026-06-15 15:43:38.616	Pos Masuk Destinasi	\N	628476907017	\N	PENDING	2026-06-17 15:43:38.616
cmr53s78t008hnxu2e4t7kvub	cmr53rtnd0004nxu2di8cbvo7	cmr53rulv000lnxu2my50du2a	cmr53rtuq0008nxu2bh61jc5b	2026-07-09 15:43:38.667	Pos Masuk Destinasi	\N	628655982681	\N	CONFIRMED	2026-07-02 15:43:38.667
cmr53s7ab008inxu2y1dqe9gi	cmr53rtoq0005nxu2ayl9e30c	cmr53runa000mnxu2iljrwwm2	cmr53rtwt0009nxu2kcf7b4a7	2026-07-13 15:43:38.717	Pos Masuk Destinasi	\N	628547107275	\N	COMPLETED	2026-06-27 15:43:38.717
cmr53s7bs008jnxu2au73fb6u	cmr53rtkn0002nxu21bbesvmg	cmr53runa000mnxu2iljrwwm2	cmr53rtwt0009nxu2kcf7b4a7	2026-06-24 15:43:38.775	Pos Masuk Destinasi	\N	628860774086	\N	PENDING	2026-06-26 15:43:38.775
cmr53s7d7008knxu2dpp3x2ls	cmr53rtnd0004nxu2di8cbvo7	cmr53runa000mnxu2iljrwwm2	cmr53rtwt0009nxu2kcf7b4a7	2026-07-01 15:43:38.826	Pos Masuk Destinasi	\N	628556558597	\N	COMPLETED	2026-06-09 15:43:38.826
cmr53s7el008lnxu2vlzomuet	cmr53rtnd0004nxu2di8cbvo7	cmr53runa000mnxu2iljrwwm2	cmr53rtwt0009nxu2kcf7b4a7	2026-07-05 15:43:38.876	Pos Masuk Destinasi	\N	628709236036	\N	CONFIRMED	2026-06-13 15:43:38.876
cmr53s7g4008mnxu2lm4ouidc	cmr53rtly0003nxu2h3we68lo	cmr53ruox000nnxu2jj3zse1h	cmr53ru4b000dnxu2xmbuu635	2026-06-16 15:43:38.927	Pos Masuk Destinasi	\N	628604635543	\N	EXPIRED	2026-06-09 15:43:38.927
cmr53s7hg008nnxu2751tkz9l	cmr53rtnd0004nxu2di8cbvo7	cmr53ruox000nnxu2jj3zse1h	cmr53ru4b000dnxu2xmbuu635	2026-06-23 15:43:38.979	Pos Masuk Destinasi	\N	628447377685	\N	CONFIRMED	2026-06-30 15:43:38.979
cmr53s7jc008onxu2yfhv2aw8	cmr53rtq40006nxu2z1iql38w	cmr53ruqf000onxu2q973yfkj	cmr53rua5000fnxu2we1n52lw	2026-06-21 15:43:39.046	Pos Masuk Destinasi	\N	628326567592	\N	PENDING	2026-07-02 15:43:39.046
cmr53s7kq008pnxu2bqbjwkl0	cmr53rtoq0005nxu2ayl9e30c	cmr53ruqf000onxu2q973yfkj	cmr53rua5000fnxu2we1n52lw	2026-07-04 15:43:39.097	Pos Masuk Destinasi	\N	628119329062	\N	EXPIRED	2026-06-25 15:43:39.097
cmr53s7m4008qnxu2pt193rxk	cmr53rtnd0004nxu2di8cbvo7	cmr53rurz000pnxu2jpjfg0w2	cmr53rug9000inxu2k3fpa7m0	2026-06-26 15:43:39.147	Pos Masuk Destinasi	\N	628786776201	\N	COMPLETED	2026-06-09 15:43:39.147
cmr53s7ng008rnxu2w4jiu3qj	cmr53rtq40006nxu2z1iql38w	cmr53rurz000pnxu2jpjfg0w2	cmr53rug9000inxu2k3fpa7m0	2026-06-15 15:43:39.195	Pos Masuk Destinasi	\N	628776007109	\N	EXPIRED	2026-06-20 15:43:39.195
cmr6buir8000prou2biy1f2r2	cmr6aw7x00001rou2e39g6xf6	cmr53runa000mnxu2iljrwwm2	cmr53rtwt0009nxu2kcf7b4a7	2026-07-04 00:00:00	mana saja	\N	081122334455	\N	PENDING	2026-07-04 12:17:10.004
cmr6bv7hg000qrou2fskpvyy9	cmr6aw7x00001rou2e39g6xf6	cmr53runa000mnxu2iljrwwm2	cmr53rtwt0009nxu2kcf7b4a7	2026-07-04 00:00:00	\N	\N	081122334455	\N	PENDING	2026-07-04 12:17:42.052
cmr6ddlti000rrou2q3ad2ald	cmr6aw7x00001rou2e39g6xf6	cmr53runa000mnxu2iljrwwm2	cmr53rtwt0009nxu2kcf7b4a7	2026-07-09 00:00:00	\N	\N	081122334455	\N	PENDING	2026-07-04 13:00:00.055
cmr6deni6000srou2a36k983b	cmr6aw7x00001rou2e39g6xf6	cmr53rurz000pnxu2jpjfg0w2	cmr53rug9000inxu2k3fpa7m0	2026-07-11 00:00:00	\N	\N	081122334455	\N	PENDING	2026-07-04 13:00:48.894
cmraddrg80000lkuf659mjubn	cmr57ouyv000084uftd63yole	cmr53rulv000lnxu2my50du2a	cmr53rtuq0008nxu2bh61jc5b	2026-07-10 00:00:00	Terminal Jombor	5 orang	085238500146	08.00 WIB	PENDING	2026-07-07 08:11:12.057
cmrafafi600006oufiwowaubi	cmr57ouyv000084uftd63yole	cmr53rulv000lnxu2my50du2a	cmr53rtuq0008nxu2bh61jc5b	2026-07-11 00:00:00	Terminal Jombor	6 orang, 2 orang anak-anak	085238500146	09.00 WIB	PENDING	2026-07-07 09:04:35.838
cmrafay8l00016ouf3j72a48l	cmr57ouyv000084uftd63yole	cmr53runa000mnxu2iljrwwm2	cmr53rtwt0009nxu2kcf7b4a7	2026-07-17 00:00:00	Terminal Jombor	\N	085238500146	09.00 WIB	PENDING	2026-07-07 09:05:00.118
cmrh8w49600054zu2qkn145ic	cmr53rtkn0002nxu21bbesvmg	cmr53rulv000lnxu2my50du2a	cmr53rtuq0008nxu2bh61jc5b	2026-08-01 00:00:00	Terminal Jombor	\N	081234567890	\N	CONFIRMED	2026-07-12 03:39:53.61
cmrh8xzqm00084zu27pew85tf	cmr53rtkn0002nxu21bbesvmg	cmr53runa000mnxu2iljrwwm2	cmr53rtwt0009nxu2kcf7b4a7	2026-08-02 00:00:00	Terminal Giwangan, Yogyakarta	\N	081234567890	\N	PENDING	2026-07-12 03:41:21.07
\.


--
-- Data for Name: Destination; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Destination" (id, name, kabupaten, kategori, latitude, longitude, "jamOperasional", "htmResmi", "hasToilet", "hasParkir", "hasTempatIbadah", "hasTempatDuduk", "hasPenitipanBarang", aksesibilitas, "vibeTags", "routeStatus", status, "submittedById", "approvedById", "approvedAt", "createdAt", "photoUrls", "buka24Jam", "jamBuka", "jamTutup", "htmAnak") FROM stdin;
cmrha3kfr00003559km6npm4b	Bukit Paralayang Watugupit	GUNUNGKIDUL	BUKIT	-8.0277661	110.369976	06:00 - 20:00	10000.000000000000000000000000000000	t	t	t	t	f	Bagi para pemburu Sunset tentu saja tempat wisata ini cocok untuk dijadikan sebagai destinasinya. Warna cahaya keemasan dari matahari terbenam memantul sampai ke permukaan laut sehingga penampakannya memang sangat menakjubkan.	{SUNSET,SPOT_FOTO,QUIET_PLACE}	BELUM_ADA_DATA	APPROVED	cmreo5a2z0000va59nhzafvye	cmr55dnks000f2du291co2mue	2026-07-12 04:49:53.002	2026-07-12 04:13:40.791	{https://res.cloudinary.com/am0sqyor/image/upload/v1783829428/blusukan/destinasi/fclskf5hp2oqjwqdc9q9.avif,https://res.cloudinary.com/am0sqyor/image/upload/v1783829428/blusukan/destinasi/k0sqezlie8mq6pg9i8rf.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783829428/blusukan/destinasi/qz0vky4slmvsiqjg9xaf.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783829428/blusukan/destinasi/cqebisaagw6bfpv7iux9.jpg}	f	06:00	20:00	\N
cmrhc5ces000n3559gxtm0djt	Tebing Breksi	SLEMAN	TEBING	-7.795357339791491	110.55112838745119	08:00 - 21:00	20000.000000000000000000000000000000	t	t	t	t	f	Hits dan Kekinian, mungkin itulah yang bisa menggambarkan destinasi wisata Taman Tebing Breksi di Yogyakarta ini.	{SPOT_FOTO}	BELUM_ADA_DATA	APPROVED	cmreo5a2z0000va59nhzafvye	cmr55dnks000f2du291co2mue	2026-07-12 05:11:14.957	2026-07-12 05:11:02.932	{https://res.cloudinary.com/am0sqyor/image/upload/v1783833026/blusukan/destinasi/cmdk0qp06opwux380mtg.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783833026/blusukan/destinasi/frpunnbbly7ogaovmkgx.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783833026/blusukan/destinasi/gjmfxn1aeaedd1nwatnc.jpg}	f	08:00	21:00	10000.000000000000000000000000000000
cmr53rtuq0008nxu2bh61jc5b	Bukit Klangon	SLEMAN	BUKIT	-7.6128	110.4456	06:00 - 18:00	5000.000000000000000000000000000000	t	f	t	t	f	\N	{SUNRISE,QUIET_PLACE}	SULIT	APPROVED	cmr53rtiw0001nxu2xsxss3b3	cmr53rtd00000nxu2hivz6wzh	2026-05-16 15:43:21.303	2026-07-03 15:43:21.315	{https://picsum.photos/seed/bukit-klangon-1/800/600,https://picsum.photos/seed/bukit-klangon-2/800/600}	f	\N	\N	\N
cmr53rtwt0009nxu2kcf7b4a7	Air Terjun Tlogo Muncar	SLEMAN	AIR_TERJUN	-7.6512	110.4271	06:00 - 18:00	0.000000000000000000000000000000	f	t	t	t	t	\N	{QUIET_PLACE}	RUSAK	APPROVED	cmr53rtiw0001nxu2xsxss3b3	cmr53rtd00000nxu2hivz6wzh	2026-06-12 15:43:21.368	2026-07-03 15:43:21.389	{https://picsum.photos/seed/air-terjun-tlogo-muncar-1/800/600,https://picsum.photos/seed/air-terjun-tlogo-muncar-2/800/600}	f	\N	\N	\N
cmr53rtzo000anxu2x2eqghmi	Pantai Wediombo	GUNUNGKIDUL	PANTAI	-8.2089	110.6739	06:00 - 18:00	10000.000000000000000000000000000000	t	t	t	t	f	\N	{SUNSET,SPOT_FOTO}	SEDANG	APPROVED	cmr53rtiw0001nxu2xsxss3b3	cmr53rtd00000nxu2hivz6wzh	2026-05-13 15:43:21.454	2026-07-03 15:43:21.493	{https://picsum.photos/seed/pantai-wediombo-1/800/600,https://picsum.photos/seed/pantai-wediombo-2/800/600}	f	\N	\N	\N
cmr53ru1b000bnxu2urm3gg23	Air Terjun Sri Gethuk	GUNUNGKIDUL	AIR_TERJUN	-7.9486	110.6628	06:00 - 18:00	15000.000000000000000000000000000000	t	t	t	t	f	\N	{SPOT_FOTO}	MUDAH	APPROVED	cmr53rtiw0001nxu2xsxss3b3	cmr53rtd00000nxu2hivz6wzh	2026-05-21 15:43:21.548	2026-07-03 15:43:21.552	{https://picsum.photos/seed/air-terjun-sri-gethuk-1/800/600,https://picsum.photos/seed/air-terjun-sri-gethuk-2/800/600}	f	\N	\N	\N
cmr53ru2q000cnxu2eeq4pnrm	Gunung Api Purba Nglanggeran	GUNUNGKIDUL	GUNUNG	-7.8775	110.595	06:00 - 18:00	15000.000000000000000000000000000000	t	t	f	f	f	\N	{SUNRISE,SPOT_FOTO}	SEDANG	APPROVED	cmr53rtiw0001nxu2xsxss3b3	cmr53rtd00000nxu2hivz6wzh	2026-06-07 15:43:21.597	2026-07-03 15:43:21.602	{https://picsum.photos/seed/gunung-api-purba-nglanggeran-1/800/600,https://picsum.photos/seed/gunung-api-purba-nglanggeran-2/800/600}	f	\N	\N	\N
cmr53ru4b000dnxu2xmbuu635	Pantai Ngrenehan	BANTUL	PANTAI	-8.1453	110.4769	06:00 - 18:00	5000.000000000000000000000000000000	f	t	f	f	f	\N	{QUIET_PLACE}	SULIT	APPROVED	cmr53rtiw0001nxu2xsxss3b3	cmr53rtd00000nxu2hivz6wzh	2026-05-08 15:43:21.656	2026-07-03 15:43:21.659	{https://picsum.photos/seed/pantai-ngrenehan-1/800/600,https://picsum.photos/seed/pantai-ngrenehan-2/800/600}	f	\N	\N	\N
cmr53ru60000enxu21aim6ww5	Bukit Lintang Sewu	BANTUL	BUKIT	-7.9398	110.4203	06:00 - 18:00	5000.000000000000000000000000000000	t	t	f	t	f	\N	{SUNSET,QUIET_PLACE}	SEDANG	APPROVED	cmr53rtiw0001nxu2xsxss3b3	cmr53rtd00000nxu2hivz6wzh	2026-05-21 15:43:21.711	2026-07-03 15:43:21.72	{https://picsum.photos/seed/bukit-lintang-sewu-1/800/600,https://picsum.photos/seed/bukit-lintang-sewu-2/800/600}	f	\N	\N	\N
cmr53rtsi0007nxu225v5jaek	Tebing Breksi	SLEMAN	TEBING	-7.7747	110.5142	06:00 - 18:00	10000.000000000000000000000000000000	t	t	f	f	f	\N	{SUNSET,SPOT_FOTO}	MUDAH	APPROVED	cmr53rtiw0001nxu2xsxss3b3	cmr53rtd00000nxu2hivz6wzh	2026-06-07 15:43:21.2	2026-07-03 15:43:21.235	{}	f	06:00	18:00	\N
cmr53rua5000fnxu2we1n52lw	Curug Banyu Nibo	BANTUL	AIR_TERJUN	-7.9637	110.4451	06:00 - 18:00	0.000000000000000000000000000000	t	t	f	t	f	\N	{QUIET_PLACE}	RUSAK	APPROVED	cmr53rtiw0001nxu2xsxss3b3	cmr53rtd00000nxu2hivz6wzh	2026-06-03 15:43:21.852	2026-07-03 15:43:21.869	{https://picsum.photos/seed/curug-banyu-nibo-1/800/600,https://picsum.photos/seed/curug-banyu-nibo-2/800/600}	f	\N	\N	\N
cmr53rucf000gnxu2w6rktmtm	Puncak Pule Payung	KULON_PROGO	BUKIT	-7.7654	110.1672	06:00 - 18:00	10000.000000000000000000000000000000	t	t	f	t	t	\N	{SUNRISE,SPOT_FOTO}	MUDAH	APPROVED	cmr53rtiw0001nxu2xsxss3b3	cmr53rtd00000nxu2hivz6wzh	2026-06-10 15:43:21.939	2026-07-03 15:43:21.951	{https://picsum.photos/seed/puncak-pule-payung-1/800/600,https://picsum.photos/seed/puncak-pule-payung-2/800/600}	f	\N	\N	\N
cmr53ruec000hnxu2ycrswa5w	Pantai Trisik	KULON_PROGO	PANTAI	-7.9356	110.1456	06:00 - 18:00	5000.000000000000000000000000000000	f	t	t	t	f	\N	{SUNSET}	SEDANG	APPROVED	cmr53rtiw0001nxu2xsxss3b3	cmr53rtd00000nxu2hivz6wzh	2026-06-09 15:43:22.008	2026-07-03 15:43:22.02	{https://picsum.photos/seed/pantai-trisik-1/800/600,https://picsum.photos/seed/pantai-trisik-2/800/600}	f	\N	\N	\N
cmr559srg000e2du2or9eg7sf	Pantai Gatau	KULON_PROGO	PANTAI	-7.9422762075099795	110.13776779174806	08.00 - 17.00	10000.000000000000000000000000000000	t	t	t	t	t	Jalan akses lancar	{SUNSET,SUNRISE,SPOT_FOTO,QUIET_PLACE}	BELUM_ADA_DATA	APPROVED	cmr54zgvg00002du2004luk4i	cmr53rtd00000nxu2hivz6wzh	2026-07-03 16:36:49.586	2026-07-03 16:25:19.325	{https://res.cloudinary.com/am0sqyor/image/upload/v1783095918/blusukan/destinasi/iv9g7qiygsvem99yjixc.jpg}	f	\N	\N	\N
cmr53ruhy000jnxu2dvcsmaqt	Curug Lepo (Belum Divalidasi)	GUNUNGKIDUL	AIR_TERJUN	-7.9012	110.6234	\N	0.000000000000000000000000000000	f	f	f	f	f	\N	{QUIET_PLACE}	BELUM_ADA_DATA	APPROVED	cmr53rtiw0001nxu2xsxss3b3	cmr55dnks000f2du291co2mue	2026-07-03 16:39:35.807	2026-07-03 15:43:22.151	{https://picsum.photos/seed/curug-lepo-1/800/600,https://picsum.photos/seed/curug-lepo-2/800/600}	f	\N	\N	\N
cmr53ruk3000knxu2hffi6oub	Bukit Watu Lawang (Belum Divalidasi)	SLEMAN	BUKIT	-7.6789	110.4567	\N	5000.000000000000000000000000000000	f	f	f	f	f	\N	{SUNSET}	BELUM_ADA_DATA	APPROVED	cmr53rtiw0001nxu2xsxss3b3	cmr55dnks000f2du291co2mue	2026-07-03 16:39:37.743	2026-07-03 15:43:22.227	{https://picsum.photos/seed/bukit-watu-lawang-1/800/600,https://picsum.photos/seed/bukit-watu-lawang-2/800/600}	f	\N	\N	\N
cmr55vzsh000317u20plp9wfu	testing	BANTUL	PANTAI	-8.020475528205624	110.32316207885744	\N	10000.000000000000000000000000000000	t	t	t	f	f	tessssstinggggggtinggggg	{SUNSET,SUNRISE}	BELUM_ADA_DATA	APPROVED	cmr54zgvg00002du2004luk4i	cmr55dnks000f2du291co2mue	2026-07-03 16:42:41.892	2026-07-03 16:42:34.871	{https://res.cloudinary.com/am0sqyor/image/upload/v1783096954/blusukan/destinasi/behnyjavg8qza7pa6dex.jpg}	f	\N	\N	\N
cmr6bbnng000brou2q49a0p0n	Pantai adadeh	KULON_PROGO	PANTAI	-7.929439892403122	110.10504484176637	06.00 - 22.00	10000.000000000000000000000000000000	t	t	t	t	t	Tesssstieanggalaljalgkdk	{SUNSET,SUNRISE,QUIET_PLACE,SPOT_FOTO}	BELUM_ADA_DATA	APPROVED	cmr54zgvg00002du2004luk4i	cmr55dnks000f2du291co2mue	2026-07-04 12:03:31.399	2026-07-04 12:02:29.885	{https://res.cloudinary.com/am0sqyor/image/upload/v1783166550/blusukan/destinasi/hajhtrofdlecje7h4laq.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783166539/blusukan/destinasi/gz1vvfbzqsagludtqarq.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783166540/blusukan/destinasi/la6bsnhw5gopdvguxt3i.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783166538/blusukan/destinasi/asvsxzqxoefxh1bulb5w.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783166539/blusukan/destinasi/b9pjxtzwt9wq3jnlgbpk.jpg}	f	\N	\N	\N
cmra4dk2o000b1gu27pgl1jyf	testing1	GUNUNGKIDUL	PANTAI	-8.118543400355597	110.49821376800537	06.00 - 22.00	10000.000000000000000000000000000000	t	t	t	t	t	pantai asik dan oke untuk refreshing	{SUNSET,SUNRISE,QUIET_PLACE,SPOT_FOTO}	BELUM_ADA_DATA	APPROVED	cmr54zgvg00002du2004luk4i	cmr55dnks000f2du291co2mue	2026-07-07 04:00:43.603	2026-07-07 03:59:05.952	{https://res.cloudinary.com/am0sqyor/image/upload/v1783396746/blusukan/destinasi/jwzqstarnbuuvsr6msp5.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783396745/blusukan/destinasi/etueafk68uxe9mtva0iy.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783396745/blusukan/destinasi/nly7sfragbats1ftmltk.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783396745/blusukan/destinasi/qv5jaza2onfxgpi9i5tv.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783396745/blusukan/destinasi/wxho1dbpaufhtmxbbtte.jpg}	f	\N	\N	\N
cmra8xk0q0000cv59ze50d8lh	pantai gelagah	KULON_PROGO	PANTAI	-7.913760555199189	110.06928831338884	04:00 - 19:00	20000.000000000000000000000000000000	t	t	t	t	t	jalan mudah karena ada arahan yang jelas	{SUNSET,SUNRISE}	BELUM_ADA_DATA	REJECTED	cmr57doa00001ix595roqi252	cmr55dnks000f2du291co2mue	2026-07-07 06:07:19.858	2026-07-07 06:06:37.466	{}	f	04:00	19:00	\N
cmr53rug9000inxu2k3fpa7m0	Curug Setawing	KULON_PROGO	AIR_TERJUN	-7.7321	110.1689	06:00 - 18:00	5000.000000000000000000000000000000	t	t	f	t	f	\N	{QUIET_PLACE}	SULIT	APPROVED	cmr54zgvg00002du2004luk4i	cmr53rtd00000nxu2hivz6wzh	2026-06-11 15:43:22.079	2026-07-03 15:43:22.089	{https://picsum.photos/seed/curug-setawing-1/800/600,https://picsum.photos/seed/curug-setawing-2/800/600}	f	\N	\N	\N
cmra796aw000111u2fe471ahe	testing2	GUNUNGKIDUL	PANTAI	-8.122452024043001	110.50426483154298	06:00 - 21:00	10000.000000000000000000000000000000	t	t	t	t	t	jos pokoke	{SUNSET,SUNRISE,QUIET_PLACE,SPOT_FOTO}	BELUM_ADA_DATA	APPROVED	cmr54zgvg00002du2004luk4i	cmr55dnks000f2du291co2mue	2026-07-07 05:21:27.941	2026-07-07 05:19:40.328	{https://res.cloudinary.com/am0sqyor/image/upload/v1783401579/blusukan/destinasi/wpqdqenln8u6qz0onlxm.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783401578/blusukan/destinasi/huniulqtd98gmhtq1nll.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783401578/blusukan/destinasi/gs6hs8uoyq1s7vlsdvty.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783401578/blusukan/destinasi/zym6u1n3rb4ozfn5sxdm.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783401578/blusukan/destinasi/hfjpumz8ktsm7cyxk1rl.jpg}	f	06:00	21:00	\N
cmrd3fasp0008x9u2rp72dtft	testing masuk	GUNUNGKIDUL	PANTAI	-8.091776157842906	110.43300630524938	06:00 - 19:00	10000.000000000000000000000000000000	t	t	t	t	t	testing masuk	{SUNSET,SUNRISE,QUIET_PLACE,SPOT_FOTO}	BELUM_ADA_DATA	APPROVED	cmr54zgvg00002du2004luk4i	cmr55dnks000f2du291co2mue	2026-07-09 05:57:10.488	2026-07-09 05:55:46.154	{https://res.cloudinary.com/am0sqyor/image/upload/v1783576546/blusukan/destinasi/knh073ujb4sx1pzusvyq.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783576545/blusukan/destinasi/pzg3jnyj9rfiqvqptshr.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783576545/blusukan/destinasi/lrvvf3jcte07vtg1l8s5.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783576545/blusukan/destinasi/qydtetoyv2a0prl6g8mu.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783576545/blusukan/destinasi/lsxst6wnivfdxdommb17.jpg}	f	06:00	19:00	5000.000000000000000000000000000000
cmra9onki0000dku2nn1n5zu8	testing3	GUNUNGKIDUL	PANTAI	-8.122876872151123	110.51254749298097	06:30 - 19:00	10000.000000000000000000000000000000	t	t	t	t	t	testing aja	{SUNSET,SUNRISE,QUIET_PLACE,SPOT_FOTO}	BELUM_ADA_DATA	REJECTED	cmr54zgvg00002du2004luk4i	cmr55dnks000f2du291co2mue	2026-07-09 05:57:20.381	2026-07-07 06:27:41.779	{}	f	06:30	19:00	\N
cmrenj2mj0002nku24vc1qy1j	Curug Kedung Pedut	KULON_PROGO	AIR_TERJUN	-7.7525812889310055	110.11624574661256	07:00 - 17:00	10000.000000000000000000000000000000	t	t	t	t	t	Akses jalan menuju area parkir sudah cukup baik dan bisa dilalui kendaraan pribadi, namun dari parkiran pengunjung harus jalan kaki sekitar 300–500 meter melewati jalur setapak menurun berupa tangga semen/batu dan sebagian tanah, memakan waktu sekitar 15 menit dan sedikit licin saat habis hujan. Jalur ini berupa tangga sehingga kurang ramah untuk pengguna kursi roda.	{SUNSET,QUIET_PLACE}	BELUM_ADA_DATA	APPROVED	cmr54zgvg00002du2004luk4i	cmr55dnks000f2du291co2mue	2026-07-10 08:14:38.834	2026-07-10 08:06:20.684	{https://res.cloudinary.com/am0sqyor/image/upload/v1783670779/blusukan/destinasi/skwtdhzd8lxlrzhq9pga.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783670780/blusukan/destinasi/grpoiyvx95n4numvw9ar.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783670780/blusukan/destinasi/uxfsyojw72pultyqthag.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783670779/blusukan/destinasi/xrmrkfvcoldyx5qpbkqb.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783670780/blusukan/destinasi/cy6imdgyejhefpe8gbvj.jpg}	f	07:00	17:00	5000.000000000000000000000000000000
cmrhbcwwy000d3559vg36lkyv	Bukit Panjung	GUNUNGKIDUL	BUKIT	-8.042232671243832	110.35131454467773	Buka 24 Jam	10000.000000000000000000000000000000	t	t	t	t	f	\N	{SUNSET,SUNRISE,SPOT_FOTO,QUIET_PLACE}	BELUM_ADA_DATA	PENDING	cmreo5a2z0000va59nhzafvye	\N	\N	2026-07-12 04:48:56.482	{https://res.cloudinary.com/am0sqyor/image/upload/v1783831733/blusukan/destinasi/a8i4lbwah8u20yqucnf8.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783831731/blusukan/destinasi/xxw0nek7ilbb8tckkge0.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783831731/blusukan/destinasi/gd2quxouultqyr6w0cks.jpg}	t	\N	\N	\N
cmreuuz9700008t59yp1rdf78	Pantai Pandansari	BANTUL	PANTAI	-7.999907158425795	110.25323152542114	Buka 24 Jam	5000.000000000000000000000000000000	t	t	t	t	t	pantai di kawasan Bantul yang memiliki mercusuar.	{SUNSET,SPOT_FOTO,SUNRISE,QUIET_PLACE}	BELUM_ADA_DATA	APPROVED	cmreo5a2z0000va59nhzafvye	cmr55dnks000f2du291co2mue	2026-07-10 14:32:41.499	2026-07-10 11:31:33.499	{https://res.cloudinary.com/am0sqyor/image/upload/v1783683094/blusukan/destinasi/hmbynvb514jyr1sfyd0e.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783683094/blusukan/destinasi/au4s3q9glywhedba4gqe.webp,https://res.cloudinary.com/am0sqyor/image/upload/v1783683094/blusukan/destinasi/u8kvfb9qvigfvqsocxxp.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783683094/blusukan/destinasi/ag5o7qpsxqegcldzmux6.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783683094/blusukan/destinasi/ly3ly7kceibq6vrmygpl.jpg}	t	\N	\N	\N
cmrex7f1g00038t59uqkjgh5n	Puncak Segoro	GUNUNGKIDUL	GUNUNG	-8.104576125664092	110.45844461916388	08:00 - 18:00	15000.000000000000000000000000000000	t	t	t	t	t	Puncak Segoro menghadirkan panorama laut lepas dari atas tebing, layaknya tempat wisata populer di Bali.	{SUNSET,SPOT_FOTO,SUNRISE,QUIET_PLACE}	BELUM_ADA_DATA	APPROVED	cmreo5a2z0000va59nhzafvye	cmr55dnks000f2du291co2mue	2026-07-10 14:33:40.095	2026-07-10 12:37:13.06	{https://res.cloudinary.com/am0sqyor/image/upload/v1783687031/blusukan/destinasi/bvxnpxudslmkixqzvz5o.webp,https://res.cloudinary.com/am0sqyor/image/upload/v1783687030/blusukan/destinasi/jvtfzsrvhypsar218b8l.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783687030/blusukan/destinasi/ciem957d9rgf1bvl0phn.jpg}	f	08:00	18:00	\N
cmrexgxyh00068t59vioo2u0e	Pantai Kobra	GUNUNGKIDUL	PANTAI	-8.082578031121978	110.4158031021881	Buka 24 Jam	15000.000000000000000000000000000000	t	t	t	t	t	antai yang masih sangat alami dan masih asli.	{SUNSET,SPOT_FOTO,SUNRISE,QUIET_PLACE}	BELUM_ADA_DATA	APPROVED	cmreo5a2z0000va59nhzafvye	cmr55dnks000f2du291co2mue	2026-07-10 14:33:40.692	2026-07-10 12:44:37.481	{https://res.cloudinary.com/am0sqyor/image/upload/v1783687476/blusukan/destinasi/hc0l8xs50joekhvdat9l.webp,https://res.cloudinary.com/am0sqyor/image/upload/v1783687476/blusukan/destinasi/kamlpq4jrfccfyzxw9ap.webp,https://res.cloudinary.com/am0sqyor/image/upload/v1783687476/blusukan/destinasi/b6k0neoeftbgzeagvhru.webp}	t	\N	\N	\N
cmrexo5j200098t59hdhh9k2s	Pantai Mesra	GUNUNGKIDUL	PANTAI	-8.133986490498273	110.55540919303895	05:00 - 20:00	10000.000000000000000000000000000000	t	t	t	t	t	Pantai yang cocok banget buat kamu yang ingin menghabiskan waktu bersama pasangan atau sekadar mencari ketenangan dari hiruk-pikuk kota.	{SUNSET,SPOT_FOTO,SUNRISE,QUIET_PLACE}	BELUM_ADA_DATA	APPROVED	cmreo5a2z0000va59nhzafvye	cmr55dnks000f2du291co2mue	2026-07-10 14:33:41.202	2026-07-10 12:50:13.887	{https://res.cloudinary.com/am0sqyor/image/upload/v1783687812/blusukan/destinasi/kqilsoo5fvnpeevulskl.webp,https://res.cloudinary.com/am0sqyor/image/upload/v1783687812/blusukan/destinasi/sssuunhuvuwhg9oemnhj.png,https://res.cloudinary.com/am0sqyor/image/upload/v1783687812/blusukan/destinasi/jihzwhtsvqjxkiwa0rtl.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783687811/blusukan/destinasi/idtbx5dk1lz7cgudrzwz.webp}	f	05:00	20:00	\N
cmrext060000c8t59281nvlsg	Pantai Baron	GUNUNGKIDUL	PANTAI	-8.128739730117157	110.54890751838686	06:00 - 18:00	15000.000000000000000000000000000000	t	t	t	t	t	Keindahan pantai baron yang eksotis dan sibuknya aktifitas nelayan yang pulang melaut akan memanjakan mata kita untuk menyatu dengan pesona alam.	{SUNSET,SPOT_FOTO,SUNRISE,QUIET_PLACE}	BELUM_ADA_DATA	APPROVED	cmreo5a2z0000va59nhzafvye	cmr55dnks000f2du291co2mue	2026-07-10 14:33:41.611	2026-07-10 12:54:00.216	{https://res.cloudinary.com/am0sqyor/image/upload/v1783688038/blusukan/destinasi/wwuhud6gz2wo3sr3ef6y.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783688038/blusukan/destinasi/qmwrdfu2zipkhmls1wnc.webp,https://res.cloudinary.com/am0sqyor/image/upload/v1783688039/blusukan/destinasi/exlhjzsmcvlzivpaaaak.webp,https://res.cloudinary.com/am0sqyor/image/upload/v1783688037/blusukan/destinasi/qepc73ouiz5f57tr14fx.jpg}	f	06:00	18:00	\N
cmrf0ph8a0000vq59096msix5	Pantai Sundak	GUNUNGKIDUL	PANTAI	-8.147209296463442	110.60805827379228	Buka 24 Jam	15000.000000000000000000000000000000	t	t	t	t	t	Pantai ini buka 24 jam dan terkenal dengan pasir putihnya, air jernih, serta karang dan gua alami.	{SUNSET,SPOT_FOTO,SUNRISE,QUIET_PLACE}	BELUM_ADA_DATA	APPROVED	cmreo5a2z0000va59nhzafvye	cmr55dnks000f2du291co2mue	2026-07-10 14:33:42.093	2026-07-10 14:15:14.555	{https://res.cloudinary.com/am0sqyor/image/upload/v1783692942/blusukan/destinasi/ffwvyeil9l4scsnghn3c.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783692943/blusukan/destinasi/qafrttdtssetulbglzfd.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783692944/blusukan/destinasi/ix5amouqasotdx6tijrv.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783692943/blusukan/destinasi/y9y2nze0cgpq4wtbbrzp.jpg}	t	\N	\N	\N
cmrfu81nq0003zl59me3l398j	Air Terjun Randusari	BANTUL	AIR_TERJUN	-7.896369660838971	110.49675464630128	07:00 - 18:00	10000.000000000000000000000000000000	t	t	f	t	f	Air Terjun Randusari berasal dari mata air ngreboh. Selain airnya sangat jernih, pesona air terjun memiliki aliran terbelah.	{SPOT_FOTO,QUIET_PLACE}	BELUM_ADA_DATA	APPROVED	cmreo5a2z0000va59nhzafvye	cmr55dnks000f2du291co2mue	2026-07-11 04:30:52.672	2026-07-11 04:01:29.702	{https://res.cloudinary.com/am0sqyor/image/upload/v1783742489/blusukan/destinasi/ogpljg9sfa8qfklpwn3a.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783742488/blusukan/destinasi/osnzqr9lw1ecxjtzy9o2.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783742488/blusukan/destinasi/fjvhmfvgamjpnmyikhzr.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783742489/blusukan/destinasi/qk7docj5vjrvsqanuo1w.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783742489/blusukan/destinasi/advjo63yucqyexsg2uiz.jpg}	f	07:00	18:00	5000.000000000000000000000000000000
cmrftyxv10000zl59wnrii1bs	Air Terjun Lepo	BANTUL	AIR_TERJUN	-7.98307772023843	110.43954849243165	06:00 - 17:00	10000.000000000000000000000000000000	t	t	t	t	t	Air Terjun Lepo memiliki empat kolam alami yang dihubungkan oleh tiga air terjun, masing-masing dengan tingkat kedalaman yang berbeda.	{SPOT_FOTO,QUIET_PLACE}	BELUM_ADA_DATA	APPROVED	cmreo5a2z0000va59nhzafvye	cmr55dnks000f2du291co2mue	2026-07-11 04:30:50.669	2026-07-11 03:54:24.877	{https://res.cloudinary.com/am0sqyor/image/upload/v1783742063/blusukan/destinasi/s7clxongrj9o2p5mduxb.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783742062/blusukan/destinasi/qrukyt5dyjkjp7zajgzw.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783742063/blusukan/destinasi/vmzhwvct8zvfj8dagk1q.webp,https://res.cloudinary.com/am0sqyor/image/upload/v1783742063/blusukan/destinasi/vvwe03xilviu7omr7n2k.jpg}	f	06:00	17:00	5000.000000000000000000000000000000
cmrfv1a46000czl59an3ow9cx	Air Terjun Luweng Sampang	GUNUNGKIDUL	AIR_TERJUN	-7.818486903509382	110.57035446166994	06:00 - 18:00	5000.000000000000000000000000000000	t	t	f	t	f	Air Terjuan Luweng Sampang tampak indah karena dihiasi oleh batuan cadas yang ada di sisi kanan dan kirinya. Pemandangan ini tentu saja sangat kontras dengan birunya warna air terjun yang jernih.	{SPOT_FOTO,QUIET_PLACE}	BELUM_ADA_DATA	APPROVED	cmreo5a2z0000va59nhzafvye	cmr55dnks000f2du291co2mue	2026-07-11 04:30:50.914	2026-07-11 04:24:13.686	{https://res.cloudinary.com/am0sqyor/image/upload/v1783743852/blusukan/destinasi/cf7zga88cs11zxjh9pa4.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783743852/blusukan/destinasi/uskfvvkmifnkoxdogyfb.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783743852/blusukan/destinasi/j7du7nr68txsgaesbgcm.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783743853/blusukan/destinasi/emvoezfld2tnlt6h0myj.webp,https://res.cloudinary.com/am0sqyor/image/upload/v1783743852/blusukan/destinasi/kuxatqwfkycmihdotolb.jpg}	f	06:00	18:00	\N
cmrfujth50006zl59fe3r4yrp	Air Terjun Kembang Soka	KULON_PROGO	AIR_TERJUN	-7.768144452028474	110.13587951660158	08:00 - 16:00	11000.000000000000000000000000000000	t	t	t	t	f	Air Terjun Kembang Soka terbentuk dari fenomena geologi yaitu air sungai yang berada di pegunungan mengalir kebawah melewati bebatuan. Mengalir dari tempat yang sangat tinggi kemudia jatuh ke tempat yang curam menghasilkan pemandangan yang luar biasa indahnya.	{SPOT_FOTO,QUIET_PLACE}	BELUM_ADA_DATA	APPROVED	cmreo5a2z0000va59nhzafvye	cmr55dnks000f2du291co2mue	2026-07-11 04:30:51.668	2026-07-11 04:10:38.969	{https://res.cloudinary.com/am0sqyor/image/upload/v1783743037/blusukan/destinasi/lvznje9ze28ljltuec3i.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783743037/blusukan/destinasi/xd5hxcmdw1vlhwdppvjh.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783743037/blusukan/destinasi/ptp7agkcjcvtx2ltlm4g.webp,https://res.cloudinary.com/am0sqyor/image/upload/v1783743038/blusukan/destinasi/ho3pqrrmonton4nnfh4x.jpg}	f	08:00	16:00	5000.000000000000000000000000000000
cmrfutrrw0009zl592epxehqu	Air Terjun Curug Sidoharjo	KULON_PROGO	AIR_TERJUN	-7.67758000395823	110.20265868983354	Buka 24 Jam	5000.000000000000000000000000000000	t	t	t	t	t	Air terjun Sidoharjo merupakan air terjun tertinggi di Yogyakarta.	{SPOT_FOTO,QUIET_PLACE}	BELUM_ADA_DATA	APPROVED	cmreo5a2z0000va59nhzafvye	cmr55dnks000f2du291co2mue	2026-07-11 04:30:53.23	2026-07-11 04:18:23.324	{https://res.cloudinary.com/am0sqyor/image/upload/v1783743502/blusukan/destinasi/gqve3al5m1qkcu9vu0hw.webp,https://res.cloudinary.com/am0sqyor/image/upload/v1783743502/blusukan/destinasi/qmrxllhmob7rweoxowz3.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783743503/blusukan/destinasi/xi2idkuuknpqfol7f0yf.jpg}	t	\N	\N	\N
cmrfv986e000fzl59g6ixxf94	Air Terjun Grojogan Sewu Jatimulyo	KULON_PROGO	AIR_TERJUN	-7.7783494918978935	110.11751174926759	08:00 - 16:00	10000.000000000000000000000000000000	t	t	f	f	f	Meski suaranya begitu bergemuruh, namun ajaibnya, suara tersebut justru menenangkan. Itulah yang akan pengunjung rasakan ketika sampai di Grojongan Sewu Tawangmangu Karanganyar.	{SPOT_FOTO,QUIET_PLACE}	BELUM_ADA_DATA	APPROVED	cmreo5a2z0000va59nhzafvye	cmr55dnks000f2du291co2mue	2026-07-11 04:30:54.246	2026-07-11 04:30:24.422	{https://res.cloudinary.com/am0sqyor/image/upload/v1783744224/blusukan/destinasi/hskp9ktom8ygzdmdflw2.webp,https://res.cloudinary.com/am0sqyor/image/upload/v1783744224/blusukan/destinasi/fbhozemwdgmojelbjz7c.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783744223/blusukan/destinasi/qdbmayyk2rcqppdzx7cw.jpg}	f	08:00	16:00	6000.000000000000000000000000000000
cmrhavl7m00093559maqtcu48	Bukit Ngisis	KULON_PROGO	BUKIT	-7.661487010673708	110.15669345855714	Buka 24 Jam	10000.000000000000000000000000000000	t	t	t	t	f	Bukit Ngisis menawarkan pemandangan alam yang memanjakan mata. Nama "Ngisis" sendiri berasal dari bahasa Jawa yang berarti "berangin", sehingga tidak heran jika tempat ini dikenal dengan suasananya yang sejuk dan menenangkan.	{SPOT_FOTO,QUIET_PLACE,SUNRISE,SUNSET}	BELUM_ADA_DATA	APPROVED	cmreo5a2z0000va59nhzafvye	cmr55dnks000f2du291co2mue	2026-07-12 04:49:38.19	2026-07-12 04:35:28.162	{https://res.cloudinary.com/am0sqyor/image/upload/v1783830688/blusukan/destinasi/sxjachx2bsmjbkfxa3pt.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783830688/blusukan/destinasi/zbvcnmy2sbku639rws55.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783830689/blusukan/destinasi/dt1y0kim2yofgobqqcu3.jpg}	t	\N	\N	5000.000000000000000000000000000000
cmrfvq40p000rzl59zjj0wl25	Gunung Api Purba Nglanggeran	GUNUNGKIDUL	GUNUNG	-7.856239758817928	110.51838397979738	08:00 - 23:00	20000.000000000000000000000000000000	f	f	f	f	f	Panorama wisata yang ditawarkan di pegunungan Nglanggeran ini meliputi Sunrise dan sunset matahari dan terbitnya bulan pada malam hari, jutaan bintang yang tersebar dilangit dapat kita nikmati pada malam hari, panjat tebing atau rock climbing yang menantang, keindahan alam berupa deretan pegunungan dan perkampungan penduduk yang menarik.	{SPOT_FOTO,SUNSET,SUNRISE,QUIET_PLACE}	BELUM_ADA_DATA	APPROVED	cmreo5a2z0000va59nhzafvye	cmr55dnks000f2du291co2mue	2026-07-11 06:13:30.157	2026-07-11 04:43:32.185	{https://res.cloudinary.com/am0sqyor/image/upload/v1783745011/blusukan/destinasi/x6qigfn7itd2xn4mwq0i.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783745011/blusukan/destinasi/vb2k0oxalmtaaovbl5gh.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783745011/blusukan/destinasi/nfg0a4fjanwmlwr7kekh.jpg}	f	08:00	23:00	0.000000000000000000000000000000
cmrfyg7xt0002ed59lckmeckw	Puncak Pinus Becici	BANTUL	GUNUNG	-7.901810703812158	110.4371452331543	06:00 - 22:00	5000.000000000000000000000000000000	t	t	t	t	t	Bagusnya pemandangan yang ditawarkan oleh wisata ini akan menjadikan wisatawan termanjakan matanya oleh indahnya Puncak Pinus Becici.	{SPOT_FOTO,QUIET_PLACE}	BELUM_ADA_DATA	APPROVED	cmreo5a2z0000va59nhzafvye	cmr55dnks000f2du291co2mue	2026-07-11 06:13:30.632	2026-07-11 05:59:49.554	{https://res.cloudinary.com/am0sqyor/image/upload/v1783749588/blusukan/destinasi/b55yl7fglmfc6q2ecnju.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783749589/blusukan/destinasi/ohb8uhcwyymeia6epwa2.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783749588/blusukan/destinasi/zyzqu8ythn0hohqzjry0.webp,https://res.cloudinary.com/am0sqyor/image/upload/v1783749589/blusukan/destinasi/eeug6oqwguo5f599vpjv.jpg}	f	06:00	22:00	\N
cmrfymj0j0005ed59rqz89eyr	Gunung Wangi	BANTUL	GUNUNG	-7.823928967618224	110.45774459838867	Buka 24 Jam	20000.000000000000000000000000000000	t	t	t	t	t	Gunung Wangi Bangkel merupakan tempat wisata gunung yang memiliki panorama keindahan alam dari atas ketinggian gunung. Para pengunjung akan disuguhkan dengan pemandangan dan rumah rumah penduduk seperti di Bukit Bintang Gunung Kidul.	{SUNSET,SUNRISE,SPOT_FOTO,QUIET_PLACE}	BELUM_ADA_DATA	APPROVED	cmreo5a2z0000va59nhzafvye	cmr55dnks000f2du291co2mue	2026-07-11 06:13:31.685	2026-07-11 06:04:43.843	{https://res.cloudinary.com/am0sqyor/image/upload/v1783749883/blusukan/destinasi/oubthdodo1yksqof5d9l.webp,https://res.cloudinary.com/am0sqyor/image/upload/v1783749883/blusukan/destinasi/ugp81pbxxzurx4uyaerx.avif,https://res.cloudinary.com/am0sqyor/image/upload/v1783749883/blusukan/destinasi/sz0fpj7qoc3rasuqn8fn.avif}	t	\N	\N	5000.000000000000000000000000000000
cmrfvib0h000ozl593bpm9dbj	Gunung Ireng	GUNUNGKIDUL	GUNUNG	-7.914052788223174	110.50649642944337	Buka 24 Jam	5000.000000000000000000000000000000	t	t	t	t	t	Salah satu tempat terbaik untuk mengabadikan keindahan momen matahari terbit adalah Gunung Ireng.	{SPOT_FOTO,QUIET_PLACE,SUNRISE}	BELUM_ADA_DATA	APPROVED	cmreo5a2z0000va59nhzafvye	cmr55dnks000f2du291co2mue	2026-07-11 06:13:29.508	2026-07-11 04:37:28.001	{https://res.cloudinary.com/am0sqyor/image/upload/v1783744647/blusukan/destinasi/nqj4uiutikjnkirfo8vw.webp,https://res.cloudinary.com/am0sqyor/image/upload/v1783744647/blusukan/destinasi/varslk45utkyiugmu7v0.png,https://res.cloudinary.com/am0sqyor/image/upload/v1783744647/blusukan/destinasi/e34m8ink3slx1s1vw1yz.png,https://res.cloudinary.com/am0sqyor/image/upload/v1783744647/blusukan/destinasi/rtja5dilgiozz72rmcdp.jpg}	t	\N	\N	\N
cmrgbusvu0000qu59c6lkact2	testing pending	SLEMAN	TEBING	-7.797040677355681	110.3790826373984	Buka 24 Jam	0.000000000000000000000000000000	f	f	f	f	f	\N	{}	BELUM_ADA_DATA	REJECTED	cmreo5a2z0000va59nhzafvye	cmr55dnks000f2du291co2mue	2026-07-12 04:49:14.448	2026-07-11 12:15:04.89	{}	t	\N	\N	\N
cmrghqfqw00005u598fq8vjp0	testing pending 2	SLEMAN	GUNUNG	-7.879192983645583	110.46001050630392	Buka 24 Jam	0.000000000000000000000000000000	f	f	f	f	f	\N	{}	BELUM_ADA_DATA	REJECTED	cmreo5a2z0000va59nhzafvye	cmr55dnks000f2du291co2mue	2026-07-12 04:49:15.712	2026-07-11 14:59:38.936	{}	t	\N	\N	\N
cmrhbi3uy000k35595wta24vm	Bukit Pethu	KULON_PROGO	BUKIT	-7.82256845824774	110.11802673339845	Buka 24 Jam	5000.000000000000000000000000000000	t	t	t	f	t	\N	{SUNSET,SUNRISE,SPOT_FOTO,QUIET_PLACE}	BELUM_ADA_DATA	PENDING	cmreo5a2z0000va59nhzafvye	\N	\N	2026-07-12 04:52:58.762	{https://res.cloudinary.com/am0sqyor/image/upload/v1783831976/blusukan/destinasi/pmauegjhijal6jktj69j.webp,https://res.cloudinary.com/am0sqyor/image/upload/v1783831976/blusukan/destinasi/hq46ovwplocu0vlbpi0k.webp,https://res.cloudinary.com/am0sqyor/image/upload/v1783831976/blusukan/destinasi/x8xhra682esiwojzgomq.jpg}	t	\N	\N	\N
cmrfzu3gc00007l59fn1ra96n	test	SLEMAN	PANTAI	-7.73123150501277	110.30223505806565	Buka 24 Jam	0.000000000000000000000000000000	t	t	t	t	t	testing	{SPOT_FOTO,SUNRISE,QUIET_PLACE,SUNSET}	BELUM_ADA_DATA	REJECTED	cmreo5a2z0000va59nhzafvye	cmr55dnks000f2du291co2mue	2026-07-11 06:38:51.414	2026-07-11 06:38:36.54	{}	t	\N	\N	\N
cmrfyscgb0008ed59fbd56f86	Bukit Bintang	GUNUNGKIDUL	BUKIT	-7.843953451003879	110.479953289032	Buka 24 Jam	20000.000000000000000000000000000000	t	t	t	t	t	Wisata malam di Bukit Bintang Jogja terutama menawarkan keindahan kota jogja dari atas bukit. Sementara itu lokasinya yang strategis berada di perbukitan Pathuk Gunung Kidul yang merupakan primadona pecinta wisata malam.	{SUNSET,SPOT_FOTO,QUIET_PLACE}	BELUM_ADA_DATA	APPROVED	cmreo5a2z0000va59nhzafvye	cmr55dnks000f2du291co2mue	2026-07-11 06:13:32.178	2026-07-11 06:09:15.275	{https://res.cloudinary.com/am0sqyor/image/upload/v1783750154/blusukan/destinasi/hd3j3zb11uccccjpbvj2.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783750153/blusukan/destinasi/rtfzxo3nvlmhutfpmhgf.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783750153/blusukan/destinasi/ayklkdpcw9irnrunwtfi.webp,https://res.cloudinary.com/am0sqyor/image/upload/v1783750154/blusukan/destinasi/lnmnqqzqfdgkjrnkzqzw.jpg}	t	\N	\N	5000.000000000000000000000000000000
cmrfyxjdi000bed59jl462cbf	Bukit Klangon	SLEMAN	BUKIT	-7.619803378975603	110.46529769897462	Buka 24 Jam	15000.000000000000000000000000000000	t	t	t	t	t	Bukit Klangon merupakan kawasan tertinggi yang dihuni oleh warga. Bahkan dari bukit ini terlihat dengan jelas Gunung Merapi. Dan tentunya, aktivitas Gunung Merapi ketika aktif dapat dipantau.	{SPOT_FOTO,QUIET_PLACE}	BELUM_ADA_DATA	APPROVED	cmreo5a2z0000va59nhzafvye	cmr55dnks000f2du291co2mue	2026-07-11 06:13:32.571	2026-07-11 06:13:17.526	{https://res.cloudinary.com/am0sqyor/image/upload/v1783750396/blusukan/destinasi/to9nvcxldm1rm5kkycav.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783750396/blusukan/destinasi/xwkv5lcudtoirxxoskj4.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783750396/blusukan/destinasi/gzvpojcxinw4kuliegzi.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783750397/blusukan/destinasi/d9vmnxp9edzf3evspn70.jpg}	t	\N	\N	\N
cmrg1mcnh00039z59ybm1drev	Gunung Gambar	GUNUNGKIDUL	GUNUNG	-7.8035208613796225	110.61086654663087	08:00 - 17:00	20000.000000000000000000000000000000	t	t	f	t	f	Tak hanya objek wisata, Gunung Gambar juga menjadi lokasi wisata spiritual. Karena terdapat sebuah petilasan milik pahlawan nasional, yaitu Raden Mas Said. Yang mana dulu pernah menjadikan Gunung Gambar sebagai tempat meditasi untuk melawan penjajah Belanda.	{SUNRISE,SPOT_FOTO,SUNSET,QUIET_PLACE}	BELUM_ADA_DATA	APPROVED	cmreo5a2z0000va59nhzafvye	cmr55dnks000f2du291co2mue	2026-07-11 07:29:03.017	2026-07-11 07:28:34.445	{https://res.cloudinary.com/am0sqyor/image/upload/v1783754914/blusukan/destinasi/h0u8yuduoik1nyofi0np.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783754914/blusukan/destinasi/gzhoz2sehh7mrqhgt6yg.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783754914/blusukan/destinasi/ypgirmk322jsoekf71rp.jpg}	f	08:00	17:00	5000.000000000000000000000000000000
cmrg1bpen00009z59xdoko7bn	Gunung Gamping	SLEMAN	GUNUNG	-7.8096433979732005	110.31938552856447	08:00 - 16:00	15000.000000000000000000000000000000	t	f	f	f	f	Perbukitan dengan batuan gamping yang dilengkapi beberapa spot foto menghadap pemandangan indah, serta momen sunrise dan sunsetnya menjadikan tempat wisata ini patut jadi alternatif wisata alam.	{SPOT_FOTO,QUIET_PLACE,SUNSET,SUNRISE}	BELUM_ADA_DATA	APPROVED	cmreo5a2z0000va59nhzafvye	cmr55dnks000f2du291co2mue	2026-07-11 07:29:02.424	2026-07-11 07:20:17.759	{https://res.cloudinary.com/am0sqyor/image/upload/v1783754417/blusukan/destinasi/l8q7eesi4fi45l0cw1zz.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783754417/blusukan/destinasi/hclqr6u3nzkbxms5cbpn.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783754417/blusukan/destinasi/bxibtdrzs6i6bjqruib2.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783755029/blusukan/destinasi/zodkr3hcqpclwq8romvx.jpg}	f	08:00	16:00	\N
cmrg1tq6f00089z59zlwvli0f	Bukit Tompak	BANTUL	BUKIT	-7.8327721702902595	110.44641494750978	Buka 24 Jam	10000.000000000000000000000000000000	t	t	f	f	f	Bukit Tompak di Bantul adalah destinasi wisata alam yang memukau, menawarkan pemandangan keindahan kota Jogja dari ketinggian dengan panorama yang menakjubkan.	{SUNSET,SPOT_FOTO,SUNRISE,QUIET_PLACE}	BELUM_ADA_DATA	PENDING	cmreo5a2z0000va59nhzafvye	\N	\N	2026-07-11 07:34:18.567	{https://res.cloudinary.com/am0sqyor/image/upload/v1783755257/blusukan/destinasi/l7zan2mano1u0kuenmdt.webp,https://res.cloudinary.com/am0sqyor/image/upload/v1783755258/blusukan/destinasi/lhmewbf2keuxsplauoyl.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783755257/blusukan/destinasi/o9gsqtvgmcejl1abjxep.jpg}	t	\N	\N	5000.000000000000000000000000000000
\.


--
-- Data for Name: Fasilitas; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Fasilitas" (id, "destinationId", nama, "hargaSewa", "satuanWaktu", "jumlahUnit", "deskripsiManfaat", "fotoUrl", "lokasiDalamDestinasi") FROM stdin;
cmr5570ad00082du2s6b9rv6u	cmr53rug9000inxu2k3fpa7m0	sewa apapun	100000.000000000000000000000000000000	per jam	10	\N	\N	\N
cmr561qve000f17u27cdbg3a2	cmr559srg000e2du2or9eg7sf	sewa serbaguna	57000.000000000000000000000000000000	per jam	6	\N	\N	\N
cmra3vn8d00041gu2pj4pfzre	cmr6bbnng000brou2q49a0p0n	testing	100000.000000000000000000000000000000	per jam	10	\N	\N	\N
cmra79svf000211u2nylmuj8j	cmra796aw000111u2fe471ahe	sewa apa aja	20000.000000000000000000000000000000	per jam	11	\N	\N	\N
cmrgj2tkg000053u2lajdenfy	cmrenj2mj0002nku24vc1qy1j	Sewa testing	10000.000000000000000000000000000000	per jam	10	\N	\N	\N
cmrha3ljx00033559x6uvioh2	cmrha3kfr00003559km6npm4b	Sewa tikar	5000.000000000000000000000000000000	per jam	50	Cocok untuk menjadi alas duduk sembari melihat sunset	\N	Dekat pintu masuk
cmrhavli0000c35590fq9zokg	cmrhavl7m00093559maqtcu48	Sewa Tenda	30000.000000000000000000000000000000	per hari	20	Untuk mereka yang ingin merasakan camping dekat dengan alam	https://res.cloudinary.com/am0sqyor/image/upload/v1783830921/blusukan/destinasi/njftgaxsuhldoansjgqp.jpg	Dekat tempat camping
\.


--
-- Data for Name: LocalService; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."LocalService" (id, "destinationId", "providerName", "serviceType", "contactWa", "baseRate", "isValidated", "validatedById", "fotoUrl", "kapasitasPenumpang") FROM stdin;
cmr53rulv000lnxu2my50du2a	cmr53rtuq0008nxu2bh61jc5b	Ojek Warga Bukit	JEEP	628328897217	27000.000000000000000000000000000000	t	cmr53rtd00000nxu2hivz6wzh	\N	\N
cmr53runa000mnxu2iljrwwm2	cmr53rtwt0009nxu2kcf7b4a7	Ojek Warga Air	OJEK	628959308288	20000.000000000000000000000000000000	t	cmr53rtd00000nxu2hivz6wzh	\N	\N
cmr53ruox000nnxu2jj3zse1h	cmr53ru4b000dnxu2xmbuu635	Ojek Warga Pantai	JEEP	628220057190	19000.000000000000000000000000000000	t	cmr53rtd00000nxu2hivz6wzh	\N	\N
cmr53ruqf000onxu2q973yfkj	cmr53rua5000fnxu2we1n52lw	Ojek Warga Curug	JEEP	628251837177	29000.000000000000000000000000000000	t	cmr53rtd00000nxu2hivz6wzh	\N	\N
cmr53rurz000pnxu2jpjfg0w2	cmr53rug9000inxu2k3fpa7m0	Ojek Warga Curug	OJEK	628857304336	18000.000000000000000000000000000000	t	cmr53rtd00000nxu2hivz6wzh	\N	\N
\.


--
-- Data for Name: LocalWarung; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."LocalWarung" (id, "destinationId", name, location, "updatedAt", kategori, "namaPemilik", "bisaBooking", "photoUrls") FROM stdin;
cmr53ry8b002knxu2yd528h07	cmr53rtuq0008nxu2bh61jc5b	Warung Bu Siti	Dekat pintu masuk Bukit Klangon	2026-07-03 15:43:26.987	LAINNYA	\N	t	{}
cmr53rygx002qnxu2zd2tckc9	cmr53rtwt0009nxu2kcf7b4a7	Warung Bu Siti	Dekat pintu masuk Air Terjun Tlogo Muncar	2026-07-03 15:43:27.297	LAINNYA	\N	t	{}
cmr53ryp9002wnxu22grljw69	cmr53rtzo000anxu2x2eqghmi	Warung Bu Tari	Dekat pintu masuk Pantai Wediombo	2026-07-03 15:43:27.597	LAINNYA	\N	t	{}
cmr53ryxb0032nxu2vwgbt1qa	cmr53ru1b000bnxu2urm3gg23	Warung Bu Marni	Dekat pintu masuk Air Terjun Sri Gethuk	2026-07-03 15:43:27.887	LAINNYA	\N	t	{}
cmr53rz5y0038nxu2rl3z5tf5	cmr53ru2q000cnxu2eeq4pnrm	Warung Bu Tari	Dekat pintu masuk Gunung Api Purba Nglanggeran	2026-07-03 15:43:28.198	LAINNYA	\N	t	{}
cmr53rze9003enxu2a3urmiuw	cmr53ru4b000dnxu2xmbuu635	Warung Bu Wati	Dekat pintu masuk Pantai Ngrenehan	2026-07-03 15:43:28.497	LAINNYA	\N	t	{}
cmr53rzml003knxu26ksaxbvi	cmr53ru60000enxu21aim6ww5	Warung Bu Marni	Dekat pintu masuk Bukit Lintang Sewu	2026-07-03 15:43:28.797	LAINNYA	\N	t	{}
cmr8xohlm00004cu2x6d97u5d	cmr6bbnng000brou2q49a0p0n	Warung Bagas	Pinggir Pantai	2026-07-06 08:03:52.475	LAINNYA	\N	t	{}
cmra7aapl000311u29q5jj2p2	cmra796aw000111u2fe471ahe	warung bu jos	sepanjang jalan pinggir pantai	2026-07-07 05:20:32.697	LAINNYA	\N	t	{}
cmr53ry02002enxu2e33b3c7u	cmr53rtsi0007nxu225v5jaek	Warung Bu Wati	Dekat pintu masuk Tebing Breksi	2026-07-09 05:12:52.553	LAINNYA	\N	t	{}
cmrd24fb00001hfu2w5wwpctn	cmra796aw000111u2fe471ahe	Warung Hanif	Dekat Jalan Ke Pantai	2026-07-09 05:19:19.165	KULINER	Hanif Alberto Gonzales	t	{https://res.cloudinary.com/am0sqyor/image/upload/v1783574353/blusukan/destinasi/faer6qcy9osygge5l2un.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783574354/blusukan/destinasi/uoirjc7kyewklbtslq1f.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783574355/blusukan/destinasi/ovcwzmxpu3q9ksr68ex6.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783574357/blusukan/destinasi/myciwkqqwlvi7evixc1c.jpg,https://res.cloudinary.com/am0sqyor/image/upload/v1783574358/blusukan/destinasi/gwaoesmque1jonhiqlzk.jpg}
cmrha3mi00004355983olnn82	cmrha3kfr00003559km6npm4b	Warung Bu Endah	Dekat Bukit	2026-07-12 04:13:43.464	KULINER	Bu endah	t	{}
\.


--
-- Data for Name: MenuItem; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."MenuItem" (id, "warungId", name, price) FROM stdin;
cmr53ry1g002fnxu2d4ff6qxu	cmr53ry02002enxu2e33b3c7u	Mie Instan + Telur	8000.000000000000000000000000000000
cmr53ry2t002gnxu214fabmdz	cmr53ry02002enxu2e33b3c7u	Nasi Goreng	13000.000000000000000000000000000000
cmr53ry48002hnxu2u82ug47c	cmr53ry02002enxu2e33b3c7u	Es Teh	15000.000000000000000000000000000000
cmr53ry5k002inxu2xqhbwmsh	cmr53ry02002enxu2e33b3c7u	Kopi Hitam	14000.000000000000000000000000000000
cmr53ry6y002jnxu2cspl0w5u	cmr53ry02002enxu2e33b3c7u	Gorengan	7000.000000000000000000000000000000
cmr53ry9r002lnxu26s11pep7	cmr53ry8b002knxu2yd528h07	Mie Instan + Telur	6000.000000000000000000000000000000
cmr53rybf002mnxu2l139edl6	cmr53ry8b002knxu2yd528h07	Nasi Goreng	7000.000000000000000000000000000000
cmr53ryct002nnxu2lzq4ndpx	cmr53ry8b002knxu2yd528h07	Es Teh	3000.000000000000000000000000000000
cmr53rye5002onxu24eaa3zwv	cmr53ry8b002knxu2yd528h07	Kopi Hitam	6000.000000000000000000000000000000
cmr53ryfj002pnxu2o6gaf8v7	cmr53ry8b002knxu2yd528h07	Gorengan	14000.000000000000000000000000000000
cmr53ryib002rnxu27qj0qlw1	cmr53rygx002qnxu2zd2tckc9	Mie Instan + Telur	6000.000000000000000000000000000000
cmr53ryjs002snxu2p8evdbam	cmr53rygx002qnxu2zd2tckc9	Nasi Goreng	5000.000000000000000000000000000000
cmr53ryl3002tnxu2rebpcw19	cmr53rygx002qnxu2zd2tckc9	Es Teh	3000.000000000000000000000000000000
cmr53rymi002unxu2zqvwz4wv	cmr53rygx002qnxu2zd2tckc9	Kopi Hitam	9000.000000000000000000000000000000
cmr53rynw002vnxu217xmm2wl	cmr53rygx002qnxu2zd2tckc9	Gorengan	8000.000000000000000000000000000000
cmr53ryqb002xnxu2uub1uhy6	cmr53ryp9002wnxu22grljw69	Mie Instan + Telur	8000.000000000000000000000000000000
cmr53ryrs002ynxu2anzftz8t	cmr53ryp9002wnxu22grljw69	Nasi Goreng	14000.000000000000000000000000000000
cmr53ryt7002znxu20h51zk7y	cmr53ryp9002wnxu22grljw69	Es Teh	10000.000000000000000000000000000000
cmr53ryuj0030nxu23qm84z4c	cmr53ryp9002wnxu22grljw69	Kopi Hitam	10000.000000000000000000000000000000
cmr53ryvx0031nxu2kwlyu35f	cmr53ryp9002wnxu22grljw69	Gorengan	7000.000000000000000000000000000000
cmr53ryyp0033nxu28ly250oi	cmr53ryxb0032nxu2vwgbt1qa	Mie Instan + Telur	13000.000000000000000000000000000000
cmr53rz030034nxu24nhvdb36	cmr53ryxb0032nxu2vwgbt1qa	Nasi Goreng	7000.000000000000000000000000000000
cmr53rz1h0035nxu2c37wxh3u	cmr53ryxb0032nxu2vwgbt1qa	Es Teh	7000.000000000000000000000000000000
cmr53rz2w0036nxu2zlqe6d4a	cmr53ryxb0032nxu2vwgbt1qa	Kopi Hitam	5000.000000000000000000000000000000
cmr53rz4j0037nxu2n3u68k65	cmr53ryxb0032nxu2vwgbt1qa	Gorengan	10000.000000000000000000000000000000
cmr53rz7b0039nxu2y97lbyui	cmr53rz5y0038nxu2rl3z5tf5	Mie Instan + Telur	5000.000000000000000000000000000000
cmr53rz8p003anxu21vj8vsvm	cmr53rz5y0038nxu2rl3z5tf5	Nasi Goreng	10000.000000000000000000000000000000
cmr53rza3003bnxu2k5hgqc8x	cmr53rz5y0038nxu2rl3z5tf5	Es Teh	6000.000000000000000000000000000000
cmr53rzbh003cnxu2pgiufw99	cmr53rz5y0038nxu2rl3z5tf5	Kopi Hitam	6000.000000000000000000000000000000
cmr53rzcx003dnxu2xkvu6hlt	cmr53rz5y0038nxu2rl3z5tf5	Gorengan	11000.000000000000000000000000000000
cmr53rzfn003fnxu2uvdlk5ss	cmr53rze9003enxu2a3urmiuw	Mie Instan + Telur	9000.000000000000000000000000000000
cmr53rzh2003gnxu2jjk39j8c	cmr53rze9003enxu2a3urmiuw	Nasi Goreng	10000.000000000000000000000000000000
cmr53rzig003hnxu203r4jtjr	cmr53rze9003enxu2a3urmiuw	Es Teh	6000.000000000000000000000000000000
cmr53rzju003inxu2jo768p9h	cmr53rze9003enxu2a3urmiuw	Kopi Hitam	6000.000000000000000000000000000000
cmr53rzl7003jnxu2noljlcmf	cmr53rze9003enxu2a3urmiuw	Gorengan	14000.000000000000000000000000000000
cmr53rzo1003lnxu2jgmnoagr	cmr53rzml003knxu26ksaxbvi	Mie Instan + Telur	4000.000000000000000000000000000000
cmr53rzpd003mnxu2lc453ml7	cmr53rzml003knxu26ksaxbvi	Nasi Goreng	11000.000000000000000000000000000000
cmr53rzqr003nnxu2gfwwzmpi	cmr53rzml003knxu26ksaxbvi	Es Teh	14000.000000000000000000000000000000
cmr53rzs5003onxu2f2x65z9q	cmr53rzml003knxu26ksaxbvi	Kopi Hitam	14000.000000000000000000000000000000
cmr53rzww003pnxu2bqyl8u1e	cmr53rzml003knxu26ksaxbvi	Gorengan	13000.000000000000000000000000000000
cmr8xp63800014cu2ml8ki8rn	cmr8xohlm00004cu2x6d97u5d	Udang goreng	20000.000000000000000000000000000000
cmr8xpeum00024cu2u1isbu6p	cmr8xohlm00004cu2x6d97u5d	Es Kelapa	10000.000000000000000000000000000000
cmrd1zy720000hfu2wlyew5vx	cmra7aapl000311u29q5jj2p2	anu	10000.000000000000000000000000000000
cmra7apq8000411u2xc5zskz7	cmra7aapl000311u29q5jj2p2	Ikan Patin	20000.000000000000000000000000000000
cmrd24fc00002hfu2kdxvijhk	cmrd24fb00001hfu2w5wwpctn	Nasi Goreng	15000.000000000000000000000000000000
cmrd24fc00003hfu2he9vncbr	cmrd24fb00001hfu2w5wwpctn	Ikan Goreng	10000.000000000000000000000000000000
cmrd24fc00004hfu22ny0hhda	cmrd24fb00001hfu2w5wwpctn	Seafood Asam Manis	12000.000000000000000000000000000000
cmrha3mwh00053559x6lla8h1	cmrha3mi00004355983olnn82	Pop mie	8000.000000000000000000000000000000
cmrha3mwh00063559lvqlxfwz	cmrha3mi00004355983olnn82	Minuman	5000.000000000000000000000000000000
cmrha3mwh00073559ecbfhy98	cmrha3mi00004355983olnn82	Bakso	15000.000000000000000000000000000000
cmrha3mwh000835594iuj0vkx	cmrha3mi00004355983olnn82	Mie Ayam	15000.000000000000000000000000000000
\.


--
-- Data for Name: Notifikasi; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Notifikasi" (id, "userId", judul, pesan, link, "isRead", "createdAt", kategori) FROM stdin;
cmr55625h00062du2zrmq2vor	cmr552khv00022du2befdgfbx	Pesanan Dikonfirmasi	Pesanan BLS-CTFFS9 di Curug Setawing telah dikonfirmasi oleh pengelola.	/transaksi/cmr555sc100032du2e5gah0cf	t	2026-07-03 16:22:24.87	\N
cmr5569w800072du2py65xe2s	cmr552khv00022du2befdgfbx	Kunjungan Selesai	Terima kasih telah berkunjung ke Curug Setawing!	/transaksi/cmr555sc100032du2e5gah0cf	t	2026-07-03 16:22:34.905	\N
cmr557p94000d2du2lguv8tux	cmr552khv00022du2befdgfbx	Kunjungan Selesai	Terima kasih telah berkunjung ke Curug Setawing!	/transaksi/cmr557hdq00092du2ocuh9wgq	t	2026-07-03 16:23:41.464	\N
cmr557n0k000c2du2f64s0pm5	cmr552khv00022du2befdgfbx	Pesanan Dikonfirmasi	Pesanan BLS-EE7GTL di Curug Setawing telah dikonfirmasi oleh pengelola.	/transaksi/cmr557hdq00092du2ocuh9wgq	t	2026-07-03 16:23:38.564	\N
cmr557hks000b2du2elnbgtos	cmr54zgvg00002du2004luk4i	Pesanan Baru Masuk	ahyeon memesan sewa apapun di Curug Setawing. Kode: BLS-EE7GTL	/pengelola/destinasi/cmr53rug9000inxu2k3fpa7m0	t	2026-07-03 16:23:31.517	\N
cmr55s5o9000117u2xqitir21	cmr53rtiw0001nxu2xsxss3b3	Destinasi Disetujui	Destinasi Curug Lepo (Belum Divalidasi) yang Anda ajukan telah disetujui dan kini tampil di Beranda.	/pengelola	f	2026-07-03 16:39:35.865	\N
cmr55s75v000217u2hpf7dl8r	cmr53rtiw0001nxu2xsxss3b3	Destinasi Disetujui	Destinasi Bukit Watu Lawang (Belum Divalidasi) yang Anda ajukan telah disetujui dan kini tampil di Beranda.	/pengelola	f	2026-07-03 16:39:37.795	\N
cmr555sl000052du2maahe3j2	cmr54zgvg00002du2004luk4i	Pesanan Baru Masuk	ahyeon memesan Tiket Masuk di Curug Setawing. Kode: BLS-CTFFS9	/pengelola/destinasi/cmr53rug9000inxu2k3fpa7m0	t	2026-07-03 16:22:12.468	\N
cmr55z5by000717u2r9sjqai6	cmr54zgvg00002du2004luk4i	Pesanan Baru Masuk	ahyeon memesan Tiket Masuk di testing. Kode: BLS-P2S1KP	/pengelola/destinasi/cmr55vzsh000317u20plp9wfu	t	2026-07-03 16:45:02.014	\N
cmr55zdib000817u2sor5mwuo	cmr552khv00022du2befdgfbx	Pesanan Dikonfirmasi	Pesanan BLS-P2S1KP di testing telah dikonfirmasi oleh pengelola.	/transaksi/cmr55z541000517u2shnls73z	t	2026-07-03 16:45:12.611	\N
cmr55zkeb000917u2jo7yt4zv	cmr552khv00022du2befdgfbx	Kunjungan Selesai	Terima kasih telah berkunjung ke testing!	/transaksi/cmr55z541000517u2shnls73z	t	2026-07-03 16:45:21.539	\N
cmr560c30000c17u23l8x9aws	cmr54zgvg00002du2004luk4i	Pesanan Baru Masuk	ahyeon memesan Tiket Masuk di Pantai Gatau. Kode: BLS-AUQPSB	/pengelola/destinasi/cmr559srg000e2du2or9eg7sf	t	2026-07-03 16:45:57.42	\N
cmr55w597000417u2lokiacyu	cmr54zgvg00002du2004luk4i	Destinasi Disetujui	Destinasi testing yang Anda ajukan telah disetujui dan kini tampil di Beranda.	/pengelola	t	2026-07-03 16:42:41.947	\N
cmr55olfx000017u2vlyg5obi	cmr54zgvg00002du2004luk4i	Destinasi Disetujui	Destinasi Pantai Gatau yang Anda ajukan telah disetujui dan kini tampil di Beranda.	/pengelola	t	2026-07-03 16:36:49.678	\N
cmr560lxx000d17u2rj6upspi	cmr552khv00022du2befdgfbx	Pesanan Dikonfirmasi	Pesanan BLS-AUQPSB di Pantai Gatau telah dikonfirmasi oleh pengelola.	/transaksi/cmr560bw4000a17u2qxug7zie	t	2026-07-03 16:46:10.197	\N
cmr560rmo000e17u2wimaw0cp	cmr552khv00022du2befdgfbx	Kunjungan Selesai	Terima kasih telah berkunjung ke Pantai Gatau!	/transaksi/cmr560bw4000a17u2qxug7zie	t	2026-07-03 16:46:17.568	\N
cmr562gn0000j17u2gvzkmmrz	cmr552khv00022du2befdgfbx	Pesanan Dikonfirmasi	Pesanan BLS-NC4ELI di Pantai Gatau telah dikonfirmasi oleh pengelola.	/transaksi/cmr5628r6000g17u265jt39no	t	2026-07-03 16:47:36.636	\N
cmr562olz000k17u2s9uyij1n	cmr552khv00022du2befdgfbx	Kunjungan Selesai	Terima kasih telah berkunjung ke Pantai Gatau!	/transaksi/cmr5628r6000g17u265jt39no	t	2026-07-03 16:47:46.967	\N
cmr56uof700042tu2ue515pmt	cmr552khv00022du2befdgfbx	Kunjungan Selesai	Terima kasih telah berkunjung ke Curug Setawing!	/transaksi/cmr56ucl400002tu224b4mvfr	t	2026-07-03 17:09:33.092	\N
cmr56ulyv00032tu2s47gangi	cmr552khv00022du2befdgfbx	Pesanan Dikonfirmasi	Pesanan BLS-K2Z6W0 di Curug Setawing telah dikonfirmasi oleh pengelola.	/transaksi/cmr56ucl400002tu224b4mvfr	t	2026-07-03 17:09:29.911	\N
cmr56ucr000022tu2ozxq5irz	cmr54zgvg00002du2004luk4i	Pesanan Baru Masuk	ahyeon memesan Tiket Masuk di Curug Setawing. Kode: BLS-K2Z6W0	/pengelola/destinasi/cmr53rug9000inxu2k3fpa7m0	t	2026-07-03 17:09:17.964	\N
cmr5628xw000i17u237spl1tr	cmr54zgvg00002du2004luk4i	Pesanan Baru Masuk	ahyeon memesan sewa serbaguna di Pantai Gatau. Kode: BLS-NC4ELI	/pengelola/destinasi/cmr559srg000e2du2or9eg7sf	t	2026-07-03 16:47:26.66	\N
cmr6ayvpe0004rou2oc80z3tv	cmr54zgvg00002du2004luk4i	Pesanan Baru Masuk	goyoumjung memesan Tiket Masuk di Pantai Gatau. Kode: BLS-LUO1FG	/pengelola/destinasi/cmr559srg000e2du2or9eg7sf	t	2026-07-04 11:52:33.794	\N
cmr6azejg0005rou2q998eapw	cmr6aw7x00001rou2e39g6xf6	Pesanan Ditolak	Pesanan BLS-LUO1FG di Pantai Gatau ditolak oleh pengelola.	/transaksi/cmr6ayvir0002rou2cn7zhjl3	t	2026-07-04 11:52:58.204	\N
cmr6b0i9r000arou2hdmfy2v0	cmr6aw7x00001rou2e39g6xf6	Kunjungan Selesai	Terima kasih telah berkunjung ke Pantai Gatau!	/transaksi/cmr6b0bdp0006rou2fdt2xsrq	t	2026-07-04 11:53:49.695	\N
cmr6b0gvo0009rou2seoaqc8b	cmr6aw7x00001rou2e39g6xf6	Pesanan Dikonfirmasi	Pesanan BLS-WKZFCI di Pantai Gatau telah dikonfirmasi oleh pengelola.	/transaksi/cmr6b0bdp0006rou2fdt2xsrq	t	2026-07-04 11:53:47.892	\N
cmr6be8k1000hrou2fscfbtgj	cmr6aw7x00001rou2e39g6xf6	Kunjungan Selesai	Terima kasih telah berkunjung ke Pantai adadeh!	/transaksi/cmr6bdsf6000drou213vlqxrv	t	2026-07-04 12:04:30.289	\N
cmr6be7nn000grou28py0q8rl	cmr6aw7x00001rou2e39g6xf6	Pesanan Dikonfirmasi	Pesanan BLS-BQFJPA di Pantai adadeh telah dikonfirmasi oleh pengelola.	/transaksi/cmr6bdsf6000drou213vlqxrv	t	2026-07-04 12:04:29.123	\N
cmr6bfc8w000mrou2uckgtfw8	cmr6aw7x00001rou2e39g6xf6	Kunjungan Selesai	Terima kasih telah berkunjung ke Pantai adadeh!	/transaksi/cmr6bf5f8000irou2d55059yn	t	2026-07-04 12:05:21.728	\N
cmr6bfbqa000lrou25ewih8dn	cmr6aw7x00001rou2e39g6xf6	Pesanan Dikonfirmasi	Pesanan BLS-TVAFWD di Pantai adadeh telah dikonfirmasi oleh pengelola.	/transaksi/cmr6bf5f8000irou2d55059yn	t	2026-07-04 12:05:21.058	\N
cmr6bf5my000krou2qdm4mkt4	cmr54zgvg00002du2004luk4i	Pesanan Baru Masuk	goyoumjung memesan Tiket Masuk di Pantai adadeh. Kode: BLS-TVAFWD	/pengelola/destinasi/cmr6bbnng000brou2q49a0p0n	t	2026-07-04 12:05:13.162	\N
cmr6bdsme000frou2v1anpp1s	cmr54zgvg00002du2004luk4i	Pesanan Baru Masuk	goyoumjung memesan Tiket Masuk di Pantai adadeh. Kode: BLS-BQFJPA	/pengelola/destinasi/cmr6bbnng000brou2q49a0p0n	t	2026-07-04 12:04:09.639	\N
cmr6bcz6l000crou284wc5f7j	cmr54zgvg00002du2004luk4i	Destinasi Disetujui	Destinasi Pantai adadeh yang Anda ajukan telah disetujui dan kini tampil di Beranda.	/pengelola	t	2026-07-04 12:03:31.485	\N
cmr6b0br00008rou2l0cmjd8j	cmr54zgvg00002du2004luk4i	Pesanan Baru Masuk	goyoumjung memesan Tiket Masuk di Pantai Gatau. Kode: BLS-WKZFCI	/pengelola/destinasi/cmr559srg000e2du2or9eg7sf	t	2026-07-04 11:53:41.244	\N
cmr6dhjmq000wrou26gt607e3	cmr6aw7x00001rou2e39g6xf6	Pesanan Dikonfirmasi	Pesanan BLS-XL4QFN di Curug Setawing telah dikonfirmasi oleh pengelola.	/transaksi/cmr6dhe8p000trou2satl1qkm	t	2026-07-04 13:03:03.842	\N
cmr6dhefl000vrou24vdvb5a3	cmr54zgvg00002du2004luk4i	Pesanan Baru Masuk	goyoumjung memesan sewa apapun di Curug Setawing. Kode: BLS-XL4QFN	/pengelola/destinasi/cmr53rug9000inxu2k3fpa7m0	t	2026-07-04 13:02:57.106	\N
cmr6dhw0j000xrou29qrjn6vf	cmr6aw7x00001rou2e39g6xf6	Kunjungan Selesai	Terima kasih telah berkunjung ke Curug Setawing!	/transaksi/cmr6dhe8p000trou2satl1qkm	t	2026-07-04 13:03:19.892	\N
cmr8yh1fg000fy1u20kwj5t0o	cmr55dnks000f2du291co2mue	Kunjungan Selesai	Terima kasih telah berkunjung ke Pantai adadeh!	/transaksi/cmr8yg2hf000by1u21r408ugk	t	2026-07-06 08:26:04.54	\N
cmr8yg2n6000dy1u263w0uzt3	cmr54zgvg00002du2004luk4i	Pesanan Baru Masuk	admin reservasi tempat di Warung Bagas, Pantai adadeh, jam 15.25.	/pengelola/destinasi/cmr6bbnng000brou2q49a0p0n	t	2026-07-06 08:25:19.459	\N
cmr8ygr67000ey1u2i68ro38f	cmr55dnks000f2du291co2mue	Pesanan Dikonfirmasi	Pesanan BLS-MBO3BY di Pantai adadeh telah dikonfirmasi oleh pengelola.	/transaksi/cmr8yg2hf000by1u21r408ugk	t	2026-07-06 08:25:51.247	\N
cmra3mpyr00031gu2feoyy671	cmr54zgvg00002du2004luk4i	Pesanan Baru Masuk	testing1 memesan Tiket Masuk di Pantai adadeh. Kode: BLS-EX6ND8	/pengelola/destinasi/cmr6bbnng000brou2q49a0p0n	f	2026-07-07 03:38:13.876	\N
cmra3z0wi00071gu28g5jkw7q	cmr54zgvg00002du2004luk4i	Pesanan Baru Masuk	testing1 memesan testing di Pantai adadeh. Kode: BLS-TYFEOP	/pengelola/destinasi/cmr6bbnng000brou2q49a0p0n	f	2026-07-07 03:47:47.923	\N
cmra4aqni000a1gu29nkukp0m	cmra3by4a00001gu2bw0glt58	Pesanan Dikonfirmasi	Pesanan BLS-EX6ND8 di Pantai adadeh telah dikonfirmasi oleh pengelola.	/transaksi/cmra3mprh00011gu2emn7c9t9	t	2026-07-07 03:56:54.51	\N
cmra4apvh00091gu2g9kwq0kv	cmra3by4a00001gu2bw0glt58	Pesanan Dikonfirmasi	Pesanan BLS-TYFEOP di Pantai adadeh telah dikonfirmasi oleh pengelola.	/transaksi/cmra3z0pj00051gu2w83h29bn	t	2026-07-07 03:56:53.501	\N
cmra4fngp000c1gu23jbn4h41	cmr54zgvg00002du2004luk4i	Destinasi Disetujui	Destinasi testing1 yang Anda ajukan telah disetujui dan kini tampil di Beranda.	/pengelola	f	2026-07-07 04:00:43.657	\N
cmra7ebno000b11u23ekkzxmz	cmra3by4a00001gu2bw0glt58	Kunjungan Selesai	Terima kasih telah berkunjung ke testing2!	/transaksi/cmra7dqvm000611u2xuia9rpx	t	2026-07-07 05:23:40.548	\N
cmra771kl000011u2d3o49d6a	cmra3by4a00001gu2bw0glt58	Pesanan Ditolak	Pesanan BLS-2S67EC di Pantai adadeh ditolak oleh pengelola.	/transaksi/cmra5sck4000d1gu2shcavwls	t	2026-07-07 05:18:00.888	\N
cmra7e9c1000a11u2l6kt3wxr	cmra3by4a00001gu2bw0glt58	Pesanan Dikonfirmasi	Pesanan BLS-9BHZME di testing2 telah dikonfirmasi oleh pengelola.	/transaksi/cmra7dqvm000611u2xuia9rpx	t	2026-07-07 05:23:37.537	\N
cmra7dr2e000911u277je2nz1	cmr54zgvg00002du2004luk4i	Pesanan Baru Masuk	testing1 memesan 1 menu dari warung bu jos di testing2, reservasi tempat jam 19.00.	/pengelola/destinasi/cmra796aw000111u2fe471ahe	t	2026-07-07 05:23:13.863	\N
cmra7bhds000511u2xk2rgloc	cmr54zgvg00002du2004luk4i	Destinasi Disetujui	Destinasi testing2 yang Anda ajukan telah disetujui dan kini tampil di Beranda.	/pengelola	t	2026-07-07 05:21:28.001	\N
cmra5scqd000f1gu23lu2jad7	cmr54zgvg00002du2004luk4i	Pesanan Baru Masuk	testing1 reservasi tempat di Warung Bagas, Pantai adadeh, jam 08.40.	/pengelola/destinasi/cmr6bbnng000brou2q49a0p0n	t	2026-07-07 04:38:35.893	\N
cmra8xkf00001cv59h03mnywt	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	Mochammad Hanif mengajukan destinasi pantai gelagah di Kulon Progo	/dashboard/destinasi/cmra8xk0q0000cv59ze50d8lh	f	2026-07-07 06:06:37.98	\N
cmra8xkf00002cv59uhomzxev	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	Mochammad Hanif mengajukan destinasi pantai gelagah di Kulon Progo	/dashboard/destinasi/cmra8xk0q0000cv59ze50d8lh	t	2026-07-07 06:06:37.98	\N
cmra8ygr80003cv59behsnpb2	cmr57doa00001ix595roqi252	Destinasi Ditolak	Destinasi pantai gelagah yang Anda ajukan ditolak oleh admin.	/pengelola	t	2026-07-07 06:07:19.892	\N
cmra9onoy0001dku22l7ir3gg	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	Faza mengajukan destinasi testing3 di Gunungkidul	/dashboard/destinasi/cmra9onki0000dku2nn1n5zu8	f	2026-07-07 06:27:41.938	\N
cmra9onoz0002dku2eg06vyui	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	Faza mengajukan destinasi testing3 di Gunungkidul	/dashboard/destinasi/cmra9onki0000dku2nn1n5zu8	t	2026-07-07 06:27:41.938	\N
cmrcxzx500002oqu2cubmqnnb	cmr54zgvg00002du2004luk4i	Pesanan Baru Masuk	ahyeon memesan Tiket Masuk di testing2. Kode: BLS-5DP7UY	/pengelola/destinasi/cmra796aw000111u2fe471ahe	t	2026-07-09 03:23:50.532	TIKET
cmrcy0gzt0003oqu2e3xkygb1	cmr552khv00022du2befdgfbx	Pesanan Dikonfirmasi	Pesanan BLS-5DP7UY di testing2 telah dikonfirmasi oleh pengelola.	/transaksi/cmrcxzwyf0000oqu2ckenfwwk	f	2026-07-09 03:24:16.265	TIKET
cmrd1vam50002g2u2ybcs7bpz	cmr54zgvg00002du2004luk4i	Pesanan Baru Masuk	Dimas Pratama reservasi tempat di warung bu jos, testing2, jam 17.00.	/pengelola/destinasi/cmra796aw000111u2fe471ahe	t	2026-07-09 05:12:13.181	UMKM
cmrd26qsz0009hfu2y5lu43ru	cmr54zgvg00002du2004luk4i	Pesanan Baru Masuk	zarel memesan 3 menu dari Warung Hanif di testing2.	/pengelola/destinasi/cmra796aw000111u2fe471ahe	t	2026-07-09 05:21:07.379	UMKM
cmrd276rc000ahfu2b1yhto0f	cmrczbmwj0004oqu29c3c18k2	Pesanan Dikonfirmasi	Pesanan BLS-VGI960 di testing2 telah dikonfirmasi oleh pengelola.	/transaksi/cmrd26qnx0005hfu2wq259z53	f	2026-07-09 05:21:28.056	UMKM
cmrd27bs0000bhfu2tbm6cf28	cmrczbmwj0004oqu29c3c18k2	Kunjungan Selesai	Terima kasih telah berkunjung ke testing2!	/transaksi/cmrd26qnx0005hfu2wq259z53	t	2026-07-09 05:21:34.56	UMKM
cmrd3306y0001x9u2kjf4cr53	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	Pak Slamet (Pokdarwis) mengajukan destinasi Curug Test HTM Anak di Sleman	/dashboard/destinasi/cmrd330320000x9u28jklvtif	f	2026-07-09 05:46:12.539	DESTINASI
cmrd3491q0003x9u21ij5jyw6	cmr53rtiw0001nxu2xsxss3b3	Destinasi Disetujui	Destinasi Curug Test HTM Anak yang Anda ajukan telah disetujui dan kini tampil di Beranda.	/pengelola	f	2026-07-09 05:47:10.67	DESTINASI
cmrd3566f0007x9u20haken1k	cmr53rtiw0001nxu2xsxss3b3	Pesanan Baru Masuk	Dimas Pratama memesan 2 Tiket Masuk Dewasa + 3 Tiket Masuk Anak-anak di Curug Test HTM Anak. Kode: BLS-14CF5M	/pengelola/destinasi/cmrd330320000x9u28jklvtif	f	2026-07-09 05:47:53.607	TIKET
cmrd3fb900009x9u2gryhm47k	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	Faza mengajukan destinasi testing masuk di Gunungkidul	/dashboard/destinasi/cmrd3fasp0008x9u2rp72dtft	f	2026-07-09 05:55:46.74	DESTINASI
cmrd3h3wm000bx9u2ksyir8gn	cmr54zgvg00002du2004luk4i	Destinasi Disetujui	Destinasi testing masuk yang Anda ajukan telah disetujui dan kini tampil di Beranda.	/pengelola	f	2026-07-09 05:57:10.534	DESTINASI
cmrd3hbje000cx9u2t10z3t6r	cmr54zgvg00002du2004luk4i	Destinasi Ditolak	Destinasi testing3 yang Anda ajukan ditolak oleh admin.	/pengelola	f	2026-07-09 05:57:20.426	DESTINASI
cmrd3ipty000gx9u25e6f4lx7	cmr54zgvg00002du2004luk4i	Pesanan Baru Masuk	zarel memesan 1 Tiket Masuk Dewasa + 1 Tiket Masuk Anak-anak di testing masuk. Kode: BLS-HLL7T1	/pengelola/destinasi/cmrd3fasp0008x9u2rp72dtft	f	2026-07-09 05:58:25.606	TIKET
cmrd3j2vo000hx9u2ezsyfwig	cmrczbmwj0004oqu29c3c18k2	Pesanan Dikonfirmasi	Pesanan BLS-HLL7T1 di testing masuk telah dikonfirmasi oleh pengelola.	/transaksi/cmrd3ipor000dx9u2kt3j1o9a	f	2026-07-09 05:58:42.516	TIKET
cmrd3306z0002x9u2vokdxc38	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	Pak Slamet (Pokdarwis) mengajukan destinasi Curug Test HTM Anak di Sleman	/dashboard/destinasi/cmrd330320000x9u28jklvtif	t	2026-07-09 05:46:12.539	DESTINASI
cmrd4c5mz0001keu213cf2dmh	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	Pak Slamet (Pokdarwis) mengajukan destinasi Test Hapus Permanen di Sleman	/dashboard/destinasi/cmrd4c56i0000keu2fbjy97qc	f	2026-07-09 06:21:19.115	DESTINASI
cmrd4cf1w0003keu2qkzd1hj5	cmr53rtiw0001nxu2xsxss3b3	Destinasi Disetujui	Destinasi Test Hapus Permanen yang Anda ajukan telah disetujui dan kini tampil di Beranda.	/pengelola	f	2026-07-09 06:21:31.316	DESTINASI
cmrdb9fyt0000oeu2cg1h61yi	cmr53rtiw0001nxu2xsxss3b3	Destinasi Disetujui	Destinasi Verifikasi Info Update Test yang Anda ajukan telah disetujui dan kini tampil di Beranda.	/pengelola	f	2026-07-09 09:35:09.845	DESTINASI
cmrd4c5mz0002keu2hs4mhmiu	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	Pak Slamet (Pokdarwis) mengajukan destinasi Test Hapus Permanen di Sleman	/dashboard/destinasi/cmrd4c56i0000keu2fbjy97qc	t	2026-07-09 06:21:19.115	DESTINASI
cmrd3fb90000ax9u2luo71dqo	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	Faza mengajukan destinasi testing masuk di Gunungkidul	/dashboard/destinasi/cmrd3fasp0008x9u2rp72dtft	t	2026-07-09 05:55:46.74	DESTINASI
cmrebl2nh0003cmu96oqqzf7b	cmr54zgvg00002du2004luk4i	Pesanan Baru Masuk	budi memesan 1 Tiket Masuk Dewasa + 1 Tiket Masuk Anak-anak di testing masuk. Kode: BLS-K3KBH9	/pengelola/destinasi/cmrd3fasp0008x9u2rp72dtft	f	2026-07-10 02:31:58.637	TIKET
cmrebm1hv0006cmu9hjgwd4d4	cmr54zgvg00002du2004luk4i	Ulasan Baru Masuk	budi memberi rating 5 bintang untuk testing masuk.	/pengelola/destinasi/cmrd3fasp0008x9u2rp72dtft	f	2026-07-10 02:32:43.795	REVIEW
cmrejacfv0000nku2pt7zjnxo	cmr5ykb7q0000a2u92jnjavnv	Pesanan Dikonfirmasi	Pesanan BLS-K3KBH9 di testing masuk telah dikonfirmasi oleh pengelola.	/transaksi/cmrebl2j10000cmu9e51w9zqb	f	2026-07-10 06:07:35.036	TIKET
cmrejadoz0001nku23ye3m1nb	cmr5ykb7q0000a2u92jnjavnv	Kunjungan Selesai	Terima kasih telah berkunjung ke testing masuk!	/transaksi/cmrebl2j10000cmu9e51w9zqb	f	2026-07-10 06:07:36.659	TIKET
cmrd3j5s3000ix9u27u940mkg	cmrczbmwj0004oqu29c3c18k2	Kunjungan Selesai	Terima kasih telah berkunjung ke testing masuk!	/transaksi/cmrd3ipor000dx9u2kt3j1o9a	t	2026-07-09 05:58:46.275	TIKET
cmrenj2ya0003nku2jjk3vxrl	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	Faza mengajukan destinasi Curug Kedung Pedut di Kulon Progo	/dashboard/destinasi/cmrenj2mj0002nku24vc1qy1j	f	2026-07-10 08:06:21.107	DESTINASI
cmrentr630005nku29v4jpzg1	cmr54zgvg00002du2004luk4i	Destinasi Disetujui	Destinasi Curug Kedung Pedut yang Anda ajukan telah disetujui dan kini tampil di Beranda.	/pengelola	f	2026-07-10 08:14:39.051	DESTINASI
cmrenj2yb0004nku2juh0pleh	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	Faza mengajukan destinasi Curug Kedung Pedut di Kulon Progo	/dashboard/destinasi/cmrenj2mj0002nku24vc1qy1j	t	2026-07-10 08:06:21.107	DESTINASI
cmreuuzi000018t59r5qxmah5	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Pantai Pandansari di Bantul	/dashboard/destinasi/cmreuuz9700008t59yp1rdf78	f	2026-07-10 11:31:33.816	DESTINASI
cmreuuzi000028t59sa8xoxu7	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Pantai Pandansari di Bantul	/dashboard/destinasi/cmreuuz9700008t59yp1rdf78	f	2026-07-10 11:31:33.816	DESTINASI
cmrex7ffm00048t59o7woevd0	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Puncak Segoro di Gunungkidul	/dashboard/destinasi/cmrex7f1g00038t59uqkjgh5n	f	2026-07-10 12:37:13.57	DESTINASI
cmrex7ffm00058t59l59635ma	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Puncak Segoro di Gunungkidul	/dashboard/destinasi/cmrex7f1g00038t59uqkjgh5n	f	2026-07-10 12:37:13.57	DESTINASI
cmrexgy6g00078t59sqcfha8a	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Pantai Kobra di Gunungkidul	/dashboard/destinasi/cmrexgxyh00068t59vioo2u0e	f	2026-07-10 12:44:37.768	DESTINASI
cmrexgy6g00088t59cuf8smg6	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Pantai Kobra di Gunungkidul	/dashboard/destinasi/cmrexgxyh00068t59vioo2u0e	f	2026-07-10 12:44:37.768	DESTINASI
cmrexo5xq000a8t59o9ris1zr	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Pantai Mesra di Gunungkidul	/dashboard/destinasi/cmrexo5j200098t59hdhh9k2s	f	2026-07-10 12:50:14.414	DESTINASI
cmrexo5xr000b8t59lkhfjjg6	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Pantai Mesra di Gunungkidul	/dashboard/destinasi/cmrexo5j200098t59hdhh9k2s	f	2026-07-10 12:50:14.414	DESTINASI
cmrext0qv000d8t59rpzzsvlg	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Pantai Baron di Gunungkidul	/dashboard/destinasi/cmrext060000c8t59281nvlsg	f	2026-07-10 12:54:00.967	DESTINASI
cmrext0qv000e8t59lyd8qs80	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Pantai Baron di Gunungkidul	/dashboard/destinasi/cmrext060000c8t59281nvlsg	f	2026-07-10 12:54:00.967	DESTINASI
cmrf0phkz0001vq59ic5zoo0u	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Pantai Sundak di Gunungkidul	/dashboard/destinasi/cmrf0ph8a0000vq59096msix5	f	2026-07-10 14:15:15.011	DESTINASI
cmrf0phkz0002vq59c0pnwqxl	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Pantai Sundak di Gunungkidul	/dashboard/destinasi/cmrf0ph8a0000vq59096msix5	f	2026-07-10 14:15:15.011	DESTINASI
cmrf1bx3s0000k759dcrp2z26	cmreo5a2z0000va59nhzafvye	Destinasi Disetujui	Destinasi Pantai Pandansari yang Anda ajukan telah disetujui dan kini tampil di Beranda.	/pengelola	f	2026-07-10 14:32:41.56	DESTINASI
cmrf1d6ar0001k759c0oofbmn	cmreo5a2z0000va59nhzafvye	Destinasi Disetujui	Destinasi Puncak Segoro yang Anda ajukan telah disetujui dan kini tampil di Beranda.	/pengelola	f	2026-07-10 14:33:40.131	DESTINASI
cmrf1d6rf0002k759lyexxzbk	cmreo5a2z0000va59nhzafvye	Destinasi Disetujui	Destinasi Pantai Kobra yang Anda ajukan telah disetujui dan kini tampil di Beranda.	/pengelola	f	2026-07-10 14:33:40.731	DESTINASI
cmrf1d75k0003k759xeo3l8eg	cmreo5a2z0000va59nhzafvye	Destinasi Disetujui	Destinasi Pantai Mesra yang Anda ajukan telah disetujui dan kini tampil di Beranda.	/pengelola	f	2026-07-10 14:33:41.24	DESTINASI
cmrf1d7gw0004k7592157o3t2	cmreo5a2z0000va59nhzafvye	Destinasi Disetujui	Destinasi Pantai Baron yang Anda ajukan telah disetujui dan kini tampil di Beranda.	/pengelola	f	2026-07-10 14:33:41.648	DESTINASI
cmrf1d7u80005k759xwot97cs	cmreo5a2z0000va59nhzafvye	Destinasi Disetujui	Destinasi Pantai Sundak yang Anda ajukan telah disetujui dan kini tampil di Beranda.	/pengelola	f	2026-07-10 14:33:42.128	DESTINASI
cmrftyxzj0001zl59bg5lxubc	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Air Terjun Lepo di Bantul	/dashboard/destinasi/cmrftyxv10000zl59wnrii1bs	f	2026-07-11 03:54:25.039	DESTINASI
cmrftyxzj0002zl595chixxw5	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Air Terjun Lepo di Bantul	/dashboard/destinasi/cmrftyxv10000zl59wnrii1bs	f	2026-07-11 03:54:25.039	DESTINASI
cmrfu81v40004zl5929x1gzy8	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Air Terjun Randusari di Bantul	/dashboard/destinasi/cmrfu81nq0003zl59me3l398j	f	2026-07-11 04:01:29.968	DESTINASI
cmrfu81v40005zl59o2lw75md	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Air Terjun Randusari di Bantul	/dashboard/destinasi/cmrfu81nq0003zl59me3l398j	f	2026-07-11 04:01:29.968	DESTINASI
cmrfujtuj0007zl594emfnsvr	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Air Terjun Kembang Soka di Kulon Progo	/dashboard/destinasi/cmrfujth50006zl59fe3r4yrp	f	2026-07-11 04:10:39.451	DESTINASI
cmrfujtuj0008zl59w2p805n3	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Air Terjun Kembang Soka di Kulon Progo	/dashboard/destinasi/cmrfujth50006zl59fe3r4yrp	f	2026-07-11 04:10:39.451	DESTINASI
cmrfutrzu000azl59i8p2g5pn	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Air Terjun Curug Sidoharjo di Kulon Progo	/dashboard/destinasi/cmrfutrrw0009zl592epxehqu	f	2026-07-11 04:18:23.61	DESTINASI
cmrfutrzu000bzl59rjepi17v	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Air Terjun Curug Sidoharjo di Kulon Progo	/dashboard/destinasi/cmrfutrrw0009zl592epxehqu	f	2026-07-11 04:18:23.61	DESTINASI
cmrfv1agm000dzl59rr0glxy8	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Air Terjun Luweng Sampang di Gunungkidul	/dashboard/destinasi/cmrfv1a46000czl59an3ow9cx	f	2026-07-11 04:24:14.134	DESTINASI
cmrfv1agm000ezl59w9hiqtp4	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Air Terjun Luweng Sampang di Gunungkidul	/dashboard/destinasi/cmrfv1a46000czl59an3ow9cx	f	2026-07-11 04:24:14.134	DESTINASI
cmrfv98fp000gzl59awtou0c0	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Air Terjun Grojogan Sewu Jatimulyo di Kulon Progo	/dashboard/destinasi/cmrfv986e000fzl59g6ixxf94	f	2026-07-11 04:30:24.757	DESTINASI
cmrfv98fp000hzl59o5a5ewn5	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Air Terjun Grojogan Sewu Jatimulyo di Kulon Progo	/dashboard/destinasi/cmrfv986e000fzl59g6ixxf94	f	2026-07-11 04:30:24.757	DESTINASI
cmrfv9sgq000izl59xd0ufr24	cmreo5a2z0000va59nhzafvye	Destinasi Disetujui	Destinasi Air Terjun Lepo yang Anda ajukan telah disetujui dan kini tampil di Beranda.	/pengelola	f	2026-07-11 04:30:50.714	DESTINASI
cmrfv9sn5000jzl593t7919rv	cmreo5a2z0000va59nhzafvye	Destinasi Disetujui	Destinasi Air Terjun Luweng Sampang yang Anda ajukan telah disetujui dan kini tampil di Beranda.	/pengelola	f	2026-07-11 04:30:50.945	DESTINASI
cmrfv9t83000kzl59l8j74z2a	cmreo5a2z0000va59nhzafvye	Destinasi Disetujui	Destinasi Air Terjun Kembang Soka yang Anda ajukan telah disetujui dan kini tampil di Beranda.	/pengelola	f	2026-07-11 04:30:51.699	DESTINASI
cmrfv9tzz000lzl59s7bly11u	cmreo5a2z0000va59nhzafvye	Destinasi Disetujui	Destinasi Air Terjun Randusari yang Anda ajukan telah disetujui dan kini tampil di Beranda.	/pengelola	f	2026-07-11 04:30:52.703	DESTINASI
cmrfv9ufh000mzl594on7vhnx	cmreo5a2z0000va59nhzafvye	Destinasi Disetujui	Destinasi Air Terjun Curug Sidoharjo yang Anda ajukan telah disetujui dan kini tampil di Beranda.	/pengelola	f	2026-07-11 04:30:53.261	DESTINASI
cmrfv9v7p000nzl59g2wx7udj	cmreo5a2z0000va59nhzafvye	Destinasi Disetujui	Destinasi Air Terjun Grojogan Sewu Jatimulyo yang Anda ajukan telah disetujui dan kini tampil di Beranda.	/pengelola	f	2026-07-11 04:30:54.277	DESTINASI
cmrfvibem000pzl59hj8ng7cu	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Gunung Ireng di Gunungkidul	/dashboard/destinasi/cmrfvib0h000ozl593bpm9dbj	f	2026-07-11 04:37:28.51	DESTINASI
cmrfvibem000qzl593bw5o3qx	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Gunung Ireng di Gunungkidul	/dashboard/destinasi/cmrfvib0h000ozl593bpm9dbj	f	2026-07-11 04:37:28.51	DESTINASI
cmrfvq48u000szl59k9x96ixi	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Gunung Api Purba Nglanggeran di Gunungkidul	/dashboard/destinasi/cmrfvq40p000rzl59zjj0wl25	f	2026-07-11 04:43:32.478	DESTINASI
cmrfvq48u000tzl594hfhlvnd	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Gunung Api Purba Nglanggeran di Gunungkidul	/dashboard/destinasi/cmrfvq40p000rzl59zjj0wl25	f	2026-07-11 04:43:32.478	DESTINASI
cmrfyg86l0003ed59ybbclsce	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Puncak Pinus Becici di Bantul	/dashboard/destinasi/cmrfyg7xt0002ed59lckmeckw	f	2026-07-11 05:59:49.869	DESTINASI
cmrfyg86l0004ed59qebmidan	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Puncak Pinus Becici di Bantul	/dashboard/destinasi/cmrfyg7xt0002ed59lckmeckw	f	2026-07-11 05:59:49.869	DESTINASI
cmrfymj800006ed59739qramw	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Gunung Wangi di Bantul	/dashboard/destinasi/cmrfymj0j0005ed59rqz89eyr	f	2026-07-11 06:04:44.112	DESTINASI
cmrfymj800007ed598cs8xqvp	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Gunung Wangi di Bantul	/dashboard/destinasi/cmrfymj0j0005ed59rqz89eyr	f	2026-07-11 06:04:44.112	DESTINASI
cmrfyscst0009ed59r9lc10cn	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Bukit Bintang di Gunungkidul	/dashboard/destinasi/cmrfyscgb0008ed59fbd56f86	f	2026-07-11 06:09:15.725	DESTINASI
cmrfyscst000aed59brew4fs7	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Bukit Bintang di Gunungkidul	/dashboard/destinasi/cmrfyscgb0008ed59fbd56f86	f	2026-07-11 06:09:15.725	DESTINASI
cmrfyxjl4000ced59xsrg9kku	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Bukit Klangon di Sleman	/dashboard/destinasi/cmrfyxjdi000bed59jl462cbf	f	2026-07-11 06:13:17.8	DESTINASI
cmrfyxjl4000ded599w0yt0g9	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Bukit Klangon di Sleman	/dashboard/destinasi/cmrfyxjdi000bed59jl462cbf	f	2026-07-11 06:13:17.8	DESTINASI
cmrfyxsne000eed59olet0rxj	cmreo5a2z0000va59nhzafvye	Destinasi Disetujui	Destinasi Gunung Ireng yang Anda ajukan telah disetujui dan kini tampil di Beranda.	/pengelola	f	2026-07-11 06:13:29.546	DESTINASI
cmrfyxt59000fed59czqokkkd	cmreo5a2z0000va59nhzafvye	Destinasi Disetujui	Destinasi Gunung Api Purba Nglanggeran yang Anda ajukan telah disetujui dan kini tampil di Beranda.	/pengelola	f	2026-07-11 06:13:30.189	DESTINASI
cmrfyxtih000ged59qguw8nlr	cmreo5a2z0000va59nhzafvye	Destinasi Disetujui	Destinasi Puncak Pinus Becici yang Anda ajukan telah disetujui dan kini tampil di Beranda.	/pengelola	f	2026-07-11 06:13:30.665	DESTINASI
cmrfyxubq000hed59zsyv3xxf	cmreo5a2z0000va59nhzafvye	Destinasi Disetujui	Destinasi Gunung Wangi yang Anda ajukan telah disetujui dan kini tampil di Beranda.	/pengelola	f	2026-07-11 06:13:31.718	DESTINASI
cmrfyxupd000ied59vaz4dlwy	cmreo5a2z0000va59nhzafvye	Destinasi Disetujui	Destinasi Bukit Bintang yang Anda ajukan telah disetujui dan kini tampil di Beranda.	/pengelola	f	2026-07-11 06:13:32.209	DESTINASI
cmrfyxv0b000jed59sxmp7e5q	cmreo5a2z0000va59nhzafvye	Destinasi Disetujui	Destinasi Bukit Klangon yang Anda ajukan telah disetujui dan kini tampil di Beranda.	/pengelola	f	2026-07-11 06:13:32.603	DESTINASI
cmrfzu3td00017l592obuhixg	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	mahliga mengajukan destinasi test di Sleman	/dashboard/destinasi/cmrfzu3gc00007l59fn1ra96n	f	2026-07-11 06:38:37.009	DESTINASI
cmrfzu3td00027l596sn96ir7	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	mahliga mengajukan destinasi test di Sleman	/dashboard/destinasi/cmrfzu3gc00007l59fn1ra96n	f	2026-07-11 06:38:37.009	DESTINASI
cmrfzueyk00037l594k1k2pnq	cmreo5a2z0000va59nhzafvye	Destinasi Ditolak	Destinasi test yang Anda ajukan ditolak oleh admin.	/pengelola	f	2026-07-11 06:38:51.452	DESTINASI
cmrg1bps800019z59yjzeyxm6	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Gunung Gamping di Sleman	/dashboard/destinasi/cmrg1bpen00009z59xdoko7bn	f	2026-07-11 07:20:18.248	DESTINASI
cmrg1bps800029z597fzhdi6s	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Gunung Gamping di Sleman	/dashboard/destinasi/cmrg1bpen00009z59xdoko7bn	f	2026-07-11 07:20:18.248	DESTINASI
cmrg1md0300049z59hmwcwgih	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Gunung Gambar di Gunungkidul	/dashboard/destinasi/cmrg1mcnh00039z59ybm1drev	f	2026-07-11 07:28:34.899	DESTINASI
cmrg1md0300059z594uu5ve7j	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Gunung Gambar di Gunungkidul	/dashboard/destinasi/cmrg1mcnh00039z59ybm1drev	f	2026-07-11 07:28:34.899	DESTINASI
cmrg1my9l00069z59av9lycr6	cmreo5a2z0000va59nhzafvye	Destinasi Disetujui	Destinasi Gunung Gamping yang Anda ajukan telah disetujui dan kini tampil di Beranda.	/pengelola	f	2026-07-11 07:29:02.457	DESTINASI
cmrg1mypy00079z59nsocmyf4	cmreo5a2z0000va59nhzafvye	Destinasi Disetujui	Destinasi Gunung Gambar yang Anda ajukan telah disetujui dan kini tampil di Beranda.	/pengelola	f	2026-07-11 07:29:03.046	DESTINASI
cmrg1tqf800099z59db3ux8s6	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Bukit Tompak di Bantul	/dashboard/destinasi/cmrg1tq6f00089z59zlwvli0f	f	2026-07-11 07:34:18.884	DESTINASI
cmrg1tqf8000a9z59lpa5q30l	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Bukit Tompak di Bantul	/dashboard/destinasi/cmrg1tq6f00089z59zlwvli0f	f	2026-07-11 07:34:18.884	DESTINASI
cmrgbut7c0001qu59d8e9n9bi	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	mahliga mengajukan destinasi testing pending di Sleman	/dashboard/destinasi/cmrgbusvu0000qu59c6lkact2	f	2026-07-11 12:15:05.304	DESTINASI
cmrgbut7c0002qu598g965i7p	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	mahliga mengajukan destinasi testing pending di Sleman	/dashboard/destinasi/cmrgbusvu0000qu59c6lkact2	f	2026-07-11 12:15:05.304	DESTINASI
cmrghqg0r00015u5973imrf5n	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	mahliga mengajukan destinasi testing pending 2 di Sleman	/dashboard/destinasi/cmrghqfqw00005u598fq8vjp0	f	2026-07-11 14:59:39.291	DESTINASI
cmrghqg0r00025u59rw3zcesp	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	mahliga mengajukan destinasi testing pending 2 di Sleman	/dashboard/destinasi/cmrghqfqw00005u598fq8vjp0	f	2026-07-11 14:59:39.291	DESTINASI
cmrh0xu8v0001a5u2pe96kwey	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	Pak Slamet (Pokdarwis) mengajukan destinasi ZZZ Wizard Skip Test 1783814235140 di Sleman	/dashboard/destinasi/cmrh0xtvr0000a5u2iziv8hcg	f	2026-07-11 23:57:17.023	DESTINASI
cmrh0xu8v0002a5u2qtik6ebx	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	Pak Slamet (Pokdarwis) mengajukan destinasi ZZZ Wizard Skip Test 1783814235140 di Sleman	/dashboard/destinasi/cmrh0xtvr0000a5u2iziv8hcg	f	2026-07-11 23:57:17.023	DESTINASI
cmrh0z4ie0004a5u2uuyuixct	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	Pak Slamet (Pokdarwis) mengajukan destinasi ZZZ Wizard Full Test 1783814293157 di Bantul	/dashboard/destinasi/cmrh0z4620003a5u23ptuhwai	f	2026-07-11 23:58:16.982	DESTINASI
cmrh0z4ie0005a5u2rgvbfc27	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	Pak Slamet (Pokdarwis) mengajukan destinasi ZZZ Wizard Full Test 1783814293157 di Bantul	/dashboard/destinasi/cmrh0z4620003a5u23ptuhwai	f	2026-07-11 23:58:16.982	DESTINASI
cmrh5jo7q0002pnu2nn5zl2kw	cmr53rtiw0001nxu2xsxss3b3	Pesanan Baru Masuk	Dimas Pratama memesan 1 Tiket Masuk Dewasa di Tebing Breksi. Kode: BLS-30LI33	/pengelola/destinasi/cmr53rtsi0007nxu225v5jaek	f	2026-07-12 02:06:14.102	TIKET
cmrh5jonm0005pnu2kremst5e	cmr53rtiw0001nxu2xsxss3b3	Pesanan Baru Masuk	Dimas Pratama memesan 1 Tiket Masuk Dewasa di Tebing Breksi. Kode: BLS-RHJ5AE	/pengelola/destinasi/cmr53rtsi0007nxu225v5jaek	f	2026-07-12 02:06:14.674	TIKET
cmrh5jp8w0008pnu2zovxmsp7	cmr53rtiw0001nxu2xsxss3b3	Pesanan Baru Masuk	Dimas Pratama memesan 1 Tiket Masuk Dewasa di Tebing Breksi. Kode: BLS-UZ1HG5	/pengelola/destinasi/cmr53rtsi0007nxu225v5jaek	f	2026-07-12 02:06:15.44	TIKET
cmrh5jpoe000bpnu2m5lcfq5e	cmr53rtiw0001nxu2xsxss3b3	Pesanan Baru Masuk	Dimas Pratama memesan 1 Tiket Masuk Dewasa di Tebing Breksi. Kode: BLS-9LK8GT	/pengelola/destinasi/cmr53rtsi0007nxu225v5jaek	f	2026-07-12 02:06:15.998	TIKET
cmrh5jqcv000epnu2y6w9iv6h	cmr53rtiw0001nxu2xsxss3b3	Pesanan Baru Masuk	Dimas Pratama memesan 1 Tiket Masuk Dewasa di Tebing Breksi. Kode: BLS-F8R0ZI	/pengelola/destinasi/cmr53rtsi0007nxu225v5jaek	f	2026-07-12 02:06:16.879	TIKET
cmrh5jqun000hpnu2vkckvo4p	cmr53rtiw0001nxu2xsxss3b3	Pesanan Baru Masuk	Dimas Pratama memesan 1 Tiket Masuk Dewasa di Tebing Breksi. Kode: BLS-RIBHB9	/pengelola/destinasi/cmr53rtsi0007nxu225v5jaek	f	2026-07-12 02:06:17.519	TIKET
cmrh5jrcg000kpnu2hn56c9j2	cmr53rtiw0001nxu2xsxss3b3	Pesanan Baru Masuk	Dimas Pratama memesan 1 Tiket Masuk Dewasa di Tebing Breksi. Kode: BLS-OWOMMD	/pengelola/destinasi/cmr53rtsi0007nxu225v5jaek	f	2026-07-12 02:06:18.16	TIKET
cmrh5jrrq000npnu2nagb4hie	cmr53rtiw0001nxu2xsxss3b3	Pesanan Baru Masuk	Dimas Pratama memesan 1 Tiket Masuk Dewasa di Tebing Breksi. Kode: BLS-8HYQHF	/pengelola/destinasi/cmr53rtsi0007nxu225v5jaek	f	2026-07-12 02:06:18.71	TIKET
cmrh5js65000qpnu253x6udqi	cmr53rtiw0001nxu2xsxss3b3	Pesanan Baru Masuk	Dimas Pratama memesan 1 Tiket Masuk Dewasa di Tebing Breksi. Kode: BLS-I7QKMW	/pengelola/destinasi/cmr53rtsi0007nxu225v5jaek	f	2026-07-12 02:06:19.229	TIKET
cmrh5jt4d000tpnu2bm6z5180	cmr53rtiw0001nxu2xsxss3b3	Pesanan Baru Masuk	Dimas Pratama memesan 1 Tiket Masuk Dewasa di Tebing Breksi. Kode: BLS-2J2MF0	/pengelola/destinasi/cmr53rtsi0007nxu225v5jaek	f	2026-07-12 02:06:20.461	TIKET
cmrh5jtpq000wpnu2m739ugjf	cmr53rtiw0001nxu2xsxss3b3	Pesanan Baru Masuk	Dimas Pratama memesan 1 Tiket Masuk Dewasa di Tebing Breksi. Kode: BLS-P5JTII	/pengelola/destinasi/cmr53rtsi0007nxu225v5jaek	f	2026-07-12 02:06:21.23	TIKET
cmrh5juic000zpnu242cpfqkd	cmr53rtiw0001nxu2xsxss3b3	Pesanan Baru Masuk	Dimas Pratama memesan 1 Tiket Masuk Dewasa di Tebing Breksi. Kode: BLS-KDMMZD	/pengelola/destinasi/cmr53rtsi0007nxu225v5jaek	f	2026-07-12 02:06:22.26	TIKET
cmrh8w4gn00064zu2tcxz0ya4	cmr53rtiw0001nxu2xsxss3b3	Booking Transport Baru	Dimas Pratama booking Ojek Warga Bukit (JEEP) di Bukit Klangon untuk tanggal 1 Agustus 2026.	/pengelola/destinasi/cmr53rtuq0008nxu2bh61jc5b	f	2026-07-12 03:39:53.879	TRANSPORT
cmrh8wyfw00074zu2y5o81jhf	cmr53rtkn0002nxu21bbesvmg	Booking Dikonfirmasi	Booking transport Anda di Bukit Klangon telah dikonfirmasi oleh pengelola.	/booking/cmrh8w49600054zu2qkn145ic	f	2026-07-12 03:40:32.732	TRANSPORT
cmrh8xzx000094zu28khdgdbq	cmr53rtiw0001nxu2xsxss3b3	Booking Transport Baru	Dimas Pratama booking Ojek Warga Air (OJEK) di Air Terjun Tlogo Muncar untuk tanggal 2 Agustus 2026.	/pengelola/destinasi/cmr53rtwt0009nxu2kcf7b4a7	f	2026-07-12 03:41:21.3	TRANSPORT
cmrha3l66000135595l9hb1xf	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Bukit Paralayang Watugupit di Gunungkidul	/dashboard/destinasi/cmrha3kfr00003559km6npm4b	f	2026-07-12 04:13:41.742	DESTINASI
cmrha3l6600023559mgmz5f3x	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Bukit Paralayang Watugupit di Gunungkidul	/dashboard/destinasi/cmrha3kfr00003559km6npm4b	f	2026-07-12 04:13:41.742	DESTINASI
cmrhavlf6000a35591p5x596f	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Bukit Ngisis di Kulon Progo	/dashboard/destinasi/cmrhavl7m00093559maqtcu48	f	2026-07-12 04:35:28.434	DESTINASI
cmrhavlf6000b3559cknu9jw1	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Bukit Ngisis di Kulon Progo	/dashboard/destinasi/cmrhavl7m00093559maqtcu48	f	2026-07-12 04:35:28.434	DESTINASI
cmrhbcx58000e3559lcuaoh76	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Bukit Panjung di Gunungkidul	/dashboard/destinasi/cmrhbcwwy000d3559vg36lkyv	f	2026-07-12 04:48:56.78	DESTINASI
cmrhbcx58000f355930qnqxyn	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Bukit Panjung di Gunungkidul	/dashboard/destinasi/cmrhbcwwy000d3559vg36lkyv	f	2026-07-12 04:48:56.78	DESTINASI
cmrhbdat3000g3559u1jjsjyd	cmreo5a2z0000va59nhzafvye	Destinasi Ditolak	Destinasi testing pending yang Anda ajukan ditolak oleh admin.	/pengelola	f	2026-07-12 04:49:14.487	DESTINASI
cmrhbdbs1000h3559a6bjnvbj	cmreo5a2z0000va59nhzafvye	Destinasi Ditolak	Destinasi testing pending 2 yang Anda ajukan ditolak oleh admin.	/pengelola	f	2026-07-12 04:49:15.745	DESTINASI
cmrhbdt4j000i3559rrxfh829	cmreo5a2z0000va59nhzafvye	Destinasi Disetujui	Destinasi Bukit Ngisis yang Anda ajukan telah disetujui dan kini tampil di Beranda.	/pengelola	f	2026-07-12 04:49:38.227	DESTINASI
cmrhbe4jw000j3559s3o83d9c	cmreo5a2z0000va59nhzafvye	Destinasi Disetujui	Destinasi Bukit Paralayang Watugupit yang Anda ajukan telah disetujui dan kini tampil di Beranda.	/pengelola	f	2026-07-12 04:49:53.036	DESTINASI
cmrhbi42o000l3559qt9jgmi4	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Bukit Pethu di Kulon Progo	/dashboard/destinasi/cmrhbi3uy000k35595wta24vm	f	2026-07-12 04:52:59.04	DESTINASI
cmrhbi42o000m3559822edtky	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	mahliga mengajukan destinasi Bukit Pethu di Kulon Progo	/dashboard/destinasi/cmrhbi3uy000k35595wta24vm	f	2026-07-12 04:52:59.04	DESTINASI
cmrhc5cmr000o3559in4ov4dq	cmr53rtd00000nxu2hivz6wzh	Pengajuan Destinasi Baru	Pengelola mengajukan destinasi Tebing Breksi di Sleman	/dashboard/destinasi/cmrhc5ces000n3559gxtm0djt	f	2026-07-12 05:11:03.219	DESTINASI
cmrhc5cmr000p3559jte9jcw1	cmr55dnks000f2du291co2mue	Pengajuan Destinasi Baru	Pengelola mengajukan destinasi Tebing Breksi di Sleman	/dashboard/destinasi/cmrhc5ces000n3559gxtm0djt	f	2026-07-12 05:11:03.219	DESTINASI
cmrhc5lpr000q3559enj7w4ay	cmreo5a2z0000va59nhzafvye	Destinasi Disetujui	Destinasi Tebing Breksi yang Anda ajukan telah disetujui dan kini tampil di Beranda.	/pengelola	f	2026-07-12 05:11:14.991	DESTINASI
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Review" (id, "userId", "destinationId", rating, komentar, "createdAt") FROM stdin;
cmr8umiac0000i359fr7nsep5	cmr57d38l0000ix59khm5bvtz	cmr55vzsh000317u20plp9wfu	5	tempat indah dan beruntung saya datang pada saat cuaca yang tepatopp	2026-07-06 06:38:21.204
cmrebm1eg0005cmu9kx4t4p97	cmr5ykb7q0000a2u92jnjavnv	cmrd3fasp0008x9u2rp72dtft	5	tes tes tes	2026-07-10 02:32:43.672
\.


--
-- Data for Name: TitikJemput; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."TitikJemput" (id, "serviceId", "namaLokasi", "hargaTambahan", "estimasiWaktu") FROM stdin;
\.


--
-- Data for Name: Transaksi; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Transaksi" (id, "userId", "destinationId", type, "totalHarga", status, "paymentMethod", jadwal, catatan, "kodeTransaksi", "createdAt", "updatedAt", "dibatalkanAt", "dikonfirmasiAt", "selesaiAt") FROM stdin;
cmr557hdq00092du2ocuh9wgq	cmr552khv00022du2befdgfbx	cmr53rug9000inxu2k3fpa7m0	FASILITAS	300000.000000000000000000000000000000	SELESAI	COD	2026-07-02 18:23:00	\N	BLS-EE7GTL	2026-07-03 16:23:31.262	2026-07-03 16:23:41.412	\N	\N	\N
cmr55z541000517u2shnls73z	cmr552khv00022du2befdgfbx	cmr55vzsh000317u20plp9wfu	TIKET_MASUK	50000.000000000000000000000000000000	SELESAI	COD	\N	\N	BLS-P2S1KP	2026-07-03 16:45:01.729	2026-07-03 16:45:21.489	\N	\N	\N
cmr560bw4000a17u2qxug7zie	cmr552khv00022du2befdgfbx	cmr559srg000e2du2or9eg7sf	TIKET_MASUK	50000.000000000000000000000000000000	SELESAI	COD	\N	\N	BLS-AUQPSB	2026-07-03 16:45:57.172	2026-07-03 16:46:17.517	\N	\N	\N
cmr5628r6000g17u265jt39no	cmr552khv00022du2befdgfbx	cmr559srg000e2du2or9eg7sf	FASILITAS	114000.000000000000000000000000000000	SELESAI	COD	2026-07-02 18:47:00	\N	BLS-NC4ELI	2026-07-03 16:47:26.418	2026-07-03 16:47:46.921	\N	\N	\N
cmra5sck4000d1gu2shcavwls	cmra3by4a00001gu2bw0glt58	cmr6bbnng000brou2q49a0p0n	UMKM	0.000000000000000000000000000000	DIBATALKAN	COD	2026-07-28 01:40:00	\N	BLS-2S67EC	2026-07-07 04:38:35.668	2026-07-07 05:18:00.828	\N	\N	\N
cmr56ucl400002tu224b4mvfr	cmr552khv00022du2befdgfbx	cmr53rug9000inxu2k3fpa7m0	TIKET_MASUK	10000.000000000000000000000000000000	SELESAI	COD	\N	\N	BLS-K2Z6W0	2026-07-03 17:09:17.752	2026-07-03 17:09:33.043	\N	\N	\N
cmr6ayvir0002rou2cn7zhjl3	cmr6aw7x00001rou2e39g6xf6	cmr559srg000e2du2or9eg7sf	TIKET_MASUK	30000.000000000000000000000000000000	DIBATALKAN	COD	\N	\N	BLS-LUO1FG	2026-07-04 11:52:33.555	2026-07-04 11:52:58.157	\N	\N	\N
cmr6b0bdp0006rou2fdt2xsrq	cmr6aw7x00001rou2e39g6xf6	cmr559srg000e2du2or9eg7sf	TIKET_MASUK	20000.000000000000000000000000000000	SELESAI	COD	\N	\N	BLS-WKZFCI	2026-07-04 11:53:40.765	2026-07-04 11:53:49.493	\N	\N	\N
cmrh5jqll000fpnu27dse992o	cmr53rtkn0002nxu21bbesvmg	cmr53rtsi0007nxu225v5jaek	TIKET_MASUK	10000.000000000000000000000000000000	PENDING	COD	\N	\N	BLS-RIBHB9	2026-07-12 02:06:17.194	2026-07-12 02:06:17.194	\N	\N	\N
cmr6bdsf6000drou213vlqxrv	cmr6aw7x00001rou2e39g6xf6	cmr6bbnng000brou2q49a0p0n	TIKET_MASUK	30000.000000000000000000000000000000	SELESAI	COD	\N	\N	BLS-BQFJPA	2026-07-04 12:04:09.378	2026-07-04 12:04:30.239	\N	\N	\N
cmr555sc100032du2e5gah0cf	cmr552khv00022du2befdgfbx	cmr53rug9000inxu2k3fpa7m0	TIKET_MASUK	20000.000000000000000000000000000000	SELESAI	COD	\N	\N	BLS-CTFFS9	2026-07-03 16:22:12.145	2026-07-03 16:22:34.856	\N	\N	\N
cmra7dqvm000611u2xuia9rpx	cmra3by4a00001gu2bw0glt58	cmra796aw000111u2fe471ahe	UMKM	20000.000000000000000000000000000000	SELESAI	COD	2026-07-16 12:00:00	\N	BLS-9BHZME	2026-07-07 05:23:13.619	2026-07-07 05:23:40.498	\N	\N	\N
cmr6bf5f8000irou2d55059yn	cmr6aw7x00001rou2e39g6xf6	cmr6bbnng000brou2q49a0p0n	TIKET_MASUK	40000.000000000000000000000000000000	SELESAI	COD	\N	\N	BLS-TVAFWD	2026-07-04 12:05:12.884	2026-07-04 12:05:21.679	\N	\N	\N
cmr6dhe8p000trou2satl1qkm	cmr6aw7x00001rou2e39g6xf6	cmr53rug9000inxu2k3fpa7m0	FASILITAS	300000.000000000000000000000000000000	SELESAI	COD	2026-07-04 13:02:00	\N	BLS-XL4QFN	2026-07-04 13:02:56.857	2026-07-04 13:03:19.841	\N	\N	\N
cmrcxzwyf0000oqu2ckenfwwk	cmr552khv00022du2befdgfbx	cmra796aw000111u2fe471ahe	TIKET_MASUK	20000.000000000000000000000000000000	DIKONFIRMASI	COD	\N	\N	BLS-5DP7UY	2026-07-09 03:23:50.296	2026-07-09 03:24:16.228	\N	2026-07-09 03:24:16.225	\N
cmr8yg2hf000by1u21r408ugk	cmr55dnks000f2du291co2mue	cmr6bbnng000brou2q49a0p0n	UMKM	0.000000000000000000000000000000	SELESAI	COD	2026-07-06 08:25:00	\N	BLS-MBO3BY	2026-07-06 08:25:19.251	2026-07-06 08:26:04.502	\N	\N	\N
cmra3z0pj00051gu2w83h29bn	cmra3by4a00001gu2bw0glt58	cmr6bbnng000brou2q49a0p0n	FASILITAS	300000.000000000000000000000000000000	DIKONFIRMASI	COD	2026-07-08 03:47:00	\N	BLS-TYFEOP	2026-07-07 03:47:47.671	2026-07-07 03:56:53.446	\N	\N	\N
cmra3mprh00011gu2emn7c9t9	cmra3by4a00001gu2bw0glt58	cmr6bbnng000brou2q49a0p0n	TIKET_MASUK	100000.000000000000000000000000000000	DIKONFIRMASI	COD	\N	\N	BLS-EX6ND8	2026-07-07 03:38:13.613	2026-07-07 03:56:54.459	\N	\N	\N
cmrh5jr4j000ipnu2ihmjxr9i	cmr53rtkn0002nxu21bbesvmg	cmr53rtsi0007nxu225v5jaek	TIKET_MASUK	10000.000000000000000000000000000000	PENDING	COD	\N	\N	BLS-OWOMMD	2026-07-12 02:06:17.875	2026-07-12 02:06:17.875	\N	\N	\N
cmrd26qnx0005hfu2wq259z53	cmrczbmwj0004oqu29c3c18k2	cmra796aw000111u2fe471ahe	UMKM	37000.000000000000000000000000000000	SELESAI	COD	\N	\N	BLS-VGI960	2026-07-09 05:21:07.197	2026-07-09 05:21:34.526	\N	2026-07-09 05:21:28.021	2026-07-09 05:21:34.524
cmrh5jrkj000lpnu2gf3pqtk2	cmr53rtkn0002nxu21bbesvmg	cmr53rtsi0007nxu225v5jaek	TIKET_MASUK	10000.000000000000000000000000000000	PENDING	COD	\N	\N	BLS-8HYQHF	2026-07-12 02:06:18.451	2026-07-12 02:06:18.451	\N	\N	\N
cmrd3ipor000dx9u2kt3j1o9a	cmrczbmwj0004oqu29c3c18k2	cmrd3fasp0008x9u2rp72dtft	TIKET_MASUK	15000.000000000000000000000000000000	SELESAI	COD	\N	\N	BLS-HLL7T1	2026-07-09 05:58:25.419	2026-07-09 05:58:46.237	\N	2026-07-09 05:58:42.47	2026-07-09 05:58:46.235
cmrh5jry5000opnu23x89arh3	cmr53rtkn0002nxu21bbesvmg	cmr53rtsi0007nxu225v5jaek	TIKET_MASUK	10000.000000000000000000000000000000	PENDING	COD	\N	\N	BLS-I7QKMW	2026-07-12 02:06:18.941	2026-07-12 02:06:18.941	\N	\N	\N
cmrebl2j10000cmu9e51w9zqb	cmr5ykb7q0000a2u92jnjavnv	cmrd3fasp0008x9u2rp72dtft	TIKET_MASUK	15000.000000000000000000000000000000	SELESAI	COD	\N	\N	BLS-K3KBH9	2026-07-10 02:31:58.477	2026-07-10 06:07:36.618	\N	2026-07-10 06:07:34.921	2026-07-10 06:07:36.616
cmrh5jo0x0000pnu2o4k3mio4	cmr53rtkn0002nxu21bbesvmg	cmr53rtsi0007nxu225v5jaek	TIKET_MASUK	10000.000000000000000000000000000000	PENDING	COD	\N	\N	BLS-30LI33	2026-07-12 02:06:13.858	2026-07-12 02:06:13.858	\N	\N	\N
cmrh5johe0003pnu2s7rp8080	cmr53rtkn0002nxu21bbesvmg	cmr53rtsi0007nxu225v5jaek	TIKET_MASUK	10000.000000000000000000000000000000	PENDING	COD	\N	\N	BLS-RHJ5AE	2026-07-12 02:06:14.45	2026-07-12 02:06:14.45	\N	\N	\N
cmrh5jovv0006pnu2kdbgrh7h	cmr53rtkn0002nxu21bbesvmg	cmr53rtsi0007nxu225v5jaek	TIKET_MASUK	10000.000000000000000000000000000000	PENDING	COD	\N	\N	BLS-UZ1HG5	2026-07-12 02:06:14.972	2026-07-12 02:06:14.972	\N	\N	\N
cmrh5jpgf0009pnu21t4wzq47	cmr53rtkn0002nxu21bbesvmg	cmr53rtsi0007nxu225v5jaek	TIKET_MASUK	10000.000000000000000000000000000000	PENDING	COD	\N	\N	BLS-9LK8GT	2026-07-12 02:06:15.711	2026-07-12 02:06:15.711	\N	\N	\N
cmrh5jpzw000cpnu2v26umjnq	cmr53rtkn0002nxu21bbesvmg	cmr53rtsi0007nxu225v5jaek	TIKET_MASUK	10000.000000000000000000000000000000	PENDING	COD	\N	\N	BLS-F8R0ZI	2026-07-12 02:06:16.412	2026-07-12 02:06:16.412	\N	\N	\N
cmrh5jsmm000rpnu2tk9xnqwn	cmr53rtkn0002nxu21bbesvmg	cmr53rtsi0007nxu225v5jaek	TIKET_MASUK	10000.000000000000000000000000000000	PENDING	COD	\N	\N	BLS-2J2MF0	2026-07-12 02:06:19.822	2026-07-12 02:06:19.822	\N	\N	\N
cmrh5jtfb000upnu22nwbikwg	cmr53rtkn0002nxu21bbesvmg	cmr53rtsi0007nxu225v5jaek	TIKET_MASUK	10000.000000000000000000000000000000	PENDING	COD	\N	\N	BLS-P5JTII	2026-07-12 02:06:20.855	2026-07-12 02:06:20.855	\N	\N	\N
cmrh5jub5000xpnu2rmny1qth	cmr53rtkn0002nxu21bbesvmg	cmr53rtsi0007nxu225v5jaek	TIKET_MASUK	10000.000000000000000000000000000000	PENDING	COD	\N	\N	BLS-KDMMZD	2026-07-12 02:06:22.001	2026-07-12 02:06:22.001	\N	\N	\N
\.


--
-- Data for Name: TransaksiItem; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."TransaksiItem" (id, "transaksiId", "namaItem", "hargaSatuan", kuantitas, subtotal) FROM stdin;
cmr555sfe00042du21uyku7bs	cmr555sc100032du2e5gah0cf	Tiket Masuk	5000.000000000000000000000000000000	4	20000.000000000000000000000000000000
cmr557hf5000a2du2he9xdvu9	cmr557hdq00092du2ocuh9wgq	sewa apapun	100000.000000000000000000000000000000	3	300000.000000000000000000000000000000
cmr55z56n000617u2r0zhlrb2	cmr55z541000517u2shnls73z	Tiket Masuk	10000.000000000000000000000000000000	5	50000.000000000000000000000000000000
cmr560bxd000b17u22mmbkse4	cmr560bw4000a17u2qxug7zie	Tiket Masuk	10000.000000000000000000000000000000	5	50000.000000000000000000000000000000
cmr5628sj000h17u2welvugxo	cmr5628r6000g17u265jt39no	sewa serbaguna	57000.000000000000000000000000000000	2	114000.000000000000000000000000000000
cmr56ucmh00012tu2ev1bty2n	cmr56ucl400002tu224b4mvfr	Tiket Masuk	5000.000000000000000000000000000000	2	10000.000000000000000000000000000000
cmr6ayvk20003rou210ur9pb6	cmr6ayvir0002rou2cn7zhjl3	Tiket Masuk	10000.000000000000000000000000000000	3	30000.000000000000000000000000000000
cmr6b0bgy0007rou2y94tnwpt	cmr6b0bdp0006rou2fdt2xsrq	Tiket Masuk	10000.000000000000000000000000000000	2	20000.000000000000000000000000000000
cmr6bdsgl000erou2u7yab7ws	cmr6bdsf6000drou213vlqxrv	Tiket Masuk	10000.000000000000000000000000000000	3	30000.000000000000000000000000000000
cmr6bf5h9000jrou2eokdlsf3	cmr6bf5f8000irou2d55059yn	Tiket Masuk	10000.000000000000000000000000000000	4	40000.000000000000000000000000000000
cmr6dhe9z000urou2ly1e6euz	cmr6dhe8p000trou2satl1qkm	sewa apapun	100000.000000000000000000000000000000	3	300000.000000000000000000000000000000
cmr8yg2it000cy1u2a4sgjqw9	cmr8yg2hf000by1u21r408ugk	Reservasi Tempat - Warung Bagas	0.000000000000000000000000000000	1	0.000000000000000000000000000000
cmra3mpt100021gu2873ex34k	cmra3mprh00011gu2emn7c9t9	Tiket Masuk	10000.000000000000000000000000000000	10	100000.000000000000000000000000000000
cmra3z0qx00061gu2okg2hs51	cmra3z0pj00051gu2w83h29bn	testing	100000.000000000000000000000000000000	3	300000.000000000000000000000000000000
cmra5sclc000e1gu2dg4l99b7	cmra5sck4000d1gu2shcavwls	Reservasi Tempat - Warung Bagas	0.000000000000000000000000000000	1	0.000000000000000000000000000000
cmra7dqwz000711u201nd2y99	cmra7dqvm000611u2xuia9rpx	warung bu jos - Ikan Patin	20000.000000000000000000000000000000	1	20000.000000000000000000000000000000
cmra7dqwz000811u217glu26a	cmra7dqvm000611u2xuia9rpx	Reservasi Tempat - warung bu jos	0.000000000000000000000000000000	1	0.000000000000000000000000000000
cmrcxzx1d0001oqu2s505bmsd	cmrcxzwyf0000oqu2ckenfwwk	Tiket Masuk	10000.000000000000000000000000000000	2	20000.000000000000000000000000000000
cmrd26qp90006hfu287ffv9nh	cmrd26qnx0005hfu2wq259z53	Warung Hanif - Nasi Goreng	15000.000000000000000000000000000000	1	15000.000000000000000000000000000000
cmrd26qp90007hfu240oq09fp	cmrd26qnx0005hfu2wq259z53	Warung Hanif - Ikan Goreng	10000.000000000000000000000000000000	1	10000.000000000000000000000000000000
cmrd26qp90008hfu20rc14enr	cmrd26qnx0005hfu2wq259z53	Warung Hanif - Seafood Asam Manis	12000.000000000000000000000000000000	1	12000.000000000000000000000000000000
cmrd3ippq000ex9u2uhkm035s	cmrd3ipor000dx9u2kt3j1o9a	Tiket Masuk Dewasa	10000.000000000000000000000000000000	1	10000.000000000000000000000000000000
cmrd3ippq000fx9u2rixp2vev	cmrd3ipor000dx9u2kt3j1o9a	Tiket Masuk Anak-anak	5000.000000000000000000000000000000	1	5000.000000000000000000000000000000
cmrebl2k40001cmu9uja06bs7	cmrebl2j10000cmu9e51w9zqb	Tiket Masuk Dewasa	10000.000000000000000000000000000000	1	10000.000000000000000000000000000000
cmrebl2k40002cmu9x5w6ya3z	cmrebl2j10000cmu9e51w9zqb	Tiket Masuk Anak-anak	5000.000000000000000000000000000000	1	5000.000000000000000000000000000000
cmrh5jo2w0001pnu219trsorf	cmrh5jo0x0000pnu2o4k3mio4	Tiket Masuk Dewasa	10000.000000000000000000000000000000	1	10000.000000000000000000000000000000
cmrh5joir0004pnu2cwbumspx	cmrh5johe0003pnu2s7rp8080	Tiket Masuk Dewasa	10000.000000000000000000000000000000	1	10000.000000000000000000000000000000
cmrh5jox60007pnu2ogkcahsu	cmrh5jovv0006pnu2kdbgrh7h	Tiket Masuk Dewasa	10000.000000000000000000000000000000	1	10000.000000000000000000000000000000
cmrh5jphs000apnu2w313r1j2	cmrh5jpgf0009pnu21t4wzq47	Tiket Masuk Dewasa	10000.000000000000000000000000000000	1	10000.000000000000000000000000000000
cmrh5jq2k000dpnu268qaile5	cmrh5jpzw000cpnu2v26umjnq	Tiket Masuk Dewasa	10000.000000000000000000000000000000	1	10000.000000000000000000000000000000
cmrh5jqmu000gpnu2554bl88w	cmrh5jqll000fpnu27dse992o	Tiket Masuk Dewasa	10000.000000000000000000000000000000	1	10000.000000000000000000000000000000
cmrh5jr6b000jpnu2qfb2n5n0	cmrh5jr4j000ipnu2ihmjxr9i	Tiket Masuk Dewasa	10000.000000000000000000000000000000	1	10000.000000000000000000000000000000
cmrh5jrm8000mpnu22syg1co4	cmrh5jrkj000lpnu2gf3pqtk2	Tiket Masuk Dewasa	10000.000000000000000000000000000000	1	10000.000000000000000000000000000000
cmrh5jrzk000ppnu2tniwts1z	cmrh5jry5000opnu23x89arh3	Tiket Masuk Dewasa	10000.000000000000000000000000000000	1	10000.000000000000000000000000000000
cmrh5jspv000spnu2fc6g9xrc	cmrh5jsmm000rpnu2tk9xnqwn	Tiket Masuk Dewasa	10000.000000000000000000000000000000	1	10000.000000000000000000000000000000
cmrh5jtgi000vpnu25atklpaf	cmrh5jtfb000upnu22nwbikwg	Tiket Masuk Dewasa	10000.000000000000000000000000000000	1	10000.000000000000000000000000000000
cmrh5juch000ypnu2ggvhqqgm	cmrh5jub5000xpnu2rmny1qth	Tiket Masuk Dewasa	10000.000000000000000000000000000000	1	10000.000000000000000000000000000000
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."User" (id, name, email, phone, "passwordHash", "nikEncrypted", role, "createdAt", "resetToken", "resetTokenExpiry", "bahasaPreferensi", "namaInstansi", "notifEmailAktif", "namaUsaha", "notifBookingAktif", "notifTransaksiAktif", "notifUlasanAktif", "notifLainnyaAktif", "notifStatusBookingAktif", "notifStatusTransaksiAktif") FROM stdin;
cmr57ouyv000084uftd63yole	Bagaskara	sarsyam9@gmail.com	085238500146	$2b$12$XMxU54/GeBi5iN1GvCbMfeo11EGLxAw9W9DT.ARvTA4kLNWXlWgXy	\N	WISATAWAN	2026-07-03 17:33:01.255	\N	\N	id	\N	t	\N	t	t	t	t	t	t
cmr53rtd00000nxu2hivz6wzh	Admin Dinas Pariwisata	admin@blusukan.id	\N	$2b$10$UNP2GSubXp3PsthcPRxXk.xdAZgU3tpZTEQ.Wd3Or5XGycINSK0Gq	\N	ADMIN	2026-07-03 15:43:20.677	\N	\N	id	\N	t	\N	t	t	t	t	t	t
cmr53rtly0003nxu2h3we68lo	Sari Wulandari	sari.wulandari@gmail.com	\N	$2b$10$XjDooNUHS0Qdxk1hF3bj9uNrcgf2N6DPL4GfTDFDRJKTPVdQIVoFy	\N	WISATAWAN	2026-07-03 15:43:20.998	\N	\N	id	\N	t	\N	t	t	t	t	t	t
cmr53rtnd0004nxu2di8cbvo7	Budi Santoso	budi.santoso@gmail.com	\N	$2b$10$XjDooNUHS0Qdxk1hF3bj9uNrcgf2N6DPL4GfTDFDRJKTPVdQIVoFy	\N	WISATAWAN	2026-07-03 15:43:21.049	\N	\N	id	\N	t	\N	t	t	t	t	t	t
cmr53rtoq0005nxu2ayl9e30c	Rina Kartika	rina.kartika@gmail.com	\N	$2b$10$XjDooNUHS0Qdxk1hF3bj9uNrcgf2N6DPL4GfTDFDRJKTPVdQIVoFy	\N	WISATAWAN	2026-07-03 15:43:21.098	\N	\N	id	\N	t	\N	t	t	t	t	t	t
cmr53rtq40006nxu2z1iql38w	Yoga Saputra	yoga.saputra@gmail.com	\N	$2b$10$XjDooNUHS0Qdxk1hF3bj9uNrcgf2N6DPL4GfTDFDRJKTPVdQIVoFy	\N	WISATAWAN	2026-07-03 15:43:21.148	\N	\N	id	\N	t	\N	t	t	t	t	t	t
cmr54zgvg00002du2004luk4i	Faza	faza@gmail.com	08778899007766	$2b$12$hXZK.s6.pu0IweOPRi3y1OJ2EmUgSRNWAfJX.Gv.OA1spzJNkfp1G	8cb9be1e4179014109fbc6a6:c6ff2cc2830c02e369b62ec7963d5e75:231fecfcebafc4eed00173ee9342e2da	PENGELOLA	2026-07-03 16:17:17.357	\N	\N	id	\N	t	\N	t	t	t	t	t	t
cmr551l8l00012du26bc07tam	Farrel	farrel@gmail.com	08919191919191919	$2b$12$cKbCSw9JF4twqS73MmvyYeV.VzaGeWZlfXtMRHA3mXgoCM3i..MRW	\N	WISATAWAN	2026-07-03 16:18:56.325	\N	\N	id	\N	t	\N	t	t	t	t	t	t
cmr57d38l0000ix59khm5bvtz	Mochammad Hanif	mochammadhanif02@gmail.com	\N	$2b$12$qh94Jc3rgogZQqA.aKDyAONpp.3gjKUZukofmFP3pl82hJRY9zbZ6	\N	WISATAWAN	2026-07-03 17:23:52.101	\N	\N	id	\N	t	\N	t	t	t	t	t	t
cmr57q9y1000184uf5krpc103	kairi bagaskara	muhagaigt@gmail.com	081250726252	$2b$12$rzssqONfp/llJPS3dllonef.jtLDtk99/h3rs3GLSCVv3KsIy2Bby	472f62e8805c6f5037206f6f:ee76717d7c89ad3dbb39af5b7ba9c9c4:83e28f95ddac5c0218cc918676da1bb3	PENGELOLA	2026-07-03 17:34:07.321	\N	\N	id	\N	t	\N	t	t	t	t	t	t
cmr6atzgi0000rou26qw3qusb	pengelola	pengelola@gmail.com	08112233445566	$2b$12$wImrdPls3hHBfxtn2O7IxOcGxAedqfYxxF9XHUZhfH1dLrjyNSN4u	cf8288b28677b31a8419bea4:d5c163da7c921f8e66c3ee6623e0fa28:e2ad7f9dc9a7c464c120a004a7a274a3	PENGELOLA	2026-07-04 11:48:45.378	\N	\N	id	\N	t	\N	t	t	t	t	t	t
cmr6aw7x00001rou2e39g6xf6	goyoumjung	gyj@gmail.com	081122334455	$2b$12$t5XJbp.3EzAIiLP97KqVS.ZcBliV9Y9g7i5JI1zFyYhJVmFNS/sKO	\N	WISATAWAN	2026-07-04 11:50:29.652	\N	\N	id	\N	t	\N	t	t	t	t	t	t
cmra3by4a00001gu2bw0glt58	testing1	testing1@gmail.com	08112233445566	$2b$12$oVY3otGWg8vwDZLQ.wteFedaf0qMpNVLLz/kt9ZLfQLyeahOLRYya	\N	WISATAWAN	2026-07-07 03:29:51.226	\N	\N	id	\N	t	\N	t	t	t	t	t	t
cmr57doa00001ix595roqi252	Mochammad Hanif	mochammadhanif01@gmail.com	081238718626	$2b$12$y.KT04RmcOx8WWD12WiQFOdVwlaI/9Zl9hMvctUqIOGC9SzVFZ/da	8eda4a5f09d3b158816e95db:7d17a7b805d5fc05b629ac80ec1de545:0c109b9ddf5adc45cc39bb1ffcba626a	PENGELOLA	2026-07-03 17:24:19.368	\N	\N	id	\N	t	\N	t	t	t	t	t	t
cmr552khv00022du2befdgfbx	ahyeon	ahyeon@gmail.com	08919191919191919	$2b$12$pCmplZhQBIhaA4VAqxq6zevMjyt2oexf/e.4g5kktg5asR4QdXD4S	\N	WISATAWAN	2026-07-03 16:19:42.019	3a75bd5ae8118c7d16413a7363a870b08fb69af9584e378f472c613f77a90f11	2026-07-09 04:52:27.111	id	\N	t	\N	t	t	t	t	t	t
cmr53rtkn0002nxu21bbesvmg	Dimas Pratama	dimas.pratama@gmail.com	\N	$2b$10$XjDooNUHS0Qdxk1hF3bj9uNrcgf2N6DPL4GfTDFDRJKTPVdQIVoFy	\N	WISATAWAN	2026-07-03 15:43:20.951	\N	\N	id	\N	t	\N	t	t	t	t	t	t
cmr5ykb7q0000a2u92jnjavnv	budi	budi8@gmail.com	081212131313	$2b$12$AsqTXGUx3Zu13x3dWVZyoubAN2JuodgNFR/x3s9Q5BxAnxhyRbzQe	\N	WISATAWAN	2026-07-04 06:05:18.662	5eccb33d8a299aa1a47982302a0fa232164b388b70c9b231e193c753d34afc90	2026-07-10 03:33:20.16	id	\N	t	\N	t	t	t	t	t	t
cmreo5a2z0000va59nhzafvye	Pengelola	mahliga@gmail.com	08123456789	$2b$12$9SwRCFU2RxvguV8M2GOtCuajCLLTPLGAXR/Y4cYq82xTNFxh2Jf4G	5be6ac3997b868ae6b441192:3f74f35759b3152b4b4bd76ec55343ab:c231c5642b795a8d6d62a78c167168b8	PENGELOLA	2026-07-10 08:23:36.779	\N	\N	id	\N	t	\N	t	t	t	t	t	t
cmr55dnks000f2du291co2mue	admin	admin@gmail.com	08919191919191919	$2b$12$c8SA64LwRs9pk3Eyy..ive2KrGU4kYVif3ZlZZbe3TLAVstmMl17m	\N	ADMIN	2026-07-03 16:28:19.228	\N	\N	id	\N	t	\N	t	t	t	t	t	t
cmr53rtiw0001nxu2xsxss3b3	Pak Slamet (Pokdarwis)	pengelola@blusukan.id	\N	$2b$10$XjDooNUHS0Qdxk1hF3bj9uNrcgf2N6DPL4GfTDFDRJKTPVdQIVoFy	\N	PENGELOLA	2026-07-03 15:43:20.888	\N	\N	id	\N	t	\N	t	t	t	t	t	t
cmrczbmwj0004oqu29c3c18k2	zarel	frelfaza@gmail.com	08919191919191919	$2b$12$jAHzkQR0SxXhPdU917PRbeExB9wplTZXkfWKUYOYPa9do8tIXupJy	\N	WISATAWAN	2026-07-09 04:00:56.755	9f3c6d2844dc61a856b7fcce2efaad362c6bec2c4dd6104151a91fb59798d70c	2026-07-10 07:47:06.109	id	\N	t	\N	t	t	t	t	t	t
\.


--
-- Data for Name: UserReport; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."UserReport" (id, "userId", "destinationId", "roadCondition", "signalStrength", "toiletLayak", "parkirLayak", "tempatIbadahLayak", "tempatDudukLayak", "penitipanBarangLayak", "reportedFee", "crowdLevel", "photoUrl", latitude, longitude, "isVerified", "upvoteCount", notes, "createdAt") FROM stdin;
cmr53ruto000qnxu29bu1hrik	cmr53rtoq0005nxu2ayl9e30c	cmr53rtsi0007nxu225v5jaek	MUDAH	LEMAH	f	t	f	t	t	10000.000000000000000000000000000000	PADAT	\N	-7.774712229276188	110.5139221836674	t	2	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-21 15:43:22.559
cmr53ruvk000rnxu2bi1okuy9	cmr53rtnd0004nxu2di8cbvo7	cmr53rtsi0007nxu225v5jaek	MUDAH	SEDANG	f	t	t	t	f	10000.000000000000000000000000000000	SEDANG	\N	-7.774292742250205	110.51461139068894	t	8	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-22 15:43:22.629
cmr53ruxc000snxu2se2e73xq	cmr53rtq40006nxu2z1iql38w	cmr53rtsi0007nxu225v5jaek	MUDAH	KUAT	t	t	f	f	t	10000.000000000000000000000000000000	SEPI	\N	-7.7744295894455036	110.51392420299493	f	8	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-25 15:43:22.698
cmr53ruz5000tnxu2rf4n701f	cmr53rtly0003nxu2h3we68lo	cmr53rtsi0007nxu225v5jaek	MUDAH	SEDANG	f	t	t	f	f	10000.000000000000000000000000000000	PADAT	\N	-7.77447070610547	110.51452178119877	t	5	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-28 15:43:22.758
cmr53rv2i000unxu2r1wuevuv	cmr53rtoq0005nxu2ayl9e30c	cmr53rtsi0007nxu225v5jaek	MUDAH	SEDANG	t	f	t	t	t	10000.000000000000000000000000000000	PADAT	\N	-7.774287298929378	110.5139676416791	t	5	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-19 15:43:22.879
cmr53rv4f000vnxu2lnlb098m	cmr53rtoq0005nxu2ayl9e30c	cmr53rtuq0008nxu2bh61jc5b	SULIT	LEMAH	t	t	t	t	t	5000.000000000000000000000000000000	PADAT	\N	-7.612808443293739	110.4460655405576	f	1	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-06 15:43:22.951
cmr53rv6f000wnxu2rh6vr1cx	cmr53rtly0003nxu2h3we68lo	cmr53rtuq0008nxu2bh61jc5b	SULIT	SEDANG	t	t	t	f	t	5000.000000000000000000000000000000	SEDANG	\N	-7.61291079126095	110.44589873375209	t	6	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-10 15:43:23.021
cmr53rv9b000xnxu20taned1d	cmr53rtkn0002nxu21bbesvmg	cmr53rtuq0008nxu2bh61jc5b	SULIT	SEDANG	t	t	f	t	f	5000.000000000000000000000000000000	PADAT	\N	-7.612984863761341	110.44511040710866	t	2	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-07-01 15:43:23.106
cmr53rvb3000ynxu28wdpjo62	cmr53rtq40006nxu2z1iql38w	cmr53rtuq0008nxu2bh61jc5b	SULIT	SEDANG	t	f	t	t	f	5000.000000000000000000000000000000	SEDANG	\N	-7.612757339596083	110.44585767033267	t	5	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-13 15:43:23.187
cmr53rvcp000znxu2uutdqzcp	cmr53rtoq0005nxu2ayl9e30c	cmr53rtuq0008nxu2bh61jc5b	SULIT	LEMAH	t	f	t	t	f	5000.000000000000000000000000000000	PADAT	\N	-7.612455354243524	110.4452310312295	t	1	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-20 15:43:23.249
cmr53rveb0010nxu2fkhtntco	cmr53rtoq0005nxu2ayl9e30c	cmr53rtuq0008nxu2bh61jc5b	SULIT	SEDANG	t	t	f	f	t	5000.000000000000000000000000000000	SEPI	\N	-7.612623749761752	110.44593307800741	f	2	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-07-03 15:43:23.308
cmr53rvfx0011nxu2yx9wvw81	cmr53rtnd0004nxu2di8cbvo7	cmr53rtwt0009nxu2kcf7b4a7	RUSAK	LEMAH	t	t	f	t	f	0.000000000000000000000000000000	SEPI	\N	-7.651446093682708	110.42712805242209	t	7	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-18 15:43:23.367
cmr53rvhk0012nxu2ha2nd1tz	cmr53rtq40006nxu2z1iql38w	cmr53rtwt0009nxu2kcf7b4a7	RUSAK	SEDANG	f	t	t	f	t	0.000000000000000000000000000000	PADAT	\N	-7.651456789476954	110.4270519134704	f	3	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-20 15:43:23.427
cmr53rvjb0013nxu2atxdwcpu	cmr53rtkn0002nxu21bbesvmg	cmr53rtwt0009nxu2kcf7b4a7	RUSAK	LEMAH	t	t	t	t	t	0.000000000000000000000000000000	SEDANG	\N	-7.650982449375935	110.42677679049487	t	4	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-18 15:43:23.489
cmr53rvkw0014nxu2gz5lc0fc	cmr53rtq40006nxu2z1iql38w	cmr53rtwt0009nxu2kcf7b4a7	RUSAK	LEMAH	f	t	t	t	f	0.000000000000000000000000000000	PADAT	\N	-7.650934908073921	110.42709282537633	f	4	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-25 15:43:23.547
cmr53rvmv0015nxu29gx969f1	cmr53rtq40006nxu2z1iql38w	cmr53rtwt0009nxu2kcf7b4a7	RUSAK	KUAT	t	t	f	f	t	0.000000000000000000000000000000	SEDANG	\N	-7.651193890872999	110.42677996733859	t	1	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-07 15:43:23.608
cmr53rvon0016nxu28vnzql10	cmr53rtnd0004nxu2di8cbvo7	cmr53rtzo000anxu2x2eqghmi	SEDANG	LEMAH	t	f	t	t	t	25000.000000000000000000000000000000	PADAT	\N	-8.20878000981561	110.67342307931389	t	8	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-15 15:43:23.68
cmr53rvq80017nxu2285lmwh3	cmr53rtq40006nxu2z1iql38w	cmr53rtzo000anxu2x2eqghmi	SEDANG	LEMAH	t	f	t	t	t	30000.000000000000000000000000000000	PADAT	\N	-8.208945969229438	110.67357691048007	f	8	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-20 15:43:23.737
cmr53rvtp0018nxu2m4jnr1q6	cmr53rtoq0005nxu2ayl9e30c	cmr53rtzo000anxu2x2eqghmi	SEDANG	SEDANG	t	t	t	f	f	27000.000000000000000000000000000000	PADAT	\N	-8.20923273477747	110.67375493006341	t	4	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-06 15:43:23.859
cmr53rvv70019nxu2hq53k1dy	cmr53rtkn0002nxu21bbesvmg	cmr53rtzo000anxu2x2eqghmi	SEDANG	KUAT	f	t	t	t	f	30000.000000000000000000000000000000	PADAT	\N	-8.208537105406513	110.67378004372534	t	7	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-07-02 15:43:23.917
cmr53rvx6001anxu29esgnnv9	cmr53rtkn0002nxu21bbesvmg	cmr53rtzo000anxu2x2eqghmi	SEDANG	LEMAH	f	f	t	f	t	29000.000000000000000000000000000000	SEDANG	\N	-8.209068982436355	110.67431283624036	t	3	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-06 15:43:23.988
cmr53rvyw001bnxu2xo3qds2m	cmr53rtkn0002nxu21bbesvmg	cmr53ru1b000bnxu2urm3gg23	MUDAH	LEMAH	f	t	t	f	t	15000.000000000000000000000000000000	SEDANG	\N	-7.948385792944219	110.66324387658828	t	1	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-04 15:43:24.048
cmr53rw0j001cnxu2f4f0x1sn	cmr53rtoq0005nxu2ayl9e30c	cmr53ru1b000bnxu2urm3gg23	MUDAH	KUAT	t	t	t	f	f	15000.000000000000000000000000000000	SEPI	\N	-7.9488390646410565	110.66260309142443	t	1	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-14 15:43:24.107
cmr53rw2e001dnxu2oqjwk7ti	cmr53rtoq0005nxu2ayl9e30c	cmr53ru1b000bnxu2urm3gg23	MUDAH	SEDANG	t	t	f	t	f	15000.000000000000000000000000000000	SEPI	\N	-7.949071045657155	110.66244585118963	t	0	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-09 15:43:24.176
cmr53rw45001enxu26knda7pw	cmr53rtkn0002nxu21bbesvmg	cmr53ru1b000bnxu2urm3gg23	MUDAH	KUAT	t	t	t	t	f	15000.000000000000000000000000000000	PADAT	\N	-7.948595083799019	110.6626963552634	t	0	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-20 15:43:24.239
cmr53rw69001fnxu2gwcpsq8k	cmr53rtoq0005nxu2ayl9e30c	cmr53ru1b000bnxu2urm3gg23	MUDAH	SEDANG	t	t	t	f	t	15000.000000000000000000000000000000	PADAT	\N	-7.9489199982662155	110.66276694250806	t	1	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-09 15:43:24.317
cmr53rw81001gnxu25wr3e3og	cmr53rtoq0005nxu2ayl9e30c	cmr53ru2q000cnxu2eeq4pnrm	SEDANG	LEMAH	f	t	t	f	t	15000.000000000000000000000000000000	PADAT	\N	-7.877808831939237	110.59534947997149	f	0	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-24 15:43:24.38
cmr53rw9q001hnxu2v6ije8zb	cmr53rtoq0005nxu2ayl9e30c	cmr53ru2q000cnxu2eeq4pnrm	SEDANG	KUAT	f	t	t	f	f	15000.000000000000000000000000000000	SEDANG	\N	-7.877280533437208	110.5950154610248	t	6	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-08 15:43:24.437
cmr53rwbw001inxu24a5xafnm	cmr53rtly0003nxu2h3we68lo	cmr53ru2q000cnxu2eeq4pnrm	SEDANG	KUAT	f	t	t	t	t	15000.000000000000000000000000000000	SEPI	\N	-7.877042568993781	110.59512427503982	t	8	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-18 15:43:24.518
cmr53rwdn001jnxu2peb9zuee	cmr53rtkn0002nxu21bbesvmg	cmr53ru2q000cnxu2eeq4pnrm	SEDANG	SEDANG	t	t	f	t	t	15000.000000000000000000000000000000	PADAT	\N	-7.877323791901251	110.59530535697877	f	8	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-06 15:43:24.578
cmr53rwfj001knxu2m2hmz04z	cmr53rtq40006nxu2z1iql38w	cmr53ru2q000cnxu2eeq4pnrm	SEDANG	LEMAH	t	f	f	f	f	15000.000000000000000000000000000000	SEPI	\N	-7.877288824161419	110.59545220090878	t	8	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-15 15:43:24.639
cmr53rwhm001lnxu2kdwng8ko	cmr53rtnd0004nxu2di8cbvo7	cmr53ru4b000dnxu2xmbuu635	SULIT	SEDANG	t	t	t	t	f	5000.000000000000000000000000000000	SEPI	\N	-8.145793079887445	110.47706626844636	t	4	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-22 15:43:24.72
cmr53rwld001mnxu2n2jlgeoe	cmr53rtly0003nxu2h3we68lo	cmr53ru4b000dnxu2xmbuu635	SULIT	LEMAH	t	f	t	t	f	5000.000000000000000000000000000000	SEPI	\N	-8.145763719917984	110.47733094479103	t	6	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-25 15:43:24.858
cmr53rwmz001nnxu26h9oa6ur	cmr53rtnd0004nxu2di8cbvo7	cmr53ru4b000dnxu2xmbuu635	SULIT	LEMAH	f	t	t	t	f	5000.000000000000000000000000000000	SEPI	\N	-8.145718523269483	110.47671807797603	f	3	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-10 15:43:24.917
cmr53rwop001onxu2j7b00ws2	cmr53rtkn0002nxu21bbesvmg	cmr53ru4b000dnxu2xmbuu635	SULIT	LEMAH	f	f	t	t	f	5000.000000000000000000000000000000	SEPI	\N	-8.145329570683991	110.47720886633996	f	2	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-30 15:43:24.978
cmr53rwqn001pnxu25jua1tzl	cmr53rtkn0002nxu21bbesvmg	cmr53ru60000enxu21aim6ww5	SEDANG	SEDANG	f	f	t	t	t	5000.000000000000000000000000000000	SEDANG	\N	-7.9395706539651165	110.41984192006956	t	1	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-16 15:43:25.05
cmr53rwsx001qnxu2w3xwl10c	cmr53rtnd0004nxu2di8cbvo7	cmr53ru60000enxu21aim6ww5	SEDANG	LEMAH	t	t	t	f	f	5000.000000000000000000000000000000	SEPI	\N	-7.9393925917993755	110.42059206055244	f	5	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-13 15:43:25.13
cmr53rwuj001rnxu2qxtf7goz	cmr53rtoq0005nxu2ayl9e30c	cmr53ru60000enxu21aim6ww5	SEDANG	SEDANG	t	t	f	f	f	5000.000000000000000000000000000000	SEDANG	\N	-7.940281612916054	110.42064164380946	t	5	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-04 15:43:25.191
cmr53rww6001snxu2g9x4ragq	cmr53rtnd0004nxu2di8cbvo7	cmr53ru60000enxu21aim6ww5	SEDANG	KUAT	f	f	t	t	t	5000.000000000000000000000000000000	SEPI	\N	-7.940238681315735	110.41990304795452	f	5	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-17 15:43:25.247
cmr53rwxs001tnxu2hc75t3mj	cmr53rtkn0002nxu21bbesvmg	cmr53ru60000enxu21aim6ww5	SEDANG	LEMAH	t	t	f	t	f	5000.000000000000000000000000000000	SEDANG	\N	-7.940259568647429	110.4198485756764	t	0	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-07-02 15:43:25.308
cmr53rwzi001unxu2g87t8bld	cmr53rtnd0004nxu2di8cbvo7	cmr53ru60000enxu21aim6ww5	SEDANG	SEDANG	t	t	t	f	t	5000.000000000000000000000000000000	PADAT	\N	-7.939617791808261	110.42015869639998	t	5	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-28 15:43:25.367
cmr53rx14001vnxu27haerx2s	cmr53rtnd0004nxu2di8cbvo7	cmr53rua5000fnxu2we1n52lw	RUSAK	KUAT	t	t	f	f	t	0.000000000000000000000000000000	SEDANG	\N	-7.96414531300198	110.44533772626387	t	3	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-28 15:43:25.431
cmr53rx2r001wnxu2qhrmbmao	cmr53rtq40006nxu2z1iql38w	cmr53rua5000fnxu2we1n52lw	RUSAK	KUAT	t	t	t	t	t	0.000000000000000000000000000000	SEPI	\N	-7.963662336448481	110.445336185269	t	5	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-25 15:43:25.487
cmr53rx48001xnxu2fveul20m	cmr53rtkn0002nxu21bbesvmg	cmr53rua5000fnxu2we1n52lw	RUSAK	SEDANG	f	t	f	t	f	0.000000000000000000000000000000	SEPI	\N	-7.9635997874069515	110.44543834794528	t	0	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-17 15:43:25.539
cmr53rx5w001ynxu2y7v1twxc	cmr53rtnd0004nxu2di8cbvo7	cmr53rua5000fnxu2we1n52lw	RUSAK	KUAT	t	t	f	t	t	0.000000000000000000000000000000	SEDANG	\N	-7.963211243312663	110.44489406553372	t	0	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-04 15:43:25.597
cmr53rx7p001znxu2r4vf9nqf	cmr53rtq40006nxu2z1iql38w	cmr53rua5000fnxu2we1n52lw	RUSAK	LEMAH	t	t	f	f	f	0.000000000000000000000000000000	SEPI	\N	-7.963807085575719	110.44508861625876	t	3	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-28 15:43:25.658
cmr53rxac0020nxu214i0e1ch	cmr53rtoq0005nxu2ayl9e30c	cmr53rua5000fnxu2we1n52lw	RUSAK	LEMAH	t	f	f	t	t	0.000000000000000000000000000000	SEDANG	\N	-7.963641686035102	110.44475495170404	f	6	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-13 15:43:25.757
cmr53rxbz0021nxu27bude233	cmr53rtoq0005nxu2ayl9e30c	cmr53rucf000gnxu2w6rktmtm	MUDAH	KUAT	t	t	f	t	f	10000.000000000000000000000000000000	SEPI	\N	-7.7651762558454696	110.16750564562713	f	3	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-16 15:43:25.816
cmr53rxdn0022nxu2otalv0wp	cmr53rtq40006nxu2z1iql38w	cmr53rucf000gnxu2w6rktmtm	MUDAH	KUAT	t	t	t	t	f	10000.000000000000000000000000000000	SEPI	\N	-7.765081720321132	110.1670506232277	t	4	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-11 15:43:25.877
cmr53rxff0023nxu2obmbdrsr	cmr53rtly0003nxu2h3we68lo	cmr53rucf000gnxu2w6rktmtm	MUDAH	KUAT	f	t	t	t	f	10000.000000000000000000000000000000	SEPI	\N	-7.765078707767364	110.16706120100994	t	0	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-23 15:43:25.937
cmr53rxh20024nxu2txjwxnf1	cmr53rtly0003nxu2h3we68lo	cmr53rucf000gnxu2w6rktmtm	MUDAH	LEMAH	f	t	f	t	t	10000.000000000000000000000000000000	PADAT	\N	-7.765028779181791	110.16741973926642	t	4	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-07-02 15:43:25.997
cmr53rxij0025nxu2anjx7bwd	cmr53rtly0003nxu2h3we68lo	cmr53rucf000gnxu2w6rktmtm	MUDAH	SEDANG	t	t	t	f	t	10000.000000000000000000000000000000	PADAT	\N	-7.76534588880896	110.16695545503477	t	5	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-22 15:43:26.055
cmr53rxk70026nxu2sdsbv893	cmr53rtnd0004nxu2di8cbvo7	cmr53ruec000hnxu2ycrswa5w	SEDANG	LEMAH	t	t	f	f	t	5000.000000000000000000000000000000	PADAT	\N	-7.935140052508602	110.14590312655116	t	2	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-04 15:43:26.116
cmr53rxme0027nxu2xdxc4lb2	cmr53rtkn0002nxu21bbesvmg	cmr53ruec000hnxu2ycrswa5w	SEDANG	KUAT	t	t	f	t	t	5000.000000000000000000000000000000	PADAT	\N	-7.9354424244081505	110.14526412072017	t	5	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-06 15:43:26.196
cmr53rxo80028nxu2jw1ayps5	cmr53rtnd0004nxu2di8cbvo7	cmr53ruec000hnxu2ycrswa5w	SEDANG	KUAT	t	f	f	t	f	5000.000000000000000000000000000000	PADAT	\N	-7.935106595458123	110.1453491312796	f	3	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-29 15:43:26.258
cmr53rxpu0029nxu2h437hs7c	cmr53rtkn0002nxu21bbesvmg	cmr53ruec000hnxu2ycrswa5w	SEDANG	KUAT	t	t	t	t	t	5000.000000000000000000000000000000	PADAT	\N	-7.935359991920852	110.14578411622877	t	0	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-13 15:43:26.316
cmr53rxrh002anxu23aotiy0n	cmr53rtoq0005nxu2ayl9e30c	cmr53rug9000inxu2k3fpa7m0	SULIT	SEDANG	f	t	f	t	f	5000.000000000000000000000000000000	SEPI	\N	-7.73192447432315	110.16848053897291	t	4	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-13 15:43:26.377
cmr53rxt6002bnxu2kf6gtboj	cmr53rtkn0002nxu21bbesvmg	cmr53rug9000inxu2k3fpa7m0	SULIT	SEDANG	t	t	f	t	f	5000.000000000000000000000000000000	SEPI	\N	-7.73188493027867	110.1684846179676	t	2	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-21 15:43:26.437
cmr53rxuv002cnxu2ct9tjlbf	cmr53rtly0003nxu2h3we68lo	cmr53rug9000inxu2k3fpa7m0	SULIT	SEDANG	t	t	t	t	f	5000.000000000000000000000000000000	SEDANG	\N	-7.732158784245247	110.16897267222116	t	8	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-10 15:43:26.498
cmr53rxwh002dnxu2wt15bw4t	cmr53rtly0003nxu2h3we68lo	cmr53rug9000inxu2k3fpa7m0	SULIT	KUAT	t	t	t	t	t	5000.000000000000000000000000000000	SEDANG	\N	-7.732471719230122	110.16883252641254	t	0	Kondisi sesuai laporan, akses masih sama seperti sebelumnya.	2026-06-05 15:43:26.556
cmr6bl43t000nrou2vrgxbxvm	cmr6aw7x00001rou2e39g6xf6	cmr6bbnng000brou2q49a0p0n	MUDAH	KUAT	t	t	t	t	t	10000.000000000000000000000000000000	SEPI	\N	-7.768488	110.288393	f	0	tempat asik dan menyenangkan	2026-07-04 12:09:51.113
cmr6bsbre000orou2piyruv05	cmr6aw7x00001rou2e39g6xf6	cmr559srg000e2du2or9eg7sf	MUDAH	LEMAH	f	f	f	f	f	\N	SEPI	\N	-7.768936790928605	110.28804932278129	f	0	\N	2026-07-04 12:15:27.626
cmra48un800081gu2nh3qs9gv	cmra3by4a00001gu2bw0glt58	cmr6bbnng000brou2q49a0p0n	MUDAH	SEDANG	t	t	t	t	t	10000.000000000000000000000000000000	SEDANG	\N	-7.76861550765046	110.28826804250255	f	0	oke	2026-07-07 03:55:26.373
cmreblw8w0004cmu98c7aedjk	cmr5ykb7q0000a2u92jnjavnv	cmrd3fasp0008x9u2rp72dtft	SEDANG	SEDANG	t	t	t	t	t	5000.000000000000000000000000000000	SEDANG	\N	-8.091776157842906	110.43300630524938	f	0	test test test	2026-07-10 02:32:36.992
cmrfvu2ba0000ed59k91m5ul1	cmr57d38l0000ix59khm5bvtz	cmrfv1a46000czl59an3ow9cx	SEDANG	LEMAH	t	t	f	f	f	\N	SEDANG	\N	-7.818486903509382	110.57035446166994	f	0	\N	2026-07-11 04:46:36.598
cmrfvv61a0001ed59aiqjp8hr	cmr57d38l0000ix59khm5bvtz	cmrfutrrw0009zl592epxehqu	RUSAK	SEDANG	f	f	f	f	f	\N	SEPI	\N	-7.67758000395823	110.20265868983354	f	0	\N	2026-07-11 04:47:28.079
\.


--
-- Data for Name: VisitStat; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."VisitStat" (id, "destinationId", date, "visitorCount", "peakHour", "crowdLevel") FROM stdin;
cmr53rzye003qnxu2zq9a3h8h	cmr53rtsi0007nxu225v5jaek	2026-07-03 15:43:29.217	47	9	SEDANG
cmr53rzzr003rnxu2gjcn6vbs	cmr53rtsi0007nxu225v5jaek	2026-07-02 15:43:29.266	38	10	PADAT
cmr53s01f003snxu276jbn12k	cmr53rtsi0007nxu225v5jaek	2026-07-01 15:43:29.329	24	14	PADAT
cmr53s02z003tnxu2eni1np0x	cmr53rtsi0007nxu225v5jaek	2026-06-30 15:43:29.386	48	10	SEDANG
cmr53s04e003unxu2640nyghb	cmr53rtsi0007nxu225v5jaek	2026-06-29 15:43:29.437	52	9	PADAT
cmr53s05q003vnxu2ufuzvms3	cmr53rtsi0007nxu225v5jaek	2026-06-28 15:43:29.485	36	9	PADAT
cmr53s075003wnxu2na1z7crg	cmr53rtsi0007nxu225v5jaek	2026-06-27 15:43:29.536	17	16	PADAT
cmr53s08k003xnxu2skzapn1q	cmr53rtsi0007nxu225v5jaek	2026-06-26 15:43:29.587	22	16	PADAT
cmr53s09s003ynxu2bdpogfm7	cmr53rtsi0007nxu225v5jaek	2026-06-25 15:43:29.631	29	15	SEDANG
cmr53s0bc003znxu25btv6c3h	cmr53rtsi0007nxu225v5jaek	2026-06-24 15:43:29.687	10	14	SEDANG
cmr53s0ct0040nxu2q1pnika3	cmr53rtsi0007nxu225v5jaek	2026-06-23 15:43:29.739	40	14	PADAT
cmr53s0e40041nxu2whthxcmm	cmr53rtsi0007nxu225v5jaek	2026-06-22 15:43:29.787	15	16	SEDANG
cmr53s0fk0042nxu295r64pyb	cmr53rtsi0007nxu225v5jaek	2026-06-21 15:43:29.839	80	9	PADAT
cmr53s0h70043nxu2g3gomenc	cmr53rtsi0007nxu225v5jaek	2026-06-20 15:43:29.897	44	10	PADAT
cmr53s0iv0044nxu2ck4i89q7	cmr53rtuq0008nxu2bh61jc5b	2026-07-03 15:43:29.957	36	9	SEDANG
cmr53s0kb0045nxu2by129j2n	cmr53rtuq0008nxu2bh61jc5b	2026-07-02 15:43:30.009	37	10	SEDANG
cmr53s0lm0046nxu2gi37369t	cmr53rtuq0008nxu2bh61jc5b	2026-07-01 15:43:30.058	36	9	SEDANG
cmr53s0mx0047nxu26u3vznne	cmr53rtuq0008nxu2bh61jc5b	2026-06-30 15:43:30.104	57	9	SEDANG
cmr53s0od0048nxu2y1aehanj	cmr53rtuq0008nxu2bh61jc5b	2026-06-29 15:43:30.156	43	10	SEDANG
cmr53s0pw0049nxu2rftcj3es	cmr53rtuq0008nxu2bh61jc5b	2026-06-28 15:43:30.209	21	10	PADAT
cmr53s0r5004anxu23l8pqf59	cmr53rtuq0008nxu2bh61jc5b	2026-06-27 15:43:30.256	57	9	SEDANG
cmr53s0sl004bnxu2m5t8zqyf	cmr53rtuq0008nxu2bh61jc5b	2026-06-26 15:43:30.308	51	16	SEDANG
cmr53s0tw004cnxu203jkxgam	cmr53rtuq0008nxu2bh61jc5b	2026-06-25 15:43:30.356	48	9	SEDANG
cmr53s0vd004dnxu2oqsn1cjz	cmr53rtuq0008nxu2bh61jc5b	2026-06-24 15:43:30.408	54	10	SEDANG
cmr53s0wm004enxu2av7dvsro	cmr53rtuq0008nxu2bh61jc5b	2026-06-23 15:43:30.453	77	15	SEDANG
cmr53s0y5004fnxu2fovuest7	cmr53rtuq0008nxu2bh61jc5b	2026-06-22 15:43:30.508	10	14	SEDANG
cmr53s0zl004gnxu2nr95ylvl	cmr53rtuq0008nxu2bh61jc5b	2026-06-21 15:43:30.56	44	16	SEDANG
cmr53s10r004hnxu2tnp32i6j	cmr53rtuq0008nxu2bh61jc5b	2026-06-20 15:43:30.603	54	14	PADAT
cmr53s12h004inxu2xttc7pbe	cmr53rtwt0009nxu2kcf7b4a7	2026-07-03 15:43:30.664	12	14	PADAT
cmr53s14g004jnxu2mb4780kd	cmr53rtwt0009nxu2kcf7b4a7	2026-07-02 15:43:30.734	68	9	PADAT
cmr53s15x004knxu26ne0yszu	cmr53rtwt0009nxu2kcf7b4a7	2026-07-01 15:43:30.789	38	15	SEDANG
cmr53s17i004lnxu2eyc31a7v	cmr53rtwt0009nxu2kcf7b4a7	2026-06-30 15:43:30.845	51	10	SEDANG
cmr53s18v004mnxu2e5zrsyh9	cmr53rtwt0009nxu2kcf7b4a7	2026-06-29 15:43:30.895	79	10	PADAT
cmr53s1a6004nnxu24b3tsvzm	cmr53rtwt0009nxu2kcf7b4a7	2026-06-28 15:43:30.942	62	16	SEDANG
cmr53s1bd004onxu2jff15btn	cmr53rtwt0009nxu2kcf7b4a7	2026-06-27 15:43:30.985	19	16	SEDANG
cmr53s1ct004pnxu2ky8zkb2f	cmr53rtwt0009nxu2kcf7b4a7	2026-06-26 15:43:31.036	34	14	PADAT
cmr53s1eu004qnxu2r5x35838	cmr53rtwt0009nxu2kcf7b4a7	2026-06-25 15:43:31.107	16	16	PADAT
cmr53s1g5004rnxu2mue4xzkr	cmr53rtwt0009nxu2kcf7b4a7	2026-06-24 15:43:31.156	72	14	SEDANG
cmr53s1hk004snxu2ov9otsrc	cmr53rtwt0009nxu2kcf7b4a7	2026-06-23 15:43:31.207	78	10	PADAT
cmr53s1mj004tnxu2u0c9vtau	cmr53rtwt0009nxu2kcf7b4a7	2026-06-22 15:43:31.386	71	15	PADAT
cmr53s1o9004unxu26b2ifu1p	cmr53rtwt0009nxu2kcf7b4a7	2026-06-21 15:43:31.447	23	14	PADAT
cmr53s1pn004vnxu2gdu9co1i	cmr53rtwt0009nxu2kcf7b4a7	2026-06-20 15:43:31.497	17	10	SEDANG
cmr53s1rl004wnxu26z8v6xho	cmr53rtzo000anxu2x2eqghmi	2026-07-03 15:43:31.568	62	16	PADAT
cmr53s1su004xnxu2l0w6wv5g	cmr53rtzo000anxu2x2eqghmi	2026-07-02 15:43:31.613	56	9	PADAT
cmr53s1tz004ynxu2bluawmc2	cmr53rtzo000anxu2x2eqghmi	2026-07-01 15:43:31.655	52	9	SEDANG
cmr53s1vp004znxu2ghih1e3b	cmr53rtzo000anxu2x2eqghmi	2026-06-30 15:43:31.716	56	15	SEDANG
cmr53s1xl0050nxu2hrzvs0qt	cmr53rtzo000anxu2x2eqghmi	2026-06-29 15:43:31.784	57	15	PADAT
cmr53s1z20051nxu2g8qhah32	cmr53rtzo000anxu2x2eqghmi	2026-06-28 15:43:31.836	67	15	PADAT
cmr53s20f0052nxu2om75yafv	cmr53rtzo000anxu2x2eqghmi	2026-06-27 15:43:31.886	36	9	SEDANG
cmr53s21s0053nxu28rtcinbu	cmr53rtzo000anxu2x2eqghmi	2026-06-26 15:43:31.936	12	10	SEDANG
cmr53s2390054nxu2nm3z5gz2	cmr53rtzo000anxu2x2eqghmi	2026-06-25 15:43:31.988	10	9	PADAT
cmr53s24o0055nxu2r2qsvr3k	cmr53rtzo000anxu2x2eqghmi	2026-06-24 15:43:32.039	16	14	PADAT
cmr53s25z0056nxu2d0prum0b	cmr53rtzo000anxu2x2eqghmi	2026-06-23 15:43:32.087	11	15	SEDANG
cmr53s27l0057nxu209brtesw	cmr53rtzo000anxu2x2eqghmi	2026-06-22 15:43:32.136	32	14	PADAT
cmr53s2910058nxu2yrzuus6f	cmr53rtzo000anxu2x2eqghmi	2026-06-21 15:43:32.196	10	14	SEDANG
cmr53s2ai0059nxu2wgn2rna9	cmr53rtzo000anxu2x2eqghmi	2026-06-20 15:43:32.25	79	14	PADAT
cmr53s2bs005anxu2934gevt1	cmr53ru1b000bnxu2urm3gg23	2026-07-03 15:43:32.295	33	16	PADAT
cmr53s2dz005bnxu2iumn7enh	cmr53ru1b000bnxu2urm3gg23	2026-07-02 15:43:32.375	43	9	PADAT
cmr53s2fd005cnxu2fyoqq4d5	cmr53ru1b000bnxu2urm3gg23	2026-07-01 15:43:32.425	74	9	SEDANG
cmr53s2gr005dnxu2qarf5zs9	cmr53ru1b000bnxu2urm3gg23	2026-06-30 15:43:32.474	22	14	SEDANG
cmr53s2i6005enxu2r8sfa2vc	cmr53ru1b000bnxu2urm3gg23	2026-06-29 15:43:32.525	52	10	SEDANG
cmr53s2jl005fnxu2sily3fjn	cmr53ru1b000bnxu2urm3gg23	2026-06-28 15:43:32.576	36	9	SEDANG
cmr53s2ks005gnxu2iu8bq7rt	cmr53ru1b000bnxu2urm3gg23	2026-06-27 15:43:32.619	42	10	SEDANG
cmr53s2m4005hnxu2ywwyr4iy	cmr53ru1b000bnxu2urm3gg23	2026-06-26 15:43:32.668	80	10	SEDANG
cmr53s2nf005inxu2bzthd3os	cmr53ru1b000bnxu2urm3gg23	2026-06-25 15:43:32.715	64	10	SEDANG
cmr53s2oz005jnxu2rj1l5nu1	cmr53ru1b000bnxu2urm3gg23	2026-06-24 15:43:32.77	13	10	PADAT
cmr53s2q7005knxu2ewtkm8c0	cmr53ru1b000bnxu2urm3gg23	2026-06-23 15:43:32.814	43	10	SEDANG
cmr53s2rl005lnxu2z4luyk86	cmr53ru1b000bnxu2urm3gg23	2026-06-22 15:43:32.865	75	9	PADAT
cmr53s2t0005mnxu2clihszts	cmr53ru1b000bnxu2urm3gg23	2026-06-21 15:43:32.915	39	10	SEDANG
cmr53s2ud005nnxu2vvpe3vy0	cmr53ru1b000bnxu2urm3gg23	2026-06-20 15:43:32.965	47	14	SEDANG
cmr53s2vr005onxu2ko0fjgfg	cmr53ru2q000cnxu2eeq4pnrm	2026-07-03 15:43:33.014	59	15	SEDANG
cmr53s2x5005pnxu29s3ur3xr	cmr53ru2q000cnxu2eeq4pnrm	2026-07-02 15:43:33.065	39	14	PADAT
cmr53s2yu005qnxu2kwcveimm	cmr53ru2q000cnxu2eeq4pnrm	2026-07-01 15:43:33.125	24	15	PADAT
cmr53s307005rnxu29mv9l1nt	cmr53ru2q000cnxu2eeq4pnrm	2026-06-30 15:43:33.175	75	9	PADAT
cmr53s31l005snxu23vgo4kbw	cmr53ru2q000cnxu2eeq4pnrm	2026-06-29 15:43:33.224	75	16	PADAT
cmr53s32z005tnxu21b4obyj1	cmr53ru2q000cnxu2eeq4pnrm	2026-06-28 15:43:33.274	45	16	SEDANG
cmr53s34d005unxu2zs09lsew	cmr53ru2q000cnxu2eeq4pnrm	2026-06-27 15:43:33.324	42	10	SEDANG
cmr53s35r005vnxu2c8kqxho8	cmr53ru2q000cnxu2eeq4pnrm	2026-06-26 15:43:33.374	28	14	PADAT
cmr53s3ar005wnxu2rqur6vdb	cmr53ru2q000cnxu2eeq4pnrm	2026-06-25 15:43:33.554	50	10	SEDANG
cmr53s3c5005xnxu2lcjjlwsk	cmr53ru2q000cnxu2eeq4pnrm	2026-06-24 15:43:33.604	15	16	PADAT
cmr53s3dl005ynxu24gaqzlus	cmr53ru2q000cnxu2eeq4pnrm	2026-06-23 15:43:33.655	63	14	PADAT
cmr53s3ex005znxu2w53i1zhb	cmr53ru2q000cnxu2eeq4pnrm	2026-06-22 15:43:33.705	75	9	SEDANG
cmr53s3gd0060nxu2fqn4nvtp	cmr53ru2q000cnxu2eeq4pnrm	2026-06-21 15:43:33.756	43	9	SEDANG
cmr53s3hr0061nxu26ha6x96c	cmr53ru2q000cnxu2eeq4pnrm	2026-06-20 15:43:33.806	38	15	SEDANG
cmr53s3j70062nxu235jft3id	cmr53ru4b000dnxu2xmbuu635	2026-07-03 15:43:33.856	1	15	SEPI
cmr53s3kj0063nxu2lt9g6gli	cmr53ru4b000dnxu2xmbuu635	2026-07-02 15:43:33.906	3	16	SEPI
cmr53s3lw0064nxu27rpdzlo3	cmr53ru4b000dnxu2xmbuu635	2026-07-01 15:43:33.955	4	15	SEPI
cmr53s3nb0065nxu2uqr4bk2s	cmr53ru4b000dnxu2xmbuu635	2026-06-30 15:43:34.006	5	14	SEPI
cmr53s3op0066nxu2j1gpykt9	cmr53ru4b000dnxu2xmbuu635	2026-06-29 15:43:34.056	1	9	SEPI
cmr53s3q20067nxu2jwgdjxkp	cmr53ru4b000dnxu2xmbuu635	2026-06-28 15:43:34.105	4	9	SEPI
cmr53s3ro0068nxu2bnzl0sot	cmr53ru4b000dnxu2xmbuu635	2026-06-27 15:43:34.163	3	10	SEPI
cmr53s3t50069nxu2z4y3qzko	cmr53ru4b000dnxu2xmbuu635	2026-06-26 15:43:34.216	4	15	SEPI
cmr53s3ut006anxu20eh2nkgm	cmr53ru4b000dnxu2xmbuu635	2026-06-25 15:43:34.276	2	14	SEPI
cmr53s3w9006bnxu2sl15ca8d	cmr53ru4b000dnxu2xmbuu635	2026-06-24 15:43:34.329	2	16	SEPI
cmr53s3xl006cnxu2ov7gy7r4	cmr53ru4b000dnxu2xmbuu635	2026-06-23 15:43:34.375	4	15	SEPI
cmr53s3yz006dnxu2pqjsx3qd	cmr53ru4b000dnxu2xmbuu635	2026-06-22 15:43:34.425	0	9	SEPI
cmr53s40d006enxu212jnzxbf	cmr53ru4b000dnxu2xmbuu635	2026-06-21 15:43:34.476	1	10	SEPI
cmr53s41s006fnxu2d83cl6ny	cmr53ru4b000dnxu2xmbuu635	2026-06-20 15:43:34.526	2	10	SEPI
cmr53s436006gnxu24k2gw343	cmr53ru60000enxu21aim6ww5	2026-07-03 15:43:34.577	13	15	PADAT
cmr53s44r006hnxu27r5qqtgi	cmr53ru60000enxu21aim6ww5	2026-07-02 15:43:34.629	36	9	PADAT
cmr53s465006inxu2fh10mfs1	cmr53ru60000enxu21aim6ww5	2026-07-01 15:43:34.684	69	10	SEDANG
cmr53s47n006jnxu267jvb8a5	cmr53ru60000enxu21aim6ww5	2026-06-30 15:43:34.736	14	14	SEDANG
cmr53s48p006knxu2f4zdcyd9	cmr53ru60000enxu21aim6ww5	2026-06-29 15:43:34.776	44	10	SEDANG
cmr53s4a3006lnxu270pcef5u	cmr53ru60000enxu21aim6ww5	2026-06-28 15:43:34.826	30	15	SEDANG
cmr53s4bf006mnxu224ylhmda	cmr53ru60000enxu21aim6ww5	2026-06-27 15:43:34.874	26	9	PADAT
cmr53s4cw006nnxu2kf732fdp	cmr53ru60000enxu21aim6ww5	2026-06-26 15:43:34.927	66	16	SEDANG
cmr53s4eh006onxu2qxqp7wml	cmr53ru60000enxu21aim6ww5	2026-06-25 15:43:34.984	68	16	SEDANG
cmr53s4fv006pnxu2hbg5czyw	cmr53ru60000enxu21aim6ww5	2026-06-24 15:43:35.035	18	9	PADAT
cmr53s4hb006qnxu2bsj71nf2	cmr53ru60000enxu21aim6ww5	2026-06-23 15:43:35.086	52	16	SEDANG
cmr53s4ir006rnxu2d7x4d2wd	cmr53ru60000enxu21aim6ww5	2026-06-22 15:43:35.138	37	9	SEDANG
cmr53s4k3006snxu2d904ag0z	cmr53ru60000enxu21aim6ww5	2026-06-21 15:43:35.186	73	14	PADAT
cmr53s4li006tnxu2l1eubwtp	cmr53ru60000enxu21aim6ww5	2026-06-20 15:43:35.237	64	16	SEDANG
cmr53s4mt006unxu22jz9hatp	cmr53rua5000fnxu2we1n52lw	2026-07-03 15:43:35.285	1	14	SEPI
cmr53s4o9006vnxu22g9wc76s	cmr53rua5000fnxu2we1n52lw	2026-07-02 15:43:35.336	2	16	SEPI
cmr53s4pn006wnxu2aru6u95u	cmr53rua5000fnxu2we1n52lw	2026-07-01 15:43:35.386	0	9	SEPI
cmr53s4r2006xnxu2eqkj7hw2	cmr53rua5000fnxu2we1n52lw	2026-06-30 15:43:35.437	2	16	SEPI
cmr53s4sf006ynxu2zlmx3yol	cmr53rua5000fnxu2we1n52lw	2026-06-29 15:43:35.486	4	16	SEPI
cmr53s4ts006znxu2p8ubdeid	cmr53rua5000fnxu2we1n52lw	2026-06-28 15:43:35.536	1	10	SEPI
cmr53s4yk0070nxu24hjuy7o9	cmr53rua5000fnxu2we1n52lw	2026-06-27 15:43:35.707	1	9	SEPI
cmr53s4zx0071nxu2rky1r8s3	cmr53rua5000fnxu2we1n52lw	2026-06-26 15:43:35.756	0	15	SEPI
cmr53s51d0072nxu2ys0mlxdc	cmr53rua5000fnxu2we1n52lw	2026-06-25 15:43:35.808	2	15	SEPI
cmr53s52n0073nxu2mwxm1kkp	cmr53rua5000fnxu2we1n52lw	2026-06-24 15:43:35.854	4	15	SEPI
cmr53s5440074nxu2824rk81s	cmr53rua5000fnxu2we1n52lw	2026-06-23 15:43:35.906	0	9	SEPI
cmr53s55n0075nxu2urb70vxp	cmr53rua5000fnxu2we1n52lw	2026-06-22 15:43:35.96	0	15	SEPI
cmr53s5730076nxu2g0gftcgh	cmr53rua5000fnxu2we1n52lw	2026-06-21 15:43:36.015	1	9	SEPI
cmr53s58j0077nxu2355yhi04	cmr53rua5000fnxu2we1n52lw	2026-06-20 15:43:36.066	5	14	SEPI
cmr53s59x0078nxu2ewfu70rg	cmr53rucf000gnxu2w6rktmtm	2026-07-03 15:43:36.115	17	14	SEDANG
cmr53s5ba0079nxu2wtx149gw	cmr53rucf000gnxu2w6rktmtm	2026-07-02 15:43:36.165	61	10	SEDANG
cmr53s5cp007anxu22wx8zyj1	cmr53rucf000gnxu2w6rktmtm	2026-07-01 15:43:36.216	18	10	PADAT
cmr53s5e4007bnxu2ctnliqnr	cmr53rucf000gnxu2w6rktmtm	2026-06-30 15:43:36.267	58	16	SEDANG
cmr53s5fg007cnxu2wue84xwe	cmr53rucf000gnxu2w6rktmtm	2026-06-29 15:43:36.315	63	9	PADAT
cmr53s5gx007dnxu2dnhgsrjv	cmr53rucf000gnxu2w6rktmtm	2026-06-28 15:43:36.367	61	10	PADAT
cmr53s5i9007enxu2t9drjazu	cmr53rucf000gnxu2w6rktmtm	2026-06-27 15:43:36.416	44	9	PADAT
cmr53s5jn007fnxu2eltimi52	cmr53rucf000gnxu2w6rktmtm	2026-06-26 15:43:36.466	66	14	SEDANG
cmr53s5kz007gnxu259z1mi2n	cmr53rucf000gnxu2w6rktmtm	2026-06-25 15:43:36.515	80	15	SEDANG
cmr53s5mf007hnxu22n65oyux	cmr53rucf000gnxu2w6rktmtm	2026-06-24 15:43:36.565	76	16	PADAT
cmr53s5nv007inxu2b13jfuwx	cmr53rucf000gnxu2w6rktmtm	2026-06-23 15:43:36.617	39	16	SEDANG
cmr53s5p9007jnxu2e7apv6uh	cmr53rucf000gnxu2w6rktmtm	2026-06-22 15:43:36.668	35	10	PADAT
cmr53s5qm007knxu2fott5b1q	cmr53rucf000gnxu2w6rktmtm	2026-06-21 15:43:36.716	53	16	PADAT
cmr53s5rz007lnxu2nevh2r8l	cmr53rucf000gnxu2w6rktmtm	2026-06-20 15:43:36.766	33	15	PADAT
cmr53s5tc007mnxu2o1t56koa	cmr53ruec000hnxu2ycrswa5w	2026-07-03 15:43:36.815	59	15	SEDANG
cmr53s5ur007nnxu261s09vvc	cmr53ruec000hnxu2ycrswa5w	2026-07-02 15:43:36.866	40	16	PADAT
cmr53s5w5007onxu26ewlehzq	cmr53ruec000hnxu2ycrswa5w	2026-07-01 15:43:36.916	14	10	PADAT
cmr53s5xs007pnxu22n463tqc	cmr53ruec000hnxu2ycrswa5w	2026-06-30 15:43:36.975	49	9	SEDANG
cmr53s5z8007qnxu2h1gwcu1u	cmr53ruec000hnxu2ycrswa5w	2026-06-29 15:43:37.026	12	15	SEDANG
cmr53s60l007rnxu2dbfatxdu	cmr53ruec000hnxu2ycrswa5w	2026-06-28 15:43:37.076	25	9	SEDANG
cmr53s629007snxu2hmvgj7mn	cmr53ruec000hnxu2ycrswa5w	2026-06-27 15:43:37.136	17	14	SEDANG
cmr53s63o007tnxu252zwm5nu	cmr53ruec000hnxu2ycrswa5w	2026-06-26 15:43:37.187	32	14	PADAT
cmr53s651007unxu2xyjux3mg	cmr53ruec000hnxu2ycrswa5w	2026-06-25 15:43:37.236	63	14	PADAT
cmr53s66f007vnxu2vpr87atx	cmr53ruec000hnxu2ycrswa5w	2026-06-24 15:43:37.285	37	14	PADAT
cmr53s67t007wnxu2gttz3lm2	cmr53ruec000hnxu2ycrswa5w	2026-06-23 15:43:37.336	57	14	PADAT
cmr53s697007xnxu2ezvqcg78	cmr53ruec000hnxu2ycrswa5w	2026-06-22 15:43:37.386	66	15	SEDANG
cmr53s6al007ynxu24n6jpykk	cmr53ruec000hnxu2ycrswa5w	2026-06-21 15:43:37.436	63	10	PADAT
cmr53s6bz007znxu2ld16cby7	cmr53ruec000hnxu2ycrswa5w	2026-06-20 15:43:37.486	78	14	SEDANG
cmr53s6dc0080nxu2mvacjoul	cmr53rug9000inxu2k3fpa7m0	2026-07-03 15:43:37.536	1	9	SEPI
cmr53s6er0081nxu28bfhx6a2	cmr53rug9000inxu2k3fpa7m0	2026-07-02 15:43:37.586	3	15	SEPI
cmr53s6g90082nxu2q11akw61	cmr53rug9000inxu2k3fpa7m0	2026-07-01 15:43:37.637	2	9	SEPI
cmr53s6hh0083nxu25al11015	cmr53rug9000inxu2k3fpa7m0	2026-06-30 15:43:37.685	4	10	SEPI
cmr53s6ma0084nxu2mnvc50pq	cmr53rug9000inxu2k3fpa7m0	2026-06-29 15:43:37.857	4	14	SEPI
cmr53s6np0085nxu2a4ta56rd	cmr53rug9000inxu2k3fpa7m0	2026-06-28 15:43:37.907	1	9	SEPI
cmr53s6p10086nxu2rqgsfo4p	cmr53rug9000inxu2k3fpa7m0	2026-06-27 15:43:37.956	0	10	SEPI
cmr53s6qh0087nxu2qephaakd	cmr53rug9000inxu2k3fpa7m0	2026-06-26 15:43:38.007	5	16	SEPI
cmr53s6rt0088nxu2lr3ujq4t	cmr53rug9000inxu2k3fpa7m0	2026-06-25 15:43:38.057	4	15	SEPI
cmr53s6t70089nxu2hl92waor	cmr53rug9000inxu2k3fpa7m0	2026-06-24 15:43:38.107	1	15	SEPI
cmr53s6ul008anxu2ot6k41ee	cmr53rug9000inxu2k3fpa7m0	2026-06-23 15:43:38.156	5	16	SEPI
cmr53s6vz008bnxu2u4jatnxu	cmr53rug9000inxu2k3fpa7m0	2026-06-22 15:43:38.206	3	9	SEPI
cmr53s6xd008cnxu2s63jt0bb	cmr53rug9000inxu2k3fpa7m0	2026-06-21 15:43:38.256	3	15	SEPI
cmr53s6yy008dnxu23akyowa8	cmr53rug9000inxu2k3fpa7m0	2026-06-20 15:43:38.313	4	9	SEPI
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
52ca6c55-8d7d-4cae-b3de-eb1403dae9e2	9744c73d0de493d8a7ff0895e182402b95decfd78c31fa783cda802b4af1c8a1	2026-06-29 04:41:08.227597+00	20260629044106_init	\N	\N	2026-06-29 04:41:07.046068+00	1
b92028ab-9050-4b24-98b3-d1e6623e033f	4438be4915dc90956c5de5f4d4e5a9386db70f34d4a98722699016291de96fed	2026-07-03 02:40:15.072445+00	20260703024014_tambah_transaksi_dan_fasilitas	\N	\N	2026-07-03 02:40:14.362401+00	1
3f628cb1-aa69-4d52-818a-e90f8a4bccb1	22d2fb6e4ea8d96a07e1540a672e72749b135ac5898a3d68c08f97fa18b3abb8	2026-07-09 06:06:11.667794+00	20260709060611_add_destination_status_nonaktif	\N	\N	2026-07-09 06:06:11.474735+00	1
7651cbd1-38ed-4d09-9fe8-18125974dc54	dbc9bb195d6aae4f6b9c14617f56bf940b4ff536c38df7cb04d5e8997c4a3f01	2026-07-03 10:17:22.679813+00	20260703101722_add_notifikasi	\N	\N	2026-07-03 10:17:22.458771+00	1
091f28b6-5c54-4e42-8465-e5e77b5c717c	36c5fafd9d55b27ea6d20ee265039b3cbac76d78233ec9188f8260c9fcd3d401	2026-07-03 12:30:11.624767+00	20260703123011_add_destination_photo_urls	\N	\N	2026-07-03 12:30:11.478593+00	1
186d921d-7e3d-4d41-a1dc-8e265d354824	2e706f7d29698dc0fbf0d239bdd7086b9b381197b92075fe7fa4af9c70d77fce	2026-07-06 06:22:17.274897+00	20260706062216_add_review	\N	\N	2026-07-06 06:22:16.999142+00	1
4001ccab-8c78-4600-895b-b5a539eb4326	993b586824ef74145c1f08500a340ab90d1d5c4f66c26f1d9508c2aa80496c2f	2026-07-10 13:17:39.035946+00	20260710131738_add_admin_settings_fields	\N	\N	2026-07-10 13:17:38.563408+00	1
4033ee9f-7540-46f3-8640-9a0f811ec714	79df5f8639d2956de7c6eb8c9b3b54d5ed43ce66cd93d98ad34dfd73f5344abf	2026-07-06 08:14:36.234044+00	20260706081435_add_umkm_transaksi_type	\N	\N	2026-07-06 08:14:36.040281+00	1
fdf4b917-5577-4677-a402-83522a221697	14209cca18e70af19013b6ed9416b03ff4f93c5e8c76d7e64aae410d5c715419	2026-07-07 04:55:32.67788+00	20260707045532_add_jam_buka_tutup	\N	\N	2026-07-07 04:55:32.437651+00	1
4eabc5fc-d7b1-45be-893f-a0e9de2817d7	680d64ea5c8d13b2ddc11b3b6774856085613dd375c465da3799913da90917b3	2026-07-07 08:42:57.317806+00	20260707083904_tambah_riwayat_detail	\N	\N	2026-07-07 08:42:57.129882+00	1
1bf63222-9e95-46f9-9898-7180664cada7	1df21c777bf3190a1631e4fbcb0976aa5874a456844ead2f3e93dcdd2a6ba7bc	2026-07-11 23:08:12.351632+00	20260711230811_add_pengelola_settings_fields	\N	\N	2026-07-11 23:08:12.112142+00	1
f25f2659-521a-4048-b1ae-dfb34d97c58b	8f80eaa03ed4cb4e89ca90a835531576b666b65ce9e7c1c94544bfc71b703d16	2026-07-07 09:37:42.23664+00	20260707093741_add_notifikasi_kategori	\N	\N	2026-07-07 09:37:42.090238+00	1
6fb1df51-1c18-4144-ab0f-f4329aef74c0	d41c5c63d1d905bf2ac2374b1ad2624b92da72176d304db5ce3731601e7b84b7	2026-07-07 15:12:22.327807+00	20260707151222_add_reset_password_fields	\N	\N	2026-07-07 15:12:22.175537+00	1
4135a9a7-97bb-4f12-95ce-025da1576557	2e13b3c44c9c5051aa69b5dac13177f2583a193dde6e5ad140427daf381d00f8	2026-07-09 04:20:03.273689+00	20260709042002_add_umkm_kategori_pemilik_foto	\N	\N	2026-07-09 04:20:03.057035+00	1
24c822fb-adc3-4231-b757-fb2d2470811b	bce721d498b4f7b15c302f363dcde0bf11592f234416c1fa03562feba4c522df	2026-07-12 02:34:35.447134+00	20260712023434_add_fasilitas_lokasi_deskripsi_foto	\N	\N	2026-07-12 02:34:35.230333+00	1
fd7d61ff-f742-4747-8187-3fbdef719a5f	3d4220f7fbddb2f1bbbcfc5ddeb69a1d037579b55c0888f239c077f0ce8437cb	2026-07-09 04:50:18.483688+00	20260709045018_umkm_multi_photo_bisa_booking	\N	\N	2026-07-09 04:50:18.318252+00	1
b607c536-3d3e-4c9d-9fc1-40c1b4705182	7943120ad9a0ccd54908e0ebcc16d5b1eef95bf8b73cbd9285c55c2e9412d5f4	2026-07-09 05:38:48.621333+00	20260709053848_add_destination_htm_anak	\N	\N	2026-07-09 05:38:48.445026+00	1
12cf46fb-b376-441c-af6f-79349a8f140f	0494a6cfc8fdf5b83e901fa1b647ac9167c06db648a0b98b1e0da72bf0197086	2026-07-12 03:35:18.36654+00	20260712033517_add_titik_jemput_and_local_service_fields	\N	\N	2026-07-12 03:35:17.908435+00	1
dbab3903-13a1-4bed-8c16-d943f1e24acd	c7041519a87159a9ac35b5e10c745435ea7b60f96cb6b18fe85a7b7331e2f74c	2026-07-12 04:40:31.052405+00	20260712044030_add_wisatawan_notif_settings	\N	\N	2026-07-12 04:40:30.782314+00	1
\.


--
-- Name: Booking Booking_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_pkey" PRIMARY KEY (id);


--
-- Name: Destination Destination_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Destination"
    ADD CONSTRAINT "Destination_pkey" PRIMARY KEY (id);


--
-- Name: Fasilitas Fasilitas_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Fasilitas"
    ADD CONSTRAINT "Fasilitas_pkey" PRIMARY KEY (id);


--
-- Name: LocalService LocalService_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."LocalService"
    ADD CONSTRAINT "LocalService_pkey" PRIMARY KEY (id);


--
-- Name: LocalWarung LocalWarung_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."LocalWarung"
    ADD CONSTRAINT "LocalWarung_pkey" PRIMARY KEY (id);


--
-- Name: MenuItem MenuItem_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."MenuItem"
    ADD CONSTRAINT "MenuItem_pkey" PRIMARY KEY (id);


--
-- Name: Notifikasi Notifikasi_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Notifikasi"
    ADD CONSTRAINT "Notifikasi_pkey" PRIMARY KEY (id);


--
-- Name: Review Review_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);


--
-- Name: TitikJemput TitikJemput_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."TitikJemput"
    ADD CONSTRAINT "TitikJemput_pkey" PRIMARY KEY (id);


--
-- Name: TransaksiItem TransaksiItem_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."TransaksiItem"
    ADD CONSTRAINT "TransaksiItem_pkey" PRIMARY KEY (id);


--
-- Name: Transaksi Transaksi_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Transaksi"
    ADD CONSTRAINT "Transaksi_pkey" PRIMARY KEY (id);


--
-- Name: UserReport UserReport_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."UserReport"
    ADD CONSTRAINT "UserReport_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: VisitStat VisitStat_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."VisitStat"
    ADD CONSTRAINT "VisitStat_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Review_userId_destinationId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Review_userId_destinationId_key" ON public."Review" USING btree ("userId", "destinationId");


--
-- Name: Transaksi_kodeTransaksi_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Transaksi_kodeTransaksi_key" ON public."Transaksi" USING btree ("kodeTransaksi");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: VisitStat_destinationId_date_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "VisitStat_destinationId_date_key" ON public."VisitStat" USING btree ("destinationId", date);


--
-- Name: Booking Booking_destinationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES public."Destination"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Booking Booking_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public."LocalService"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Booking Booking_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Destination Destination_approvedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Destination"
    ADD CONSTRAINT "Destination_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Destination Destination_submittedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Destination"
    ADD CONSTRAINT "Destination_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Fasilitas Fasilitas_destinationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Fasilitas"
    ADD CONSTRAINT "Fasilitas_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES public."Destination"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LocalService LocalService_destinationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."LocalService"
    ADD CONSTRAINT "LocalService_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES public."Destination"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LocalService LocalService_validatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."LocalService"
    ADD CONSTRAINT "LocalService_validatedById_fkey" FOREIGN KEY ("validatedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: LocalWarung LocalWarung_destinationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."LocalWarung"
    ADD CONSTRAINT "LocalWarung_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES public."Destination"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MenuItem MenuItem_warungId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."MenuItem"
    ADD CONSTRAINT "MenuItem_warungId_fkey" FOREIGN KEY ("warungId") REFERENCES public."LocalWarung"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Notifikasi Notifikasi_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Notifikasi"
    ADD CONSTRAINT "Notifikasi_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Review Review_destinationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES public."Destination"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Review Review_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TitikJemput TitikJemput_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."TitikJemput"
    ADD CONSTRAINT "TitikJemput_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public."LocalService"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TransaksiItem TransaksiItem_transaksiId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."TransaksiItem"
    ADD CONSTRAINT "TransaksiItem_transaksiId_fkey" FOREIGN KEY ("transaksiId") REFERENCES public."Transaksi"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Transaksi Transaksi_destinationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Transaksi"
    ADD CONSTRAINT "Transaksi_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES public."Destination"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transaksi Transaksi_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Transaksi"
    ADD CONSTRAINT "Transaksi_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserReport UserReport_destinationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."UserReport"
    ADD CONSTRAINT "UserReport_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES public."Destination"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserReport UserReport_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."UserReport"
    ADD CONSTRAINT "UserReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: VisitStat VisitStat_destinationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."VisitStat"
    ADD CONSTRAINT "VisitStat_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES public."Destination"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict N9nobybms7GzEipd5FJBlcAlUk2IC7OqSjyl2YfsWTmYNtzlnqJwixc2PCCb8pV

