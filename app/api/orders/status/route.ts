import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/api'
import { sendEmail, statusChangeEmailHtml } from '@/lib/brevo'
import { formatOrderId } from '@/lib/constants'

const VALID_STATUSES = ['pending', 'in_progress', 'label_created', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled']

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const { orderId, status } = await req.json()
  if (!orderId || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: { user: { select: { email: true, name: true } } },
  })

  // Email customer on meaningful status changes
  try {
    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const email = statusChangeEmailHtml(orderId, formatOrderId(order), status, appUrl)
    if (email) {
      await sendEmail({
        to: order.user.email,
        toName: order.user.name ?? undefined,
        subject: email.subject,
        htmlContent: email.html,
      })
    }
  } catch (e) {
    console.error('Status email failed:', e)
  }

  return NextResponse.json({ success: true })
}
