import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { orderId, status } = await req.json()
  const valid = ['pending', 'in_progress', 'completed', 'shipped']
  if (!orderId || !valid.includes(status)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  await prisma.order.update({ where: { id: orderId }, data: { status } })
  return NextResponse.json({ success: true })
}
