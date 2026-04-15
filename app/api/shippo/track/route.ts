import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTrackingStatus } from '@/lib/shippo'
import type { TrackingInfo } from '@/types'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const carrier = searchParams.get('carrier')
  const trackingNumber = searchParams.get('tracking_number')

  if (!carrier || !trackingNumber) {
    return NextResponse.json({ error: 'Missing carrier or tracking_number' }, { status: 400 })
  }

  try {
    const raw = await getTrackingStatus(carrier, trackingNumber)

    const tracking: TrackingInfo = {
      carrier: raw.carrier,
      tracking_number: raw.tracking_number,
      status: raw.tracking_status?.status || 'unknown',
      eta: raw.eta || null,
      tracking_url: raw.tracking_url_provider || null,
      tracking_history: (raw.tracking_history || []).map((e: {
        status: string
        status_date: string
        location?: { city?: string; state?: string; country?: string }
        status_details?: string
      }) => ({
        status: e.status,
        status_date: e.status_date,
        location: [e.location?.city, e.location?.state, e.location?.country].filter(Boolean).join(', '),
        description: e.status_details || e.status,
      })),
    }

    return NextResponse.json(tracking)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
