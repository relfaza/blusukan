import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)]
}

async function main() {
  console.log('🌱 Mulai seeding...')

  await prisma.booking.deleteMany()
  await prisma.menuItem.deleteMany()
  await prisma.localWarung.deleteMany()
  await prisma.visitStat.deleteMany()
  await prisma.userReport.deleteMany()
  await prisma.localService.deleteMany()
  await prisma.destination.deleteMany()
  await prisma.user.deleteMany()

  // 1. USERS
  const adminPassword = await bcrypt.hash('admin123', 10)
  const userPassword = await bcrypt.hash('wisata123', 10)

  const admin = await prisma.user.create({
    data: {
      name: 'Admin Dinas Pariwisata',
      email: 'admin@blusukan.id',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  })

  const pengelola = await prisma.user.create({
    data: {
      name: 'Pak Slamet (Pokdarwis)',
      email: 'pengelola@blusukan.id',
      passwordHash: userPassword,
      role: 'PENGELOLA',
    },
  })

  const wisatawanNames = ['Dimas Pratama', 'Sari Wulandari', 'Budi Santoso', 'Rina Kartika', 'Yoga Saputra']
  const wisatawans = []
  for (const name of wisatawanNames) {
    const w = await prisma.user.create({
      data: {
        name,
        email: `${name.toLowerCase().replace(/ /g, '.')}@gmail.com`,
        passwordHash: userPassword,
        role: 'WISATAWAN',
      },
    })
    wisatawans.push(w)
  }
  console.log(`✅ ${wisatawans.length + 2} user dibuat`)

  // 2. DESTINATIONS
  const destinationsData = [
    { name: 'Tebing Breksi', kabupaten: 'SLEMAN', kategori: 'TEBING', lat: -7.7747, lng: 110.5142, htm: 10000, route: 'MUDAH', vibe: ['SUNSET', 'SPOT_FOTO'] },
    { name: 'Bukit Klangon', kabupaten: 'SLEMAN', kategori: 'BUKIT', lat: -7.6128, lng: 110.4456, htm: 5000, route: 'SULIT', vibe: ['SUNRISE', 'QUIET_PLACE'] },
    { name: 'Air Terjun Tlogo Muncar', kabupaten: 'SLEMAN', kategori: 'AIR_TERJUN', lat: -7.6512, lng: 110.4271, htm: 0, route: 'RUSAK', vibe: ['QUIET_PLACE'] },
    { name: 'Pantai Wediombo', kabupaten: 'GUNUNGKIDUL', kategori: 'PANTAI', lat: -8.2089, lng: 110.6739, htm: 10000, route: 'SEDANG', vibe: ['SUNSET', 'SPOT_FOTO'] },
    { name: 'Air Terjun Sri Gethuk', kabupaten: 'GUNUNGKIDUL', kategori: 'AIR_TERJUN', lat: -7.9486, lng: 110.6628, htm: 15000, route: 'MUDAH', vibe: ['SPOT_FOTO'] },
    { name: 'Gunung Api Purba Nglanggeran', kabupaten: 'GUNUNGKIDUL', kategori: 'GUNUNG', lat: -7.8775, lng: 110.5950, htm: 15000, route: 'SEDANG', vibe: ['SUNRISE', 'SPOT_FOTO'] },
    { name: 'Pantai Ngrenehan', kabupaten: 'BANTUL', kategori: 'PANTAI', lat: -8.1453, lng: 110.4769, htm: 5000, route: 'SULIT', vibe: ['QUIET_PLACE'] },
    { name: 'Bukit Lintang Sewu', kabupaten: 'BANTUL', kategori: 'BUKIT', lat: -7.9398, lng: 110.4203, htm: 5000, route: 'SEDANG', vibe: ['SUNSET', 'QUIET_PLACE'] },
    { name: 'Curug Banyu Nibo', kabupaten: 'BANTUL', kategori: 'AIR_TERJUN', lat: -7.9637, lng: 110.4451, htm: 0, route: 'RUSAK', vibe: ['QUIET_PLACE'] },
    { name: 'Puncak Pule Payung', kabupaten: 'KULON_PROGO', kategori: 'BUKIT', lat: -7.7654, lng: 110.1672, htm: 10000, route: 'MUDAH', vibe: ['SUNRISE', 'SPOT_FOTO'] },
    { name: 'Pantai Trisik', kabupaten: 'KULON_PROGO', kategori: 'PANTAI', lat: -7.9356, lng: 110.1456, htm: 5000, route: 'SEDANG', vibe: ['SUNSET'] },
    { name: 'Curug Setawing', kabupaten: 'KULON_PROGO', kategori: 'AIR_TERJUN', lat: -7.7321, lng: 110.1689, htm: 5000, route: 'SULIT', vibe: ['QUIET_PLACE'] },
  ] as const

  const destinations = []
  for (const d of destinationsData) {
    const dest = await prisma.destination.create({
      data: {
        name: d.name,
        kabupaten: d.kabupaten as any,
        kategori: d.kategori as any,
        latitude: d.lat,
        longitude: d.lng,
        jamOperasional: '06:00 - 18:00',
        htmResmi: d.htm,
        hasToilet: Math.random() > 0.3,
        hasParkir: Math.random() > 0.2,
        hasTempatIbadah: Math.random() > 0.5,
        hasTempatDuduk: Math.random() > 0.4,
        hasPenitipanBarang: Math.random() > 0.7,
        vibeTags: d.vibe as any,
        routeStatus: d.route as any,
        status: 'APPROVED',
        submittedById: pengelola.id,
        approvedById: admin.id,
        approvedAt: daysAgo(randomInt(20, 60)),
      },
    })
    destinations.push(dest)
  }

  // 2 destinasi pending validasi
  await prisma.destination.create({
    data: {
      name: 'Curug Lepo (Belum Divalidasi)',
      kabupaten: 'GUNUNGKIDUL',
      kategori: 'AIR_TERJUN',
      latitude: -7.9012,
      longitude: 110.6234,
      htmResmi: 0,
      vibeTags: ['QUIET_PLACE'],
      status: 'PENDING',
      submittedById: pengelola.id,
    },
  })
  await prisma.destination.create({
    data: {
      name: 'Bukit Watu Lawang (Belum Divalidasi)',
      kabupaten: 'SLEMAN',
      kategori: 'BUKIT',
      latitude: -7.6789,
      longitude: 110.4567,
      htmResmi: 5000,
      vibeTags: ['SUNSET'],
      status: 'PENDING',
      submittedById: pengelola.id,
    },
  })
  console.log(`✅ ${destinations.length + 2} destinasi dibuat (termasuk 2 pending validasi, Kota Yogyakarta sengaja dikosongkan untuk uji empty-state)`)

  // 3. LOCAL SERVICES
  const sulitRusakDest = destinations.filter((d) => ['SULIT', 'RUSAK'].includes(d.routeStatus))
  for (const dest of sulitRusakDest) {
    await prisma.localService.create({
      data: {
        destinationId: dest.id,
        providerName: `Ojek Warga ${dest.name.split(' ')[0]}`,
        serviceType: pick(['OJEK', 'JEEP']) as any,
        contactWa: `628${randomInt(100000000, 999999999)}`,
        baseRate: randomInt(15, 50) * 1000,
        isValidated: true,
        validatedById: admin.id,
      },
    })
  }
  console.log(`✅ ${sulitRusakDest.length} layanan lokal dibuat`)

  // 4. USER REPORTS
  const sepiDestNames = ['Curug Banyu Nibo', 'Curug Setawing', 'Pantai Ngrenehan']
  const pungliDestName = 'Pantai Wediombo'
  let totalReports = 0

  for (const dest of destinations) {
    const isSepi = sepiDestNames.includes(dest.name)
    const isPungli = dest.name === pungliDestName
    const numReports = randomInt(3, 6)

    for (let i = 0; i < numReports; i++) {
      const reporter = pick(wisatawans)
      const crowd = isSepi ? pick(['SEPI', 'SEPI', 'SEDANG']) : pick(['SEDANG', 'PADAT', 'PADAT', 'SEPI'])
      const reportedFee = isPungli ? Number(dest.htmResmi) + randomInt(10, 20) * 1000 : Number(dest.htmResmi)

      await prisma.userReport.create({
        data: {
          userId: reporter.id,
          destinationId: dest.id,
          roadCondition: dest.routeStatus,
          signalStrength: pick(['LEMAH', 'SEDANG', 'KUAT']) as any,
          toiletLayak: Math.random() > 0.3,
          parkirLayak: Math.random() > 0.2,
          tempatIbadahLayak: Math.random() > 0.4,
          tempatDudukLayak: Math.random() > 0.3,
          penitipanBarangLayak: Math.random() > 0.5,
          reportedFee,
          crowdLevel: crowd as any,
          latitude: dest.latitude + (Math.random() - 0.5) * 0.001,
          longitude: dest.longitude + (Math.random() - 0.5) * 0.001,
          isVerified: Math.random() > 0.2,
          upvoteCount: randomInt(0, 8),
          notes: 'Kondisi sesuai laporan, akses masih sama seperti sebelumnya.',
          createdAt: daysAgo(randomInt(0, 29)),
        },
      })
      totalReports++
    }
  }
  console.log(`✅ ${totalReports} laporan lapangan dibuat (termasuk pola sepi & pungli untuk uji badge otomatis)`)

  // 5. LOCAL WARUNG + MENU
  let totalWarung = 0
  for (const dest of destinations.slice(0, 8)) {
    const warung = await prisma.localWarung.create({
      data: {
        destinationId: dest.id,
        name: `Warung Bu ${pick(['Siti', 'Tari', 'Wati', 'Marni'])}`,
        location: `Dekat pintu masuk ${dest.name}`,
      },
    })
    const menuNames = ['Mie Instan + Telur', 'Nasi Goreng', 'Es Teh', 'Kopi Hitam', 'Gorengan']
    for (const menu of menuNames) {
      await prisma.menuItem.create({
        data: { warungId: warung.id, name: menu, price: randomInt(3, 15) * 1000 },
      })
    }
    totalWarung++
  }
  console.log(`✅ ${totalWarung} warung + menu dibuat`)

  // 6. VISIT STATS (14 hari terakhir)
  let totalStats = 0
  for (const dest of destinations) {
    const isSepi = sepiDestNames.includes(dest.name)
    for (let i = 0; i < 14; i++) {
      await prisma.visitStat.create({
        data: {
          destinationId: dest.id,
          date: daysAgo(i),
          visitorCount: isSepi ? randomInt(0, 5) : randomInt(10, 80),
          peakHour: pick([9, 10, 14, 15, 16]),
          crowdLevel: isSepi ? 'SEPI' : (pick(['SEDANG', 'PADAT']) as any),
        },
      })
      totalStats++
    }
  }
  console.log(`✅ ${totalStats} data statistik kunjungan dibuat`)

  // 7. BOOKINGS
  const services = await prisma.localService.findMany()
  let totalBookings = 0
  for (const service of services) {
    const numBookings = randomInt(1, 4)
    for (let i = 0; i < numBookings; i++) {
      await prisma.booking.create({
        data: {
          userId: pick(wisatawans).id,
          serviceId: service.id,
          destinationId: service.destinationId,
          travelDate: daysAgo(randomInt(-10, 20)),
          meetingPoint: 'Pos Masuk Destinasi',
          contactNumber: `628${randomInt(100000000, 999999999)}`,
          status: pick(['PENDING', 'CONFIRMED', 'COMPLETED', 'EXPIRED']) as any,
          createdAt: daysAgo(randomInt(0, 25)),
        },
      })
      totalBookings++
    }
  }
  console.log(`✅ ${totalBookings} booking dibuat`)

  console.log('🎉 Seeding selesai!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })