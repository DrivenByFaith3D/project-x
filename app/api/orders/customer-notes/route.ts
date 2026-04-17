import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/api'

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const { orderId, customerNotes } = await req.json()
  if (!orderId) return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })

  await prisma.order.update({
    where: { id: orderId },
    data: { customerNotes: customerNotes ?? null },
  })

  return NextResponse.json({ success: true })
}
