import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const orders = await prisma.order.findMany({
    where: { description: { startsWith: '[' } },
  })

  console.log(`Found ${orders.length} orders with prefixed descriptions`)

  for (const order of orders) {
    const cleaned = order.description.replace(/^\[[A-Z]+\]\s*/, '')
    await prisma.order.update({
      where: { id: order.id },
      data: { description: cleaned },
    })
    console.log(`  ${order.orderNumber ?? order.id.slice(0, 8)}: "${order.description}" → "${cleaned}"`)
  }

  console.log('Done.')
}

main().catch(console.error).finally(() => prisma.$disconnect())
