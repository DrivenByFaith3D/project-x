import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { purchaseLabel } from '@/lib/shippo'
import { requireAdmin } from '@/lib/api'

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const body = await req.json()
  const { orderId, rateId, carrier } = body

  try {
    const transaction = await purchaseLabel(rateId)

    if (transaction.status !== 'SUCCESS') {
      return NextResponse.json({ error: 'Failed to purchase label' }, { status: 422 })
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'shipped',
        trackingNumber: transaction.tracking_number,
        carrier: carrier?.toLowerCase() || 'usps',
        trackingUrl: transaction.tracking_url_provider,
        trackingStatus: 'label_created',
      },
    })

    return NextResponse.json({ tracking_number: transaction.tracking_number, label_url: transaction.label_url })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
