import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createShipment, purchaseLabel } from '@/lib/shippo'
import { requireAdmin } from '@/lib/api'

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const body = await req.json()
  const { orderId, fromName, fromStreet, fromCity, fromState, fromZip, fromCountry,
    toName, toStreet, toCity, toState, toZip, toCountry, length, width, height, weight } = body

  try {
    const shipment = await createShipment(
      { name: fromName, street1: fromStreet, city: fromCity, state: fromState, zip: fromZip, country: fromCountry },
      { name: toName, street1: toStreet, city: toCity, state: toState, zip: toZip, country: toCountry },
      { length: String(length), width: String(width), height: String(height), distance_unit: 'in', weight: String(weight), mass_unit: 'lb' }
    )

    if (shipment.status !== 'SUCCESS' || !shipment.rates?.length) {
      return NextResponse.json({ error: 'No shipping rates available. Check addresses.' }, { status: 422 })
    }

    const sorted = [...shipment.rates].sort((a: { amount: string }, b: { amount: string }) =>
      parseFloat(a.amount) - parseFloat(b.amount))
    const transaction = await purchaseLabel(sorted[0].object_id)

    if (transaction.status !== 'SUCCESS') {
      return NextResponse.json({ error: 'Failed to purchase label' }, { status: 422 })
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'shipped',
        trackingNumber: transaction.tracking_number,
        carrier: sorted[0].provider?.toLowerCase() || 'usps',
        trackingUrl: transaction.tracking_url_provider,
        trackingStatus: 'label_created',
      },
    })

    return NextResponse.json({ tracking_number: transaction.tracking_number, label_url: transaction.label_url })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
