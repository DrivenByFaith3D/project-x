import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api'

export async function PATCH(req: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  const { orderId, description } = await req.json()
  if (!orderId || !description?.trim()) {
    return NextResponse.json({ error: 'Order ID and description are required' }, { status: 400 })
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  // Only the order owner can edit, and only while pending
  if (order.userId !== session!.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (order.status !== 'pending') {
    return NextResponse.json({ error: 'Description can only be edited while the order is pending' }, { status: 400 })
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { description: description.trim() },
  })

  return NextResponse.json({ description: updated.description })
}
