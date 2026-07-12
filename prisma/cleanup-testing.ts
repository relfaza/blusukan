/**
 * Pembersihan data testing + destinasi seed lama.
 *
 * Dua kelompok yang dihapus:
 *  1. Destinasi bernama mengandung "test" (case-insensitive).
 *  2. Destinasi batch seed lama (createdAt sebelum SEED_LAMA_CUTOFF) — foto picsum,
 *     jam operasional kosong, sebagian duplikat nama dengan destinasi asli.
 *
 * Destinasi asli (foto Cloudinary) TIDAK disentuh.
 * Jalankan: npx tsx --env-file=.env prisma/cleanup-testing.ts --apply
 */
import { prisma } from '../lib/prisma'

const SEED_LAMA_CUTOFF = new Date('2026-07-03T16:00:00Z')

async function main() {
  const apply = process.argv.includes('--apply')

  const all = await prisma.destination.findMany({
    select: { id: true, name: true, status: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  const targets = all.filter((d) => /test/i.test(d.name) || d.createdAt < SEED_LAMA_CUTOFF)

  console.log(`Destinasi total: ${all.length} | akan dihapus: ${targets.length} | tersisa: ${all.length - targets.length}\n`)
  for (const d of targets) {
    const alasan = /test/i.test(d.name) ? 'testing' : 'seed-lama'
    console.log(`  - [${alasan}] ${d.name} (${d.status}) ${d.id}`)
  }

  if (!apply) {
    console.log('\nDRY RUN. Tambahkan --apply untuk benar-benar menghapus.')
    return
  }

  const totals = { transaksi: 0, transaksiItem: 0, review: 0, laporan: 0, booking: 0, service: 0, titikJemput: 0, warung: 0, menu: 0, fasilitas: 0, visitStat: 0, notifikasi: 0 }

  for (const d of targets) {
    const [transaksis, bookings, warungs, services] = await Promise.all([
      prisma.transaksi.findMany({ where: { destinationId: d.id }, select: { id: true } }),
      prisma.booking.findMany({ where: { destinationId: d.id }, select: { id: true } }),
      prisma.localWarung.findMany({ where: { destinationId: d.id }, select: { id: true } }),
      prisma.localService.findMany({ where: { destinationId: d.id }, select: { id: true } }),
    ])

    // Notifikasi tidak punya FK ke destinasi — dicocokkan lewat kolom link.
    const links = [
      `/pengelola/destinasi/${d.id}`,
      ...transaksis.map((t) => `/transaksi/${t.id}`),
      ...bookings.map((b) => `/booking/${b.id}`),
    ]

    const res = await prisma.$transaction(async (tx) => {
      const notif = await tx.notifikasi.deleteMany({ where: { link: { in: links } } })
      const item = await tx.transaksiItem.deleteMany({ where: { transaksiId: { in: transaksis.map((t) => t.id) } } })
      const trx = await tx.transaksi.deleteMany({ where: { destinationId: d.id } })
      const rev = await tx.review.deleteMany({ where: { destinationId: d.id } })
      const rep = await tx.userReport.deleteMany({ where: { destinationId: d.id } })
      const bok = await tx.booking.deleteMany({ where: { destinationId: d.id } })
      const tjp = await tx.titikJemput.deleteMany({ where: { serviceId: { in: services.map((s) => s.id) } } })
      const svc = await tx.localService.deleteMany({ where: { destinationId: d.id } })
      const mnu = await tx.menuItem.deleteMany({ where: { warungId: { in: warungs.map((w) => w.id) } } })
      const wrg = await tx.localWarung.deleteMany({ where: { destinationId: d.id } })
      const fas = await tx.fasilitas.deleteMany({ where: { destinationId: d.id } })
      const vst = await tx.visitStat.deleteMany({ where: { destinationId: d.id } })
      await tx.destination.delete({ where: { id: d.id } })
      return { notif, item, trx, rev, rep, bok, tjp, svc, mnu, wrg, fas, vst }
    })

    totals.notifikasi += res.notif.count
    totals.transaksiItem += res.item.count
    totals.transaksi += res.trx.count
    totals.review += res.rev.count
    totals.laporan += res.rep.count
    totals.booking += res.bok.count
    totals.titikJemput += res.tjp.count
    totals.service += res.svc.count
    totals.menu += res.mnu.count
    totals.warung += res.wrg.count
    totals.fasilitas += res.fas.count
    totals.visitStat += res.vst.count

    console.log(`  ✓ hapus "${d.name}"`)
  }

  console.log(`\nSELESAI. Destinasi dihapus: ${targets.length}`)
  console.log('Data terkait ikut terhapus:', totals)
  console.log('Destinasi tersisa:', await prisma.destination.count())
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
