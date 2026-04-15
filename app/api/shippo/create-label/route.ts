import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createShipment, purchaseLabel } from '@/lib/shippo'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const {
    orderId,
    fromName, fromStreet, fromCity, fromState, fromZip, fromCountry,
    toName, toStreet, toCity, toState, toZip, toCountry,
    length, width, height, weight,
  } = body

  try {
    // Create shipment in Shippo
    const shipment = await createShipment(
      { name: fromName, street1: fromStreet, city: fromCity, state: fromState, zip: fromZip, country: fromCountry },
      { name: toName, street1: toStreet, city: toCity, state: toState, zip: toZip, country: toCountry },
      { length: String(length), width: String(width), height: String(height), distance_unit: 'in', weight: String(weight), mass_unit: 'lb' }
    )

    if (shipment.status !== 'SUCCESS' || !shipment.rates?.length) {
      return NextResponse.json({ error: 'No shipping rates available. Check addresses.' }, { status: 422 })
    }

    // Pick cheapest rate
    const sortedRates = [...shipment.rates].sort((a: { amount: string }, b: { amount: string }) => parseFloat(a.amount) - parseFloat(b.amount))
    const cheapestRate = sortedRates[0]

    // Purchase label
    const transaction = await purchaseLabel(cheapestRate.object_id)

    if (transaction.status !== 'SUCCESS') {
      return NextResponse.json({ error: 'Failed to purchase label', details: transaction.messages }, { status: 422 })
    }

    const trackingNumber = transaction.tracking_number
    const carrier = cheapestRate.provider?.toLowerCase() || 'usps'
    const trackingUrl = transaction.tracking_url_provider

    // Update order
    const { error: dbError } = await supabase
      .from('orders')
      .update({
        status: 'shipped',
        tracking_number: trackingNumber,
        carrier,
        tracking_url: trackingUrl,
        tracking_status: 'label_created',
      })
      .eq('id', orderId)

    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

    return NextResponse.json({
      tracking_number: trackingNumber,
      carrier,
      tracking_url: trackingUrl,
      label_url: transaction.label_url,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
