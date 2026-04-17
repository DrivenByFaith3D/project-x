import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { uploadFile } from '@/lib/storage'
import { requireAuth } from '@/lib/api'

const MAX_SIZE = 50 * 1024 * 1024 // 50MB

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const orderId = formData.get('orderId') as string | null

  if (!file || !orderId) return NextResponse.json({ error: 'Missing file or orderId' }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 400 })

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (session.user.role !== 'admin' && order.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { url, name } = await uploadFile(file, orderId)

  await prisma.fileUpload.create({ data: { orderId, url, name } })
  await prisma.message.create({
    data: { orderId, senderId: session.user.id, content: `Uploaded file: ${name}`, fileUrl: url },
  })

  return NextResponse.json({ url, name })
}
