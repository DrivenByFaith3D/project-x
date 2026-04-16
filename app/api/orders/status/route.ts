import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/api'

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const { orderId, status } = await req.json()
  const valid = ['pending', 'in_progress', 'label_created', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled', 'completed', 'shipped']
  if (!orderId || !valid.includes(status)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  await prisma.order.update({ where: { id: orderId }, data: { status } })
  return NextResponse.json({ success: true })
}
