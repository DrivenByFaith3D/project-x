import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { sendEmail, productPurchaseAdminEmailHtml } from '@/lib/brevo'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set')
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
  }

  const stripe = getStripe()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { orderId, productId, productName } = session.metadata ?? {}

    if (orderId && session.payment_status === 'paid') {
      // Custom order payment
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'paid', status: 'in_progress' },
      })
    } else if (productId && session.payment_status === 'paid') {
      // Product listing purchase — email admin
      try {
        const appUrl = (process.env.NEXTAUTH_URL || 'http://localhost:3000').trim()
        const admins = await prisma.user.findMany({ where: { role: 'admin' }, select: { email: true } })
        const amount = (session.amount_total ?? 0) / 100
        const buyerEmail = session.customer_email ?? session.customer_details?.email ?? 'Unknown'
        for (const admin of admins) {
          await sendEmail({
            to: admin.email,
            subject: `New product purchase: ${productName ?? 'Product'}`,
            htmlContent: productPurchaseAdminEmailHtml(productName ?? 'Product', amount, buyerEmail, appUrl),
          })
        }
      } catch (e) {
        console.error('Product purchase email failed:', e)
      }
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session
    const orderId = session.metadata?.orderId
    if (orderId) {
      // Clear the stripe session so the customer can retry
      await prisma.order.update({
        where: { id: orderId },
        data: { stripeSessionId: null },
      }).catch(() => {})
    }
  }

  return NextResponse.json({ received: true })
}
