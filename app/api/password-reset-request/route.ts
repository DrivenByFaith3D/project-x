import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const DEFAULT_PASSWORD = 'drivenbyfaith3d'

export async function POST(req: NextRequest) {
  const { email, name } = await req.json()
  if (!email?.trim() || !name?.trim()) {
    return NextResponse.json({ error: 'Email and name are required' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })

  // Verify name matches (case-insensitive)
  if (!user || user.name?.toLowerCase().trim() !== name.trim().toLowerCase()) {
    return NextResponse.json({ error: 'No account found with that email and name.' }, { status: 404 })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await bcrypt.hash(DEFAULT_PASSWORD, 10),
      mustChangePassword: true,
    },
  })

  return NextResponse.json({ ok: true })
}
