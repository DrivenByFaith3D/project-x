import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api'

export async function GET() {
  const { session, error } = await requireAuth()
  if (error) return error

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
  })

  return NextResponse.json(addresses)
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  const count = await prisma.address.count({ where: { userId: session.user.id } })
  if (count >= 3) {
    return NextResponse.json({ error: 'Maximum of 3 saved addresses allowed.' }, { status: 400 })
  }

  const { label, street, city, state, zip, country, isDefault } = await req.json()
  if (!label || !street || !city || !state || !zip) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    })
  }

  const address = await prisma.address.create({
    data: {
      userId: session.user.id,
      label, street, city, state, zip,
      country: country || 'US',
      isDefault: isDefault ?? count === 0,
    },
  })

  return NextResponse.json(address)
}

export async function PATCH(req: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  const { id, label, street, city, state, zip, country, isDefault } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 })

  const existing = await prisma.address.findUnique({ where: { id } })
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  }

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    })
  }

  const address = await prisma.address.update({
    where: { id },
    data: {
      ...(label !== undefined && { label }),
      ...(street !== undefined && { street }),
      ...(city !== undefined && { city }),
      ...(state !== undefined && { state }),
      ...(zip !== undefined && { zip }),
      ...(country !== undefined && { country }),
      ...(isDefault !== undefined && { isDefault }),
    },
  })

  return NextResponse.json(address)
}

export async function DELETE(req: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 })

  const existing = await prisma.address.findUnique({ where: { id } })
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  }

  await prisma.address.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
