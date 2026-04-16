import { NextRequest, NextResponse } from 'next/server'
import { createShipment } from '@/lib/shippo'
import { requireAdmin } from '@/lib/api'

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const body = await req.json()
  const { fromName, fromStreet, fromCity, fromState, fromZip, fromCountry,
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

    const rates = shipment.rates
      .sort((a: { amount: string }, b: { amount: string }) => parseFloat(a.amount) - parseFloat(b.amount))
      .map((r: { object_id: string; provider: string; servicelevel: { name: string }; amount: string; currency: string; estimated_days: number }) => ({
        id: r.object_id,
        carrier: r.provider,
        service: r.servicelevel?.name,
        amount: r.amount,
        currency: r.currency,
        estimatedDays: r.estimated_days,
      }))

    return NextResponse.json({ rates })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
