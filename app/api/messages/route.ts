import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendEmail, newMessageEmailHtml } from '@/lib/brevo'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { orderId, content, fileUrl } = body

  if (!orderId || !content?.trim()) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Verify user has access to this order
  const { data: order } = await supabase
    .from('orders')
    .select('user_id')
    .eq('id', orderId)
    .single()

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'
  if (!isAdmin && order.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Insert message
  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      order_id: orderId,
      sender_id: user.id,
      content: content.trim(),
      file_url: fileUrl || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Send email notification to the other participant
  try {
    const serviceClient = await createServiceClient()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    if (isAdmin) {
      // Admin sent → notify the order owner
      const { data: ownerProfile } = await serviceClient
        .from('profiles')
        .select('email')
        .eq('id', order.user_id)
        .single()

      if (ownerProfile?.email) {
        await sendEmail({
          to: ownerProfile.email,
          subject: 'New message on your order',
          htmlContent: newMessageEmailHtml(orderId, appUrl),
        })
      }
    } else {
      // User sent → notify admin(s)
      const { data: admins } = await serviceClient
        .from('profiles')
        .select('email')
        .eq('role', 'admin')

      for (const admin of admins || []) {
        if (admin.email) {
          await sendEmail({
            to: admin.email,
            subject: `New message on order #${orderId.slice(0, 8).toUpperCase()}`,
            htmlContent: newMessageEmailHtml(orderId, appUrl),
          })
        }
      }
    }
  } catch (emailErr) {
    // Email failure should not block message delivery
    console.error('Email notification failed:', emailErr)
  }

  return NextResponse.json(message)
}
