import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api'

// Actions: archive | delete | restore | purge-expired
export async function PATCH(req: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { orderId, action } = await req.json()
  if (!orderId || !action) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  if (action === 'archive') {
    await prisma.order.update({
      where: { id: orderId },
      data: { archivedAt: new Date(), deletedAt: null },
    })
  } else if (action === 'delete') {
    await prisma.order.update({
      where: { id: orderId },
      data: { deletedAt: new Date(), archivedAt: null },
    })
  } else if (action === 'restore') {
    await prisma.order.update({
      where: { id: orderId },
      data: { deletedAt: null, archivedAt: null },
    })
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}

// Permanently deletes orders that have been in trash for 30+ days
export async function DELETE(req: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const { count } = await prisma.order.deleteMany({
    where: { deletedAt: { not: null, lte: cutoff } },
  })

  return NextResponse.json({ purged: count })
}
