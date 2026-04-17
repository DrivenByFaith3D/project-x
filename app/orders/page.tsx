import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { STATUS_STYLES, formatOrderId } from '@/lib/constants'

const PER_PAGE = 10

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1') || 1)

  const [total, orders] = await Promise.all([
    prisma.order.count({ where: { userId: session.user.id } }),
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
  ])

  const totalPages = Math.ceil(total / PER_PAGE)

  // Get unread message counts per order (messages from admin since last view)
  const orderViews = await prisma.orderView.findMany({
    where: { userId: session.user.id, orderId: { in: orders.map(o => o.id) } },
  })
  const viewMap = new Map(orderViews.map(v => [v.orderId, v.viewedAt]))

  const unreadCounts = await Promise.all(
    orders.map(async (order) => {
      const lastViewed = viewMap.get(order.id)
      const count = await prisma.message.count({
        where: {
          orderId: order.id,
          senderId: { not: session.user.id },
          ...(lastViewed ? { createdAt: { gt: lastViewed } } : {}),
        },
      })
      return { orderId: order.id, count }
    })
  )
  const unreadMap = new Map(unreadCounts.map(u => [u.orderId, u.count]))

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Orders</h1>
          <p className="text-zinc-400 text-sm mt-1">Track and manage your custom orders</p>
        </div>
        <Link href="/orders/new" className="btn-primary">+ New Order</Link>
      </div>

      {orders.length === 0 && page === 1 ? (
        <div className="card p-16 text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="font-medium text-zinc-400">No orders yet</p>
          <p className="text-sm mt-1 mb-6 text-zinc-500">Create your first custom order to get started.</p>
          <Link href="/orders/new" className="btn-primary">Create Order</Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {orders.map((order) => {
              const unread = unreadMap.get(order.id) ?? 0
              return (
                <div key={order.id} className={`card p-5 flex items-center justify-between hover:border-zinc-600 transition-colors ${unread > 0 ? 'border-blue-800/60' : ''}`}>
                  <Link href={`/orders/${order.id}`} className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white text-sm">Order {formatOrderId(order)}</p>
                      {unread > 0 && (
                        <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-blue-600 text-white rounded-full">
                          {unread}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-400 mt-0.5 line-clamp-1">{order.description}</p>
                    <p className="text-xs text-zinc-600 mt-1">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </Link>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[order.status] || 'bg-zinc-800 text-zinc-300'}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                    {['delivered', 'completed'].includes(order.status) && (
                      <Link
                        href={`/orders/new?type=${order.orderType ?? 'scratch'}&description=${encodeURIComponent(order.description.slice(0, 500))}`}
                        className="text-xs text-zinc-500 hover:text-white border border-zinc-700 hover:border-zinc-500 px-2 py-1 rounded transition-colors"
                        title="Reorder"
                      >
                        Reorder
                      </Link>
                    )}
                    <Link href={`/orders/${order.id}`}>
                      <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-xs text-zinc-500">
                Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} of {total} orders
              </p>
              <div className="flex items-center gap-2">
                {page > 1 && (
                  <Link href={`/orders?page=${page - 1}`}
                    className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors">
                    ← Previous
                  </Link>
                )}
                <span className="text-xs text-zinc-500">Page {page} of {totalPages}</span>
                {page < totalPages && (
                  <Link href={`/orders?page=${page + 1}`}
                    className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors">
                    Next →
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
