import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/api'
import { sendEmail, statusChangeEmailHtml } from '@/lib/brevo'
import { formatOrderId } from '@/lib/constants'

const VALID_STATUSES = ['pending', 'in_progress', 'label_created', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled']

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const body = await req.json()
  const { status } = body

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  // Bulk update
  if (Array.isArray(body.orderIds)) {
    const ids: string[] = body.orderIds
    if (ids.length === 0) return NextResponse.json({ success: true })

    const orders = await prisma.order.findMany({
      where: { id: { in: ids } },
      include: { user: { select: { email: true, name: true } } },
    })

    await prisma.order.updateMany({ where: { id: { in: ids } }, data: { status } })

    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    for (const order of orders) {
      try {
        const email = statusChangeEmailHtml(order.id, formatOrderId(order), status, appUrl)
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
    }

    return NextResponse.json({ success: true })
  }

  // Single update
  const { orderId } = body
  if (!orderId) return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: { user: { select: { email: true, name: true } } },
  })

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
