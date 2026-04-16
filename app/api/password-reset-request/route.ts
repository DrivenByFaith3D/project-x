import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { email, name } = await req.json()
  if (!email?.trim() || !name?.trim()) {
    return NextResponse.json({ error: 'Email and name are required' }, { status: 400 })
  }

  await prisma.passwordResetRequest.create({
    data: { email: email.trim().toLowerCase(), name: name.trim() },
  })

  return NextResponse.json({ ok: true })
}
