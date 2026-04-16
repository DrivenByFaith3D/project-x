import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { description } = await req.json()
  if (!description?.trim()) return NextResponse.json({ error: 'Description required' }, { status: 400 })

  const order = await prisma.order.create({
    data: { userId: session.user.id, description: description.trim(), status: 'pending' },
  })

  return NextResponse.json(order)
}
