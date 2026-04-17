import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { uploadFile } from '@/lib/storage'
import { requireAdmin } from '@/lib/api'

const MAX_SIZE = 20 * 1024 * 1024 // 20MB

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const orderId = formData.get('orderId') as string | null

  if (!file || !orderId) return NextResponse.json({ error: 'Missing file or orderId' }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File too large (max 20MB)' }, { status: 400 })

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  const { url } = await uploadFile(file, orderId)
  const photo = await prisma.orderPhoto.create({ data: { orderId, url } })

  return NextResponse.json(photo)
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const { photoId } = await req.json()
  if (!photoId) return NextResponse.json({ error: 'Missing photoId' }, { status: 400 })

  await prisma.orderPhoto.delete({ where: { id: photoId } }).catch(() => {})
  return NextResponse.json({ success: true })
}
