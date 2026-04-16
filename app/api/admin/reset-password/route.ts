import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { requireAdmin } from '@/lib/api'

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const { userId, newPassword } = await req.json()

  if (!userId || !newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  await prisma.user.update({
    where: { id: userId },
    data: { password: await bcrypt.hash(newPassword, 10) },
  })

  return NextResponse.json({ success: true })
}
