import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api'

// Validate a coupon code
export async function GET(req: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 })

  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })
  if (!coupon || !coupon.active) return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 })
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 })
  if (coupon.maxUses && coupon.uses >= coupon.maxUses) return NextResponse.json({ error: 'Coupon has reached its usage limit' }, { status: 400 })

  return NextResponse.json({ id: coupon.id, code: coupon.code, type: coupon.type, value: coupon.value })
}

// Admin: create coupon
export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { code, type, value, maxUses, expiresAt } = await req.json()
  if (!code || !type || !value) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const coupon = await prisma.coupon.create({
    data: {
      code: code.toUpperCase().trim(),
      type,
      value: parseFloat(value),
      maxUses: maxUses ? parseInt(maxUses) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  })

  return NextResponse.json(coupon)
}

// Admin: toggle active / delete
export async function PATCH(req: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, active } = await req.json()
  const coupon = await prisma.coupon.update({ where: { id }, data: { active } })
  return NextResponse.json(coupon)
}

export async function DELETE(req: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  await prisma.coupon.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
