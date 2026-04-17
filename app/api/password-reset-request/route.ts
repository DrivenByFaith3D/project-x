import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, passwordResetEmailHtml } from '@/lib/brevo'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email?.trim()) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })

  // Always return success to prevent email enumeration
  if (!user) return NextResponse.json({ ok: true })

  // Delete any existing tokens for this user
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  })

  const appUrl = (process.env.NEXTAUTH_URL || 'http://localhost:3000').trim()
  const resetUrl = `${appUrl}/reset-password?token=${token}`

  try {
    await sendEmail({
      to: user.email,
      toName: user.name ?? undefined,
      subject: 'Reset your DrivenByFaith3D password',
      htmlContent: passwordResetEmailHtml(resetUrl),
    })
  } catch (e) {
    console.error('Password reset email failed:', e)
    return NextResponse.json({ error: 'Failed to send email. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
