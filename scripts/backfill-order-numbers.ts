import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const PREFIX_MAP: Record<string, string> = {
  STL:     'STL',
  IMAGE:   'IMG',
  SCRATCH: 'SCR',
}

async function main() {
  const orders = await prisma.order.findMany({
    where: { orderNumber: null },
    orderBy: { createdAt: 'asc' },
  })

  console.log(`Found ${orders.length} orders to backfill`)

  // Track counters per type
  const counters: Record<string, number> = {}

  // Seed counters from already-numbered orders
  const existing = await prisma.order.findMany({
    where: { orderNumber: { not: null } },
    select: { orderNumber: true },
  })
  for (const o of existing) {
    const match = o.orderNumber?.match(/^([A-Z]+)-(\d+)$/)
    if (match) {
      const prefix = match[1]
      const num = parseInt(match[2])
      if (!counters[prefix] || num > counters[prefix]) {
        counters[prefix] = num
      }
    }
  }

  for (const order of orders) {
    // Extract type from description prefix like [STL], [IMAGE], [SCRATCH]
    const match = order.description.match(/^\[([A-Z]+)\]/)
    const typeKey = match ? match[1] : 'STL'
    const prefix = PREFIX_MAP[typeKey] ?? 'STL'
    const orderType = typeKey === 'IMAGE' ? 'image' : typeKey === 'SCRATCH' ? 'scratch' : 'stl'

    counters[prefix] = (counters[prefix] ?? 0) + 1
    const orderNumber = `${prefix}-${String(counters[prefix]).padStart(4, '0')}`

    await prisma.order.update({
      where: { id: order.id },
      data: { orderNumber, orderType },
    })

    console.log(`  ${order.id.slice(0, 8)} → ${orderNumber}`)
  }

  console.log('Done.')
}

main().catch(console.error).finally(() => prisma.$disconnect())
