import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function check() {
  const reservations = await prisma.reservation.findMany({
    include: {
      timeSlot: true,
      allowedEmail: true
    }
  })

  console.log(`\nTotal reservations: ${reservations.length}\n`)

  if (reservations.length === 0) {
    console.log('No reservations found!')
  } else {
    reservations.forEach(r => {
      const cancelled = r.cancelledAt ? 'CANCELLED' : 'ACTIVE'
      console.log(`- ${r.allowedEmail.email} - ${r.timeSlot.startTime} on ${r.reservationDate.toISOString().split('T')[0]} (${cancelled})`)
    })
  }

  await prisma.$disconnect()
}

check()
