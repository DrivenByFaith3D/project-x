import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json()

  if (!email || !password || password.length < 6 || !name) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
  }

  const hashed = await bcrypt.hash(password, 10)

  // First user with ADMIN_EMAIL gets admin role
  const adminEmail = process.env.ADMIN_EMAIL
  const role = adminEmail && email === adminEmail ? 'admin' : 'user'

  const user = await prisma.user.create({
    data: { email, password: hashed, name, role },
  })

  return NextResponse.json({ id: user.id, email: user.email, role: user.role })
}
