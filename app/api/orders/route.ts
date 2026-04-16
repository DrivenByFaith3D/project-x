import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api'

const TYPE_PREFIX: Record<string, string> = {
  stl: 'STL',
  image: 'IMG',
  scratch: 'SCR',
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  const { description, orderType } = await req.json()
  if (!description?.trim()) return NextResponse.json({ error: 'Description required' }, { status: 400 })

  const type = orderType && TYPE_PREFIX[orderType] ? orderType : 'stl'
  const prefix = TYPE_PREFIX[type]

  // Count existing orders of this type to get next sequential number
  const count = await prisma.order.count({ where: { orderType: type } })
  const orderNumber = `${prefix}-${String(count + 1).padStart(4, '0')}`

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      description: description.trim(),
      status: 'pending',
      orderType: type,
      orderNumber,
    },
  })

  // Post an automatic welcome message from the admin account
  const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } })
  if (adminUser) {
    await prisma.message.create({
      data: {
        orderId: order.id,
        senderId: adminUser.id,
        content: `Thank you for your message! We've received it and will review it shortly. We'll reach out to discuss details, pricing, and timeline. We appreciate your interest! 🙏`,
      },
    })
  }

  return NextResponse.json(order)
}
