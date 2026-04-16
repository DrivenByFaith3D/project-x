import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { requireAuth } from '@/lib/api'

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  const { newPassword } = await req.json()
  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      password: await bcrypt.hash(newPassword, 10),
      mustChangePassword: false,
    },
  })

  return NextResponse.json({ ok: true })
}
