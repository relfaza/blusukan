/**
 * Hapus destinasi tertentu beserta seluruh data turunannya (1 $transaction per destinasi).
 * Notifikasi tidak punya FK ke destinasi — dicocokkan lewat kolom `link`.
 *
 *   npx tsx --env-file=.env prisma/cleanup-destinasi.ts           -> dry run
 *   npx tsx --env-file=.env prisma/cleanup-destinasi.ts --apply   -> hapus
 */
import { prisma } from '../lib/prisma'

const NAMA_TARGET = ['Curug Kedung Pedut', 'Pantai Adadeh', 'Pantai Gatau']

async function main() {
  const apply = process.argv.includes('--apply')

  const targets = await prisma.destination.findMany({
    where: { OR: NAMA_TARGET.map((name) => ({ name: { equals: name, mode: 'insensitive' as const } })) },
    select: { id: true, name: true, status: true, submittedBy: { select: { email: true } } },
  })

  if (targets.length === 0) {
    console.log('Tidak ada destinasi target yang tersisa — sudah bersih.')
    return
  }

  const total = { transaksi: 0, transaksiItem: 0, review: 0, laporan: 0, booking: 0, service: 0, titikJemput: 0, warung: 0, menu: 0, fasilitas: 0, visitStat: 0, notifikasi: 0 }

  for (const d of targets) {
    const [transaksis, bookings, warungs, services] = await Promise.all([
      prisma.transaksi.findMany({ where: { destinationId: d.id }, select: { id: true } }),
      prisma.booking.findMany({ where: { destinationId: d.id }, select: { id: true } }),
      prisma.localWarung.findMany({ where: { destinationId: d.id }, select: { id: true } }),
      prisma.localService.findMany({ where: { destinationId: d.id }, select: { id: true } }),
    ])

    const links = [
      `/pengelola/destinasi/${d.id}`,
      ...transaksis.map((t) => `/transaksi/${t.id}`),
      ...bookings.map((b) => `/booking/${b.id}`),
    ]

    if (!apply) {
      console.log(`[dry] ${d.name} (${d.status}, ${d.submittedBy.email}): transaksi=${transaksis.length} booking=${bookings.length} warung=${warungs.length} service=${services.length}`)
      continue
    }

    const r = await prisma.$transaction(async (tx) => ({
      notif: await tx.notifikasi.deleteMany({ where: { link: { in: links } } }),
      item: await tx.transaksiItem.deleteMany({ where: { transaksiId: { in: transaksis.map((t) => t.id) } } }),
      trx: await tx.transaksi.deleteMany({ where: { destinationId: d.id } }),
      rev: await tx.review.deleteMany({ where: { destinationId: d.id } }),
      rep: await tx.userReport.deleteMany({ where: { destinationId: d.id } }),
      bok: await tx.booking.deleteMany({ where: { destinationId: d.id } }),
      tjp: await tx.titikJemput.deleteMany({ where: { serviceId: { in: services.map((s) => s.id) } } }),
      svc: await tx.localService.deleteMany({ where: { destinationId: d.id } }),
      mnu: await tx.menuItem.deleteMany({ where: { warungId: { in: warungs.map((w) => w.id) } } }),
      wrg: await tx.localWarung.deleteMany({ where: { destinationId: d.id } }),
      fas: await tx.fasilitas.deleteMany({ where: { destinationId: d.id } }),
      vst: await tx.visitStat.deleteMany({ where: { destinationId: d.id } }),
      dst: await tx.destination.delete({ where: { id: d.id } }),
    }))

    total.notifikasi += r.notif.count
    total.transaksiItem += r.item.count
    total.transaksi += r.trx.count
    total.review += r.rev.count
    total.laporan += r.rep.count
    total.booking += r.bok.count
    total.titikJemput += r.tjp.count
    total.service += r.svc.count
    total.menu += r.mnu.count
    total.warung += r.wrg.count
    total.fasilitas += r.fas.count
    total.visitStat += r.vst.count
    console.log(`  ✓ hapus "${d.name}" (${d.submittedBy.email})`)
  }

  if (apply) {
    console.log(`\nDestinasi dihapus: ${targets.length}`)
    console.log('Data terkait ikut terhapus:', total)
    console.log('Destinasi APPROVED tersisa:', await prisma.destination.count({ where: { status: 'APPROVED' } }))
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
