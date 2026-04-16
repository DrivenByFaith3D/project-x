import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ChatWindow from '@/components/ChatWindow'
import ShippingStatus from '@/components/ShippingStatus'
import { STATUS_STYLES, formatOrderId } from '@/lib/constants'

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const isAdmin = session.user.role === 'admin'

  const order = await prisma.order.findUnique({
    where: { id },
    include: { files: true },
  })

  if (!order) notFound()
  if (!isAdmin && order.userId !== session.user.id) notFound()

  const messages = await prisma.message.findMany({
    where: { orderId: id },
    include: { sender: { select: { email: true, role: true } } },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-sm text-zinc-500">Order</p>
          <h1 className="text-2xl font-bold text-white">{formatOrderId(order)}</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Created {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <span className={`self-start sm:self-auto text-sm font-medium px-3 py-1.5 rounded-full capitalize ${STATUS_STYLES[order.status] || 'bg-zinc-800 text-zinc-300'}`}>
          {order.status.replace('_', ' ')}
        </span>
      </div>

      <div className="card p-5 mb-6">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Description</h2>
        <p className="text-zinc-200">{order.description}</p>
      </div>

      {order.status === 'shipped' && order.trackingNumber && (
        <div className="mb-6">
          <ShippingStatus order={order} />
        </div>
      )}

      {order.files.length > 0 && (
        <div className="card p-5 mb-6">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Uploaded Files</h2>
          <div className="space-y-2">
            {order.files.map((file) => (
              <a key={file.id} href={file.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors text-sm">
                <svg className="w-5 h-5 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span className="text-zinc-300 hover:text-white truncate">{file.name || 'Uploaded file'}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      <ChatWindow
        orderId={id}
        initialMessages={messages.map(m => ({
          id: m.id,
          orderId: m.orderId,
          senderId: m.senderId,
          content: m.content,
          fileUrl: m.fileUrl,
          createdAt: m.createdAt.toISOString(),
          senderEmail: m.sender.email,
          senderRole: m.sender.role,
        }))}
        currentUserId={session.user.id}
        isAdmin={isAdmin}
      />
    </div>
  )
}
