import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api'
import { formatOrderId } from '@/lib/constants'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  const { orderId } = await req.json()
  if (!orderId) return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (order.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (!order.quote) return NextResponse.json({ error: 'No quote set for this order' }, { status: 400 })
  if (order.paymentStatus === 'paid') return NextResponse.json({ error: 'Already paid' }, { status: 400 })

  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `3D Print Order ${formatOrderId(order)}`,
            description: order.description.slice(0, 200),
          },
          unit_amount: Math.round(order.quote * 100),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${appUrl}/orders/${orderId}/payment-success`,
    cancel_url: `${appUrl}/orders/${orderId}/payment-cancel`,
    metadata: { orderId },
  })

  await prisma.order.update({
    where: { id: orderId },
    data: { stripeSessionId: checkoutSession.id },
  })

  return NextResponse.json({ url: checkoutSession.url })
}
