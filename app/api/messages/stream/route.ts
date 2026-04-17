import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  const orderId = req.nextUrl.searchParams.get('orderId')
  if (!orderId) return new Response('Missing orderId', { status: 400 })

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) return new Response('Not found', { status: 404 })
  if (session.user.role !== 'admin' && order.userId !== session.user.id) {
    return new Response('Forbidden', { status: 403 })
  }

  // Support Last-Event-ID for reconnection (EventSource sends this header automatically)
  const resumeId = req.headers.get('last-event-id') ?? req.nextUrl.searchParams.get('lastId') ?? null

  const encoder = new TextEncoder()

  function sseMessage(event: string, data: string, id?: string) {
    return encoder.encode(`${id ? `id: ${id}\n` : ''}event: ${event}\ndata: ${data}\n\n`)
  }

  const stream = new ReadableStream({
    async start(controller) {
      let lastMessageId = resumeId

      // If resuming, fetch messages since the last known one and flush them immediately
      if (lastMessageId) {
        try {
          const missed = await prisma.message.findMany({
            where: { orderId },
            include: { sender: { select: { email: true, role: true, name: true } } },
            orderBy: { createdAt: 'asc' },
          })
          const idx = missed.findIndex(m => m.id === lastMessageId)
          const newOnes = idx === -1 ? missed : missed.slice(idx + 1)
          for (const m of newOnes) {
            controller.enqueue(sseMessage('message', JSON.stringify({
              id: m.id, orderId: m.orderId, senderId: m.senderId,
              content: m.content, fileUrl: m.fileUrl,
              createdAt: m.createdAt.toISOString(),
              senderEmail: m.sender.email, senderName: m.sender.name, senderRole: m.sender.role,
            }), m.id))
            lastMessageId = m.id
          }
        } catch { /* ignore, will catch up on next poll */ }
      }

      // Send initial ping so the client knows the connection is open
      controller.enqueue(encoder.encode(': ping\n\n'))

      const pollInterval = setInterval(async () => {
        try {
          const messages = await prisma.message.findMany({
            where: { orderId },
            include: { sender: { select: { email: true, role: true, name: true } } },
            orderBy: { createdAt: 'asc' },
          })

          // Find messages newer than what we last sent
          const idx = lastMessageId ? messages.findIndex(m => m.id === lastMessageId) : -1
          const newMessages = idx === -1 && !lastMessageId ? messages : messages.slice(idx + 1)

          for (const m of newMessages) {
            controller.enqueue(sseMessage('message', JSON.stringify({
              id: m.id, orderId: m.orderId, senderId: m.senderId,
              content: m.content, fileUrl: m.fileUrl,
              createdAt: m.createdAt.toISOString(),
              senderEmail: m.sender.email, senderName: m.sender.name, senderRole: m.sender.role,
            }), m.id))
            lastMessageId = m.id
          }
        } catch {
          clearInterval(pollInterval)
          clearInterval(pingInterval)
          try { controller.close() } catch { /* already closed */ }
        }
      }, 1000)

      // Keep-alive ping every 20s to prevent proxy timeouts
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'))
        } catch {
          clearInterval(pingInterval)
        }
      }, 20000)

      req.signal.addEventListener('abort', () => {
        clearInterval(pollInterval)
        clearInterval(pingInterval)
        try { controller.close() } catch { /* already closed */ }
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  })
}
