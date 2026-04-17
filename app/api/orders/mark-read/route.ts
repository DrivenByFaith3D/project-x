import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api'

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  const { orderId } = await req.json()
  if (!orderId) return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (session.user.role !== 'admin' && order.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.orderView.upsert({
    where: { userId_orderId: { userId: session.user.id, orderId } },
    create: { userId: session.user.id, orderId },
    update: { viewedAt: new Date() },
  })

  return NextResponse.json({ ok: true })
}
