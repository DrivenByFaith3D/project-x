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

      function formatMessage(m: { id: string; orderId: string; senderId: string; content: string; fileUrl: string | null; createdAt: Date; sender: { email: string; role: string; name: string | null } }) {
        return JSON.stringify({
          id: m.id, orderId: m.orderId, senderId: m.senderId,
          content: m.content, fileUrl: m.fileUrl,
          createdAt: m.createdAt.toISOString(),
          senderEmail: m.sender.email, senderName: m.sender.name, senderRole: m.sender.role,
        })
      }

      // If resuming, fetch only messages after the last known ID
      if (lastMessageId) {
        try {
          const missed = await prisma.message.findMany({
            where: { orderId },
            cursor: { id: lastMessageId },
            skip: 1,
            include: { sender: { select: { email: true, role: true, name: true } } },
            orderBy: { createdAt: 'asc' },
          })
          for (const m of missed) {
            controller.enqueue(sseMessage('message', formatMessage(m), m.id))
            lastMessageId = m.id
          }
        } catch { /* ignore, will catch up on next poll */ }
      }

      // Send initial ping so the client knows the connection is open
      controller.enqueue(encoder.encode(': ping\n\n'))

      const pollInterval = setInterval(async () => {
        try {
          // Only fetch messages newer than the last one we sent
          const newMessages = await prisma.message.findMany({
            where: { orderId },
            ...(lastMessageId ? { cursor: { id: lastMessageId }, skip: 1 } : {}),
            orderBy: { createdAt: 'asc' },
            include: { sender: { select: { email: true, role: true, name: true } } },
          })

          for (const m of newMessages) {
            controller.enqueue(sseMessage('message', formatMessage(m), m.id))
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
