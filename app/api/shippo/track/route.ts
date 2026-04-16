import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getTrackingStatus } from '@/lib/shippo'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const carrier = req.nextUrl.searchParams.get('carrier')
  const trackingNumber = req.nextUrl.searchParams.get('tracking_number')
  if (!carrier || !trackingNumber) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  try {
    const raw = await getTrackingStatus(carrier, trackingNumber)
    return NextResponse.json({
      carrier: raw.carrier,
      tracking_number: raw.tracking_number,
      status: raw.tracking_status?.status || 'unknown',
      eta: raw.eta || null,
      tracking_url: raw.tracking_url_provider || null,
      tracking_history: (raw.tracking_history || []).map((e: {
        status: string; status_date: string;
        location?: { city?: string; state?: string; country?: string };
        status_details?: string
      }) => ({
        status: e.status,
        status_date: e.status_date,
        location: [e.location?.city, e.location?.state, e.location?.country].filter(Boolean).join(', '),
        description: e.status_details || e.status,
      })),
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
