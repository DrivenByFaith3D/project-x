import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { requireAdmin } from '@/lib/api'

const DEFAULT_PASSWORD = 'drivenbyfaith3d'

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  await prisma.user.update({
    where: { id: userId },
    data: { password: await bcrypt.hash(DEFAULT_PASSWORD, 10), mustChangePassword: true },
  })

  return NextResponse.json({ success: true })
}
