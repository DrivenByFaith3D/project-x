import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api'

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  const { description } = await req.json()
  if (!description?.trim()) return NextResponse.json({ error: 'Description required' }, { status: 400 })

  const order = await prisma.order.create({
    data: { userId: session.user.id, description: description.trim(), status: 'pending' },
  })

  return NextResponse.json(order)
}
