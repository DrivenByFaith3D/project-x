import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api'

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get('productId')
  if (!productId) return NextResponse.json({ error: 'Missing productId' }, { status: 400 })

  const reviews = await prisma.review.findMany({
    where: { productId },
    orderBy: { createdAt: 'desc' },
    include: { },
  })

  // Fetch user names separately to avoid exposing emails
  const userIds = Array.from(new Set(reviews.map(r => r.userId)))
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true },
  })
  const userMap = new Map(users.map(u => [u.id, u.name ?? u.email.split('@')[0]]))

  return NextResponse.json(reviews.map(r => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt,
    userName: userMap.get(r.userId) ?? 'Customer',
  })))
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  const { productId, rating, comment } = await req.json()
  if (!productId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  // Must have a delivered order to review (optional enforcement)
  const review = await prisma.review.upsert({
    where: { productId_userId: { productId, userId: session.user.id } },
    create: { productId, userId: session.user.id, rating, comment: comment?.trim() || null },
    update: { rating, comment: comment?.trim() || null },
  })

  return NextResponse.json(review)
}

export async function DELETE(req: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  const productId = req.nextUrl.searchParams.get('productId')
  if (!productId) return NextResponse.json({ error: 'Missing productId' }, { status: 400 })

  await prisma.review.deleteMany({
    where: { productId, userId: session.user.id },
  })

  return NextResponse.json({ success: true })
}
