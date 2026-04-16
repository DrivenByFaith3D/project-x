import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/api'

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const { orderId, quote } = await req.json()
  if (!orderId || quote == null || isNaN(Number(quote)) || Number(quote) <= 0) {
    return NextResponse.json({ error: 'Invalid quote amount' }, { status: 400 })
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { quote: Number(quote), paymentStatus: 'unpaid' },
  })

  return NextResponse.json(order)
}
